import { test, expect } from '@playwright/test';

test.describe('Procurement Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/procurement');
    });

    test('should load procurement overview', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Procurement' })).toBeVisible();
    });

    test('should navigate to Suppliers tab', async ({ page }) => {
        const suppliersTab = page.getByRole('tab', { name: 'Suppliers' });
        await suppliersTab.click();

        // Check if tab is selected
        await expect(suppliersTab).toHaveAttribute('aria-selected', 'true');

        // Check content (assuming there's a button to add supplier or a table)
        // If content is empty, maybe check for empty state text or just the container presence
        // Assuming there is an "Add Supplier" button
        await expect(page.getByRole('button', { name: /add supplier/i })).toBeVisible();
    });

    // test('should navigate to Raw Materials tab', async ({ page }) => {
    //     const tab = page.getByRole('tab', { name: 'Raw Materials' });
    //     await tab.click();
    //     await expect(tab).toHaveAttribute('aria-selected', 'true');

    //     await expect(page.getByRole('button', { name: /add stock/i })).toBeVisible();
    // });

    test('should navigate to Purchase Orders tab', async ({ page }) => {
        const tab = page.getByRole('tab', { name: 'Purchase Orders' });
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');

        await expect(page.getByRole('button', { name: /create po/i })).toBeVisible();
    });
});
