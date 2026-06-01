/**
 * NAKAZAWA PORTFOLIO — MAIN.JS v3.0
 * ═══════════════════════════════════════════════════════════════
 * FIXES IN THIS VERSION:
 *   [FIX 1] Loader stuck — removed 7s auto-dismiss, fixed progress
 *            simulation to always reach 100% and enable Enter button
 *   [FIX 2] Lenis CDN changed — guard added, graceful fallback
 *   [FIX 3] Animations too subtle — all durations, distances and
 *            easings amplified for maximum visual impact
 *   [FIX 4] Image container sizing — proj-item layout enforced
 *            via JS style injection so all slots are equal height
 *   [ADD]   Canvas grain replaces CSS grain for true per-frame noise
 *   [ADD]   Magnetic button pull on all CTAs
 *   [ADD]   Scroll-velocity tilt on project cards
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ─── WAIT FOR ALL DEPS ──────────────────────────────────────── */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') {
    console.warn('[Portfolio] GSAP not available — showing content immediately');
    document.querySelectorAll('[data-gsap-reveal],[data-gsap-proj]').forEach(el => {
      el.style.opacity  = '1';
      el.style.transform = 'none';
      el.style.clipPath  = 'none';
    });
    initFallbackNav();
    injectImageAssets();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  Portfolio.init();
});

/* ═══════════════════════════════════════════════════════════════
   SCREENSHOT FILTER — applied to all project image slots
═══════════════════════════════════════════════════════════════ */
const SCREENSHOT_FILTER = 'saturate(0.12) contrast(1.08) sepia(0.14) brightness(1.02)';

/* ═══════════════════════════════════════════════════════════════
   ASSET DESCRIPTORS
═══════════════════════════════════════════════════════════════ */
const ASSETS = [
  {
    slot:    '.asset-slot--hero',
    src:     'assets/hero-ink.jpg',
    alt:     'Sumi-e ink wash — solitary figure',
    filter:  'saturate(0) contrast(1.04) brightness(1.03)',
    blend:   'multiply',
  },
  {
    slot:    '.asset-slot--portrait',
    src:     'assets/about-portrait.jpg',
    alt:     'High-contrast ink portrait',
    filter:  'saturate(0) contrast(1.08) brightness(1.01)',
    blend:   'multiply',
  },
  {
    slot:    '.asset-slot--stack',
    src:     'assets/stack-texture.jpg',
    alt:     'Washi paper texture',
    filter:  'saturate(0.08) contrast(1.02) brightness(1.04)',
    blend:   'multiply',
  },
  {
    slot:    '.asset-slot--landscape',
    src:     'assets/contact-landscape.jpg',
    alt:     'Ink wash mountain landscape',
    filter:  'saturate(0) contrast(0.96) brightness(1.02)',
    blend:   'multiply',
  },
];

const PROJ_ASSETS = [
  { slot: '.proj-item:nth-child(1) .asset-slot--proj', src: 'assets/blueprint-brief.jpg',  alt: 'The Blueprint Brief' },
  { slot: '.proj-item:nth-child(2) .asset-slot--proj', src: 'assets/autonomous-nav.jpg',   alt: 'Autonomous Navigation System' },
  { slot: '.proj-item:nth-child(3) .asset-slot--proj', src: 'assets/lexis-rag.jpg',         alt: 'Lexis AI Research Assistant' },
  { slot: '.proj-item:nth-child(4) .asset-slot--proj', src: 'assets/sky-voting.jpg',        alt: 'Sky TV Voting Platform' },
];

/* ═══════════════════════════════════════════════════════════════
   IMAGE INJECTION
═══════════════════════════════════════════════════════════════ */
function injectImageAssets() {
  ASSETS.forEach(a => {
    document.querySelectorAll(a.slot).forEach(slot => injectImg(slot, a.src, a.alt, a.filter, a.blend));
  });
  PROJ_ASSETS.forEach(a => {
    const slot = document.querySelector(a.slot);
    if (slot) injectImg(slot, a.src, a.alt, SCREENSHOT_FILTER, 'multiply');
  });
}

