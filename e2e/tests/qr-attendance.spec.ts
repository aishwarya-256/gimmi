import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  return user?.id;
}

test.describe('QR Attendance System (E2E)', () => {

  const slug = `qr-test-gym-${Date.now()}`;
  let gymId: string;
  let ownerId: string;
  let memberId: string;
  let unpaidId: string;

  test.beforeAll(async () => {
    ownerId = await getUserIdByEmail(process.env.TEST_OWNER_EMAIL!) || `owner-${Date.now()}`;
    memberId = await getUserIdByEmail(process.env.TEST_MEMBER_EMAIL!) || `member-${Date.now()}`;
    unpaidId = await getUserIdByEmail(process.env.TEST_UNPAID_EMAIL!) || `unpaid-${Date.now()}`;

    // Clean any prior dangling test gyms just in case
    await prisma.gym.deleteMany({ where: { slug: { startsWith: 'qr-test-gym-' } } });

    // Seed comprehensive test Gym environment
    const gym = await prisma.gym.create({
      data: {
        name: 'QR Automated Gym',
        slug: slug,
        qrSecret: 'playwright-test-secret',
        members: {
          create: { userId: ownerId, role: 'OWNER', status: 'ACTIVE' }
        }
      }
    });
    gymId = gym.id;

    const plan = await prisma.membershipPlan.create({
      data: { gymId, name: 'Pro Tester Plan', price: 50, interval: 'MONTHLY' }
    });

    // Paid Member
    await prisma.joinRequest.create({ data: { userId: memberId, gymId, status: 'ACCEPTED' } });
    await prisma.gymMember.create({ data: { userId: memberId, gymId, role: 'MEMBER', status: 'ACTIVE', planId: plan.id } });

    // Unpaid Member (Rejected)
    await prisma.joinRequest.create({ data: { userId: unpaidId, gymId, status: 'REJECTED' } });
  });

  test.afterAll(async () => {
    if (gymId) {
      // Prisma cascade deletion logic ensures cleanup handles related nested records (like Attendance logs)
      await prisma.gym.delete({ where: { id: gymId } });
    }
  });

  test.describe('Unpaid User Restrictions', () => {
    test.use({ storageState: 'e2e/.auth/unpaid.json' });

    test('cannot access the QR in-app scanner', async ({ page }) => {
      await page.goto(`/${slug}/scan`);
      await expect(page).toHaveURL(new RegExp(`.*\\/${slug}\\/join`));
    });

    test('cannot securely swipe entry using native URL payload', async ({ page }) => {
      await page.goto(`/${slug}/check-in?t=playwright-test-secret`);
      await expect(page.locator('text=Access Denied')).toBeVisible();
      await expect(page.locator('text=You do not have an active membership at this gym.')).toBeVisible();
    });
  });

  test.describe('Approved Paid Member Activity', () => {
    test.use({ storageState: 'e2e/.auth/member.json' });

    test('can physically view the in-app scanner interface', async ({ page }) => {
      await page.goto(`/${slug}/scan`);
      await expect(page.locator('h1', { hasText: 'Scan Gym QR' })).toBeVisible();
    });

    test('successfully checks in when parsing valid token (Google Lens Simulation)', async ({ page }) => {
      await page.goto(`/${slug}/check-in?t=playwright-test-secret`);

      await expect(page.locator('text=Access Granted')).toBeVisible();
      await expect(page.locator('text=Welcome to QR Automated Gym!')).toBeVisible();

      // Ensure the attendance log was inserted on Postgres
      const logs = await prisma.attendance.findMany({ where: { gymId, userId: memberId } });
      expect(logs.length).toBeGreaterThan(0);
    });

    test('QR Scanner rigidly denies compromised token hijacking', async ({ page }) => {
      await page.goto(`/${slug}/check-in?t=compromised-stale-secret-1234`);

      await expect(page.locator('text=Invalid or Expired QR Code')).toBeVisible();
      await expect(page.locator('text=Please scan the latest poster at the front desk.')).toBeVisible();
    });
  });

  test.describe('Admin Observer Verification', () => {
    test.use({ storageState: 'e2e/.auth/owner.json' });

    test('views live attendance feed successfully', async ({ page }) => {
      await page.goto(`/${slug}/admin/attendance`);
      
      await expect(page.locator('text=Live Attendance')).toBeVisible();
      await expect(page.locator('text=Print Desk Poster')).toBeVisible();
    });
  });

});
