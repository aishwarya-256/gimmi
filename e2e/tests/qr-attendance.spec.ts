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
    const oldGyms = await prisma.gym.findMany({ where: { slug: { startsWith: 'qr-test-gym-' } }, select: { id: true } });
    const oldGymIds = oldGyms.map(g => g.id);
    if (oldGymIds.length > 0) {
      await prisma.attendance.deleteMany({ where: { gymId: { in: oldGymIds } } });
      await prisma.joinRequest.deleteMany({ where: { gymId: { in: oldGymIds } } });
      await prisma.gymMember.deleteMany({ where: { gymId: { in: oldGymIds } } });
      await prisma.membershipPlan.deleteMany({ where: { gymId: { in: oldGymIds } } });
      await prisma.gym.deleteMany({ where: { id: { in: oldGymIds } } });
    }

    // Seed comprehensive test Gym environment idempotently
    const gym = await prisma.gym.upsert({
      where: { slug: slug },
      update: {},
      create: {
        name: 'QR Automated Gym',
        slug: slug,
        qrSecret: 'playwright-test-secret',
      }
    });
    gymId = gym.id;

    await prisma.gymMember.upsert({
      where: { userId_gymId: { userId: ownerId, gymId } },
      update: { role: 'OWNER', status: 'ACTIVE' },
      create: { userId: ownerId, gymId, role: 'OWNER', status: 'ACTIVE' }
    });

    const plan = await prisma.membershipPlan.create({
      data: { gymId, name: 'Pro Tester Plan', price: 50, durationDays: 30 }
    });

    // Paid Member
    await prisma.joinRequest.upsert({
      where: { userId_gymId: { userId: memberId, gymId } },
      update: { status: 'ACCEPTED' },
      create: { userId: memberId, gymId, status: 'ACCEPTED' }
    });

    await prisma.gymMember.upsert({
      where: { userId_gymId: { userId: memberId, gymId } },
      update: { role: 'MEMBER', status: 'ACTIVE', planId: plan.id },
      create: { userId: memberId, gymId, role: 'MEMBER', status: 'ACTIVE', planId: plan.id }
    });

    // Unpaid Member (Rejected)
    await prisma.joinRequest.upsert({
      where: { userId_gymId: { userId: unpaidId, gymId } },
      update: { status: 'REJECTED' },
      create: { userId: unpaidId, gymId, status: 'REJECTED' }
    });
  });

  test.afterAll(async () => {
    if (gymId) {
      try {
        // Prisma cascade deletion logic ensures cleanup handles related nested records (like Attendance logs)
        await prisma.attendance.deleteMany({ where: { gymId } });
        await prisma.joinRequest.deleteMany({ where: { gymId } });
        await prisma.gymMember.deleteMany({ where: { gymId } });
        await prisma.membershipPlan.deleteMany({ where: { gymId } });
        await prisma.gym.deleteMany({ where: { id: gymId } }); // Resilient deleteMany instead of throwing delete()
      } catch (e) {
        console.error("Cleanup warning", e);
      }
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
