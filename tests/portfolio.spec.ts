import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { profile, skills, projects, work } from '../src/data/portfolio';

const pages = [
  { path: '/', label: 'Home', heading: /^Hello, I’m\s*Seojin An$/ },
  { path: '/achievements/', label: 'Achievements', heading: 'Achievements' },
  { path: '/experience/', label: 'Experience', heading: 'Experience' },
  { path: '/links/', label: 'Links', heading: 'Let’s connect' },
];

async function settleMotion(page: Page) {
  // Measure the final reading state, not an intermediate fade's color contrast.
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
  });
}

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
    await expect(page.locator('.brand')).toHaveText(profile.handle);
    await expect(page.locator('.brand-symbol, .brand-mark')).toHaveCount(0);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg?v=wide-brim-tilt15');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/svg+xml');
    await expect(page.locator('.small-dot, .accent-dot')).toHaveCount(0);
    await expect(page.locator('.footer-bottom')).toContainText(`© ${new Date().getFullYear()} ${profile.name}`);
    const badgeDecorations = await page.locator('.status-badge').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node, '::before').content));
    expect(badgeDecorations.every((content) => content === 'none' || content === 'normal')).toBe(true);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://love09010224.github.io${route.path}`);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('body')).not.toContainText(/Lorem ipsum|undefined|TODO|준비 중/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await settleMotion(page);
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(accessibility.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true, animations: 'disabled', scale: 'css' });
  });
}

test('the selected wide-brim favicon loads as an SVG', async ({ page, request }) => {
  await page.goto('/');
  const favicon = page.locator('link[rel="icon"]');
  const href = await favicon.getAttribute('href');
  expect(href).toBe('/favicon.svg?v=wide-brim-tilt15');
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  const svg = await response.text();
  expect(svg).toContain('<title>Rounded bucket hat with a wider brim</title>');
  expect(svg).toContain('transform="rotate(-15 32 32)"');
  expect(svg).toContain('fill="#f3eee9"');
  expect(await favicon.evaluate(async (node) => {
    const image = new Image();
    image.src = (node as HTMLLinkElement).href;
    await image.decode();
    return image.naturalWidth > 0 && image.naturalHeight > 0;
  })).toBe(true);
});

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
  await expect(page.locator('.skill-list li')).toHaveText(skills.flatMap((group) => group.items));
  await expect(page.locator('.education-list')).toContainText('한국디지털미디어고등학교');
  await expect(page.locator('.education-list')).toContainText('2022.03 — 2025.02');
  await expect(page.locator('.education-list')).toContainText('2025.03 — 현재');
  const image = page.locator('.portrait-image');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('alt', /웃고 있는/);
  expect(await image.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
  const imageBox = await image.boundingBox();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.height / imageBox!.width).toBeCloseTo(9 / 8, 2);
  expect(await image.evaluate((node) => getComputedStyle(node).objectPosition)).toBe('50% 0%');
});

test('all 13 CTF results, two CVEs and the project are included', async ({ page }) => {
  await page.goto('/achievements/');
  await expect(page.locator('[data-result]:visible')).toHaveCount(6);
  await page.locator('summary').click();
  await expect(page.locator('[data-result]:visible')).toHaveCount(13);
  await expect(page.locator('.cve-id')).toHaveText(['CVE-2026-47193', 'CVE-2026-52779']);
  await expect(page.locator('.project-content h3')).toHaveText(projects.map((project) => project.name));
  await expect(page.locator('.project-subtitle')).toHaveText(projects.map((project) => project.subtitle));
  await expect(page.locator('.project-role')).toHaveText(projects.map((project) => project.role).filter(Boolean));
  await settleMotion(page);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(accessibility.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
});

test('work roles match the content and all activities have the supplied dates', async ({ page }) => {
  await page.goto('/experience/');
  await expect(page.locator('.timeline li')).toHaveCount(4);
  await expect(page.locator('.timeline li').nth(0)).toContainText('버비컴퍼니');
  await expect(page.locator('.timeline .date-range')).toHaveText(['2025.09 — 현재', '2025.03 — 현재', '2026.09 — 현재', '2026.04 — 현재']);
  await expect(page.locator('.work-role')).toHaveText(work.map((item) => item.role).filter(Boolean));
});

test('contact email opens the supplied mail address', async ({ page }) => {
  await page.goto('/links/');
  const email = page.getByRole('link', { name: `${profile.email} 이메일 보내기` });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute('href', 'mailto:love09010224@uos.ac.kr');
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

test('a custom 404 page is present', async ({ page }, testInfo) => {
  const response = await page.goto('/not-a-real-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg?v=wide-brim-tilt15');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('이 페이지는 찾을 수 없어요.');
  const image = page.getByRole('img', { name: '울먹이며 휴대폰을 들고 있는 Seojin An의 캐릭터' });
  await expect(image).toBeVisible();
  expect(await image.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await settleMotion(page);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(accessibility.violations.map(({ id }) => id)).toEqual([]);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true, animations: 'disabled', scale: 'css' });
  const homeLink = page.getByRole('link', { name: 'Back to home' });
  await expect(homeLink).toHaveAttribute('href', '/');
  await homeLink.click();
  await expect(page).toHaveURL('/');
});
