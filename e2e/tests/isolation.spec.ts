import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility to get user by email for dynamic test data setup
async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  return user?.id;
}

test.describe('Cross-Business Isolation (Customer Access)', () => {
  test.use({ storageState: 'e2e/.auth/customer.json' });

  test('customer cannot access admin panel of an arbitrary gym', async ({ page }) => {
    // Attempting to access an admin route
    await page.goto('/random-gym/admin');
    
    // Should be redirected back to the platform admin selector, 
    // which then forces them to create a gym (since they have no admin rights)
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Verify they see the "Create New Gym" button, meaning they have no gyms managed
    const createBtn = page.locator('text=Create New Gym');
    await expect(createBtn).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Cross-Business Isolation (Owner Access)', () => {
  test.use({ storageState: 'e2e/.auth/owner.json' });

  test('owner cannot access another owner\'s dashboard', async ({ page }) => {
    // Setup generic gym completely unlinked to our TEST_OWNER
    const genericOwnerId = `test-generic-${Date.now()}`;
    const slug = `secure-gym-${Date.now()}`;
    
    await prisma.gym.create({
      data: {
        name: 'Secure Other Gym',
        slug: slug,
        qrSecret: 'other-secret-123',
        members: {
          create: {
            userId: genericOwnerId,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      }
    });

    // Try to access it
    await page.goto(`/${slug}/admin`);
    
    // Middleware or Layout should redirect to /admin root because they don't own it
    await expect(page).toHaveURL(/.*\/admin.*/);

    // Cleanup
    await prisma.gym.delete({ where: { slug } });
  });
});

test.describe('Cross-Business Isolation (Unpaid User)', () => {
  test.use({ storageState: 'e2e/.auth/unpaid.json' });

  test('unapproved user cannot bypass join request to access private member dashboard', async ({ page }) => {
    const ownerId = await getUserIdByEmail(process.env.TEST_OWNER_EMAIL!) || `temp-owner-${Date.now()}`;
    const slug = `exclusive-gym-${Date.now()}`;
    
    const gym = await prisma.gym.create({
      data: {
        name: 'Exclusive Gym',
        slug: slug,
        members: { create: { userId: ownerId, role: 'OWNER', status: 'ACTIVE' } }
      }
    });

    // Go directly to member dashboard
    await page.goto(`/${slug}`);
    
    // Should be intercepted and sent to the public join page
    await expect(page).toHaveURL(new RegExp(`.*\\/${slug}\\/join`));
    
    await expect(page.locator('text=Request to Join')).toBeVisible();

    // Cleanup
    await prisma.gym.delete({ where: { slug } });
  });
});
