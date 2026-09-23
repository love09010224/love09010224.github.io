// Animate content blocks, not whole sections, so long lists reveal as you read.
const selectors = [
  '.hero-copy', '.portrait', '.page-intro', '.section-heading',
  '.home-section-content:not(.skill-groups):not(.education-list)',
  '.skill-group', '.education-list > li', '.highlight-card',
  '.result-row', '.more-results > summary', '.section-after-link',
  '.cve-card', '.project-card', '.timeline > li', '.page-note',
  '.email-contact', '.social-card', '.links-signoff',
  '.not-found-image', '.not-found-copy', '.footer-bottom',
];

function setupScrollReveal() {
  const targets = [...document.querySelectorAll<HTMLElement>(selectors.join(','))];
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  targets.forEach((target) => { target.dataset.reveal = 'visible'; });

  // The HTML/CSS stays visible without JS, browser support, or motion permission.
  if (preference.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const compact = window.matchMedia('(max-width: 760px)').matches;
  const distance = compact ? 16 : 20;
  const duration = compact ? 440 : 560;
  const seen = new WeakSet<HTMLElement>();
  const observed = new WeakSet<Element>();
  const active = new Map<HTMLElement, Animation>();

  const stop = (target: HTMLElement) => {
    active.get(target)?.cancel();
    active.delete(target);
  };

  const reveal = (target: HTMLElement, delay = 0, animate = true) => {
    if (seen.has(target)) {
      if (!animate) stop(target);
      return;
    }
    seen.add(target);
    observer.unobserve(target);
    target.dataset.reveal = 'visible';
    if (!animate || preference.matches || document.hidden || target.contains(document.activeElement)) return;

    // Individual translate leaves existing hover transforms intact. No hidden
    // classes or persistent opacity: a failure can never strand invisible text.
    const animation = target.animate(
      [{ opacity: 0, translate: `0 ${distance}px` }, { opacity: 1, translate: '0 0' }],
      { duration, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' },
    );
    active.set(target, animation);
    animation.finished.then(() => active.delete(target), () => active.delete(target));
  };

  const observer = new IntersectionObserver((entries) => {
    let previousTop = -Infinity;
    let rowIndex = 0;
    for (const entry of entries) {
      const initialObservation = !observed.has(entry.target);
      observed.add(entry.target);
      if (!entry.isIntersecting) continue;
      rowIndex = Math.abs(entry.boundingClientRect.top - previousTop) < 32 ? rowIndex + 1 : 0;
      previousTop = entry.boundingClientRect.top;
      // Opening a route is not scrolling. Its initial viewport must not flash
      // or replay a page-entry effect; only previously offscreen blocks animate.
      reveal(entry.target as HTMLElement, Math.min(rowIndex * 60, 120), !initialObservation);
    }
  }, { rootMargin: '0px 0px 24px 0px', threshold: 0.08 });

  targets.forEach((target) => {
    target.dataset.reveal = 'pending';
    observer.observe(target);
  });

  const showRelated = (element: Element) => {
    for (const target of targets) {
      if (target.contains(element) || element.contains(target)) reveal(target, 0, false);
    }
  };

  const showHashTarget = () => {
    if (!window.location.hash) return;
    try {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) showRelated(target);
    } catch {
      // An invalid percent-encoded fragment must not affect page content.
    }
  };

  const showAll = () => {
    observer.disconnect();
    targets.forEach((target) => reveal(target, 0, false));
  };

  // Keyboard navigation and anchor links should never wait for an animation.
  document.addEventListener('focusin', (event) => {
    if (event.target instanceof Element) showRelated(event.target);
  });
  window.addEventListener('hashchange', showHashTarget);
  showHashTarget();

  preference.addEventListener('change', (event) => { if (event.matches) showAll(); });
  window.addEventListener('beforeprint', showAll);
  window.addEventListener('pagehide', showAll);
  window.addEventListener('pageshow', (event) => { if (event.persisted) showAll(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) [...active.keys()].forEach(stop);
  });
}

setupScrollReveal();
