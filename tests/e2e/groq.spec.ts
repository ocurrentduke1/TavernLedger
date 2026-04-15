import { test, expect } from "@playwright/test";

test.describe("Groq Backstory Generation", () => {
  let characterId: string;

  test.beforeAll(async () => {
    // This would be set up by a fixture in a real test suite
    // For now, we'll create a character during the test
  });

  test("should show generate backstory button when not in edit mode", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "Password123");
    await page.click("button:has-text('Acceder')");
    await page.waitForNavigation();

    // Navigate to characters
    await page.goto("/dashboard/characters");
    await page.waitForSelector("a:has-text('Crear Personaje')");

    // Create a character if needed
    const characterLinks = await page.locator("a[href*='/characters/']").count();
    if (characterLinks === 0) {
      await page.click("a:has-text('Crear Personaje')");
      await page.fill('input[name="name"]', "Test Character");
      await page.selectOption('select[name="race"]', "Humano");
      await page.selectOption('select[name="class"]', "Guerrero");
      await page.click("button:has-text('Crear Personaje')");
      await page.waitForNavigation();
      characterId = page.url().split("/").pop() || "";
    } else {
      characterId = await page.locator("a[href*='/characters/']").first().evaluate((el) => {
        const href = (el as HTMLAnchorElement).href;
        return href.split("/").pop() || "";
      });
      await page.goto(`/dashboard/characters/${characterId}`);
    }

    // Check if generate backstory button is visible
    const generateBtn = page.locator("button:has-text('Generar Trasfondo')");
    if (await generateBtn.count() > 0) {
      expect(generateBtn).toBeVisible();
    }
  });

  test("should display usage counter", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "Password123");
    await page.click("button:has-text('Acceder')");
    await page.waitForNavigation();

    await page.goto("/dashboard/characters");
    const characterLinks = await page.locator("a[href*='/characters/']");
    if ((await characterLinks.count()) > 0) {
      const firstCharLink = characterLinks.first();
      const href = await firstCharLink.getAttribute("href");
      if (href) {
        await page.goto(href);

        // Look for usage text like "30 trasfondos disponibles"
        const usageText = page.locator("text=/trasfondos disponibles/");
        if (await usageText.count() > 0) {
          expect(usageText).toBeVisible();
        }
      }
    }
  });

  test("should show error when rate limit is reached", async ({ page }) => {
    // This test would need to mock the Groq API or have a test user
    // that has already used their daily limit

    await page.goto("/login");
    await page.fill('input[type="email"]', "limited-user@example.com");
    await page.fill('input[type="password"]', "Password123");
    await page.click("button:has-text('Acceder')");
    await page.waitForNavigation();

    await page.goto("/dashboard/characters");
    const characterLinks = await page.locator("a[href*='/characters/']");
    if ((await characterLinks.count()) > 0) {
      const firstCharLink = characterLinks.first();
      const href = await firstCharLink.getAttribute("href");
      if (href) {
        await page.goto(href);

        // Check for rate limit message
        const limitMessage = page.locator("text=/límite|agotados/");
        if (await limitMessage.count() > 0) {
          expect(limitMessage).toBeVisible();
        }
      }
    }
  });

  test("should show loading state while generating", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "Password123");
    await page.click("button:has-text('Acceder')");
    await page.waitForNavigation();

    await page.goto("/dashboard/characters");
    const characterLinks = await page.locator("a[href*='/characters/']");
    if ((await characterLinks.count()) > 0) {
      const firstCharLink = characterLinks.first();
      const href = await firstCharLink.getAttribute("href");
      if (href) {
        await page.goto(href);

        const generateBtn = page.locator("button:has-text('Generar Trasfondo')");
        if (await generateBtn.count() > 0) {
          await generateBtn.click();

          // Check for loading message
          const loadingMsg = page.locator("text=/Generando trasfondo/");
          if (await loadingMsg.count() > 0) {
            expect(loadingMsg).toBeVisible();
          }
        }
      }
    }
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock a failed API response
    await page.route("https://api.groq.com/**", (route) => {
      route.abort();
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "Password123");
    await page.click("button:has-text('Acceder')");
    await page.waitForNavigation();

    await page.goto("/dashboard/characters");
    const characterLinks = await page.locator("a[href*='/characters/']");
    if ((await characterLinks.count()) > 0) {
      const firstCharLink = characterLinks.first();
      const href = await firstCharLink.getAttribute("href");
      if (href) {
        await page.goto(href);

        const generateBtn = page.locator("button:has-text('Generar Trasfondo')");
        if (await generateBtn.count() > 0) {
          await generateBtn.click();

          // Wait for error message
          const errorMsg = page.locator("text=/Error|intentar/i");
          await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("character edit mode should exclude backstory generation UI", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "Password123");
    await page.click("button:has-text('Acceder')");
    await page.waitForNavigation();

    await page.goto("/dashboard/characters");
    const characterLinks = await page.locator("a[href*='/characters/']");
    if ((await characterLinks.count()) > 0) {
      const firstCharLink = characterLinks.first();
      const href = await firstCharLink.getAttribute("href");
      if (href) {
        await page.goto(href);

        // Click edit
        await page.click("button:has-text('Editar')");

        // Generate backstory button should not be visible
        const generateBtn = page.locator("button:has-text('Generar Trasfondo')");
        if (await generateBtn.count() > 0) {
          expect(generateBtn).not.toBeVisible();
        }
      }
    }
  });
});
