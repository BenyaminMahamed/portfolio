/**
 * NAKAZAWA PORTFOLIO — MAIN.JS v3
 *
 * ROOT FIX: gsap.registerPlugin was called at IIFE parse time,
 * before defer'd CDN scripts finished loading. All GSAP usage
 * is now gated inside window.load so every dep is guaranteed ready.
 *
 * VISUAL: all asset-slot image placeholders removed from HTML.
 * Panels are pure CSS/ink — no SVG blobs, no placeholder boxes.
 */

'use strict';

/* ─── SINGLE ENTRY POINT ─────────────────────────────────────────────────────
   window.load fires AFTER all defer'd <script> tags have executed.
   DOMContentLoaded fires before defer scripts complete — that was the bug.
   ─────────────────────────────────────────────────────────────────────────── */
window.addEventListener('load', function () {

  /* Hard guard — if CDN failed, degrade gracefully */
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('[data-gsap-reveal],[data-gsap-proj]').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    initCursorBasic();
    initLoaderBasic();
    initMobileMenuBasic();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Init order matters */
  var lenis = initLenis();
  initCursor();
  initLoader(lenis);
  initNav();
  initMobileMenu(lenis);
  initSmoothAnchors(lenis);
  initParallax();
  initScrollReveals();
  initKatanaHovers();
  initSkillBars();
  initCredentialCounters();
  initMarquee();
  initProjectFilter();
  initContactHovers();
  initNavTracking();
  initResizeHandler(lenis);

  requestAnimationFrame(function() { ScrollTrigger.refresh(true); });
});

/* ════════════════════════════════════════════════════════════════════
   LENIS
   ════════════════════════════════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('[Portfolio] Lenis not found — native scroll');
    return null;
  }

  var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop: function(value) {
      if (arguments.length) { lenis.scrollTo(value, { immediate: true }); }
      return lenis.scroll;
    },
    getBoundingClientRect: function() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  lenis.on('scroll', ScrollTrigger.update);
  return lenis;
}

/* ════════════════════════════════════════════════════════════════════
   CURSOR
   ════════════════════════════════════════════════════════════════════ */
function initCursor() {
  var dot  = document.querySelector('.cursor-dot');
  var ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  if ('ontouchstart' in window) {
    dot.style.display = ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  var mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  var isel = 'a,button,.pf,.af,.tag,.proj-link,.repo-link,.contact-link';
  document.addEventListener('mouseover', function(e) {
    if (e.target.closest(isel)) {
      ring.style.width = ring.style.height = '50px';
      ring.style.borderColor = 'var(--c-crimson)';
    }
  });
  document.addEventListener('mouseout', function(e) {
    if (e.target.closest(isel)) {
      ring.style.width = ring.style.height = '36px';
      ring.style.borderColor = 'var(--c-ink-mid)';
    }
  });
  document.addEventListener('mouseleave', function() {
    dot.style.opacity = ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function() {
    dot.style.opacity = ring.style.opacity = '1';
  });
}

function initCursorBasic() {
  var dot  = document.querySelector('.cursor-dot');
  var ring = document.querySelector('.cursor-ring');
  if (dot)  dot.style.display  = 'none';
  if (ring) ring.style.display = 'none';
  document.body.style.cursor = 'auto';
}

/* ════════════════════════════════════════════════════════════════════
   LOADER
   ════════════════════════════════════════════════════════════════════ */
function initLoader(lenis) {
  var loader   = document.getElementById('loader');
  var bar      = document.getElementById('ld-bar');
  var pct      = document.getElementById('ld-pct');
  var enterBtn = document.getElementById('ld-enter');

  if (!loader || !enterBtn) {
    document.body.style.overflow = '';
    animateHeroEntrance();
    return;
  }

  document.body.style.overflow = 'hidden';
  var progress = 0, timer;

  function tick() {
    var inc = progress < 60  ? Math.random() * 5 + 1.5
            : progress < 88  ? Math.random() * 2 + 0.5
            :                  Math.random() * 0.6 + 0.1;
    progress = Math.min(progress + inc, 100);
    if (bar) bar.style.width = progress + '%';
    if (pct) pct.textContent = Math.floor(progress) + '%';
    if (progress < 100) {
      timer = setTimeout(tick, progress < 70 ? 28 + Math.random() * 30 : 60 + Math.random() * 80);
    } else {
      setTimeout(function() {
        if (pct) pct.textContent = '100%';
        enterBtn.classList.add('ready');
      }, 150);
    }
  }
  tick();

  function dismiss() {
    clearTimeout(timer);
    document.body.style.overflow = '';

    var slash = document.createElement('div');
    slash.style.cssText = 'position:absolute;inset:0;background:var(--c-crimson);transform:scaleX(0);transform-origin:left;z-index:1;';
    loader.appendChild(slash);

    gsap.timeline({ onComplete: function() {
      loader.style.display = 'none';
      animateHeroEntrance();
    }})
    .to(slash,  { scaleX: 1, duration: 0.32, ease: 'power4.inOut' })
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.55, ease: 'power4.inOut' }, 0.25);
  }

  enterBtn.addEventListener('click', dismiss);
  setTimeout(function() { if (loader.style.display !== 'none') dismiss(); }, 8000);
}

