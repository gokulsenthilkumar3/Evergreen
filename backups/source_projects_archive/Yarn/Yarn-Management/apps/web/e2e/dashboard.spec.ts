import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
    });

    test('should display dashboard overview', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // Check for main widgets/sections presence based on real page content
        await expect(page.getByText('Welcome back')).toBeVisible();
        await expect(page.getByText('Total Revenue')).toBeVisible();
        await expect(page.getByText('Active Batches')).toBeVisible();
        await expect(page.getByText('Raw Material')).toBeVisible();
    });

    test('should show advanced analytics', async ({ page }) => {
        await expect(page.getByText('Advanced Analytics')).toBeVisible();
        await expect(page.getByText('Revenue & Collection Trend')).toBeVisible();
    });
});
