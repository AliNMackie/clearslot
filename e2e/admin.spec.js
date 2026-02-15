import { test, expect } from '@playwright/test';

test.describe('Admin Workflows', () => {
    // These tests require authentication as an admin.
    // They are skipped by default unless valid credentials are provided via ENV.

    test.skip('admin can post news', async ({ page }) => {
        // 1. Login Logic (would need abstracting)
        await page.goto('/login');
        await page.getByPlaceholder('Email').fill(process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
        await page.getByPlaceholder('Password').fill(process.env.TEST_ADMIN_PASSWORD || 'password');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for redirect to dashboard or navigate manually
        await expect(page).toHaveURL(/\/clubs\/.*\/app/); // Member portal

        // Navigate to Admin Portal
        await page.goto('/clubs/strathaven/admin');
        await expect(page.getByRole('heading', { name: 'Club Admin' })).toBeVisible();

        // 2. Post News
        await page.getByRole('button', { name: 'News' }).click();

        const uniqueTitle = `Test News ${Date.now()}`;
        await page.getByLabel('Title').fill(uniqueTitle);
        await page.getByLabel('Content').fill('Automated test content.');
        await page.getByRole('button', { name: 'Post Update' }).click();

        // 3. Verify
        await expect(page.getByText(uniqueTitle)).toBeVisible();
    });

    test('unauthorized user cannot access admin portal', async ({ page }) => {
        // Without login
        await page.goto('/clubs/strathaven/admin');
        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });
});
