import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.getByLabel(/email/i).fill('gokulkangeyan@gmail.com');
    await page.getByLabel(/password/i).fill('admin123456!');

    // Click sign in
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Wait until the page receives the cookies.
    console.log('Waiting for dashboard URL...');
    await page.waitForURL('/dashboard', { timeout: 15000 }).catch(async e => {
        console.log('Navigation to dashboard failed/timed out.');
        const content = await page.content();
        console.log('Page content length:', content.length);
        const fs = require('fs');
        fs.writeFileSync('e2e/login_failure.html', content);

        // Also take a screenshot
        await page.screenshot({ path: 'e2e/login_failure.png' });

        throw e;
    });

    // Alternatively, you can wait until the page reaches a state where all cookies are set.
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    console.log('Login successful, saving state...');
    await page.context().storageState({ path: authFile });
});