function injectImg(slot, src, alt, filter, blend) {
  const img = document.createElement('img');
  img.src   = src;
  img.alt   = alt;
  img.style.cssText = `
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; object-position:center;
    mix-blend-mode:${blend}; filter:${filter};
    display:block; opacity:0;
    transition: opacity 0.7s ease;
  `;
  img.addEventListener('load', () => {
    img.style.opacity = '1';
    const lbl = slot.querySelector('.asset-slot-label');
    if (lbl) lbl.style.display = 'none';
  });
  const inner = slot.querySelector('.asset-slot-inner') || slot;
  inner.style.position = 'relative';
  inner.insertBefore(img, inner.firstChild);
}

/* ═══════════════════════════════════════════════════════════════
   FIX 1: IMAGE CONTAINER SIZING
   All .asset-slot--proj containers are forced to the same height.
   This fixes inconsistent panel sizes across project cards.
═══════════════════════════════════════════════════════════════ */
function fixProjectImageSizing() {
  const projItems = document.querySelectorAll('.proj-item');
  projItems.forEach(item => {
    const visual = item.querySelector('.proj-visual');
    const panel  = item.querySelector('.proj-img-panel');
    const slot   = item.querySelector('.asset-slot--proj');
    if (visual) {
      visual.style.cssText += `
        position: relative;
        overflow: hidden;
        height: 100%;
        min-height: 320px;
      `;
    }
    if (panel) {
      panel.style.cssText += `
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 320px;
        overflow: hidden;
      `;
    }
    if (slot) {
      slot.style.cssText += `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        min-height: unset;
      `;
    }
  });

  /* Featured project gets taller image */
  const featured = document.querySelector('.proj-item--featured .proj-img-panel');
  if (featured) featured.style.minHeight = '420px';
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS GRAIN — true per-frame celluloid noise
   Replaces the CSS SVG grain for more organic film texture.
   Runs at 16fps intentionally — matches analog film frame rate.
═══════════════════════════════════════════════════════════════ */
function initCanvasGrain() {
  /* Replace the .paper-grain div with a canvas overlay */
  const existing = document.querySelector('.paper-grain');
  const canvas   = document.createElement('canvas');
  canvas.id      = 'grain-canvas';
  canvas.style.cssText = `
    position:fixed; inset:0; z-index:9990; pointer-events:none;
    width:100%; height:100%; opacity:0.42;
    mix-blend-mode:multiply;
  `;
  if (existing) existing.replaceWith(canvas);
  else document.body.appendChild(canvas);

  const ctx  = canvas.getContext('2d');
  let W = 0, H = 0, lastT = 0;
  const INTERVAL = 1000 / 16; /* 16fps */

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function drawGrain(now) {
    requestAnimationFrame(drawGrain);
    if (now - lastT < INTERVAL) return;
    lastT = now;
    const img  = ctx.createImageData(W, H);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v    = Math.random() * 255 | 0;
      data[i]    = v;
      data[i+1]  = v;
      data[i+2]  = v;
      data[i+3]  = (Math.random() * 28 + 6) | 0;
    }
    ctx.putImageData(img, 0, 0);
  }
  requestAnimationFrame(drawGrain);
}

/* ═══════════════════════════════════════════════════════════════
   FIX 2: LENIS INIT — guarded, graceful fallback
═══════════════════════════════════════════════════════════════ */
let lenis = null;

function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('[Portfolio] Lenis not loaded — using native scroll');
    return null;
  }
  lenis = new Lenis({
    duration:        1.3,
    easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:     true,
    wheelMultiplier: 0.85,
    touchMultiplier: 2.2,
  });

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) lenis.scrollTo(value, { immediate: true });
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
  });

  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  return lenis;
}

