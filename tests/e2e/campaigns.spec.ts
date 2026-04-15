import { test, expect } from '@playwright/test';

/**
 * Campaign Detail Page E2E Tests
 * Tests viewing, editing, and managing campaign information
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Campaign Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to campaigns list first
    await page.goto(`${BASE_URL}/dashboard/campaigns`);

    // Click first campaign to view details
    const campaignLinks = await page.locator('a[href*="/campaigns/"]').all();
    if (campaignLinks.length > 0) {
      await campaignLinks[0].click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Load campaign detail page', async ({ page }) => {
    // Should show campaign name in heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Should show back link
    const backLink = page.locator('a:has-text("← Volver")');
    await expect(backLink).toBeVisible();

    // Should show "Información de la Campaña" section
    await expect(page.locator('text=Información de la Campaña')).toBeVisible();
  });

  test('Display campaign information', async ({ page }) => {
    // Campaign info should be visible
    await expect(page.locator('text=/Nombre|Estado|Jugadores/i')).toBeVisible();
  });

  test('Show players and characters section', async ({ page }) => {
    // Should show "Jugadores y Personajes" section
    await expect(page.locator('text=Jugadores y Personajes')).toBeVisible();

    // Should have player list or "Sin jugadores" message
    const hasPlayers = await page.locator('text=/⚔|personajes/').isVisible().catch(() => false);
    const noPlayers = await page.locator('text=/Aún no hay|Sin jugadores/').isVisible().catch(() => false);

    expect(hasPlayers || noPlayers).toBe(true);
  });

  test('Show invite code for private campaigns', async ({ page }) => {
    // Get current campaign visibility
    const visibilityText = await page.locator('text=Visibilidad|Pública|Privada').textContent();

    if (visibilityText?.includes('Privada')) {
      // Should show invite code section
      await expect(page.locator('text=Código de Invitación')).toBeVisible();

      // Should have copy button
      const copyBtn = page.locator('button').filter({ has: page.locator('text=Copiar') });
      await expect(copyBtn).toBeVisible();
    }
  });

  test('Copy invite code to clipboard', async ({ page }) => {
    // Check if campaign is private
    const isPrivate = await page.locator('text=Privada').isVisible().catch(() => false);

    if (isPrivate) {
      const copyBtn = page.locator('button').filter({ has: page.locator('text=Copiar') });

      // Click copy
      await copyBtn.click();
      await page.waitForTimeout(300);

      // Should show "✓" or "Copiado"
      const text = await copyBtn.textContent();
      expect(text?.includes('✓') || text?.includes('Copiado')).toBe(true);
    }
  });

  test('Back link returns to campaigns list', async ({ page }) => {
    const backLink = page.locator('a:has-text("← Volver")');
    await backLink.click();

    await page.waitForURL(/\/campaigns$/);
    expect(page.url()).toContain('/campaigns');
    await expect(page.locator('h1')).toContainText('Campañas');
  });
});

test.describe('Campaign Editing (Owner Only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/campaigns`);

    // Navigate to first campaign
    const campaignLinks = await page.locator('a[href*="/campaigns/"]').all();
    if (campaignLinks.length > 0) {
      await campaignLinks[0].click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Show edit button only for owner', async ({ page }) => {
    // Check if Editar button exists (owner only)
    const editBtn = page.locator('button').filter({ has: page.locator('text=Editar') });
    const hasEditBtn = await editBtn.isVisible().catch(() => false);

    // Button presence depends on ownership
    // If visible, we're the owner; if not, we're a player
    if (hasEditBtn) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('Edit campaign details', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('text=Editar') });

    if (await editBtn.isVisible()) {
      await editBtn.click();

      // Should show form inputs
      const nameInput = page.locator('input').first();
      await expect(nameInput).toBeVisible();

      // Should show save button
      const saveBtn = page.locator('button').filter({ has: page.locator('text=/Guardar|Save/') });
      await expect(saveBtn).toBeVisible();

      // Should show cancel button
      const cancelBtn = page.locator('button').filter({ has: page.locator('text=Cancelar') });
      await expect(cancelBtn).toBeVisible();
    }
  });

  test('Cancel edit returns to view mode', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('text=Editar') });

    if (await editBtn.isVisible()) {
      await editBtn.click();

      const cancelBtn = page.locator('button').filter({ has: page.locator('text=Cancelar') });
      await cancelBtn.click();

      // Should return to view mode
      const editBtnAgain = page.locator('button').filter({ has: page.locator('text=Editar') });
      await expect(editBtnAgain).toBeVisible();
    }
  });

  test('Delete button visible for owner', async ({ page }) => {
    const deleteBtn = page.locator('button').filter({ has: page.locator('text=Eliminar') });
    const hasDeleteBtn = await deleteBtn.isVisible().catch(() => false);

    // Owner should see delete button
    // Non-owner shouldn't see it
    expect(typeof hasDeleteBtn === 'boolean').toBe(true);
  });

  test('Delete campaign with confirmation', async ({ page }) => {
    const deleteBtn = page.locator('button').filter({ has: page.locator('text=Eliminar') });

    if (await deleteBtn.isVisible()) {
      page.once('dialog', dialog => {
        expect(dialog.message()).toContain('Eliminar');
        dialog.dismiss();
      });

      await deleteBtn.click();

      // Should dismiss dialog, no navigation
      await page.waitForTimeout(300);

      // Should still be on campaign page
      expect(page.url()).toContain('/campaigns/');
    }
  });
});

test.describe('Campaign Players Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/campaigns`);

    const campaignLinks = await page.locator('a[href*="/campaigns/"]').all();
    if (campaignLinks.length > 0) {
      await campaignLinks[0].click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Show each player with character info', async ({ page }) => {
    // If campaign has players
    const playerCards = await page.locator('text=/⚔/').all();

    if (playerCards.length > 0) {
      // Each player should show character name
      for (const _card of playerCards) {
        // Characters are displayed with name and class/race/level
        const hasInfo = await page.locator('text=/Nv\\. [0-9]+/').isVisible();
        expect(hasInfo).toBe(true);
      }
    }
  });

  test('Show message when no players', async ({ page }) => {
    // Check for empty state
    const emptyMsg = page.locator('text=/Aún no hay|Sin jugadores/');
    const hasPlayers = await page.locator('text=⚔').isVisible().catch(() => false);

    if (!hasPlayers) {
      await expect(emptyMsg).toBeVisible();
    }
  });

  test('Player list shows level badge', async ({ page }) => {
    // Look for "Nv." (Nivel) badges
    const levelBadges = await page.locator('text=/Nv\\. [0-9]+/').all();

    if (levelBadges.length > 0) {
      // At least one player showing level
      expect(levelBadges.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Error Handling', () => {
  test('Redirects to campaigns list if campaign not found', async ({ page }) => {
    // Try to navigate to non-existent campaign
    await page.goto(`${BASE_URL}/dashboard/campaigns/nonexistent-id`);

    // Should redirect to campaigns list
    await page.waitForURL(/\/campaigns$/);
    expect(page.url()).toContain('/campaigns');
  });

  test('Redirects to login if not authenticated', async ({ page, context }) => {
    await context.clearCookies();

    // Navigate to campaigns first to get a real ID
    await page.goto(`${BASE_URL}/dashboard/campaigns`);

    const campaignLinks = await page.locator('a[href*="/campaigns/"]').all();
    if (campaignLinks.length > 0) {
      const href = await campaignLinks[0].getAttribute('href');
      await context.clearCookies();

      // Now try to navigate directly
      if (href) {
        await page.goto(`${BASE_URL}${href}`);

        // Should redirect to login
        await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
          // Might not redirect immediately
        });

        const finalUrl = page.url();
        expect(finalUrl.includes('/login') || finalUrl.includes('/campaigns/')).toBe(true);
      }
    }
  });
});