function initLoaderBasic() {
  var loader = document.getElementById('loader');
  var enterBtn = document.getElementById('ld-enter');
  if (!loader || !enterBtn) return;
  document.body.style.overflow = 'hidden';
  setTimeout(function() { enterBtn.classList.add('ready'); }, 1200);
  enterBtn.addEventListener('click', function() {
    loader.style.display = 'none';
    document.body.style.overflow = '';
    document.querySelectorAll('[data-gsap-reveal],[data-gsap-proj]').forEach(function(el) {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   HERO ENTRANCE
   ════════════════════════════════════════════════════════════════════ */
function animateHeroEntrance() {
  var lines   = document.querySelectorAll('.h1-line');
  var eyebrow = document.querySelector('.hero-eyebrow');
  var meta    = document.querySelector('.hero-meta');
  var desc    = document.querySelector('.hero-desc');
  var actions = document.querySelector('.hero-actions');
  var right   = document.querySelector('.hero-right');
  var slash   = document.querySelector('.hero-accent-slash');

  var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  if (lines.length) tl.to(lines, { y: 0, duration: 1.0, stagger: 0.1, ease: 'power3.out' }, 0);
  if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55 }, 0.2);
  if (meta)    tl.fromTo(meta,    { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5  }, 0.5);
  if (desc)    tl.fromTo(desc,    { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5  }, 0.62);
  if (actions) tl.fromTo(actions, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5  }, 0.75);
  if (right)   tl.fromTo(right,   { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, 0.28);
  if (slash)   tl.fromTo(slash,   { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 0.88);

  tl.call(function() { ScrollTrigger.refresh(); });
}

/* ════════════════════════════════════════════════════════════════════
   NAV SCROLL STATE
   ════════════════════════════════════════════════════════════════════ */
function initNav() {
  var nav = document.getElementById('nav');
  if (!nav) return;
  ScrollTrigger.create({
    start: 'top -60px',
    onEnter:     function() { nav.classList.add('scrolled'); },
    onLeaveBack: function() { nav.classList.remove('scrolled'); },
  });
}

/* ════════════════════════════════════════════════════════════════════
   MOBILE MENU
   ════════════════════════════════════════════════════════════════════ */
function initMobileMenu(lenis) {
  var burger = document.getElementById('nav-burger');
  var menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  function open() {
    burger.classList.add('active');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    burger.classList.remove('active');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function() {
    burger.classList.contains('active') ? close() : open();
  });

  menu.querySelectorAll('.mm-link').forEach(function(link) {
    link.addEventListener('click', function() {
      close();
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        if (lenis) { setTimeout(function() { lenis.scrollTo(target, { offset: -64, duration: 1.3 }); }, 50); }
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
}

function initMobileMenuBasic() { initMobileMenu(null); }

/* ════════════════════════════════════════════════════════════════════
   SMOOTH ANCHORS
   ════════════════════════════════════════════════════════════════════ */
function initSmoothAnchors(lenis) {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.3 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   PARALLAX — 4-TIER DEPTH
   ════════════════════════════════════════════════════════════════════ */
function initParallax() {
  /* Hero layers */
  var heroPanel = document.querySelector('.hero-ink-panel');
  if (heroPanel) gsap.to(heroPanel, { y: -100, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2.0 }});

  var heroRight = document.querySelector('.hero-right');
  if (heroRight) gsap.to(heroRight, { y: -55, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.3 }});

  var heroText = document.querySelector('.hero-text');
  if (heroText) gsap.to(heroText, { y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }});

  /* About ink panel */
  var aboutInk = document.querySelector('.about-ink-panel');
  if (aboutInk) gsap.to(aboutInk, { y: -70, ease: 'none', scrollTrigger: { trigger: '.section-about', start: 'top bottom', end: 'bottom top', scrub: 1.6 }});

  /* Contact landscape */
  var landscape = document.querySelector('.contact-landscape-band');
  if (landscape) gsap.to(landscape.querySelector('.landscape-ink') || landscape, { y: -35, ease: 'none', scrollTrigger: { trigger: '.section-contact', start: 'top bottom', end: 'center top', scrub: 2.2 }});

  /* Section titles — clip-path wipe in */
  document.querySelectorAll('.section-title').forEach(function(title) {
    gsap.fromTo(title,
      { opacity: 0, clipPath: 'inset(0 0 100% 0)', y: 16 },
      { opacity: 1, clipPath: 'inset(0 0 0% 0)',   y: 0,  duration: 0.85, ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 86%', once: true }
      }
    );
  });
}

/* ════════════════════════════════════════════════════════════════════
   SCROLL REVEALS
   ════════════════════════════════════════════════════════════════════ */
function initScrollReveals() {
  document.querySelectorAll('[data-gsap-reveal]').forEach(function(el) {
    var delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, delay: delay, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  var projs = document.querySelectorAll('[data-gsap-proj]');
  if (projs.length) {
    gsap.fromTo(projs,
      { opacity: 0, x: -28, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, x: 0,  clipPath: 'inset(0 0% 0 0)',  duration: 0.65, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '#proj-grid', start: 'top 82%', once: true }
      }
    );
  }
}

/* ════════════════════════════════════════════════════════════════════
   KATANA SLASH HOVERS
   ════════════════════════════════════════════════════════════════════ */
function initKatanaHovers() {
  document.querySelectorAll('.proj-item').forEach(function(item) {
    var panel    = item.querySelector('.proj-img-panel');
    var title    = item.querySelector('.proj-title');
    var tags     = item.querySelectorAll('.proj-tags li');
    var data     = item.querySelector('.proj-data');
    var overlay  = item.querySelector('.proj-visit-overlay');
    if (!panel) return;

    /* Slash overlay */
    var slashEl = document.createElement('div');
    slashEl.className = 'katana-slash';
    slashEl.style.cssText = 'position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,16,46,0.10),rgba(200,16,46,0.06));clip-path:polygon(0 0,0 0,0 100%,0 100%);pointer-events:none;z-index:2;will-change:clip-path;';
    panel.appendChild(slashEl);

    /* Stroke band */
    var strokeEl = document.createElement('div');
    strokeEl.className = 'katana-stroke';
    strokeEl.style.cssText = 'position:absolute;inset:-10% -20%;width:140%;height:120%;background:linear-gradient(105deg,transparent 30%,rgba(200,16,46,0.60) 44%,rgba(230,40,70,0.75) 50%,rgba(200,16,46,0.60) 56%,transparent 70%);background-size:300% 100%;background-position:100% 0;pointer-events:none;z-index:3;opacity:0;';
    panel.appendChild(strokeEl);

    var tl = null;

    item.addEventListener('mouseenter', function() {
      if (tl) tl.kill();
      strokeEl.style.backgroundPosition = '100% 0';
      strokeEl.style.opacity = '0';

      tl = gsap.timeline();
      /* Stroke sweeps across — 0.48s, readable */
      tl.set(strokeEl, { opacity: 1, backgroundPosition: '100% 0' })
        .to(strokeEl, { backgroundPosition: '-30% 0', duration: 0.48, ease: 'power3.inOut' }, 0)
        .to(strokeEl, { opacity: 0, duration: 0.14, ease: 'none' }, 0.40);
      /* Overlay fills */
      tl.to(slashEl, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', duration: 0.52, ease: 'power2.out' }, 0.06);
      /* Visit overlay */
      if (overlay) tl.to(overlay, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.2);
      /* Text drift */
      if (title) tl.to(title, { x: 5, duration: 0.28, ease: 'power2.out' }, 0.05);
      if (tags.length) tl.to(tags, { x: 3, stagger: 0.02, duration: 0.24, ease: 'power2.out' }, 0.08);
      if (data) tl.to(data, { borderLeftColor: 'var(--c-crimson)', duration: 0.18 }, 0);
    });

    item.addEventListener('mouseleave', function() {
      if (tl) tl.kill();
      tl = gsap.timeline();
      tl.to(slashEl, { clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)', duration: 0.40, ease: 'power3.in' }, 0)
        .set(slashEl, { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' });
      if (overlay) tl.to(overlay, { opacity: 0, duration: 0.16 }, 0);
      if (title) tl.to(title, { x: 0, duration: 0.28, ease: 'power2.inOut' }, 0.04);
      if (tags.length) tl.to(tags, { x: 0, stagger: 0.015, duration: 0.22, ease: 'power2.inOut' }, 0.04);
      if (data) tl.to(data, { borderLeftColor: 'var(--c-ink-whisper)', duration: 0.2 }, 0.08);
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   SKILL BARS
   ════════════════════════════════════════════════════════════════════ */
function initSkillBars() {
  document.querySelectorAll('.sk-fill').forEach(function(fill) {
    var pct = parseInt(fill.dataset.pct, 10) || 0;
    gsap.set(fill, { width: '0%' });
    ScrollTrigger.create({
      trigger: fill, start: 'top 88%', once: true,
      onEnter: function() { gsap.to(fill, { width: pct + '%', duration: 1.0, ease: 'power2.out' }); }
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   PROJECT FILTER
   ════════════════════════════════════════════════════════════════════ */
function initProjectFilter() {
  var btns  = document.querySelectorAll('#proj-filters .pf');
  var items = document.querySelectorAll('.proj-item');
  if (!btns.length || !items.length) return;

  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.f;
      items.forEach(function(item, i) {
        var tags = (item.dataset.t || '').toLowerCase();
        var show = f === 'all' || tags.includes(f.toLowerCase());
        if (show) {
          item.classList.remove('hidden');
          gsap.fromTo(item, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, delay: i * 0.04, ease: 'power2.out' });
        } else {
          gsap.to(item, { opacity: 0, y: 8, duration: 0.2, ease: 'power2.in', onComplete: function() { item.classList.add('hidden'); }});
        }
      });
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   CONTACT HOVERS
   ════════════════════════════════════════════════════════════════════ */
function initContactHovers() {
  document.querySelectorAll('.contact-link').forEach(function(link) {
    var handle = link.querySelector('.cl-handle');
    if (!handle) return;
    link.addEventListener('mouseenter', function() { gsap.to(handle, { x: 7, duration: 0.26, ease: 'power2.out' }); });
    link.addEventListener('mouseleave', function() { gsap.to(handle, { x: 0, duration: 0.3,  ease: 'power2.inOut' }); });
  });
}

/* ════════════════════════════════════════════════════════════════════
   NAV ACTIVE TRACKING
   ════════════════════════════════════════════════════════════════════ */
function initNavTracking() {
  var sections = document.querySelectorAll('section[id]');
  var links    = document.querySelectorAll('.nav-link');
  sections.forEach(function(sec) {
    ScrollTrigger.create({
      trigger: sec, start: 'top 52%', end: 'bottom 52%',
      onEnter:     function() { setActive(sec.id); },
      onEnterBack: function() { setActive(sec.id); },
    });
  });
  function setActive(id) {
    links.forEach(function(l) {
      l.classList.toggle('active', l.getAttribute('href').replace('#','') === id);
    });
  }
}

/* ════════════════════════════════════════════════════════════════════
   CREDENTIAL COUNTER ANIMATION
   Count-up from 0 to target on viewport entry.
   Handles "1,000+" "7+" "4+" "100%" — skips non-numeric like "BSc".
   ════════════════════════════════════════════════════════════════════ */
function initCredentialCounters() {
  document.querySelectorAll('.cred-val, .hi-val, .pm-val').forEach(function(el) {
    var text  = el.textContent.trim();
    var match = text.match(/^([\d,]+)/);
    if (!match) return;

    var target      = parseInt(match[1].replace(/,/g, ''), 10);
    var suffix      = text.slice(match[1].length);
    var hasPlus     = suffix.charAt(0) === '+';
    var cleanSuffix = hasPlus ? suffix.slice(1) : suffix;

    /* Store original so counter has clean start point */
    el.dataset.counterTarget = target;

    ScrollTrigger.create({
      trigger: el,
      start:   'top 88%',
      once:    true,
      onEnter: function() {
        var duration  = Math.min(1.4, 0.4 + target / 800);
        var startTime = performance.now();

        (function update(now) {
          var elapsed  = (now - startTime) / 1000;
          var progress = Math.min(elapsed / duration, 1);
          var eased    = 1 - Math.pow(1 - progress, 3);
          var current  = Math.round(eased * target);
          var formatted = current >= 1000
            ? current.toLocaleString('en-GB')
            : String(current);

          el.textContent = formatted + (hasPlus && progress >= 1 ? '+' : '') + cleanSuffix;

          if (progress < 1) requestAnimationFrame(update);
        })(performance.now());
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   MARQUEE ENTRANCE
   Fades in from right on first scroll into view.
   CSS animation keeps running — we just fade the track in.
   ════════════════════════════════════════════════════════════════════ */
function initMarquee() {
  var track = document.querySelector('.marquee-track');
  if (!track) return;

  gsap.set(track, { opacity: 0, x: 40 });

  ScrollTrigger.create({
    trigger: '.marquee-strip',
    start:   'top 85%',
    once:    true,
    onEnter: function() {
      gsap.to(track, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
    }
  });
}

/* ════════════════════════════════════════════════════════════════════
   RESIZE
   ════════════════════════════════════════════════════════════════════ */
function initResizeHandler(lenis) {
  var t;
  window.addEventListener('resize', function() {
    clearTimeout(t);
    t = setTimeout(function() {
      ScrollTrigger.refresh(true);
      if (lenis) lenis.resize();
    }, 200);
  });
}