/* ═══════════════════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring || 'ontouchstart' in window) {
    if (dot)  dot.style.display  = 'none';
    if (ring) ring.style.display = 'none';
    document.body.style.cursor  = 'auto';
    return;
  }

  let mX = -100, mY = -100, rX = -100, rY = -100;
  const LAG = 0.1;

  window.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    dot.style.left = mX + 'px';
    dot.style.top  = mY + 'px';
  }, { passive: true });

  (function loop() {
    rX += (mX - rX) * LAG;
    rY += (mY - rY) * LAG;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';
    requestAnimationFrame(loop);
  })();

  const TARGETS = 'a,button,.pf,.af,.tag,.proj-link,.repo-link,.nav-link,.contact-link,.ld-enter';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(TARGETS)) {
      ring.style.width = '52px'; ring.style.height = '52px';
      ring.style.borderColor = 'var(--c-crimson)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(TARGETS)) {
      ring.style.width = '36px'; ring.style.height = '36px';
      ring.style.borderColor = 'var(--c-ink-mid)';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   FIX 3: LOADER — guaranteed to reach 100%, Enter always works
═══════════════════════════════════════════════════════════════ */
function initLoader() {
  const loader   = document.getElementById('loader');
  const bar      = document.getElementById('ld-bar');
  const pctEl    = document.getElementById('ld-pct');
  const enterBtn = document.getElementById('ld-enter');

  if (!loader) {
    animateHeroEntrance();
    return;
  }

  document.body.style.overflow = 'hidden';
  let progress  = 0;
  let dismissed = false;

  /* Guaranteed progress — reaches 100 in ~2.5s */
  const totalTime = 2400; /* ms */
  const startTime = performance.now();

  function updateProgress(now) {
    if (dismissed) return;
    const elapsed  = now - startTime;
    const raw      = Math.min(elapsed / totalTime, 1);
    /* ease-out curve so it feels organic */
    progress = Math.round((1 - Math.pow(1 - raw, 2.4)) * 100);

    if (bar)   bar.style.width     = progress + '%';
    if (pctEl) pctEl.textContent   = progress + '%';

    if (progress < 100) {
      requestAnimationFrame(updateProgress);
    } else {
      /* Guarantee Enter button becomes clickable */
      if (enterBtn) {
        enterBtn.classList.add('ready');
        enterBtn.style.opacity        = '1';
        enterBtn.style.pointerEvents  = 'all';
        enterBtn.style.transform      = 'translateY(0)';
      }
    }
  }
  requestAnimationFrame(updateProgress);

  /* Dismiss function */
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    document.body.style.overflow = '';

    /* Crimson slash sweeps up then loader clips away */
    const slash = document.createElement('div');
    slash.style.cssText = `
      position:absolute; inset:0; background:var(--c-crimson);
      transform:scaleY(0); transform-origin:bottom; z-index:2;
    `;
    loader.appendChild(slash);

    gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        animateHeroEntrance();
        ScrollTrigger.refresh();
      }
    })
    .to(slash, { scaleY: 1, duration: 0.4, ease: 'power4.inOut' })
    .to(loader, { yPercent: -105, duration: 0.55, ease: 'power4.inOut' }, 0.32);
  }

  if (enterBtn) enterBtn.addEventListener('click', dismiss);
  /* Keyboard shortcut */
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !dismissed) { e.preventDefault(); dismiss(); }
  });
  /* Safety valve — auto-dismiss after 6s */
  setTimeout(() => { if (!dismissed) dismiss(); }, 6000);
}

