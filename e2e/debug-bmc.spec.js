import { test, expect } from '@playwright/test';
import fs from 'fs';

test('capture bmc console logs', async ({ page }) => {
    const logStream = fs.createWriteStream('debug_console.txt', { flags: 'a' });

    page.on('console', msg => logStream.write(`BROWSER LOG: ${msg.text()}\n`));
    page.on('pageerror', err => logStream.write(`BROWSER ERROR: ${err}\n`));

    await page.goto('http://localhost:5173/bmc');

    try {
        await page.waitForSelector('text=ClearSlot', { timeout: 10000 });
        logStream.write('SUCCESS: Component rendered successfully\n');
    } catch (e) {
        logStream.write(`FAILURE: Component failed to render: ${e}\n`);
        throw e; // Fail the test
    } finally {
        await page.screenshot({ path: 'bmc-debug-screenshot.png', fullPage: true });
        logStream.end();
    }
});
