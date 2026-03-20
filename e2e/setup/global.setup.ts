import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFileOwner = path.resolve(__dirname, '../.auth/owner.json');
const authFileMember = path.resolve(__dirname, '../.auth/member.json');
const authFileUnpaid = path.resolve(__dirname, '../.auth/unpaid.json');
const authFileCustomer = path.resolve(__dirname, '../.auth/customer.json');

// Ensure the .auth directory exists
const authDir = path.resolve(__dirname, '../.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

async function loginAndSaveState(page: any, email: string, password: string, storageFile: string) {
  await page.context().clearCookies();
  await page.goto('/sign-in'); // Standard Clerk sign-in page path
  
  // Enter email
  const emailInput = page.locator('input[name="identifier"]');
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(email);
  await page.locator('button.cl-formButtonPrimary').first().click();
  
  // Enter password
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(password);
  await page.locator('button.cl-formButtonPrimary').first().click();
  
  // Wait until we reach the dashboard (e.g. /customer or successfully authenticated state)
  // We check for the Clerk user button or a known dashboard element to ensure auth completed
  await expect(page.locator('.cl-userButtonTrigger').first()).toBeVisible({ timeout: 20000 });
  
  // Save session state (Cookies + LocalStorage)
  await page.context().storageState({ path: storageFile });
  console.log(`Successfully authenticated and saved state for ${email}`);
}

setup('authenticate owner', async ({ page }) => {
  const { TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD } = process.env;
  if (TEST_OWNER_EMAIL && TEST_OWNER_PASSWORD) {
    await loginAndSaveState(page, TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD, authFileOwner);
  } else {
    console.warn('Skipping Owner auth: Missing TEST_OWNER_EMAIL or password');
  }
});

setup('authenticate paid member', async ({ page }) => {
  const { TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD } = process.env;
  if (TEST_MEMBER_EMAIL && TEST_MEMBER_PASSWORD) {
    await loginAndSaveState(page, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD, authFileMember);
  }
});

setup('authenticate unpaid user', async ({ page }) => {
  const { TEST_UNPAID_EMAIL, TEST_UNPAID_PASSWORD } = process.env;
  if (TEST_UNPAID_EMAIL && TEST_UNPAID_PASSWORD) {
    await loginAndSaveState(page, TEST_UNPAID_EMAIL, TEST_UNPAID_PASSWORD, authFileUnpaid);
  }
});

setup('authenticate baseline customer', async ({ page }) => {
  const { TEST_CUSTOMER_EMAIL, TEST_CUSTOMER_PASSWORD } = process.env;
  if (TEST_CUSTOMER_EMAIL && TEST_CUSTOMER_PASSWORD) {
    await loginAndSaveState(page, TEST_CUSTOMER_EMAIL, TEST_CUSTOMER_PASSWORD, authFileCustomer);
  }
});
