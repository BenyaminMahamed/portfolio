/**
 * NAKAZAWA PORTFOLIO — MAIN.JS
 * ═══════════════════════════════════════════════════════════════════════════════
 * SYSTEM ARCHITECTURE:
 *   1. Lenis Smooth Scroll   — initialized first, feeds RAF to GSAP ticker
 *   2. GSAP + ScrollTrigger  — all scroll-bound frame transforms
 *   3. Custom Cursor         — hardware-accelerated rAF tracking
 *   4. Loader Sequence       — timed progress sim + enter gate
 *   5. Nav Scroll State      — threshold-based class toggle
 *   6. Mobile Menu           — clip-path reveal
 *   7. Hero Type Reveal      — staggered line lift from mask
 *   8. Inline SVG Artwork    — programmatic Nakazawa-style ink generation
 *   9. Parallax Layers       — multi-tier scroll depth
 *   10. Section Reveals      — gsap.reveal pipeline
 *   11. Skill Bars           — counter-animated on entry
 *   12. Project Filter       — tag-based fade/hide
 *   13. Marquee              — CSS-driven, pause-on-hover guard
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─── DEPENDENCY GUARD ────────────────────────────────────────────────────────── */
// All init deferred until DOM + CDN scripts are ready
window.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.warn('[Portfolio] GSAP not loaded — animations disabled');
    document.querySelectorAll('[data-gsap-reveal],[data-gsap-proj]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  Portfolio.init();
});

