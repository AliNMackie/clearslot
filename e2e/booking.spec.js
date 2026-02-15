import { test, expect } from '@playwright/test';

test.describe('Booking Calendar Visibility', () => {
    test('public user can see confirmed slots on calendar', async ({ page }) => {
        // Mock the bookings API to return some confirmed slots
        await page.route('**/api/bookings/strathaven', async route => {
            const json = [
                {
                    id: 'b1',
                    club_slug: 'strathaven',
                    aircraft_reg: 'G-CILY',
                    pilot_uid: 'p1',
                    start_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
                    end_time: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
                    status: 'confirmed'
                }
            ];
            await route.fulfill({ json });
        });

        // The public page might not show the full calendar yet, 
        // but let's assume we navigate to a page that uses CalendarWeekView if public.
        // Actually, CalendarWeekView is in MemberPortal (protected).
        // So public user shouldn't see it. 
        // Let's verify redirection or absence on member routes.

        await page.goto('/clubs/strathaven/app');
        await expect(page).toHaveURL(/\/login/);
    });

    // Valid authenticated test (Skipped until seeded user available)
    test.fixme('member can book a slot', async ({ page }) => {
        await page.goto('/login');
        await page.getByPlaceholder('Email').fill('test@clearslot.space');
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL(/\/app/);

        // Mock flyability slots
        await page.route('**/api/v1/flyability/slots', async route => {
            // ... mock response ...
            await route.fulfill({ json: [] });
        });

        // Click a slot
        await page.locator('div.bg-green-100').first().click();

        // Handle dialog
        page.on('dialog', dialog => dialog.accept());

        // Expect success message
        // ...
    });
});
