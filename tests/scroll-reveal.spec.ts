import { test, expect } from '@playwright/test';

test('navigation and reload do not replay entrance effects in the initial viewport', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as typeof window & { revealCalls: string[] };
    state.revealCalls = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (this: Element, ...args: Parameters<Element['animate']>) {
      if (this.hasAttribute('data-reveal')) state.revealCalls.push(this.className);
      return animate.apply(this, args);
    };
  });
  const expectNoEntranceEffect = async () => {
    await expect(page.locator('main [data-reveal]').first()).toHaveAttribute('data-reveal', 'visible');
    expect(await page.evaluate(() => (window as typeof window & { revealCalls: string[] }).revealCalls)).toEqual([]);
  };

  await page.goto('/');
  await expectNoEntranceEffect();
  for (const label of ['Achievements', 'Experience', 'Links', 'Home']) {
    await page.getByRole('navigation', { name: '메인 메뉴' }).getByRole('link', { name: label, exact: true }).click();
    await expectNoEntranceEffect();
  }
  await page.reload();
  await expectNoEntranceEffect();
  await page.goBack();
  await expectNoEntranceEffect();

  // The navigation fix must not disable subsequent scroll-triggered motion.
  await page.getByRole('navigation', { name: '메인 메뉴' }).getByRole('link', { name: 'Achievements', exact: true }).click();
  await expectNoEntranceEffect();
  const project = page.locator('.project-card');
  await expect(project).toHaveAttribute('data-reveal', 'pending');
  await project.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(project).toHaveAttribute('data-reveal', 'visible');
  expect(await page.evaluate(() => (window as typeof window & { revealCalls: string[] }).revealCalls)).toContain('project-card');
});

test('content on every page participates, but navigation stays still', async ({ page }) => {
  for (const path of ['/', '/achievements/', '/experience/', '/links/', '/not-a-real-page/']) {
    await page.goto(path);
    await expect(page.locator('[data-reveal]').first()).toHaveAttribute('data-reveal', 'visible');
    expect(await page.locator('main [data-reveal]').count()).toBeGreaterThan(1);
    await expect(page.locator('.site-header [data-reveal]')).toHaveCount(0);
    await expect(page.locator('.footer-bottom')).toHaveAttribute('data-reveal', /pending|visible/);
  }
});

test('below-fold content rises and fades in once, without changing the layout', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.highlight-card').last();
  await expect(card).toHaveAttribute('data-reveal', 'pending');
  // Pending content is not hidden by CSS: JS failure cannot hide the portfolio.
  await expect(card).toHaveCSS('opacity', '1');
  const height = await card.evaluate((element) => (element as HTMLElement).offsetHeight);
  await card.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(card).toHaveAttribute('data-reveal', 'visible');
  const frames = await card.evaluate((element) => element.getAnimations().flatMap((animation) => (animation.effect as KeyframeEffect).getKeyframes()));
  expect(frames.some((frame) => Number(frame.opacity) === 0 && /(?:16|20)px/.test(String(frame.translate)))).toBe(true);
  await expect.poll(() => card.evaluate((element) => element.getAnimations().length)).toBe(0);
  await expect(card).toHaveCSS('opacity', '1');
  await expect(card).toHaveCSS('translate', 'none');
  expect(await card.evaluate((element) => (element as HTMLElement).offsetHeight)).toBe(height);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await card.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0);
});

test('reduced motion shows everything immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-copy')).toHaveAttribute('data-reveal', 'visible');
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator('.highlight-card').last()).toHaveCSS('opacity', '1');
});

test('enabling reduced motion stops effects and clears pending blocks', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.highlight-card').last()).toHaveAttribute('data-reveal', 'pending');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('keyboard focus reveals a card immediately without waiting for motion', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.highlight-card').last();
  await expect(card).toHaveAttribute('data-reveal', 'pending');
  await card.focus();
  await expect(card).toBeFocused();
  await expect(card).toHaveAttribute('data-reveal', 'visible');
  await expect(card).toHaveCSS('opacity', '1');
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0);
});

test('fragment navigation bypasses motion for the destination section', async ({ page }) => {
  await page.goto('/achievements/#cves');
  const cards = page.locator('.cve-card');
  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute('data-reveal', 'visible');
    expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0);
  }
  await page.locator('.section-nav a[href="#projects"]').click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('.project-card')).toHaveAttribute('data-reveal', 'visible');
  await expect.poll(() => page.locator('.project-card').evaluate((element) => element.getAnimations().length)).toBe(0);
});

test('opening more results still reveals the newly displayed rows', async ({ page }) => {
  await page.goto('/achievements/');
  const lastRow = page.locator('.more-results .result-row').last();
  await expect(lastRow).toHaveAttribute('data-reveal', 'pending');
  await page.locator('.more-results summary').click();
  await lastRow.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(lastRow).toHaveAttribute('data-reveal', 'visible');
  await expect.poll(() => lastRow.evaluate((element) => element.getAnimations().length)).toBe(0);
  await expect(lastRow).toHaveCSS('opacity', '1');
});

test('unsupported browsers retain visible content', async ({ page }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(window, 'IntersectionObserver'); });
  await page.goto('/');
  await expect(page.locator('.hero-copy')).toHaveAttribute('data-reveal', 'visible');
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await expect(page.locator('.highlight-card').last()).toHaveCSS('opacity', '1');
});

test('printing stops reveal effects', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.highlight-card').last()).toHaveAttribute('data-reveal', 'pending');
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('portfolio content and navigation remain available', async ({ page }) => {
    for (const path of ['/', '/achievements/', '/experience/', '/links/']) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('main')).toHaveCSS('opacity', '1');
      await expect(page.locator('[data-reveal]')).toHaveCount(0);
    }
    await page.goto('/achievements/');
    await page.locator('.more-results summary').click();
    await expect(page.locator('.more-results .result-row').last()).toBeVisible();
  });
});
