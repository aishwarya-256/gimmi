import { test, expect } from '@playwright/test';

test.describe('Authentication & Routing (Customer)', () => {
  // Use the pre-authenticated 'customer' state for this block
  test.use({ storageState: 'e2e/.auth/customer.json' });

  test('authenticated customer sees entry to Customer portal on Home', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Clerk to initialize and show the signed-in state
    const customerButton = page.locator('text=Open Customer App');
    await expect(customerButton).toBeVisible({ timeout: 15000 });
    
    await customerButton.click();
    await expect(page).toHaveURL(/.*\/customer/);
  });
});

test.describe('Authentication & Routing (Unauthenticated)', () => {
  // Use no storage state, so we are a blank anonymous user
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated users are redirected from /customer to /sign-in', async ({ page }) => {
    await page.goto('/customer');
    // NextJS redirect + Clerk middleware will send them to sign-in
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('unauthenticated users are redirected from /admin to /sign-in', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*sign-in.*/);
  });
});

test.describe('Authentication & Routing (Owner)', () => {
  // Use the pre-authenticated 'owner' state for this block
  test.use({ storageState: 'e2e/.auth/owner.json' });

  test('authenticated owner can access /admin and see their dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    const adminHeading = page.locator('text=Welcome to Gimmi Admin');
    await expect(adminHeading).toBeVisible({ timeout: 15000 });
  });
});
