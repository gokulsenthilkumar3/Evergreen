import { test } from '@playwright/test';

test('debug page content', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    console.log('Page Title:', title);
    const content = await page.content();
    console.log('Page Content:', content.slice(0, 500)); // First 500 chars
});
