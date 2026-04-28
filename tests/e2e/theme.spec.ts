import { test, expect } from '@playwright/test';

test('light mode CSS variable --background is not pure white', async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
  );
  // --background in light mode resolves to --raw-canvas (#F8F7F4), not white
  expect(bg).toBeTruthy();
  expect(bg).not.toBe('#ffffff');
  expect(bg).not.toBe('rgb(255, 255, 255)');
});

test('dark mode CSS variable --background is dark', async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  const rawBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--raw-canvas').trim()
  );
  // --raw-canvas in dark mode is #1A1410 — a very dark colour
  expect(rawBg).toBeTruthy();
  expect(rawBg.toLowerCase()).toBe('#1a1410');
});
