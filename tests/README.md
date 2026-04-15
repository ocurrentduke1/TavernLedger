# Testing Guide - TavernLedger

## E2E Testing with Playwright

This project uses **Playwright** for end-to-end testing. Tests verify critical user flows across all modules.

### Setup

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in UI mode (interactive, visual feedback)
npm run test:ui

# Run tests in debug mode (step through execution)
npm run test:debug

# Run specific test file
npx playwright test tests/e2e/characters.spec.ts

# Run tests matching pattern
npx playwright test --grep "Character Management"

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Test Structure

Tests are organized by feature:

- **`tests/e2e/characters.spec.ts`** - Character CRUD operations
  - List characters
  - Create character with validation
  - Edit character attributes
  - Delete character with confirmation
  - Error handling & auth checks

- **`tests/e2e/dice.spec.ts`** - Dice roller functionality
  - Roll different die types (d4-d20, d100)
  - Apply modifiers
  - Detect critical (natural 20) and fumbles (natural 1)
  - Track roll history
  - Character association

### Configuration

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Reporters**: HTML report saved in `playwright-report/`
- **Screenshots**: Only captured on test failure
- **Retries**: 2x in CI, 0x locally

### Important Notes

1. **Authentication**: Tests assume you're logged in or have test credentials
   - For local dev: manually log in, then run tests
   - For CI: Mock auth or use test user credentials

2. **Test Data**: Tests create/modify data during execution
   - Can be run against local dev database
   - Consider data cleanup between runs in production

3. **Flaky Tests**: Some tests (critical/fumble detection) involve randomness
   - These retry/allow multiple attempts to avoid false negatives
   - Consider mocking randomness for deterministic tests

### CI/CD Integration

To run in CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Playwright tests
  run: npm run test
  env:
    BASE_URL: ${{ secrets.TEST_URL }}
    PLAYWRIGHT_TIMEOUT: 30000
```

### Debugging

1. **Visual Debugging**: `npm run test:ui` shows browser + test code side-by-side
2. **Logs**: Check `playwright-report/` HTML report for screenshots + trace
3. **Step Through**: `npm run test:debug` pauses at each step

### Adding New Tests

1. Create `.spec.ts` file in `tests/e2e/`
2. Import test framework: `import { test, expect } from '@playwright/test'`
3. Structure: `test.describe()` for suites, `test()` for individual tests
4. Use fixtures: `page`, `context`, `browser` are pre-configured

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature X', () => {
  test('should do something', async ({ page }) => {
    await page.goto('http://localhost:3000/path');
    await page.click('button:has-text("Action")');
    await expect(page.locator('h1')).toContainText('Success');
  });
});
```

### Known Limitations

- Tests require app server running (`npm run dev`)
- Supabase must be accessible (local or remote)
- Auth state persists across tests (intentional)
- Some random-based tests may flake occasionally

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **Tests timeout** | Increase `timeout` in `playwright.config.ts` |
| **Auth fails** | Manually log in test user before running tests |
| **Port 3000 busy** | Change `webServer.url` in config or kill process on 3000 |
| **Flaky tests** | Run multiple times; some random tests need multiple attempts |

---

**Next**: Continue implementing inventory module with similar test coverage.
