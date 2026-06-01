/**
 * NAKAZAWA PORTFOLIO — MAIN.JS  v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * UPGRADE MANIFEST (v1 → v2):
 *   [A] Image Asset System     — real <img> injection with multiply/difference
 *                                blend modes; graceful SVG fallback preserved
 *   [B] Katana Slash Hovers    — multi-stage GSAP clip-path polygon sequence
 *                                that cuts across proj-item containers in two
 *                                directed phases (enter slash → hold → exit wipe)
 *   [C] Deep Parallax          — 4-layer scrub architecture: bg-wash, figure,
 *                                text, UI chrome at independent scrub speeds
 *   [D] Lenis sync pipeline    — proxy + RAF + lagSmoothing(0) hardened
 *   [E] Screenshot normaliser  — applies saturate(0.12) contrast(1.08)
 *                                sepia(0.15) to all .proj-img so screenshots
 *                                integrate into the neutral ink palette
 *
 * SYSTEM ARCHITECTURE:
 *   01. Lenis Smooth Scroll    — proxy + RAF synchronized to GSAP ticker
 *   02. GSAP + ScrollTrigger   — all scroll-bound frame transforms
 *   03. Custom Cursor          — rAF lag-free tracking
 *   04. Loader Sequence        — organic progress sim + slash-wipe dismiss
 *   05. Hero Type Reveal       — staggered line lift from overflow:hidden mask
 *   06. Asset Image System     — img inject + blend + SVG fallback
 *   07. Nav Scroll State       — ScrollTrigger threshold class
 *   08. Mobile Menu            — clip-path diagonal wipe
 *   09. Smooth Anchors         — Lenis.scrollTo with nav offset
 *   10. Deep Multi-Layer Parallax — 4-tier scrub depth per section
 *   11. Section Reveals        — fromTo opacity+Y pipeline
 *   12. Katana Slash Hovers    — 3-phase polygon clip-path animation
 *   13. Skill Bar Animation    — width counter on ST entry
 *   14. Project Filter         — tag-based fade/hide
 *   15. Contact Hover          — handle x-drift
 *   16. Nav Active Tracking    — ST section-based link highlight
 *   17. Resize Handler         — debounced ST.refresh + lenis.resize
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─── DEPENDENCY GUARD ────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.warn('[Portfolio] GSAP not loaded — graceful degradation active');
    document.querySelectorAll('[data-gsap-reveal],[data-gsap-proj]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath  = 'none';
    });
    Portfolio.initFallback();
    return;
  }
  Portfolio.init();
});

/* ─── PORTFOLIO NAMESPACE ────────────────────────────────────────────────────── */
const Portfolio = (() => {

  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;

  /* ═══════════════════════════════════════════════════════════════════
     01 — LENIS SMOOTH SCROLL
         Proxy architecture: Lenis owns the scroll position.
         GSAP ScrollTrigger reads it via scrollerProxy so all
         scroll-bound transforms are in frame-perfect sync.
  ═══════════════════════════════════════════════════════════════════ */
  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[Portfolio] Lenis not loaded — native scroll active');
      return null;
    }

    lenis = new Lenis({
      duration:          1.3,
      easing:            (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction:         'vertical',
      gestureDirection:  'vertical',
      smooth:            true,
      smoothTouch:       false,
      touchMultiplier:   2.2,
      infinite:          false,
      autoResize:        true,
    });

    // Feed Lenis RAF into GSAP ticker — single rAF loop for both
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Critical: disable GSAP's own lag smoothing — Lenis handles temporal easing
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger proxy — reads lenis.scroll instead of window.scrollY
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top:    0,
          left:   0,
          width:  window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    // Every Lenis frame, invalidate ST position cache
    lenis.on('scroll', ScrollTrigger.update);

    return lenis;
  }

  /* ═══════════════════════════════════════════════════════════════════
     02 — CUSTOM CURSOR
         Dot: immediate rAF tracking (no transition lag).
         Ring: exponential lerp lag for trailing inertia.
         State: expands on any interactive element.
  ═══════════════════════════════════════════════════════════════════ */
  function initCursor() {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    // Touch device — hide entirely
    if ('ontouchstart' in window) {
      dot.style.display  = 'none';
      ring.style.display = 'none';
      document.body.style.cursor = 'auto';
      return;
    }

    let mX = -100, mY = -100;
    let rX  = -100, rY  = -100;
    const LAG = 0.11;

    function trackMouse(e) {
      mX = e.clientX;
      mY = e.clientY;
      gsap.set(dot, { x: mX - 3, y: mY - 3 });
    }

    function lerpRing() {
      rX += (mX - rX) * LAG;
      rY += (mY - rY) * LAG;
      gsap.set(ring, { x: rX - 18, y: rY - 18 });
      requestAnimationFrame(lerpRing);
    }

    window.addEventListener('mousemove', trackMouse, { passive: true });
    lerpRing();

    const INTERACTIVE = 'a, button, .pf, .af, .tag, .proj-link, .repo-link, .nav-link, .contact-link, .ld-enter';

    function expandCursor() {
      gsap.to(ring, { width: 54, height: 54, borderColor: 'var(--c-crimson)', duration: 0.2 });
      gsap.to(dot,  { width: 3,  height: 3,  duration: 0.15 });
    }
    function contractCursor() {
      gsap.to(ring, { width: 36, height: 36, borderColor: 'var(--c-ink-mid)', duration: 0.25 });
      gsap.to(dot,  { width: 6,  height: 6,  duration: 0.2 });
    }

    document.addEventListener('mouseover', (e) => { if (e.target.closest(INTERACTIVE)) expandCursor(); });
    document.addEventListener('mouseout',  (e) => { if (e.target.closest(INTERACTIVE)) contractCursor(); });

    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.15 }));
    document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.15 }));
  }

  /* ═══════════════════════════════════════════════════════════════════
     03 — LOADER SEQUENCE
         Organic progress sim with natural deceleration curve.
         Dismiss: GSAP vertical clip-path slash-wipe (top → bottom).
         After clear: hero entrance animation fires.
  ═══════════════════════════════════════════════════════════════════ */
  function initLoader() {
    const loader   = document.getElementById('loader');
    const bar      = document.getElementById('ld-bar');
    const pct      = document.getElementById('ld-pct');
    const enterBtn = document.getElementById('ld-enter');

    if (!loader || !enterBtn) {
      document.body.style.overflow = '';
      // Still fire hero entrance if loader not present
      setTimeout(animateHeroEntrance, 100);
      return;
    }

    document.body.style.overflow = 'hidden';
    let progress = 0;
    let timer;

    function tick() {
      // Organic: fast at first, then plateau, then final burst
      let increment;
      if (progress < 60)      { increment = Math.random() * 5  + 1.5; }
      else if (progress < 88) { increment = Math.random() * 2  + 0.5; }
      else                    { increment = Math.random() * 0.8 + 0.2; }

      progress = Math.min(progress + increment, 100);

      if (bar) bar.style.width  = progress + '%';
      if (pct) pct.textContent  = Math.floor(progress) + '%';

      if (progress < 100) {
        const delay = progress < 70 ? 25 + Math.random() * 35 : 55 + Math.random() * 90;
        timer = setTimeout(tick, delay);
      } else {
        setTimeout(() => {
          if (pct) pct.textContent = '100%';
          enterBtn.classList.add('ready');
        }, 180);
      }
    }

    tick();

    function dismissLoader() {
      clearTimeout(timer);
      document.body.style.overflow = '';

      // Two-phase exit: first a crimson slash overlay, then clip-wipe
      const slashOverlay = document.createElement('div');
      slashOverlay.style.cssText = `
        position:absolute; inset:0;
        background:var(--c-crimson);
        transform:scaleX(0); transform-origin:left;
        z-index:1;
      `;
      loader.appendChild(slashOverlay);

      const tl = gsap.timeline({
        onComplete: () => {
          loader.style.display = 'none';
          animateHeroEntrance();
        }
      });

      tl.to(slashOverlay, {
        scaleX: 1,
        duration: 0.35,
        ease: 'power4.inOut',
      })
      .to(loader, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.65,
        ease: 'power4.inOut',
      }, 0.28);
    }

    enterBtn.addEventListener('click', dismissLoader);
    // Auto-dismiss ceiling
    setTimeout(() => {
      if (loader.style.display !== 'none') dismissLoader();
    }, 7000);
  }

  /* ═══════════════════════════════════════════════════════════════════
     04 — HERO ENTRANCE
         Each H1 .h1-line lifts from y:100% (set in CSS)
         through overflow:hidden on .h1-line-wrap.
         All other elements fade/rise in cascade.
  ═══════════════════════════════════════════════════════════════════ */
  function animateHeroEntrance() {
    const lines        = document.querySelectorAll('.h1-line');
    const eyebrow      = document.querySelector('.hero-eyebrow');
    const meta         = document.querySelector('.hero-meta');
    const desc         = document.querySelector('.hero-desc');
    const actions      = document.querySelector('.hero-actions');
    const heroRight    = document.querySelector('.hero-right');
    const accentSlash  = document.querySelector('.hero-accent-slash');

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    if (lines.length) {
      tl.to(lines, {
        y: 0,
        duration: 1.05,
        stagger: 0.11,
        ease: 'power3.out',
      }, 0);
    }

    if (eyebrow) {
      tl.fromTo(eyebrow, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.18);
    }
    if (meta) {
      tl.fromTo(meta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55 }, 0.5);
    }
    if (desc) {
      tl.fromTo(desc, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55 }, 0.65);
    }
    if (actions) {
      tl.fromTo(actions, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55 }, 0.8);
    }
    if (heroRight) {
      tl.fromTo(heroRight, { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out' }, 0.25);
    }
    if (accentSlash) {
      tl.fromTo(accentSlash, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.9);
    }

    tl.call(() => ScrollTrigger.refresh());
  }

  /* ═══════════════════════════════════════════════════════════════════
     05 — IMAGE ASSET SYSTEM
         Injects real <img> tags into every .asset-slot container.
         Applies CSS filter pipeline for palette integration:
           saturate(0.12) contrast(1.08) sepia(0.12)
         on screenshot slots, and:
           saturate(0) contrast(1.05) brightness(1.02)
         on ink/texture slots.
         mix-blend-mode: multiply on all images so the canvas
         background bleeds through paper edges.
         SVG fallback fires if image load fails (onerror).
  ═══════════════════════════════════════════════════════════════════ */

  // Asset descriptor table
  const ASSETS = [
    {
      slot:    '.asset-slot--hero',
      src:     'assets/hero-ink.jpg',
      alt:     'Sumi-e ink wash — solitary figure in negative space',
      imgClass:'hero-img',
      filter:  'saturate(0) contrast(1.04) brightness(1.03)',
      blend:   'multiply',
      fit:     'cover',
      svgFn:   generateNakazawaHeroSVG,
    },
    {
      slot:    '.asset-slot--portrait',
      src:     'assets/about-portrait.jpg',
      alt:     'High-contrast ink line portrait',
      imgClass:'about-portrait-img',
      filter:  'saturate(0) contrast(1.08) brightness(1.01)',
      blend:   'multiply',
      fit:     'cover',
      svgFn:   generatePortraitSVG,
    },
    {
      slot:    '.asset-slot--stack',
      src:     'assets/stack-texture.jpg',
      alt:     'Washi paper ink bleed texture',
      imgClass:'stack-texture-img',
      filter:  'saturate(0.08) contrast(1.02) brightness(1.04)',
      blend:   'multiply',
      fit:     'cover',
      svgFn:   generateStackSVG,
    },
    {
      slot:    '.asset-slot--landscape',
      src:     'assets/contact-landscape.jpg',
      alt:     'Ink wash mountain landscape panorama',
      imgClass:'landscape-img',
      filter:  'saturate(0) contrast(0.96) brightness(1.02)',
      blend:   'multiply',
      fit:     'cover',
      svgFn:   generateContactLandscapeSVG,
    },
  ];

  // Screenshot project slots — apply editorial normaliser filter
  const PROJ_ASSETS = [
    { slot: '.proj-item:nth-child(1) .asset-slot--proj', src: 'assets/blueprint-brief.jpg', alt: 'The Blueprint Brief platform screenshot' },
    { slot: '.proj-item:nth-child(2) .asset-slot--proj', src: 'assets/autonomous-nav.jpg',  alt: 'Autonomous Navigation System — hardware setup' },
    { slot: '.proj-item:nth-child(3) .asset-slot--proj', src: 'assets/lexis-rag.jpg',        alt: 'Lexis AI Research Assistant interface' },
    { slot: '.proj-item:nth-child(4) .asset-slot--proj', src: 'assets/sky-voting.jpg',       alt: 'Sky TV Voting Platform interface' },
  ];

  // Screenshot filter — desaturated near-monochrome with slight warm sepia
  const SCREENSHOT_FILTER = 'saturate(0.12) contrast(1.08) sepia(0.14) brightness(1.02)';
  const SCREENSHOT_BLEND  = 'multiply';

  function injectImageAssets() {
    // Main layout slots
    ASSETS.forEach(asset => {
      const slots = document.querySelectorAll(asset.slot);
      slots.forEach(slot => {
        injectImage(slot, asset.src, asset.alt, asset.imgClass, asset.filter, asset.blend, asset.fit, asset.svgFn);
      });
    });

    // Project screenshot slots
    PROJ_ASSETS.forEach(pa => {
      const slot = document.querySelector(pa.slot);
      if (slot) {
        injectImage(slot, pa.src, pa.alt, 'proj-screenshot', SCREENSHOT_FILTER, SCREENSHOT_BLEND, 'cover', null);
      }
    });
  }

  function injectImage(slot, src, alt, imgClass, filter, blend, fit, svgFallbackFn) {
    const img = document.createElement('img');
    img.src    = src;
    img.alt    = alt;
    img.className = 'asset-img ' + imgClass;

    // Apply blend + filter for palette integration
    img.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: ${fit};
      object-position: center;
      mix-blend-mode: ${blend};
      filter: ${filter};
      display: block;
      opacity: 0;
      transition: opacity 0.6s ease;
    `;

    img.addEventListener('load', () => {
      img.style.opacity = '1';
      // Remove the label once the real image is loaded
      const label = slot.querySelector('.asset-slot-label');
      if (label) label.style.display = 'none';
      // Remove any SVG fallback
      const svgWrap = slot.querySelector('.nakazawa-svg-wrap');
      if (svgWrap) svgWrap.style.opacity = '0';
    });

    img.addEventListener('error', () => {
      // Real asset not found — inject SVG fallback
      img.style.display = 'none';
      if (svgFallbackFn) {
        const wrap = document.createElement('div');
        wrap.className = 'nakazawa-svg-wrap';
        wrap.innerHTML = svgFallbackFn();
        // Insert before label so label sits on top
        const label = slot.querySelector('.asset-slot-label');
        if (label) {
          slot.insertBefore(wrap, label);
        } else {
          slot.appendChild(wrap);
        }
      }
    });

    // Prepend so it sits behind the label overlay
    const inner = slot.querySelector('.asset-slot-inner') || slot;
    const firstChild = inner.firstChild;
    if (firstChild) {
      inner.insertBefore(img, firstChild);
    } else {
      inner.appendChild(img);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     05b — SVG FALLBACK GENERATORS
         These fire only when the real asset file is absent.
         Full inline SVG — no external deps.
  ═══════════════════════════════════════════════════════════════════ */
  function generateNakazawaHeroSVG() {
    return `<svg viewBox="0 0 540 680" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Nakazawa-style ink composition"
      preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="wash1" cx="30%" cy="40%" r="55%" fx="28%" fy="38%">
          <stop offset="0%"   stop-color="#1a1815" stop-opacity="0.22"/>
          <stop offset="45%"  stop-color="#1a1815" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#1a1815" stop-opacity="0.00"/>
        </radialGradient>
        <radialGradient id="wash2" cx="70%" cy="75%" r="40%">
          <stop offset="0%"   stop-color="#0d0c0a" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#0d0c0a" stop-opacity="0.00"/>
        </radialGradient>
        <clipPath id="speedClip"><rect x="0" y="0" width="540" height="680"/></clipPath>
        <filter id="inkBlur" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="3" seed="12" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="inkBlurSoft">
          <feTurbulence type="fractalNoise" baseFrequency="0.08 0.12" numOctaves="2" seed="7" result="noise2"/>
          <feDisplacementMap in="SourceGraphic" in2="noise2" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <rect width="540" height="680" fill="#f5f0e8"/>
      <g style="mix-blend-mode:multiply">
        <ellipse cx="162" cy="272" rx="180" ry="240" fill="url(#wash1)" filter="url(#inkBlurSoft)"/>
        <ellipse cx="378" cy="510" rx="110" ry="140" fill="url(#wash2)" filter="url(#inkBlurSoft)"/>
        <path d="M 82,180 C 75,170 60,185 55,178 C 50,171 68,162 78,168 C 90,158 100,175 82,180 Z" fill="#0d0c0a" opacity="0.08" filter="url(#inkBlurSoft)"/>
        <path d="M 410,480 C 400,470 388,490 380,482 C 372,474 390,462 402,470 C 415,458 422,478 410,480 Z" fill="#0d0c0a" opacity="0.09" filter="url(#inkBlurSoft)"/>
      </g>
      <g clip-path="url(#speedClip)" opacity="0.055">
        <line x1="160" y1="320" x2="-30"  y2="-20"  stroke="#0d0c0a" stroke-width="0.8"/>
        <line x1="160" y1="320" x2="40"   y2="-30"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="120"  y2="-30"  stroke="#0d0c0a" stroke-width="0.6"/>
        <line x1="160" y1="320" x2="220"  y2="-30"  stroke="#0d0c0a" stroke-width="0.4"/>
        <line x1="160" y1="320" x2="580"  y2="0"    stroke="#0d0c0a" stroke-width="0.7"/>
        <line x1="160" y1="320" x2="580"  y2="200"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="-30"  y2="260"  stroke="#0d0c0a" stroke-width="0.7"/>
        <line x1="160" y1="320" x2="-30"  y2="520"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="300"  y2="710"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="580"  y2="480"  stroke="#0d0c0a" stroke-width="0.6"/>
      </g>
      <g filter="url(#inkBlur)" style="mix-blend-mode:darken">
        <ellipse cx="272" cy="96" rx="34" ry="38" fill="#0d0c0a"/>
        <path d="M 260,130 L 258,148 L 286,148 L 284,130 Z" fill="#0d0c0a"/>
        <path d="M 248,148 C 240,152 228,162 218,175 C 210,186 204,198 200,212 C 196,224 194,236 192,248 L 190,298 C 188,310 190,318 196,322 L 200,340 C 192,348 188,360 186,374 L 182,420 C 180,432 179,444 180,452 C 180,460 183,465 188,466 L 192,500 L 202,502 L 206,466 C 209,460 210,452 208,440 L 212,395 C 214,382 218,372 224,366 L 240,352 L 254,340 L 272,335 L 290,340 L 310,352 L 320,366 C 326,372 330,382 332,395 L 336,440 C 334,452 335,460 338,466 L 342,502 L 352,500 L 356,466 C 361,465 364,460 364,452 C 365,444 364,432 362,420 L 358,374 C 356,360 352,348 344,340 L 348,322 C 354,318 356,310 354,298 L 352,248 C 350,236 348,224 344,212 C 340,198 334,186 326,175 C 316,162 304,152 296,148 Z" fill="#0d0c0a" opacity="0.92"/>
        <path d="M 248,155 C 236,158 218,168 204,182 C 190,196 180,216 172,234 C 165,250 162,264 160,280 L 158,310 C 156,324 158,338 164,346 C 150,352 138,360 128,372 C 116,386 108,404 102,420 C 94,438 90,458 88,476 L 85,500 C 84,512 86,520 92,524 L 186,520 L 190,495 C 182,490 178,480 178,468 L 182,424 C 184,412 188,400 195,390 C 200,382 207,376 216,372 L 220,358 C 230,352 244,348 256,346 L 264,335" fill="none" stroke="#0d0c0a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 248,162 C 240,158 230,154 218,152 C 208,150 196,152 186,158 L 175,168 C 165,176 158,188 152,200 L 140,232 C 133,248 128,264 124,278 L 120,300 C 118,312 118,322 122,330 C 126,338 132,342 140,340 L 148,336 C 148,330 144,322 142,312 L 142,286 C 144,272 148,258 154,246 L 163,222 C 170,208 178,196 187,187 L 200,177 L 218,170 L 240,170 Z" fill="#1a1815" opacity="0.85"/>
        <path d="M 118,298 L 36,142 L 44,136 L 126,294 Z" fill="#0d0c0a"/>
        <line x1="40" y1="139" x2="122" y2="296" stroke="#f5f0e8" stroke-width="0.6" opacity="0.4"/>
        <ellipse cx="124" cy="300" rx="9" ry="6" fill="#1a1815" transform="rotate(-32 124 300)"/>
        <path d="M 124,300 L 138,338" stroke="#0d0c0a" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M 296,162 C 306,158 318,156 330,158 L 350,168 C 364,178 374,192 380,208 L 390,236 C 396,252 398,268 396,280 L 392,305 L 386,312 L 376,308 L 372,290 L 374,266 C 372,252 368,240 361,228 L 350,208 C 340,195 329,186 316,180 L 300,173 Z" fill="#1a1815" opacity="0.82"/>
        <path d="M 220,460 L 215,545 L 213,580 L 220,625 C 222,636 228,644 236,646 L 258,648 L 265,600 L 267,560 L 272,540 L 277,560 L 279,600 L 286,648 L 308,646 C 316,644 322,636 324,625 L 331,580 L 329,545 L 324,460 Z" fill="#0d0c0a" opacity="0.88"/>
        <path d="M 225,648 C 218,652 210,658 206,665 C 202,672 205,678 214,679 L 244,679 C 252,679 255,674 253,668 L 249,648 Z" fill="#1a1815"/>
        <path d="M 319,648 C 326,652 334,658 338,665 C 342,672 339,678 330,679 L 300,679 C 292,679 289,674 291,668 L 295,648 Z" fill="#1a1815"/>
      </g>
      <path d="M 38,540 L 508,290 L 514,302 L 44,552 Z" fill="#0d0c0a" opacity="0.07"/>
      <path d="M 55,565 L 530,308 L 532,312 L 57,569 Z" fill="#0d0c0a" opacity="0.04"/>
      <rect x="0" y="188" width="88" height="2.5" fill="#c8102e" opacity="0.9"/>
      <rect x="0" y="194" width="52" height="1" fill="#c8102e" opacity="0.5"/>
      <line x1="0" y1="62"  x2="540" y2="62"  stroke="#0d0c0a" stroke-width="0.5" opacity="0.12"/>
      <line x1="0" y1="640" x2="540" y2="640" stroke="#0d0c0a" stroke-width="0.5" opacity="0.12"/>
      <line x1="48" y1="0" x2="48" y2="680" stroke="#0d0c0a" stroke-width="0.5" opacity="0.10"/>
      <g opacity="0.4" fill="none" stroke="#0d0c0a" stroke-width="0.8">
        <path d="M 20,20 L 20,8 L 32,8"/>
        <path d="M 520,20 L 520,8 L 508,8"/>
        <path d="M 20,660 L 20,672 L 32,672"/>
        <path d="M 520,660 L 520,672 L 508,672"/>
      </g>
      <text x="56" y="76"  font-family="'DM Mono',monospace" font-size="9" fill="#0d0c0a" opacity="0.3" letter-spacing="0.2em">001 — ENGINEER</text>
      <text x="56" y="654" font-family="'DM Mono',monospace" font-size="9" fill="#0d0c0a" opacity="0.3" letter-spacing="0.2em">LONDON · 2026</text>
      <rect x="532" y="160" width="2" height="220" fill="#c8102e" opacity="0.8"/>
      <g opacity="0.15" fill="#0d0c0a">
        <circle cx="68"  cy="130" r="1.2"/>
        <circle cx="72"  cy="135" r="0.7"/>
        <circle cx="490" cy="420" r="1.5"/>
        <circle cx="495" cy="415" r="0.8"/>
        <circle cx="440" cy="150" r="1.0"/>
        <circle cx="120" cy="580" r="1.2"/>
      </g>
    </svg>`;
  }

  function generatePortraitSVG() {
    return `<svg viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Abstract ink portrait" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="pgradL" cx="35%" cy="45%" r="55%">
          <stop offset="0%"  stop-color="#0d0c0a" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#0d0c0a" stop-opacity="0.00"/>
        </radialGradient>
      </defs>
      <rect width="320" height="400" fill="#f9f5ed"/>
      <ellipse cx="112" cy="180" rx="110" ry="130" fill="url(#pgradL)"/>
      <g fill="none" stroke="#0d0c0a" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 160,55 C 182,55 200,68 205,88 C 210,108 208,130 200,148 C 192,166 180,176 165,180 C 150,184 136,180 126,170 C 116,160 110,145 108,128 C 106,111 108,94 116,80 C 124,66 140,55 160,55 Z" stroke-width="2.0" opacity="0.85"/>
        <path d="M 68,260 C 88,240 115,228 145,222 C 162,218 178,220 194,226 C 218,234 238,248 255,268" stroke-width="3.5" opacity="0.9"/>
        <path d="M 68,260 L 58,340 L 72,345" stroke-width="2.5" opacity="0.75"/>
        <path d="M 255,268 L 262,345 L 248,342" stroke-width="2.0" opacity="0.7"/>
        <path d="M 145,180 L 140,222" stroke-width="1.8" opacity="0.65"/>
        <path d="M 175,180 L 180,222" stroke-width="1.5" opacity="0.6"/>
        <path d="M 140,118 C 144,116 150,116 154,118" stroke-width="1.4" opacity="0.7"/>
        <path d="M 166,118 C 170,116 176,116 180,118" stroke-width="1.4" opacity="0.7"/>
        <path d="M 152,142 C 158,148 168,148 172,142" stroke-width="1.2" opacity="0.6"/>
      </g>
      <path d="M 145,222 C 118,230 96,246 78,266 L 74,310 L 70,345 L 250,345 L 252,310 L 254,268 C 236,250 216,238 194,232 L 180,222 Z" fill="#0d0c0a" opacity="0.08"/>
      <rect x="0" y="112" width="40" height="2" fill="#c8102e" opacity="0.8"/>
      <g opacity="0.25" fill="none" stroke="#0d0c0a" stroke-width="0.7">
        <path d="M 12,12 L 12,4 L 20,4"/>
        <path d="M 308,12 L 308,4 L 300,4"/>
        <path d="M 12,388 L 12,396 L 20,396"/>
        <path d="M 308,388 L 308,396 L 300,396"/>
      </g>
      <text x="22" y="394" font-family="'DM Mono',monospace" font-size="7" fill="#0d0c0a" opacity="0.2" letter-spacing="0.18em">BM — LDN · 2026</text>
    </svg>`;
  }

  function generateStackSVG() {
    return `<svg viewBox="0 0 380 240" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Abstract ink texture" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="inkpool1" cx="40%" cy="55%" r="50%">
          <stop offset="0%"   stop-color="#0d0c0a" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#0d0c0a" stop-opacity="0.00"/>
        </radialGradient>
      </defs>
      <rect width="380" height="240" fill="#efe8d8"/>
      <ellipse cx="152" cy="132" rx="150" ry="100" fill="url(#inkpool1)"/>
      <g fill="none" stroke="#0d0c0a" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 60,80 C 80,78 120,78 160,80" stroke-width="3.5" opacity="0.9"/>
        <path d="M 65,100 C 82,98 118,98 148,100" stroke-width="1.8" opacity="0.7"/>
        <path d="M 55,120 C 80,118 130,118 170,122" stroke-width="2.8" opacity="0.85"/>
        <path d="M 110,60 C 109,90 110,130 112,168" stroke-width="4.0" opacity="0.9"/>
        <path d="M 90,72 C 89,95 88,118 87,142" stroke-width="1.4" opacity="0.5"/>
        <path d="M 60,158 C 100,145 148,132 190,118 C 220,108 245,100 260,92" stroke-width="2.5" opacity="0.7"/>
        <path d="M 200,60 C 198,85 197,120 198,155" stroke-width="3.2" opacity="0.85"/>
        <path d="M 190,90 C 210,89 235,90 252,92" stroke-width="2.0" opacity="0.65"/>
        <path d="M 186,145 C 215,142 248,140 270,138" stroke-width="2.8" opacity="0.75"/>
        <path d="M 256,90 C 270,95 282,105 288,118 C 292,128 290,140 284,150" stroke-width="1.8" opacity="0.6"/>
      </g>
      <circle cx="110" cy="60" r="3.5" fill="#c8102e" opacity="0.85"/>
      <g opacity="0.3" fill="none" stroke="#0d0c0a" stroke-width="0.7">
        <path d="M 12,12 L 12,4 L 20,4"/>
        <path d="M 368,12 L 368,4 L 360,4"/>
        <path d="M 12,228 L 12,236 L 20,236"/>
        <path d="M 368,228 L 368,236 L 360,236"/>
      </g>
      <text x="22" y="232" font-family="'DM Mono',monospace" font-size="7" fill="#0d0c0a" opacity="0.25" letter-spacing="0.2em">TECHNICAL STACK — 2026</text>
    </svg>`;
  }

  function generateContactLandscapeSVG() {
    return `<svg viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Ink wash mountain landscape" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stop-color="#efe8d8"/>
          <stop offset="100%" stop-color="#e8dfc8"/>
        </linearGradient>
        <radialGradient id="mistL" cx="20%" cy="100%" r="60%">
          <stop offset="0%" stop-color="#f5f0e8" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#f5f0e8" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="mistR" cx="80%" cy="100%" r="50%">
          <stop offset="0%" stop-color="#f5f0e8" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#f5f0e8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="200" fill="url(#skyFade)"/>
      <g opacity="0.08">
        <path d="M 0,200 L 0,120 C 40,115 80,108 130,100 C 180,92 220,98 260,104 C 300,110 340,105 380,98 C 420,91 460,96 490,102 C 490,102 490,200 0,200 Z" fill="#0d0c0a"/>
        <path d="M 490,102 C 530,95 580,88 630,92 C 680,96 720,104 760,108 C 800,112 840,106 880,98 C 920,90 960,94 1000,100 C 1000,100 1000,200 490,200 Z" fill="#0d0c0a"/>
        <path d="M 1000,100 C 1040,94 1080,88 1120,92 C 1160,96 1190,104 1200,110 L 1200,200 L 1000,200 Z" fill="#0d0c0a"/>
      </g>
      <g opacity="0.14">
        <path d="M 0,200 L 0,148 C 30,142 70,130 110,120 C 150,110 182,115 208,125 C 240,136 260,150 288,158 C 310,164 330,162 350,155 C 380,145 400,130 430,120 C 462,109 495,112 520,122 C 520,122 520,200 0,200 Z" fill="#0d0c0a"/>
        <path d="M 520,122 C 548,132 575,142 605,148 C 635,154 665,150 695,140 C 730,128 755,112 790,106 C 825,100 860,108 890,120 C 918,130 942,144 970,152 C 995,158 1018,155 1040,145 C 1040,145 1040,200 520,200 Z" fill="#0d0c0a"/>
        <path d="M 1040,145 C 1065,134 1092,120 1118,115 C 1148,110 1175,118 1200,130 L 1200,200 L 1040,200 Z" fill="#0d0c0a"/>
      </g>
      <path d="M 0,200 L 0,172 C 25,168 55,162 88,155 C 115,149 142,146 165,149 C 185,152 200,158 218,163 C 238,168 258,170 278,166 C 302,161 322,150 348,142 C 372,134 398,130 425,133 C 452,136 475,145 498,154 C 520,162 540,168 560,170 C 580,172 598,168 618,160 C 640,151 660,138 685,130 C 710,122 738,118 765,122 C 790,126 812,136 835,146 C 858,156 880,164 905,168 C 928,172 952,170 975,164 C 1000,157 1022,145 1048,136 C 1072,128 1098,122 1125,125 C 1152,128 1178,140 1200,152 L 1200,200 Z" fill="#0d0c0a" opacity="0.22"/>
      <g fill="#0d0c0a" opacity="0.28">
        <path d="M 85,170 L 80,155 L 90,155 Z"/>
        <path d="M 90,172 L 84,157 L 96,157 Z"/>
        <path d="M 350,148 L 344,132 L 356,132 Z"/>
        <path d="M 615,165 L 610,149 L 620,149 Z"/>
        <path d="M 622,162 L 617,148 L 627,148 Z"/>
        <path d="M 975,160 L 970,145 L 980,145 Z"/>
        <path d="M 982,163 L 977,148 L 987,148 Z"/>
      </g>
      <rect x="0" y="0" width="1200" height="200" fill="url(#mistL)" opacity="0.6"/>
      <rect x="0" y="0" width="1200" height="200" fill="url(#mistR)" opacity="0.5"/>
      <circle cx="960" cy="52" r="22" fill="none" stroke="#0d0c0a" stroke-width="0.8" opacity="0.18"/>
      <g fill="none" stroke="#0d0c0a">
        <path d="M 820,38 C 823,35 827,35 830,38" stroke-width="1.2" opacity="0.35"/>
        <path d="M 835,32 C 838,29 842,29 845,32" stroke-width="1.0" opacity="0.35"/>
        <path d="M 845,42 C 848,39 851,39 854,42" stroke-width="0.9" opacity="0.35"/>
      </g>
      <line x1="0" y1="0" x2="1200" y2="0" stroke="#0d0c0a" stroke-width="0.6" opacity="0.15"/>
    </svg>`;
  }

  /* ═══════════════════════════════════════════════════════════════════
     06 — NAV SCROLL STATE
  ═══════════════════════════════════════════════════════════════════ */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -60px',
      onEnter:     () => nav.classList.add('scrolled'),
      onLeaveBack: () => nav.classList.remove('scrolled'),
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     07 — MOBILE MENU
         clip-path diagonal wipe open/close.
  ═══════════════════════════════════════════════════════════════════ */
  function initMobileMenu() {
    const burger = document.getElementById('nav-burger');
    const menu   = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    function openMenu() {
      burger.classList.add('active');
      burger.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
      burger.classList.contains('active') ? closeMenu() : openMenu();
    });

    menu.querySelectorAll('.mm-link').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
        if (lenis) {
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {
            setTimeout(() => lenis.scrollTo(target, { offset: -64, duration: 1.4 }), 50);
          }
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     08 — SMOOTH ANCHOR NAVIGATION
  ═══════════════════════════════════════════════════════════════════ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -64, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     09 — DEEP MULTI-LAYER PARALLAX
         4 independent scrub tiers per parallax zone:
           Tier 1 (scrub 2.2): background wash / image layer
           Tier 2 (scrub 1.4): primary visual / figure
           Tier 3 (scrub 0.9): text content block
           Tier 4 (scrub 0.5): UI chrome (index col, labels)
         This matches Nakazawa's camera-layer editing — background
         strips move at different rates than foreground linework,
         creating the hyper-dynamic perspective warp on scroll.
  ═══════════════════════════════════════════════════════════════════ */
  function initParallax() {
    // ── HERO SECTION — 4-tier depth ──
    const heroImgLayer = document.querySelector('.asset-slot--hero');
    if (heroImgLayer) {
      gsap.to(heroImgLayer, {
        y: -110,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 2.2,
        }
      });
    }

    const heroRight = document.querySelector('.hero-right');
    if (heroRight) {
      gsap.to(heroRight, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4,
        }
      });
    }

    const heroText = document.querySelector('.hero-text');
    if (heroText) {
      gsap.to(heroText, {
        y: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.9,
        }
      });
    }

    const heroIndexCol = document.querySelector('.hero-index-col');
    if (heroIndexCol) {
      gsap.to(heroIndexCol, {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        }
      });
    }

    // ── ABOUT SECTION — visual panel parallax ──
    const aboutImgLayer = document.querySelector('.asset-slot--portrait');
    if (aboutImgLayer) {
      gsap.to(aboutImgLayer, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.8,
        }
      });
    }

    // Subtle background depth on about section
    const aboutBg = document.querySelector('.section-about');
    if (aboutBg) {
      gsap.fromTo(aboutBg, { backgroundPositionY: '0%' }, {
        backgroundPositionY: '30%',
        ease: 'none',
        scrollTrigger: {
          trigger: aboutBg,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 3.0,
        }
      });
    }

    // ── STACK SECTION — texture panel drift ──
    const stackImgLayer = document.querySelector('.asset-slot--stack');
    if (stackImgLayer) {
      gsap.to(stackImgLayer, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-stack',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.6,
        }
      });
    }

    // ── CONTACT SECTION — landscape panoramic slow pan ──
    const contactLandscape = document.querySelector('.contact-landscape-band');
    if (contactLandscape) {
      // Inner element pan (more dramatic than container shift)
      const landscapeInner = contactLandscape.querySelector('.nakazawa-svg-wrap, .asset-img, .landscape-img');
      const panTarget = landscapeInner || contactLandscape;
      gsap.to(panTarget, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-contact',
          start: 'top bottom',
          end: 'center top',
          scrub: 2.5,
        }
      });
    }

    // ── MARQUEE STRIP — entrance from right on scroll entry ──
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
      ScrollTrigger.create({
        trigger: '.marquee-strip',
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.fromTo(marqueeTrack,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.85, ease: 'power3.out' }
          );
        }
      });
    }

    // ── SECTION TITLES — Nakazawa title-card slice reveal ──
    // clip-path bottom-up wipe, simulating the rapid title cuts in B:Beginning
    document.querySelectorAll('.section-title').forEach(title => {
      gsap.fromTo(title,
        {
          opacity: 0,
          clipPath: 'inset(0 0 100% 0)',
          y: 18,
        },
        {
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 0.92,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 86%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     10 — SECTION REVEALS
         All [data-gsap-reveal] elements: opacity+Y fade.
         [data-gsap-proj] elements: staggered x-wipe with clip-path.
  ═══════════════════════════════════════════════════════════════════ */
  function initScrollReveals() {
    document.querySelectorAll('[data-gsap-reveal]').forEach(el => {
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.72,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    });

    const projItems = document.querySelectorAll('[data-gsap-proj]');
    if (projItems.length) {
      gsap.fromTo(projItems,
        {
          opacity: 0,
          x: -32,
          clipPath: 'inset(0 100% 0 0)',
        },
        {
          opacity: 1,
          x: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.72,
          stagger: 0.11,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#proj-grid',
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     11 — KATANA SLASH HOVER REVEALS
         3-phase polygon clip-path animation on project card hover.

         Phase 1 (enter): A diagonal slash polygon cuts across the
                          image panel from top-left to bottom-right,
                          expanding to reveal a crimson overlay.
                          Duration: 0.22s — aggressive, high-impact.

         Phase 2 (hold):  The overlay settles into a stable state.
                          Image brightens via filter to editorial tone.

         Phase 3 (leave): Reverse slash wipe exits bottom-right to
                          top-left. Duration: 0.28s — controlled exit.

         Additionally: title and tags receive a micro x-drift
         in the same direction as the slash for kinetic coherence.
  ═══════════════════════════════════════════════════════════════════ */
  function initKatanaSlashHovers() {
    document.querySelectorAll('.proj-item').forEach(item => {
      const imgPanel    = item.querySelector('.proj-img-panel');
      const title       = item.querySelector('.proj-title');
      const tags        = item.querySelectorAll('.proj-tags li');
      const projData    = item.querySelector('.proj-data');
      const visitOverlay = item.querySelector('.proj-visit-overlay');

      if (!imgPanel) return;

      // Build the slash overlay element dynamically
      let slashOverlay = item.querySelector('.katana-slash');
      if (!slashOverlay) {
        slashOverlay = document.createElement('div');
        slashOverlay.className = 'katana-slash';
        slashOverlay.style.cssText = `
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(200, 16, 46, 0.10) 0%,
            rgba(200, 16, 46, 0.06) 50%,
            rgba(13, 12, 10, 0.04) 100%
          );
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          pointer-events: none;
          z-index: 2;
          will-change: clip-path;
        `;
        imgPanel.style.position = 'relative';
        imgPanel.appendChild(slashOverlay);
      }

      // A second, faster "slash stroke" — thin diagonal line sweep
      let slashStroke = item.querySelector('.katana-stroke');
      if (!slashStroke) {
        slashStroke = document.createElement('div');
        slashStroke.className = 'katana-stroke';
        slashStroke.style.cssText = `
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 30%,
            rgba(200, 16, 46, 0.25) 48%,
            rgba(200, 16, 46, 0.25) 52%,
            transparent 70%
          );
          clip-path: polygon(-20% 0%, 0% 0%, 120% 100%, 100% 100%);
          opacity: 0;
          pointer-events: none;
          z-index: 3;
          will-change: opacity, transform;
        `;
        imgPanel.appendChild(slashStroke);
      }

      let hoverTL = null;

      item.addEventListener('mouseenter', () => {
        if (hoverTL) hoverTL.kill();

        hoverTL = gsap.timeline();

        // Phase 1: razor-fast katana slash stroke sweeps across
        hoverTL
          .to(slashStroke, {
            opacity: 1,
            duration: 0.04,
            ease: 'none',
          })
          .to(slashStroke, {
            x: '120%',
            duration: 0.18,
            ease: 'power4.in',
          }, 0)
          .to(slashStroke, {
            opacity: 0,
            duration: 0.05,
            ease: 'none',
          }, 0.16);

        // Phase 2: overlay expands from the slash vector
        // polygon: starts as a collapsed diagonal, opens to full coverage
        hoverTL
          .to(slashOverlay, {
            duration: 0.28,
            ease: 'power3.out',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          }, 0.05);

        // Phase 3: visit overlay fades in (if present)
        if (visitOverlay) {
          hoverTL.to(visitOverlay, {
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
          }, 0.18);
        }

        // Title micro-drift in slash direction
        if (title) {
          hoverTL.to(title, {
            x: 6,
            duration: 0.3,
            ease: 'power2.out',
          }, 0.05);
        }

        // Tags stagger drift
        if (tags.length) {
          hoverTL.to(tags, {
            x: 4,
            stagger: 0.022,
            duration: 0.25,
            ease: 'power2.out',
          }, 0.08);
        }

        // Image filter brightens — editorial polish
        const img = imgPanel.querySelector('img.asset-img, img.proj-screenshot');
        if (img) {
          hoverTL.to(img, {
            filter: 'saturate(0.25) contrast(1.12) sepia(0.1) brightness(1.06)',
            duration: 0.35,
            ease: 'power2.out',
          }, 0.05);
        }

        // Proj-data left border flash
        if (projData) {
          hoverTL.to(projData, {
            borderLeftColor: 'var(--c-crimson)',
            duration: 0.2,
          }, 0);
        }
      });

      item.addEventListener('mouseleave', () => {
        if (hoverTL) hoverTL.kill();

        hoverTL = gsap.timeline();

        // Reverse slash: wipe exits bottom-right → top-left
        hoverTL
          .to(slashOverlay, {
            duration: 0.32,
            ease: 'power3.in',
            clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
          }, 0)
          .to(slashOverlay, {
            duration: 0,
            clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          }, 0.32);

        if (visitOverlay) {
          hoverTL.to(visitOverlay, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0);
        }

        if (title) {
          hoverTL.to(title, { x: 0, duration: 0.3, ease: 'power2.inOut' }, 0.05);
        }

        if (tags.length) {
          hoverTL.to(tags, { x: 0, stagger: 0.015, duration: 0.25, ease: 'power2.inOut' }, 0.05);
        }

        const img = imgPanel.querySelector('img.asset-img, img.proj-screenshot');
        if (img) {
          // Restore original screenshot normaliser filter
          hoverTL.to(img, {
            filter: SCREENSHOT_FILTER,
            duration: 0.4,
            ease: 'power2.inOut',
          }, 0.05);
        }

        if (projData) {
          hoverTL.to(projData, { borderLeftColor: 'transparent', duration: 0.2 }, 0.1);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     12 — SKILL BAR ANIMATION
  ═══════════════════════════════════════════════════════════════════ */
  function initSkillBars() {
    document.querySelectorAll('.sk-fill').forEach(fill => {
      const targetPct = parseInt(fill.dataset.pct, 10) || 0;
      gsap.set(fill, { width: '0%' });
      ScrollTrigger.create({
        trigger: fill,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(fill, {
            width: targetPct + '%',
            duration: 1.05,
            ease: 'power2.out',
          });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     13 — PROJECT FILTER
  ═══════════════════════════════════════════════════════════════════ */
  function initProjectFilter() {
    const filterBtns = document.querySelectorAll('#proj-filters .pf');
    const projItems  = document.querySelectorAll('.proj-item');
    if (!filterBtns.length || !projItems.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.f;

        projItems.forEach((item, i) => {
          const tags    = (item.dataset.t || '').toLowerCase();
          const matches = filter === 'all' || tags.includes(filter.toLowerCase());

          if (matches) {
            item.classList.remove('hidden');
            gsap.fromTo(item,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.4, delay: i * 0.045, ease: 'power2.out' }
            );
          } else {
            gsap.to(item, {
              opacity: 0,
              y: 8,
              duration: 0.22,
              ease: 'power2.in',
              onComplete: () => item.classList.add('hidden'),
            });
          }
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     14 — CONTACT LINK HOVER
  ═══════════════════════════════════════════════════════════════════ */
  function initContactHovers() {
    document.querySelectorAll('.contact-link').forEach(link => {
      const handle = link.querySelector('.cl-handle');
      if (!handle) return;

      link.addEventListener('mouseenter', () => {
        gsap.to(handle, { x: 7, duration: 0.28, ease: 'power2.out' });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(handle, { x: 0, duration: 0.32, ease: 'power2.inOut' });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     15 — ACTIVE NAV LINK TRACKING
  ═══════════════════════════════════════════════════════════════════ */
  function initNavTracking() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 52%',
        end: 'bottom 52%',
        onEnter:     () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id),
      });
    });

    function setActiveNav(id) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === id);
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     16 — RESIZE HANDLER
  ═══════════════════════════════════════════════════════════════════ */
  function initResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh(true);
        if (lenis) lenis.resize();
      }, 200);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     FALLBACK — no GSAP
  ═══════════════════════════════════════════════════════════════════ */
  function initFallback() {
    injectImageAssets();
    // Degrade mobile menu to native show/hide
    const burger = document.getElementById('nav-burger');
    const menu   = document.getElementById('mobile-menu');
    if (burger && menu) {
      burger.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        menu.setAttribute('aria-hidden', String(!open));
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     MAIN INIT PIPELINE
         Order is critical:
         1. Lenis first — owns scroll, must be up before ST registers
         2. Cursor — needs rAF from start
         3. Asset injection — images load async, no blocking
         4. Loader — blocks body overflow, deferred anim fires after
         5. Nav/menu — lightweight DOM toggles
         6. Anchors — wraps Lenis.scrollTo
         7. Parallax — registers ST instances for each zone
         8. Reveals — remaining ST registrations
         9. Katana hovers — GSAP mousenter/leave timelines
         10. Skill bars — ST width counters
         11. Filter — interactive show/hide
         12. Contact — micro hovers
         13. Nav tracking — ST per section
         14. Resize — debounced refresh
         15. Final refresh — after all ST instances registered
  ═══════════════════════════════════════════════════════════════════ */
  function init() {
    lenis = initLenis();
    initCursor();
    injectImageAssets();
    initLoader();
    initNav();
    initMobileMenu();
    initSmoothAnchors();
    initParallax();
    initScrollReveals();
    initKatanaSlashHovers();
    initSkillBars();
    initProjectFilter();
    initContactHovers();
    initNavTracking();
    initResizeHandler();

    // Defer final refresh until paint is complete
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  }

  return { init, initFallback };
})();