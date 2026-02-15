import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('redirects unauthenticated user from protected route', async ({ page }) => {
        await page.goto('/clubs/strathaven/app');

        // Should be redirected to /login?redirect=...
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByRole('heading', { name: 'Member Login' })).toBeVisible(); // Adjust selector based on LoginPage implementation
    });

    test('login page loads correctly', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByPlaceholder('Email', { exact: false })).toBeVisible();
        await expect(page.getByPlaceholder('Password', { exact: false })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
});
