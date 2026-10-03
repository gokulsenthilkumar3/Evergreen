import { test, expect } from '@playwright/test';

test.describe('Inventory Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/inventory');
    });

    test('should load inventory overview', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Inventory Overview' })).toBeVisible();
    });

    test('should display KPI cards', async ({ page }) => {
        await expect(page.getByText('Raw Material Stock')).toBeVisible();
        await expect(page.getByText('Finished Goods Stock')).toBeVisible();
        await expect(page.getByText('Low Stock Alerts')).toBeVisible();
    });

    test('should allow switching tabs', async ({ page }) => {
        const rawMatTab = page.getByRole('tab', { name: 'Raw Materials' });
        const finishedGoodsTab = page.getByRole('tab', { name: 'Finished Goods' });

        // Default tab should be Raw Materials
        await expect(rawMatTab).toHaveAttribute('aria-selected', 'true');

        // Switch to Finished Goods
        await finishedGoodsTab.click();
        await expect(finishedGoodsTab).toHaveAttribute('aria-selected', 'true');
        await expect(rawMatTab).toHaveAttribute('aria-selected', 'false');

        // Check if Finished Goods content is visible (assuming generic table or specific element)
        // Since component is FinishedGoodsList, likely a table
        // await expect(page.getByRole('grid')).toBeVisible();
    });
});