/* ─── PORTFOLIO NAMESPACE ────────────────────────────────────────────────────── */
const Portfolio = (() => {

  /* ─── GSAP PLUGIN REGISTRATION ─────────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─── LENIS INITIALIZATION ──────────────────────────────────────────────────── */
  let lenis;

  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[Portfolio] Lenis not loaded — native scroll active');
      return null;
    }

    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2.0,
      infinite: false,
      autoResize: true,
    });

    // ── Critical: feed Lenis RAF into GSAP ticker
    // This synchronizes Lenis's virtual scroll position with all
    // GSAP ScrollTrigger calculations, preventing frame-offset artifacts
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP's default lag smoothing — Lenis handles this
    gsap.ticker.lagSmoothing(0);

    // Tell ScrollTrigger to use Lenis's scroll position
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    // After Lenis updates, refresh all ScrollTrigger instances
    lenis.on('scroll', ScrollTrigger.update);

    return lenis;
  }

  /* ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────── */
  function initCursor() {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    const ringLag = 0.12;

    function moveCursor(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows immediately
      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    }

    function animateRing() {
      ringX += (mouseX - ringX) * ringLag;
      ringY += (mouseY - ringY) * ringLag;
      ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(animateRing);
    }

    window.addEventListener('mousemove', moveCursor, { passive: true });
    animateRing();

    // Scale ring on interactive elements
    const interactive = 'a, button, .pf, .af, .tag, .proj-link, .repo-link';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactive)) {
        ring.style.width  = '52px';
        ring.style.height = '52px';
        ring.style.borderColor = 'var(--c-crimson)';
        dot.style.width  = '3px';
        dot.style.height = '3px';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactive)) {
        ring.style.width  = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'var(--c-ink-mid)';
        dot.style.width  = '6px';
        dot.style.height = '6px';
      }
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  /* ─── LOADER SEQUENCE ───────────────────────────────────────────────────────── */
  function initLoader() {
    const loader   = document.getElementById('loader');
    const bar      = document.getElementById('ld-bar');
    const pct      = document.getElementById('ld-pct');
    const enterBtn = document.getElementById('ld-enter');
    if (!loader || !bar || !enterBtn) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    let progress = 0;
    let raf;

    // Simulate asset loading with organic easing
    function tick() {
      // Ease toward 100 with natural deceleration
      const target = progress < 90 ? progress + (Math.random() * 4 + 0.8) : 100;
      progress = Math.min(target, 100);

      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent  = Math.floor(progress) + '%';

      if (progress < 100) {
        const delay = progress < 70
          ? 30 + Math.random() * 40
          : 60 + Math.random() * 80;
        raf = setTimeout(tick, delay);
      } else {
        // Loader complete — reveal enter button
        setTimeout(() => {
          enterBtn.classList.add('ready');
          if (pct) pct.textContent = '100%';
        }, 200);
      }
    }

    tick();

    function dismissLoader() {
      clearTimeout(raf);
      document.body.style.overflow = '';

      // Nakazawa slash-wipe exit — horizontal ink slice
      gsap.to(loader, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.9,
        ease: 'power4.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          // Trigger hero entrance after loader clears
          animateHeroEntrance();
        }
      });
    }

    enterBtn.addEventListener('click', dismissLoader);

    // Auto-dismiss after 6s max
    setTimeout(() => {
      if (loader.style.display !== 'none') dismissLoader();
    }, 6000);
  }

  /* ─── HERO ENTRANCE ANIMATION ───────────────────────────────────────────────── */
  function animateHeroEntrance() {
    const h1Lines = document.querySelectorAll('.h1-line');
    const heroEyebrow = document.querySelector('.hero-eyebrow');
    const heroMeta = document.querySelector('.hero-meta');
    const heroDesc = document.querySelector('.hero-desc');
    const heroActions = document.querySelector('.hero-actions');
    const heroRight = document.querySelector('.hero-right');

    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' }
    });

    // Staggered line lift — each H1 line revealed from clipping mask
    if (h1Lines.length) {
      tl.to(h1Lines, {
        y: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power3.out',
      }, 0);
    }

    if (heroEyebrow) {
      tl.fromTo(heroEyebrow,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.2
      );
    }

    if (heroMeta) {
      tl.fromTo(heroMeta,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.55
      );
    }

    if (heroDesc) {
      tl.fromTo(heroDesc,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.7
      );
    }

    if (heroActions) {
      tl.fromTo(heroActions,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.85
      );
    }

    if (heroRight) {
      tl.fromTo(heroRight,
        { opacity: 0, x: 24 },
        { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out' },
        0.3
      );
    }

    // After hero is in, refresh ScrollTrigger
    tl.call(() => {
      ScrollTrigger.refresh();
    });
  }

  /* ─── NAV SCROLL STATE ──────────────────────────────────────────────────────── */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    // Use ScrollTrigger to toggle 'scrolled' class for nav background
    ScrollTrigger.create({
      start: 'top -60px',
      onEnter:    () => nav.classList.add('scrolled'),
      onLeaveBack: () => nav.classList.remove('scrolled'),
    });
  }

  /* ─── MOBILE MENU ───────────────────────────────────────────────────────────── */
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

    burger.addEventListener('click', () => {
      burger.classList.contains('active') ? close() : open();
    });

    // Close on link click
    menu.querySelectorAll('.mm-link').forEach(link => {
      link.addEventListener('click', () => {
        close();
        // Lenis handles the scroll
        if (lenis) {
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {
            setTimeout(() => lenis.scrollTo(target, { offset: -64, duration: 1.4 }), 50);
          }
        }
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) close();
    });
  }

  /* ─── SMOOTH ANCHOR NAVIGATION ──────────────────────────────────────────────── */
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

  /* ─── INLINE SVG NAKAZAWA ARTWORK GENERATOR ─────────────────────────────────── */
  /**
   * Generates a complex, multi-layered pure inline SVG composition
   * synthesized from Nakazawa's compositional vocabulary:
   *   — Asymmetric figure silhouettes (high-contrast, razor-edged)
   *   — Hand-drawn line weight variation via stroke-dasharray + width variation
   *   — Sumi-e ink wash bleed patches using radial gradients + multiply blend
   *   — Kinetic diagonal speed lines (Kill Bill anime motion cues)
   *   — Sparse geometric framing (Champloo episode card borders)
   *   — Negative space weighting: 60% white / 40% ink
   */
  function generateNakazawaHeroSVG() {
    return `<svg viewBox="0 0 540 680" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Nakazawa-style ink composition"
      preserveAspectRatio="xMidYMid meet">

      <defs>
        <!-- Sumi-e ink wash gradient — irregular bleed at edges -->
        <radialGradient id="wash1" cx="30%" cy="40%" r="55%" fx="28%" fy="38%">
          <stop offset="0%"   stop-color="#1a1815" stop-opacity="0.22"/>
          <stop offset="45%"  stop-color="#1a1815" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#1a1815" stop-opacity="0.00"/>
        </radialGradient>
        <radialGradient id="wash2" cx="70%" cy="75%" r="40%" fx="72%" fy="78%">
          <stop offset="0%"   stop-color="#0d0c0a" stop-opacity="0.15"/>
          <stop offset="60%"  stop-color="#0d0c0a" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#0d0c0a" stop-opacity="0.00"/>
        </radialGradient>
        <!-- Crimson accent gradient -->
        <linearGradient id="crimsonFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#c8102e" stop-opacity="1"/>
          <stop offset="100%" stop-color="#c8102e" stop-opacity="0"/>
        </linearGradient>
        <!-- Speed-line clip mask -->
        <clipPath id="speedClip">
          <rect x="0" y="0" width="540" height="680"/>
        </clipPath>
        <!-- Ink texture filter -->
        <filter id="inkBlur" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06"
            numOctaves="3" seed="12" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise"
            scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="inkBlurSoft">
          <feTurbulence type="fractalNoise" baseFrequency="0.08 0.12"
            numOctaves="2" seed="7" result="noise2"/>
          <feDisplacementMap in="SourceGraphic" in2="noise2"
            scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>

      <!-- ══ BACKGROUND — warm bone canvas ══ -->
      <rect width="540" height="680" fill="#f5f0e8"/>

      <!-- ══ SUMI-E INK WASH LAYERS — mix-blend-mode:multiply ══ -->
      <g class="ink-wash-layer">
        <ellipse cx="162" cy="272" rx="180" ry="240" fill="url(#wash1)" filter="url(#inkBlurSoft)"/>
        <ellipse cx="378" cy="510" rx="110" ry="140" fill="url(#wash2)" filter="url(#inkBlurSoft)"/>

        <!-- Irregular ink bleed patches — brushstroke edges -->
        <path d="M 82,180 C 75,170 60,185 55,178 C 50,171 68,162 78,168
                 C 90,158 100,175 82,180 Z"
          fill="#0d0c0a" opacity="0.08" filter="url(#inkBlurSoft)"/>
        <path d="M 110,340 C 95,332 88,350 80,345 C 72,340 85,325 98,330
                 C 112,318 120,338 110,340 Z"
          fill="#0d0c0a" opacity="0.06" filter="url(#inkBlurSoft)"/>
        <path d="M 410,480 C 400,470 388,490 380,482 C 372,474 390,462 402,470
                 C 415,458 422,478 410,480 Z"
          fill="#0d0c0a" opacity="0.09" filter="url(#inkBlurSoft)"/>
      </g>

      <!-- ══ NAKAZAWA SPEED LINES — Kill Bill diagonal motion cues ══ -->
      <g clip-path="url(#speedClip)" opacity="0.055">
        <!-- Radiating from focal point at ~(160, 320) — perspective warp -->
        <line x1="160" y1="320" x2="-30"  y2="-20"  stroke="#0d0c0a" stroke-width="0.8"/>
        <line x1="160" y1="320" x2="40"   y2="-30"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="120"  y2="-30"  stroke="#0d0c0a" stroke-width="0.6"/>
        <line x1="160" y1="320" x2="220"  y2="-30"  stroke="#0d0c0a" stroke-width="0.4"/>
        <line x1="160" y1="320" x2="580"  y2="0"    stroke="#0d0c0a" stroke-width="0.7"/>
        <line x1="160" y1="320" x2="580"  y2="100"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="580"  y2="200"  stroke="#0d0c0a" stroke-width="0.4"/>
        <line x1="160" y1="320" x2="-30"  y2="120"  stroke="#0d0c0a" stroke-width="0.6"/>
        <line x1="160" y1="320" x2="-30"  y2="260"  stroke="#0d0c0a" stroke-width="0.7"/>
        <line x1="160" y1="320" x2="-30"  y2="400"  stroke="#0d0c0a" stroke-width="0.4"/>
        <line x1="160" y1="320" x2="-30"  y2="520"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="80"   y2="710"  stroke="#0d0c0a" stroke-width="0.6"/>
        <line x1="160" y1="320" x2="180"  y2="710"  stroke="#0d0c0a" stroke-width="0.4"/>
        <line x1="160" y1="320" x2="300"  y2="710"  stroke="#0d0c0a" stroke-width="0.5"/>
        <line x1="160" y1="320" x2="580"  y2="480"  stroke="#0d0c0a" stroke-width="0.6"/>
        <line x1="160" y1="320" x2="580"  y2="380"  stroke="#0d0c0a" stroke-width="0.5"/>
      </g>

      <!-- ══ SAMURAI FIGURE SILHOUETTE — Nakazawa razor-sharp ink construction ══ -->
      <!--
          Figure in classic Samurai Champloo stance:
          weight shifted right, sword hand raised, coat billowing left
          Built from precise path segments with deliberate line-weight variation
          to simulate hand-drawn organic ink on washi paper
      -->
      <g class="ink-line-layer" filter="url(#inkBlur)">

        <!-- Head silhouette — high-contrast, minimal detail -->
        <ellipse cx="272" cy="96" rx="34" ry="38" fill="#0d0c0a"/>

        <!-- Neck & collar -->
        <path d="M 260,130 L 258,148 L 286,148 L 284,130 Z" fill="#0d0c0a"/>

        <!-- Main body — gi/coat, asymmetric wrap -->
        <path d="
          M 248,148
          C 240,152 228,162 218,175
          C 210,186 204,198 200,212
          C 196,224 194,236 192,248
          L 190,298
          C 188,310 190,318 196,322
          L 200,340
          C 192,348 188,360 186,374
          L 182,420
          C 180,432 179,444 180,452
          C 180,460 183,465 188,466
          L 192,500
          L 202,502
          L 206,466
          C 209,460 210,452 208,440
          L 212,395
          C 214,382 218,372 224,366
          L 240,352
          L 254,340
          L 272,335
          L 290,340
          L 310,352
          L 320,366
          C 326,372 330,382 332,395
          L 336,440
          C 334,452 335,460 338,466
          L 342,502
          L 352,500
          L 356,466
          C 361,465 364,460 364,452
          C 365,444 364,432 362,420
          L 358,374
          C 356,360 352,348 344,340
          L 348,322
          C 354,318 356,310 354,298
          L 352,248
          C 350,236 348,224 344,212
          C 340,198 334,186 326,175
          C 316,162 304,152 296,148
          Z
        " fill="#0d0c0a" opacity="0.92"/>

        <!-- Haori coat overlay — partial, flowing left — Champloo kimono silhouette -->
        <path d="
          M 248,155
          C 236,158 218,168 204,182
          C 190,196 180,216 172,234
          C 165,250 162,264 160,280
          L 158,310
          C 156,324 158,338 164,346
          C 150,352 138,360 128,372
          C 116,386 108,404 102,420
          C 94,438 90,458 88,476
          L 85,500
          C 84,512 86,520 92,524
          L 186,520
          L 190,495
          C 182,490 178,480 178,468
          L 182,424
          C 184,412 188,400 195,390
          C 200,382 207,376 216,372
          L 220,358
          C 230,352 244,348 256,346
          L 264,335
        " fill="none" stroke="#0d0c0a" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Coat hem detail lines — ink weight variation -->
        <path d="M 88,476 C 86,490 85,502 85,512 L 88,520"
          fill="none" stroke="#0d0c0a" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 102,420 C 98,434 94,448 92,462"
          fill="none" stroke="#0d0c0a" stroke-width="1.0" stroke-linecap="round" opacity="0.7"/>

        <!-- Raised sword arm — left arm elevated, katana grip visible -->
        <path d="
          M 248,162
          C 240,158 230,154 218,152
          C 208,150 196,152 186,158
          L 175,168
          C 165,176 158,188 152,200
          L 140,232
          C 133,248 128,264 124,278
          L 120,300
          C 118,312 118,322 122,330
          C 126,338 132,342 140,340
          L 148,336
          C 148,330 144,322 142,312
          L 142,286
          C 144,272 148,258 154,246
          L 163,222
          C 170,208 178,196 187,187
          L 200,177
          L 218,170
          L 240,170
          Z
        " fill="#1a1815" opacity="0.85"/>

        <!-- Katana blade — full extension, razor geometry -->
        <path d="M 118,298 L 36,142 L 44,136 L 126,294 Z"
          fill="#0d0c0a"/>

        <!-- Blade edge highlight — thin ink line on leading edge -->
        <line x1="40" y1="139" x2="122" y2="296"
          stroke="#f5f0e8" stroke-width="0.6" opacity="0.4"/>

        <!-- Tsuba (guard) -->
        <ellipse cx="124" cy="300" rx="9" ry="6" fill="#1a1815"
          transform="rotate(-32 124 300)"/>

        <!-- Katana handle grip wrap — diagonal texture lines -->
        <path d="M 124,300 L 138,338" stroke="#0d0c0a" stroke-width="3.5"
          stroke-linecap="round"/>
        <line x1="126" y1="305" x2="132" y2="320" stroke="#f5f0e8" stroke-width="0.8" opacity="0.3"/>
        <line x1="129" y1="312" x2="135" y2="327" stroke="#f5f0e8" stroke-width="0.8" opacity="0.3"/>
        <line x1="132" y1="320" x2="138" y2="335" stroke="#f5f0e8" stroke-width="0.8" opacity="0.3"/>

        <!-- Right arm — lowered, steady stance -->
        <path d="
          M 296,162
          C 306,158 318,156 330,158
          L 350,168
          C 364,178 374,192 380,208
          L 390,236
          C 396,252 398,268 396,280
          L 392,305
          L 386,312
          L 376,308
          L 372,290
          L 374,266
          C 372,252 368,240 361,228
          L 350,208
          C 340,195 329,186 316,180
          L 300,173
          Z
        " fill="#1a1815" opacity="0.82"/>

        <!-- Lower body — hakama/trousers, wide stance -->
        <path d="
          M 220,460
          L 215,545
          L 213,580
          L 220,625
          C 222,636 228,644 236,646
          L 258,648
          L 265,600
          L 267,560
          L 272,540
          L 277,560
          L 279,600
          L 286,648
          L 308,646
          C 316,644 322,636 324,625
          L 331,580
          L 329,545
          L 324,460
          Z
        " fill="#0d0c0a" opacity="0.88"/>

        <!-- Hakama fold lines — fabric structure -->
        <path d="M 240,470 L 238,530" stroke="#f5f0e8" stroke-width="0.7" opacity="0.25"/>
        <path d="M 256,465 L 255,535" stroke="#f5f0e8" stroke-width="0.5" opacity="0.2"/>
        <path d="M 288,465 L 289,535" stroke="#f5f0e8" stroke-width="0.5" opacity="0.2"/>
        <path d="M 304,470 L 306,530" stroke="#f5f0e8" stroke-width="0.7" opacity="0.25"/>

        <!-- Tabi (feet/footwear) -->
        <path d="M 225,648 C 218,652 210,658 206,665 C 202,672 205,678 214,679 L 244,679 C 252,679 255,674 253,668 L 249,648 Z"
          fill="#1a1815"/>
        <path d="M 319,648 C 326,652 334,658 338,665 C 342,672 339,678 330,679 L 300,679 C 292,679 289,674 291,668 L 295,648 Z"
          fill="#1a1815"/>

      </g>

      <!-- ══ KINETIC INK SLASH ACCENTS — Nakazawa motion geometry ══ -->
      <!-- These represent the fast-cut brush-stroke overlays in Kill Bill's opening -->

      <!-- Primary diagonal slash — thick, slightly uneven pressure -->
      <path d="M 38,540 L 508,290 L 514,302 L 44,552 Z"
        fill="#0d0c0a" opacity="0.07"/>

      <!-- Secondary thin slash — parallel, offset -->
      <path d="M 55,565 L 530,308 L 532,312 L 57,569 Z"
        fill="#0d0c0a" opacity="0.04"/>

      <!-- Crimson accent slash — surgical, precise -->
      <rect x="0" y="188" width="88" height="2.5"
        fill="#c8102e" opacity="0.9"/>
      <rect x="0" y="194" width="52" height="1"
        fill="#c8102e" opacity="0.5"/>

      <!-- Horizontal rule — editorial framing -->
      <line x1="0" y1="62" x2="540" y2="62"
        stroke="#0d0c0a" stroke-width="0.5" opacity="0.12"/>
      <line x1="0" y1="640" x2="540" y2="640"
        stroke="#0d0c0a" stroke-width="0.5" opacity="0.12"/>

      <!-- Vertical index rule — left edge newspaper column -->
      <line x1="48" y1="0" x2="48" y2="680"
        stroke="#0d0c0a" stroke-width="0.5" opacity="0.1"/>

      <!-- Corner registration marks — B:The Beginning production card style -->
      <g opacity="0.4" fill="none" stroke="#0d0c0a" stroke-width="0.8">
        <path d="M 20,20 L 20,8 L 32,8"/>
        <path d="M 520,20 L 520,8 L 508,8"/>
        <path d="M 20,660 L 20,672 L 32,672"/>
        <path d="M 520,660 L 520,672 L 508,672"/>
      </g>

      <!-- Frame index text — production card typography -->
      <text x="56" y="76" font-family="'DM Mono', monospace" font-size="9"
        fill="#0d0c0a" opacity="0.3" letter-spacing="0.2em">001 — ENGINEER</text>

      <text x="56" y="654" font-family="'DM Mono', monospace" font-size="9"
        fill="#0d0c0a" opacity="0.3" letter-spacing="0.2em">LONDON · 2026</text>

      <!-- Crimson vertical accent — right panel rule -->
      <rect x="532" y="160" width="2" height="220"
        fill="#c8102e" opacity="0.8"/>
      <rect x="534" y="200" width="1" height="120"
        fill="#c8102e" opacity="0.3"/>

      <!-- ══ SCATTERED INK DOTS — brush spatter ══ -->
      <g opacity="0.15" fill="#0d0c0a">
        <circle cx="68"  cy="130" r="1.2"/>
        <circle cx="72"  cy="135" r="0.7"/>
        <circle cx="64"  cy="139" r="0.5"/>
        <circle cx="490" cy="420" r="1.5"/>
        <circle cx="495" cy="415" r="0.8"/>
        <circle cx="486" cy="426" r="0.6"/>
        <circle cx="440" cy="150" r="1.0"/>
        <circle cx="446" cy="146" r="0.6"/>
        <circle cx="120" cy="580" r="1.2"/>
        <circle cx="116" cy="585" r="0.7"/>
        <circle cx="124" cy="575" r="0.5"/>
      </g>

    </svg>`;
  }

  function generateStackSVG() {
    return `<svg viewBox="0 0 380 240" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Abstract ink texture"
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="inkpool1" cx="40%" cy="55%" r="50%">
          <stop offset="0%"   stop-color="#0d0c0a" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#0d0c0a" stop-opacity="0.00"/>
        </radialGradient>
      </defs>
      <rect width="380" height="240" fill="#efe8d8"/>
      <ellipse cx="152" cy="132" rx="150" ry="100" fill="url(#inkpool1)"/>

      <!-- Calligraphy stroke cluster — 技 (skill/technique) deconstructed -->
      <g fill="none" stroke="#0d0c0a" stroke-linecap="round" stroke-linejoin="round">
        <!-- Horizontal strokes — varying pressure -->
        <path d="M 60,80 C 80,78 120,78 160,80" stroke-width="3.5" opacity="0.9"/>
        <path d="M 65,100 C 82,98 118,98 148,100" stroke-width="1.8" opacity="0.7"/>
        <path d="M 55,120 C 80,118 130,118 170,122" stroke-width="2.8" opacity="0.85"/>
        <!-- Vertical strokes -->
        <path d="M 110,60 C 109,90 110,130 112,168" stroke-width="4.0" opacity="0.9"/>
        <path d="M 90,72 C 89,95 88,118 87,142" stroke-width="1.4" opacity="0.5"/>
        <!-- Diagonal sweeping stroke -->
        <path d="M 60,158 C 100,145 148,132 190,118 C 220,108 245,100 260,92"
          stroke-width="2.5" opacity="0.7"/>
        <!-- Secondary character element — right side -->
        <path d="M 200,60 C 198,85 197,120 198,155" stroke-width="3.2" opacity="0.85"/>
        <path d="M 190,90 C 210,89 235,90 252,92" stroke-width="2.0" opacity="0.65"/>
        <path d="M 188,118 C 205,116 228,116 248,120" stroke-width="1.5" opacity="0.55"/>
        <path d="M 186,145 C 215,142 248,140 270,138" stroke-width="2.8" opacity="0.75"/>
        <!-- Ink tail strokes — brush lifting off paper -->
        <path d="M 256,90 C 270,95 282,105 288,118 C 292,128 290,140 284,150"
          stroke-width="1.8" opacity="0.6"/>
        <path d="M 272,136 C 290,140 310,148 326,156 C 338,162 348,170 354,180"
          stroke-width="1.2" opacity="0.45"/>
      </g>

      <!-- Small crimson accent point -->
      <circle cx="110" cy="60" r="3.5" fill="#c8102e" opacity="0.85"/>

      <!-- Registration marks -->
      <g opacity="0.3" fill="none" stroke="#0d0c0a" stroke-width="0.7">
        <path d="M 12,12 L 12,4 L 20,4"/>
        <path d="M 368,12 L 368,4 L 360,4"/>
        <path d="M 12,228 L 12,236 L 20,236"/>
        <path d="M 368,228 L 368,236 L 360,236"/>
      </g>

      <text x="22" y="232" font-family="'DM Mono',monospace" font-size="7"
        fill="#0d0c0a" opacity="0.25" letter-spacing="0.2em">TECHNICAL STACK — 2026</text>
    </svg>`;
  }

  function generateContactLandscapeSVG() {
    return `<svg viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Ink wash mountain landscape"
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stop-color="#efe8d8" stop-opacity="1"/>
          <stop offset="100%" stop-color="#e8dfc8" stop-opacity="1"/>
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

      <!-- ── Far mountains — low opacity, minimal detail ── -->
      <g opacity="0.08">
        <path d="M 0,200 L 0,120 C 40,115 80,108 130,100 C 180,92 220,98 260,104
                 C 300,110 340,105 380,98 C 420,91 460,96 490,102
                 C 490,102 490,200 0,200 Z" fill="#0d0c0a"/>
        <path d="M 490,102 C 530,95 580,88 630,92 C 680,96 720,104 760,108
                 C 800,112 840,106 880,98 C 920,90 960,94 1000,100
                 C 1000,100 1000,200 490,200 Z" fill="#0d0c0a"/>
        <path d="M 1000,100 C 1040,94 1080,88 1120,92 C 1160,96 1190,104 1200,110
                 L 1200,200 L 1000,200 Z" fill="#0d0c0a"/>
      </g>

      <!-- ── Mid mountains — medium opacity, more form ── -->
      <g opacity="0.14">
        <path d="M 0,200 L 0,148 C 30,142 70,130 110,120 C 150,110 182,115 208,125
                 C 240,136 260,150 288,158 C 310,164 330,162 350,155
                 C 380,145 400,130 430,120 C 462,109 495,112 520,122
                 C 520,122 520,200 0,200 Z" fill="#0d0c0a"/>
        <path d="M 520,122 C 548,132 575,142 605,148 C 635,154 665,150 695,140
                 C 730,128 755,112 790,106 C 825,100 860,108 890,120
                 C 918,130 942,144 970,152 C 995,158 1018,155 1040,145
                 C 1040,145 1040,200 520,200 Z" fill="#0d0c0a"/>
        <path d="M 1040,145 C 1065,134 1092,120 1118,115 C 1148,110 1175,118 1200,130
                 L 1200,200 L 1040,200 Z" fill="#0d0c0a"/>
      </g>

      <!-- ── Foreground ridge — darkest, most detail ── -->
      <path d="
        M 0,200 L 0,172
        C 25,168 55,162 88,155
        C 115,149 142,146 165,149
        C 185,152 200,158 218,163
        C 238,168 258,170 278,166
        C 302,161 322,150 348,142
        C 372,134 398,130 425,133
        C 452,136 475,145 498,154
        C 520,162 540,168 560,170
        C 580,172 598,168 618,160
        C 640,151 660,138 685,130
        C 710,122 738,118 765,122
        C 790,126 812,136 835,146
        C 858,156 880,164 905,168
        C 928,172 952,170 975,164
        C 1000,157 1022,145 1048,136
        C 1072,128 1098,122 1125,125
        C 1152,128 1178,140 1200,152
        L 1200,200 Z
      " fill="#0d0c0a" opacity="0.22"/>

      <!-- Scattered trees/forms on foreground ridge -->
      <g fill="#0d0c0a" opacity="0.28">
        <!-- Tree cluster left -->
        <path d="M 85,170 L 80,155 L 90,155 Z"/>
        <path d="M 90,172 L 84,157 L 96,157 Z"/>
        <path d="M 95,168 L 90,156 L 100,156 Z"/>
        <!-- Tree cluster center-left -->
        <path d="M 350,148 L 344,132 L 356,132 Z"/>
        <path d="M 358,150 L 352,134 L 364,134 Z"/>
        <!-- Tree cluster center -->
        <path d="M 615,165 L 610,149 L 620,149 Z"/>
        <path d="M 622,162 L 617,148 L 627,148 Z"/>
        <path d="M 630,168 L 625,153 L 635,153 Z"/>
        <!-- Tree cluster right -->
        <path d="M 975,160 L 970,145 L 980,145 Z"/>
        <path d="M 982,163 L 977,148 L 987,148 Z"/>
      </g>

      <!-- Mist layers — foreground fades -->
      <rect x="0" y="0" width="1200" height="200" fill="url(#mistL)" opacity="0.6"/>
      <rect x="0" y="0" width="1200" height="200" fill="url(#mistR)" opacity="0.5"/>

      <!-- Sun disc — spare, high in frame -->
      <circle cx="960" cy="52" r="22" fill="none"
        stroke="#0d0c0a" stroke-width="0.8" opacity="0.18"/>
      <circle cx="960" cy="52" r="18" fill="#0d0c0a" opacity="0.06"/>

      <!-- Flying birds — ink dots in loose formation -->
      <g fill="#0d0c0a" opacity="0.35">
        <path d="M 820,38 C 823,35 827,35 830,38" fill="none" stroke="#0d0c0a" stroke-width="1.2"/>
        <path d="M 835,32 C 838,29 842,29 845,32" fill="none" stroke="#0d0c0a" stroke-width="1.0"/>
        <path d="M 845,42 C 848,39 851,39 854,42" fill="none" stroke="#0d0c0a" stroke-width="0.9"/>
        <path d="M 810,46 C 813,43 816,43 819,46" fill="none" stroke="#0d0c0a" stroke-width="0.8"/>
      </g>

      <!-- Horizontal rule at top -->
      <line x1="0" y1="0" x2="1200" y2="0"
        stroke="#0d0c0a" stroke-width="0.6" opacity="0.15"/>
    </svg>`;
  }

  function generatePortraitSVG() {
    return `<svg viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Abstract ink portrait"
      preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="pgradL" cx="35%" cy="45%" r="55%">
          <stop offset="0%"  stop-color="#0d0c0a" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#0d0c0a" stop-opacity="0.00"/>
        </radialGradient>
      </defs>
      <rect width="320" height="400" fill="#f9f5ed"/>
      <ellipse cx="112" cy="180" rx="110" ry="130" fill="url(#pgradL)"/>

      <!-- Abstract portrait suggestion — intentionally sparse, Nakazawa negative space -->
      <g fill="none" stroke="#0d0c0a" stroke-linecap="round" stroke-linejoin="round">
        <!-- Head outline — single continuous gesture -->
        <path d="M 160,55 C 182,55 200,68 205,88 C 210,108 208,130 200,148
                 C 192,166 180,176 165,180 C 150,184 136,180 126,170
                 C 116,160 110,145 108,128 C 106,111 108,94 116,80 C 124,66 140,55 160,55 Z"
          stroke-width="2.0" opacity="0.85"/>

        <!-- Shoulder line — single weighted stroke -->
        <path d="M 68,260 C 88,240 115,228 145,222 C 162,218 178,220 194,226
                 C 218,234 238,248 255,268"
          stroke-width="3.5" opacity="0.9"/>

        <!-- Torso edge — left -->
        <path d="M 68,260 L 58,340 L 72,345" stroke-width="2.5" opacity="0.75"/>

        <!-- Torso edge — right -->
        <path d="M 255,268 L 262,345 L 248,342" stroke-width="2.0" opacity="0.7"/>

        <!-- Collar/neck -->
        <path d="M 145,180 L 140,222" stroke-width="1.8" opacity="0.65"/>
        <path d="M 175,180 L 180,222" stroke-width="1.5" opacity="0.6"/>

        <!-- Sparse face features — single gesture, Champloo abstraction -->
        <path d="M 140,118 C 144,116 150,116 154,118" stroke-width="1.4" opacity="0.7"/>
        <path d="M 166,118 C 170,116 176,116 180,118" stroke-width="1.4" opacity="0.7"/>
        <path d="M 152,142 C 158,148 168,148 172,142" stroke-width="1.2" opacity="0.6"/>
        <path d="M 148,130 L 172,130" stroke-width="0.8" opacity="0.25"/>
      </g>

      <!-- Fill areas — sparse -->
      <path d="M 145,222 C 118,230 96,246 78,266 L 74,310 L 70,345 L 250,345 L 252,310
               L 254,268 C 236,250 216,238 194,232 L 180,222 Z"
        fill="#0d0c0a" opacity="0.08"/>

      <!-- Crimson accent -->
      <rect x="0" y="112" width="40" height="2" fill="#c8102e" opacity="0.8"/>

      <!-- Registration marks -->
      <g opacity="0.25" fill="none" stroke="#0d0c0a" stroke-width="0.7">
        <path d="M 12,12 L 12,4 L 20,4"/>
        <path d="M 308,12 L 308,4 L 300,4"/>
        <path d="M 12,388 L 12,396 L 20,396"/>
        <path d="M 308,388 L 308,396 L 300,396"/>
      </g>

      <text x="22" y="394" font-family="'DM Mono',monospace" font-size="7"
        fill="#0d0c0a" opacity="0.2" letter-spacing="0.18em">BM — LDN · 2026</text>
    </svg>`;
  }

  function injectSVGArtwork() {
    // Hero slot
    const heroSlot = document.querySelector('.asset-slot--hero .asset-slot-inner');
    if (heroSlot) {
      const heroLabel = heroSlot.querySelector('.asset-slot-label');
      const wrap = document.createElement('div');
      wrap.className = 'nakazawa-svg-wrap';
      wrap.innerHTML = generateNakazawaHeroSVG();
      if (heroLabel) {
        heroSlot.insertBefore(wrap, heroLabel);
      } else {
        heroSlot.appendChild(wrap);
      }
    }

    // Portrait slot
    const portraitSlot = document.querySelector('.asset-slot--portrait .asset-slot-inner');
    if (portraitSlot) {
      const portraitLabel = portraitSlot.querySelector('.asset-slot-label');
      const wrap = document.createElement('div');
      wrap.className = 'nakazawa-svg-wrap';
      wrap.innerHTML = generatePortraitSVG();
      if (portraitLabel) {
        portraitSlot.insertBefore(wrap, portraitLabel);
      } else {
        portraitSlot.appendChild(wrap);
      }
    }

    // Stack texture slot
    const stackSlot = document.querySelector('.asset-slot--stack');
    if (stackSlot) {
      const wrap = document.createElement('div');
      wrap.className = 'nakazawa-svg-wrap';
      wrap.innerHTML = generateStackSVG();
      stackSlot.insertBefore(wrap, stackSlot.firstChild);
    }

    // Contact landscape slot
    const landscapeSlot = document.querySelector('.asset-slot--landscape');
    if (landscapeSlot) {
      const wrap = document.createElement('div');
      wrap.className = 'nakazawa-svg-wrap';
      wrap.innerHTML = generateContactLandscapeSVG();
      landscapeSlot.insertBefore(wrap, landscapeSlot.firstChild);
    }
  }

  /* ─── GSAP SCROLL REVEALS ───────────────────────────────────────────────────── */
  function initScrollReveals() {
    // Section eyebrow / text reveals
    document.querySelectorAll('[data-gsap-reveal]').forEach(el => {
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
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

    // Project items — staggered horizontal wipe-in
    const projItems = document.querySelectorAll('[data-gsap-proj]');
    if (projItems.length) {
      gsap.fromTo(projItems,
        { opacity: 0, x: -28, clipPath: 'inset(0 100% 0 0)' },
        {
          opacity: 1,
          x: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#proj-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    }
  }

  /* ─── MULTI-LAYER PARALLAX — Nakazawa perspective warp ──────────────────────── */
  function initParallax() {
    // Hero text panel — subtle upward drift on scroll
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
      gsap.to(heroText, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        }
      });
    }

    // Hero right panel — counter-drift (Nakazawa foreground/background split)
    const heroRight = document.querySelector('.hero-right');
    if (heroRight) {
      gsap.to(heroRight, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      });
    }

    // Hero SVG artwork — independent parallax layer (background depth)
    const heroSvgWrap = document.querySelector('.asset-slot--hero .nakazawa-svg-wrap');
    if (heroSvgWrap) {
      gsap.to(heroSvgWrap, {
        y: -90,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.8, // slower — deeper z-layer
        }
      });
    }

    // Hero vertical index column — slowest layer (deepest depth)
    const heroIndexCol = document.querySelector('.hero-index-col');
    if (heroIndexCol) {
      gsap.to(heroIndexCol, {
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        }
      });
    }

    // Marquee strip — slight horizontal offset parallax on scroll
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
      ScrollTrigger.create({
        trigger: '.marquee-strip',
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(marqueeTrack,
            { opacity: 0, x: 40 },
            { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
          );
        },
        once: true,
      });
    }

    // Section titles — kinetic scale entrance (Nakazawa title card cuts)
    document.querySelectorAll('.section-title').forEach(title => {
      gsap.fromTo(title,
        { opacity: 0, clipPath: 'inset(0 0 100% 0)', y: 20 },
        {
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 0.9,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    });

    // About visual — sticky parallax depth
    const aboutVisual = document.querySelector('.about-visual');
    if (aboutVisual) {
      gsap.to(aboutVisual.querySelector('.nakazawa-svg-wrap, .asset-slot-inner') || aboutVisual, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });
    }

    // Contact landscape — dramatic pan
    const contactLandscape = document.querySelector('.contact-landscape-band');
    if (contactLandscape) {
      gsap.to(contactLandscape.querySelector('.nakazawa-svg-wrap') || contactLandscape, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-contact',
          start: 'top bottom',
          end: 'top top',
          scrub: 2.0,
        }
      });
    }
  }

  /* ─── SKILL BAR ANIMATION ───────────────────────────────────────────────────── */
  function initSkillBars() {
    document.querySelectorAll('.sk-fill').forEach(fill => {
      const targetPct = parseInt(fill.dataset.pct, 10) || 0;
      ScrollTrigger.create({
        trigger: fill,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(fill, {
            width: targetPct + '%',
            duration: 1.0,
            ease: 'power2.out',
          });
        }
      });
    });
  }

  /* ─── PROJECT HOVER EFFECTS — clip-path slash reveal ────────────────────────── */
  function initProjectHovers() {
    document.querySelectorAll('.proj-item').forEach(item => {
      const title = item.querySelector('.proj-title');
      const tags  = item.querySelectorAll('.proj-tags li');

      item.addEventListener('mouseenter', () => {
        if (title) {
          gsap.to(title, {
            x: 4,
            duration: 0.35,
            ease: 'power2.out',
          });
        }
        if (tags.length) {
          gsap.to(tags, {
            x: 3,
            stagger: 0.025,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });

      item.addEventListener('mouseleave', () => {
        if (title) {
          gsap.to(title, {
            x: 0,
            duration: 0.35,
            ease: 'power2.out',
          });
        }
        if (tags.length) {
          gsap.to(tags, {
            x: 0,
            stagger: 0.02,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    });
  }

  /* ─── PROJECT FILTER ─────────────────────────────────────────────────────────── */
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
          const tags = item.dataset.t || '';
          const matches = filter === 'all' || tags.includes(filter);

          if (matches) {
            item.classList.remove('hidden');
            gsap.fromTo(item,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.4, delay: i * 0.05, ease: 'power2.out' }
            );
          } else {
            gsap.to(item, {
              opacity: 0,
              y: 8,
              duration: 0.25,
              onComplete: () => item.classList.add('hidden'),
            });
          }
        });
      });
    });
  }

  /* ─── CONTACT LINK HOVER ─────────────────────────────────────────────────────── */
  function initContactHovers() {
    document.querySelectorAll('.contact-link').forEach(link => {
      const handle = link.querySelector('.cl-handle');
      if (!handle) return;

      link.addEventListener('mouseenter', () => {
        gsap.to(handle, {
          x: 6,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      link.addEventListener('mouseleave', () => {
        gsap.to(handle, {
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
  }

  /* ─── ACTIVE NAV LINK TRACKING ───────────────────────────────────────────────── */
  function initNavTracking() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter: () => setActiveNav(section.id),
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

  /* ─── RESIZE HANDLER ─────────────────────────────────────────────────────────── */
  function initResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        if (lenis) lenis.resize();
      }, 200);
    });
  }

  /* ─── MAIN INIT ──────────────────────────────────────────────────────────────── */
  function init() {
    lenis = initLenis();
    initCursor();
    injectSVGArtwork();
    initLoader();
    initNav();
    initMobileMenu();
    initSmoothAnchors();
    initScrollReveals();
    initParallax();
    initSkillBars();
    initProjectHovers();
    initProjectFilter();
    initContactHovers();
    initNavTracking();
    initResizeHandler();

    // Final ScrollTrigger refresh after all triggers are registered
    // Defer to ensure DOM fully painted
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  return { init };
})();