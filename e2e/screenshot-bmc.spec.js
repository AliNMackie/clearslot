import { test, expect } from '@playwright/test';

test('capture bmc screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/bmc');
    await page.waitForTimeout(2000); // Wait for animations
    await page.screenshot({ path: 'bmc-screenshot.png', fullPage: true });
});
