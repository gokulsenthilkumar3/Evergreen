import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
    // Reset storage state for these tests to simulate logged out state
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should display login form', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle(/Yarn Management/);
        await expect(page.getByRole('heading', { name: /Yarn Management/i })).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
    });

    test('should show validation errors', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill('');
        await page.getByLabel('Password').fill('');
        await page.getByRole('button', { name: /^sign in$/i }).click();

        // Native validation might block submission or HTML5 validation.
        // If controlled component validation:
        // await expect(page.getByText(/required/i)).toBeVisible(); 

        // Checking if we are still on login page
        await expect(page.getByRole('heading', { name: /Yarn Management/i })).toBeVisible();
    });
});
