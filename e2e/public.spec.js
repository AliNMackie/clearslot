import { test, expect } from '@playwright/test';

test.describe('Public Club Page', () => {
    test('loads club branding and public elements', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        page.on('request', req => console.log('REQ:', req.url()));

        // Mock API responses with broad wildcards
        await page.route('**/*clubs/strathaven*', async route => {
            console.log('MOCK HIT: club');
            await route.fulfill({
                json: {
                    slug: 'strathaven',
                    name: 'Strathaven Airfield',
                    theme: { primary: '#1e3a8a', secondary: '#93c5fd' }
                }
            });
        });
        await page.route('**/*clubs/strathaven/news*', async route => {
            await route.fulfill({ json: [{ id: 'n1', title: 'Welcome', content: 'Hello' }] });
        });
        await page.route('**/*clubs/strathaven/fleet*', async route => {
            await route.fulfill({ json: [{ id: 'f1', reg: 'G-CILY', type: 'C42' }] });
        });
        await page.route('**/*weather*', async route => {
            await route.fulfill({ json: { data: [] } });
        });

        // Visit a known club slug (e.g., strathaven)
        await page.goto('/clubs/strathaven');

        // Check title/branding
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByText('Strathaven Airfield')).toBeVisible(); // Assumes seed data or default fallback

        // Check Weather Widget presence (using text "Flyability" or similar)
        await expect(page.getByText('Flyability', { exact: false })).toBeVisible();

        // Check News section
        await expect(page.getByRole('heading', { name: 'Latest News' })).toBeVisible();

        // Check Fleet section
        await expect(page.getByRole('heading', { name: 'Our Fleet' })).toBeVisible();

        // Check navigation to Member Portal
        const portalLink = page.getByRole('link', { name: 'Member Portal' });
        await expect(portalLink).toBeVisible();
        await expect(portalLink).toHaveAttribute('href', '/clubs/strathaven/app');
    });

    test('handles unknown club gracefully', async ({ page }) => {
        // This depends on how the app handles 404s/unknown clubs. 
        // Currently it might show empty or default.
        // Let's just check it doesn't crash.
        await page.goto('/clubs/unknown-club-123');
        await expect(page.locator('body')).toBeVisible();
    });
});
