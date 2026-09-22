import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { path: '/', label: 'Home', heading: /Hello, I’m\s*Seojin An\./ },
  { path: '/achievements/', label: 'Achievements', heading: 'Achievements.' },
  { path: '/experience/', label: 'Experience', heading: 'Experience.' },
  { path: '/links/', label: 'Links', heading: 'Let’s connect.' },
];

for (const route of pages) {
  test(`${route.label}: content, accessibility and visual check`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveTitle(/Seojin An/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(route.heading);
    await expect(page.locator('.main-nav a[aria-current="page"]')).toHaveText(route.label);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://love09010224.github.io${route.path}`);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('body')).not.toContainText(/Lorem ipsum|undefined|TODO|준비 중/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(accessibility.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true, animations: 'disabled', scale: 'css' });
  });
}

test('navigation supports direct loads, clicks, reload and back', async ({ page }) => {
  await page.goto('/');
  for (const route of pages.slice(1)) {
    await page.getByRole('navigation', { name: '메인 메뉴' }).getByRole('link', { name: route.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route.path}$`));
    await page.reload();
    await expect(page.locator('.main-nav a[aria-current="page"]')).toHaveText(route.label);
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/experience\/$/);
});

test('all provided skills and education, and the smiling portrait are present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.skill-list li')).toHaveText(['System Hacking', 'Reverse Engineering', 'Bug Bounty', 'Python', 'C', 'C++', 'Java', 'TypeScript', 'React', 'MySQL', 'MongoDB']);
  await expect(page.locator('.education-list')).toContainText('한국디지털미디어고등학교');
  await expect(page.locator('.education-list')).toContainText('2022.03 — 2025.02');
  await expect(page.locator('.education-list')).toContainText('2025.03 — 현재');
  const image = page.locator('.portrait-image');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('alt', /웃고 있는/);
  expect(await image.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
});

test('all 13 CTF results, two CVEs and the project are included', async ({ page }) => {
  await page.goto('/achievements/');
  await expect(page.locator('[data-result]:visible')).toHaveCount(6);
  await page.locator('summary').click();
  await expect(page.locator('[data-result]:visible')).toHaveCount(13);
  await expect(page.locator('.cve-id')).toHaveText(['CVE-2026-47193', 'CVE-2026-52779']);
  await expect(page.locator('.project-card')).toContainText('SHA & Doorlock');
  await expect(page.locator('.project-card')).toContainText('2026 방탈출 CTF');
  await expect(page.locator('.project-role')).toHaveCount(0);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(accessibility.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
});

test('work roles stay empty and all activities have the supplied dates', async ({ page }) => {
  await page.goto('/experience/');
  await expect(page.locator('.timeline li')).toHaveCount(4);
  await expect(page.locator('.timeline li').nth(0)).toContainText('버비컴퍼니');
  await expect(page.locator('.timeline .date-range')).toHaveText(['2025.09 — 현재', '2025.03 — 현재', '2026.09 — 현재', '2026.04 — 현재']);
  await expect(page.locator('.work-role')).toHaveCount(0);
});

test('Discord copy works without navigation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/links/');
  await page.getByRole('button', { name: 'Discord 아이디 복사', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('복사했어요');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('anseojin3235');
  await expect(page).toHaveURL(/\/links\/$/);
});

test('Discord copy has an accessible failure fallback', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Not allowed')) }, configurable: true }));
  await page.goto('/links/');
  await page.getByRole('button', { name: 'Discord 아이디 복사', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('직접 복사');
  await expect(page.locator('#discord-handle')).toHaveText('anseojin3235');
});

test('local links and fragment targets resolve', async ({ page, request }) => {
  const targets = new Set<string>();
  for (const route of pages) {
    await page.goto(route.path);
    const links = await page.locator('a[href]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).getAttribute('href')!));
    for (const href of links) {
      expect(href).not.toBe('');
      expect(href).not.toBe('#');
      if (href.startsWith('/')) targets.add(href);
      else if (href.startsWith('#')) targets.add(`${route.path}${href}`);
    }
  }
  for (const href of targets) {
    const [path, fragment] = href.split('#');
    const response = await request.get(path);
    expect(response.status(), href).toBe(200);
    if (fragment) expect(await response.text(), href).toContain(`id="${fragment}"`);
  }
});

test('layouts do not overflow at narrow, tablet and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 560, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of pages) {
      await page.goto(route.path);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route.path} at ${width}px`).toBe(true);
      for (const label of pages.map((item) => item.label)) await expect(page.locator('.main-nav').getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  }
});

test('skip link is keyboard accessible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('a custom 404 page is present', async ({ page }) => {
  const response = await page.goto('/not-a-real-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('이 페이지는 찾을 수 없어요.');
  await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
});