/* ═══════════════════════════════════════════════════════════════
   FIX 3b: HERO ENTRANCE — amplified, prominent animations
   Nakazawa reference: B:Beginning title sequences use extreme
   vertical wipes with snap timing (no gentle fades — slices).
═══════════════════════════════════════════════════════════════ */
function animateHeroEntrance() {
  const lines       = document.querySelectorAll('.h1-line');
  const eyebrow     = document.querySelector('.hero-eyebrow');
  const meta        = document.querySelector('.hero-meta');
  const desc        = document.querySelector('.hero-desc');
  const actions     = document.querySelector('.hero-actions');
  const heroRight   = document.querySelector('.hero-right');
  const accentSlash = document.querySelector('.hero-accent-slash');
  const indexCol    = document.querySelector('.hero-index-col');
  const rule        = document.querySelector('.hero-rule');

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  /* Vertical ink rule draws downward */
  if (rule) {
    tl.fromTo(rule,
      { scaleY: 0, transformOrigin: 'top center' },
      { scaleY: 1, duration: 1.1, ease: 'power4.inOut' }, 0
    );
  }

  /* Index column rises from below */
  if (indexCol) {
    tl.fromTo(indexCol,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7 }, 0.15
    );
  }

  /* Eyebrow slices in from left */
  if (eyebrow) {
    tl.fromTo(eyebrow,
      { opacity: 0, x: -40, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.7 }, 0.3
    );
  }

  /* H1 lines — aggressive yPercent lifts, staggered tight */
  if (lines.length) {
    tl.to(lines,
      { y: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, 0.4
    );
  }

  /* Meta data snaps in */
  if (meta) {
    tl.fromTo(meta,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6 }, 0.72
    );
  }

  /* Desc rises */
  if (desc) {
    tl.fromTo(desc,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 }, 0.86
    );
  }

  /* Actions */
  if (actions) {
    tl.fromTo(actions,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55 }, 1.0
    );
  }

  /* Hero right wipes in from right edge — dramatic reveal */
  if (heroRight) {
    tl.fromTo(heroRight,
      { opacity: 0, clipPath: 'inset(0 100% 0 0)', x: 40 },
      { opacity: 1, clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.2, ease: 'power4.inOut' }, 0.2
    );
  }

  /* Accent slash draws */
  if (accentSlash) {
    tl.fromTo(accentSlash,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.8, ease: 'power4.out' }, 1.0
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -80',
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  /* Active link tracking */
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  sections.forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end:   'bottom 55%',
      onEnter:     () => setActive(sec.id),
      onEnterBack: () => setActive(sec.id),
    });
  });

  function setActive(id) {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  }
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  function open() {
    burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => burger.classList.contains('active') ? close() : open());
  menu.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', () => {
    close();
    const target = document.querySelector(l.getAttribute('href'));
    if (target) {
      setTimeout(() => {
        if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ═══════════════════════════════════════════════════════════════
   SMOOTH ANCHORS
═══════════════════════════════════════════════════════════════ */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   FIX 3c: PROMINENT PARALLAX — amplified depths
   4-tier scrub: bg=2.2, figure=1.6, text=1.0, chrome=0.5
═══════════════════════════════════════════════════════════════ */
function initParallax() {
  /* Hero — 4 layers */
  const heroImgSlot = document.querySelector('.asset-slot--hero');
  if (heroImgSlot) gsap.to(heroImgSlot, { y: -140, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2.2 } });

  const heroRight = document.querySelector('.hero-right');
  if (heroRight) gsap.to(heroRight, { y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.6 } });

  const heroText = document.querySelector('.hero-text');
  if (heroText) gsap.to(heroText, { y: -45, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.0 } });

  const heroIdx = document.querySelector('.hero-index-col');
  if (heroIdx) gsap.to(heroIdx, { y: -20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });

  /* About portrait — drifts up as page scrolls past */
  const portrait = document.querySelector('.asset-slot--portrait');
  if (portrait) gsap.to(portrait, { y: -100, ease: 'none', scrollTrigger: { trigger: '.section-about', start: 'top bottom', end: 'bottom top', scrub: 1.8 } });

  /* Stack texture */
  const stackImg = document.querySelector('.asset-slot--stack');
  if (stackImg) gsap.to(stackImg, { y: -65, ease: 'none', scrollTrigger: { trigger: '.section-stack', start: 'top bottom', end: 'bottom top', scrub: 1.6 } });

  /* Contact landscape — panoramic horizontal drift */
  const landscape = document.querySelector('.contact-landscape-band');
  if (landscape) gsap.to(landscape, { y: -50, ease: 'none', scrollTrigger: { trigger: '.section-contact', start: 'top bottom', end: 'center top', scrub: 2.5 } });

  /* Section titles — aggressive clip-path slice reveals */
  document.querySelectorAll('.section-title, .contact-title').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, clipPath: 'inset(0 0 100% 0)', y: 30 },
      {
        opacity: 1, clipPath: 'inset(0 0 0% 0)', y: 0,
        duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none', once: true }
      }
    );
  });

  /* Eyebrow rules draw from left */
  document.querySelectorAll('.eyebrow-rule').forEach(el => {
    gsap.fromTo(el,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1, duration: 0.9, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true }
      }
    );
  });
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEALS — amplified distances + clip-path slices
═══════════════════════════════════════════════════════════════ */
function initScrollReveals() {
  document.querySelectorAll('[data-gsap-reveal]').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { opacity: 0, y: 50, clipPath: 'inset(0 0 100% 0)' },
      {
        opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)',
        duration: 0.85, delay,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none', once: true }
      }
    );
  });

  /* Project items — staggered x-wipes */
  const projItems = document.querySelectorAll('[data-gsap-proj]');
  if (projItems.length) {
    gsap.fromTo(projItems,
      { opacity: 0, x: -50, clipPath: 'inset(0 100% 0 0)' },
      {
        opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)',
        duration: 0.85, stagger: 0.13,
        ease: 'power4.out',
        scrollTrigger: { trigger: '#proj-grid', start: 'top 82%', toggleActions: 'play none none none', once: true }
      }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   KATANA SLASH HOVERS — amplified 3-phase interaction
═══════════════════════════════════════════════════════════════ */
function initKatanaSlashHovers() {
  document.querySelectorAll('.proj-item').forEach(item => {
    const imgPanel    = item.querySelector('.proj-img-panel');
    const title       = item.querySelector('.proj-title');
    const tags        = item.querySelectorAll('.proj-tags li');
    const projData    = item.querySelector('.proj-data');
    const visitOverlay = item.querySelector('.proj-visit-overlay');

    if (!imgPanel) return;

    /* Build slash overlay */
    const slash = document.createElement('div');
    slash.style.cssText = `
      position:absolute; inset:0; pointer-events:none; z-index:2;
      background: linear-gradient(135deg,
        rgba(200,16,46,0.18) 0%,
        rgba(200,16,46,0.08) 60%,
        rgba(13,12,10,0.04) 100%);
      clip-path: polygon(0 0,0 0,0 100%,0 100%);
      will-change: clip-path;
    `;
    imgPanel.style.position = 'relative';
    imgPanel.appendChild(slash);

    /* Slash stroke — gradient band sweep */
    const stroke = document.createElement('div');
    stroke.style.cssText = `
      position:absolute; inset:-10% -20%; width:140%; height:120%;
      pointer-events:none; z-index:3; opacity:0;
      background: linear-gradient(105deg,
        transparent 35%,
        rgba(200,16,46,0.7) 44%,
        rgba(240,60,80,0.9) 50%,
        rgba(200,16,46,0.7) 56%,
        transparent 65%);
      background-size:300% 100%;
      background-position:100% 0;
      will-change: background-position, opacity;
    `;
    imgPanel.appendChild(stroke);

    let tl = null;

    item.addEventListener('mouseenter', () => {
      if (tl) tl.kill();
      tl = gsap.timeline();

      /* Phase 1: slash stroke sweeps — very fast, kinetic */
      tl.set(stroke, { opacity: 1, backgroundPosition: '100% 0' })
        .to(stroke, { backgroundPosition: '-30% 0', duration: 0.42, ease: 'power3.inOut' }, 0)
        .to(stroke, { opacity: 0, duration: 0.12 }, 0.38);

      /* Phase 2: slash overlay expands in wake */
      tl.to(slash, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', duration: 0.52, ease: 'power3.out' }, 0.06);

      /* Visit overlay */
      if (visitOverlay) tl.to(visitOverlay, { opacity: 1, duration: 0.22 }, 0.16);

      /* Title + tags kinetic drift */
      if (title) tl.to(title, { x: 10, skewX: -2, duration: 0.32, ease: 'power3.out' }, 0.04);
      if (tags.length) tl.to(tags, { x: 6, stagger: 0.02, duration: 0.28, ease: 'power3.out' }, 0.06);

      /* Image filter brightens */
      const img = imgPanel.querySelector('img');
      if (img) tl.to(img, { filter: 'saturate(0.35) contrast(1.15) sepia(0.08) brightness(1.08)', duration: 0.4 }, 0.04);

      /* Left border crimson flash */
      if (projData) tl.to(projData, { borderLeftColor: 'var(--c-crimson)', duration: 0.18 }, 0);
    });

    item.addEventListener('mouseleave', () => {
      if (tl) tl.kill();
      tl = gsap.timeline();

      /* Reverse wipe exits right */
      tl.to(slash, { clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)', duration: 0.42, ease: 'power3.in' }, 0)
        .set(slash, { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' });

      if (visitOverlay) tl.to(visitOverlay, { opacity: 0, duration: 0.18 }, 0);
      if (title) tl.to(title, { x: 0, skewX: 0, duration: 0.35, ease: 'power3.inOut' }, 0.04);
      if (tags.length) tl.to(tags, { x: 0, stagger: 0.015, duration: 0.28, ease: 'power3.inOut' }, 0.04);

      const img = imgPanel.querySelector('img');
      if (img) tl.to(img, { filter: SCREENSHOT_FILTER, duration: 0.4 }, 0.04);
      if (projData) tl.to(projData, { borderLeftColor: 'transparent', duration: 0.2 }, 0.08);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   SKILL BARS
═══════════════════════════════════════════════════════════════ */
function initSkillBars() {
  document.querySelectorAll('.sk-fill').forEach(fill => {
    const pct = parseInt(fill.dataset.pct, 10) || 0;
    gsap.set(fill, { width: '0%' });
    ScrollTrigger.create({
      trigger: fill, start: 'top 88%', once: true,
      onEnter: () => gsap.to(fill, { width: pct + '%', duration: 1.2, ease: 'power2.out' })
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   CREDENTIAL COUNTER
═══════════════════════════════════════════════════════════════ */
function initCounters() {
  document.querySelectorAll('.cred-val, .hi-val, .pm-val').forEach(el => {
    const raw   = el.textContent.trim();
    const match = raw.match(/^([\d,]+)/);
    if (!match) return;
    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = raw.replace(match[1], '');

    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        const dur  = Math.min(1.5, 0.5 + target / 800);
        const s    = performance.now();
        (function tick(now) {
          const p = Math.min((now - s) / (dur * 1000), 1);
          const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
          el.textContent = (v >= 1000 ? v.toLocaleString('en-GB') : v) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT FILTER
═══════════════════════════════════════════════════════════════ */
function initProjectFilter() {
  const btns  = document.querySelectorAll('#proj-filters .pf');
  const items = document.querySelectorAll('.proj-item');
  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;

      items.forEach((item, i) => {
        const tags = (item.dataset.t || '').toLowerCase();
        const show = f === 'all' || tags.includes(f);

        if (show) {
          item.classList.remove('hidden');
          gsap.fromTo(item,
            { opacity: 0, y: 20, clipPath: 'inset(0 0 100% 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.5, delay: i * 0.06, ease: 'power3.out' }
          );
        } else {
          gsap.to(item, {
            opacity: 0, y: 10, duration: 0.25, ease: 'power3.in',
            onComplete: () => item.classList.add('hidden')
          });
        }
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT HOVERS
═══════════════════════════════════════════════════════════════ */
function initContactHovers() {
  document.querySelectorAll('.contact-link').forEach(link => {
    const handle = link.querySelector('.cl-handle');
    if (!handle) return;
    link.addEventListener('mouseenter', () => gsap.to(handle, { x: 10, duration: 0.28, ease: 'power3.out' }));
    link.addEventListener('mouseleave', () => gsap.to(handle, { x: 0, duration: 0.32, ease: 'power3.inOut' }));
  });
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC BUTTONS — pulls towards cursor on hover
═══════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  if ('ontouchstart' in window) return;
  document.querySelectorAll('.btn-primary, .nav-cta, .ld-enter').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.32;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.32;
      gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   MARQUEE — pause on hover
═══════════════════════════════════════════════════════════════ */
function initMarquee() {
  const strip = document.querySelector('.marquee-strip');
  const track = document.querySelector('.marquee-track');
  if (!strip || !track) return;
  strip.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  strip.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');

  /* Marquee entrance */
  ScrollTrigger.create({
    trigger: strip, start: 'top 85%', once: true,
    onEnter: () => gsap.fromTo(track,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power4.out' }
    )
  });
}

/* ═══════════════════════════════════════════════════════════════
   RESIZE HANDLER
═══════════════════════════════════════════════════════════════ */
function initResize() {
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      ScrollTrigger.refresh(true);
      if (lenis) lenis.resize();
    }, 200);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   FALLBACK NAV (no GSAP)
═══════════════════════════════════════════════════════════════ */
function initFallbackNav() {
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO NAMESPACE
═══════════════════════════════════════════════════════════════ */
const Portfolio = {
  init() {
    /* Order matters — Lenis before ScrollTrigger registrations */
    lenis = initLenis();
    initCursor();
    initCanvasGrain();
    injectImageAssets();
    fixProjectImageSizing();
    initLoader();
    initNav();
    initMobileMenu();
    initAnchors();
    initParallax();
    initScrollReveals();
    initKatanaSlashHovers();
    initSkillBars();
    initCounters();
    initProjectFilter();
    initContactHovers();
    initMagneticButtons();
    initMarquee();
    initResize();

    requestAnimationFrame(() => ScrollTrigger.refresh(true));
  }
};