import { test, expect } from '@playwright/test';

/**
 * Character Management E2E Tests
 * Tests CRUD operations for character creation, listing, editing, and deletion
 */

// Helper to authenticate if needed
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Character Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you'd set up test auth session
    // For now, tests assume user is already logged in or tests run in authenticated context
    await page.goto(`${BASE_URL}/dashboard/characters`);
  });

  test('Load characters page', async ({ page }) => {
    // Should load characters list
    await expect(page.locator('h1')).toContainText('Personajes');
    await expect(page.locator('a')).toContainText('+ Nuevo Personaje');
  });

  test('Navigate to create character form', async ({ page }) => {
    await page.click('a:has-text("+ Nuevo Personaje")');
    await page.waitForURL(`${BASE_URL}/dashboard/characters/new`);
    await expect(page.locator('h1')).toContainText('Crear Personaje');
  });

  test('Create character with valid data', async ({ page }) => {
    await page.click('a:has-text("+ Nuevo Personaje")');

    // Fill form
    await page.fill('input[placeholder*="Gandalf"]', 'Test Mago');
    await page.selectOption('select', { index: 5 }); // Select race

    // Select class
    const classSelects = await page.locator('select').all();
    await classSelects[1].selectOption('Mago');

    // Fill basic info
    await page.fill('input[type="number"][min="1"][max="20"]', '5');
    await page.fill('input[type="number"][min="1"][max="999"]', '20'); // HP

    // Click Forjar button
    const buttons = await page.locator('button').all();
    const submitBtn = buttons[buttons.length - 1];

    // Check if we stay on form with validation error or navigate away
    const originalUrl = page.url();
    await submitBtn.click();

    // Should navigate to characters list on success
    await page.waitForTimeout(1000);
    const newUrl = page.url();
    expect(newUrl).not.toBe(originalUrl);
  });

  test('Form validation: requires character name', async ({ page }) => {
    await page.click('a:has-text("+ Nuevo Personaje")');

    // Try to submit empty form
    const buttons = await page.locator('button').all();
    const submitBtn = buttons[buttons.length - 1];
    await submitBtn.click();

    // Should stay on page (form validation)
    // HTML5 required should prevent submit or show browser validation
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/new');
  });
});

test.describe('Character Detail View', () => {
  test('Display character sheet', async ({ page }) => {
    // First navigate to characters list
    await page.goto(`${BASE_URL}/dashboard/characters`);

    // Get first character link if available
    const charLinks = await page.locator('a[href*="/dashboard/characters/"]').all();

    if (charLinks.length > 0) {
      // Click first character
      await charLinks[0].click();

      // Should show character details
      await expect(page.locator('button')).toContainText('Editar');
      await expect(page.locator('button')).toContainText('Eliminar');
    }
  });

  test('Edit character attributes', async ({ page }) => {
    // Navigate to a character (if available)
    await page.goto(`${BASE_URL}/dashboard/characters`);

    const charLinks = await page.locator('a[href*="/dashboard/characters/"]').all();

    if (charLinks.length === 0) {
      test.skip();
    }

    await charLinks[0].click();

    // Click edit button
    await page.click('button:has-text("Editar")');

    // Should show edit inputs
    const inputs = await page.locator('input[type="text"]').all();
    expect(inputs.length).toBeGreaterThan(0);

    // Click cancel button
    await page.click('button:has-text("Cancelar")');

    // Should return to view mode
    await expect(page.locator('button')).toContainText('Editar');
  });

  test('Cannot delete without confirmation', async ({ page }) => {
    page.on('dialog', dialog => {
      expect(dialog.type()).toBe('confirm');
      dialog.dismiss();
    });

    await page.goto(`${BASE_URL}/dashboard/characters`);
    const charLinks = await page.locator('a[href*="/dashboard/characters/"]').all();

    if (charLinks.length === 0) {
      test.skip();
    }

    await charLinks[0].click();

    const deleteBtn = await page.locator('button:has-text("Eliminar")').first();
    await deleteBtn.click();

    // Should stay on page after dismissing confirm
    await page.waitForTimeout(300);
    expect(page.url()).toContain('/characters/');
  });
});

test.describe('Error Handling', () => {
  test('Shows error if character fetch fails (mock scenario)', async ({ page }) => {
    // This is a basic check that error state is handled
    // In real scenario, you'd mock the API or simulate network error
    await page.goto(`${BASE_URL}/dashboard/characters`);

    // Should either show characters or error message, not both blank
    const hasContent = await page.locator('h1').isVisible();
    expect(hasContent).toBe(true);
  });

  test('Redirects to login if not authenticated', async ({ page, context }) => {
    // Clear any auth tokens to simulate unauthenticated state
    await context.clearCookies();

    await page.goto(`${BASE_URL}/dashboard/characters`);

    // Should redirect to login
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });
});
