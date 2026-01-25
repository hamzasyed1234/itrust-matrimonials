import { test, expect } from '@playwright/test';

test.setTimeout(90_000);

test('iTrust Matrimonials – main user flow', async ({ page }) => {
  // ─────────────────────────────
  // Home & Login
  // ─────────────────────────────
  await page.goto('https://itrust-matrimonials.onrender.com/', {
    waitUntil: 'networkidle',
  });

  await page.getByRole('button', { name: /log in/i }).click();

  await page.getByRole('textbox', { name: /email/i }).fill('hamzasy416@gmail.com');
  await page.getByRole('textbox', { name: /password/i }).fill('123456');

  const loginButton = page.getByRole('button', { name: /log in/i });
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // ─────────────────────────────
  // Profile edits
  // ─────────────────────────────
  await page.waitForLoadState('networkidle');

  await page.locator('.edit-icon').first().click();
  await page.getByRole('button', { name: '✓' }).click();

  await page.getByRole('button', { name: '✏️' }).nth(1).click();
  await page.getByRole('button', { name: '✓' }).click();

  // ─────────────────────────────
  // Search & Filters
  // ─────────────────────────────
  await page.getByRole('button', { name: /search/i }).click();

  await page.getByRole('button', { name: '✕' }).click();

  const ethnicitySelect = page.locator('.css-19bb58m').first();
  await ethnicitySelect.click();
  await page.getByRole('option', { name: /african/i }).click();

  await ethnicitySelect.click();
  await page.locator('#react-select-4-option-0').click();

  // ─────────────────────────────
  // Matches & Requests
  // ─────────────────────────────
  await page.getByRole('button', { name: /matches/i }).click();
  await page.getByRole('button', { name: /sent/i }).click();
  await page.getByRole('button', { name: /inbox/i }).click();

  // ─────────────────────────────
  // Feedback
  // ─────────────────────────────
  await page.getByRole('button', { name: /feedback/i }).click();

  await page.getByRole('textbox', { name: /full name/i }).fill('Hamza');
  await page.getByRole('textbox', { name: /email address/i }).fill('hamzasy416@gmail.com');
  await page.getByRole('textbox', { name: /phone number/i }).fill('213546451321');
  await page.getByRole('textbox', { name: /feedback/i }).fill('LOL TEST');

  await page.getByRole('button', { name: /submit/i }).click();

  // ─────────────────────────────
  // Back Home
  // ─────────────────────────────
  await page.getByRole('button', { name: /home/i }).click();
  await expect(page.getByText(/itrust muslim matrimonials/i)).toBeVisible();
});
