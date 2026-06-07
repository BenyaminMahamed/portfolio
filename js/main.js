/**
 * SAMURAI CHAMPLOO PORTFOLIO — MAIN.JS
 * Benyamin Mahamed · 2026
 *
 * FLOW:
 * 1. Page loads → menu screen visible immediately
 * 2. User selects episode → title card flashes → content section reveals
 * 3. Back button → returns to menu
 * 4. Scroll reveals, skill bars, project filter, cursor all init on content entry
 */

'use strict';

/* ─── EPISODE DATA ───────────────────────────────────────────────────────────── */
const EPISODES = {
  about:    { num: 'EP.01', title: 'The Wanderer',        sub: 'About · Origins · Philosophy' },
  projects: { num: 'EP.02', title: 'The Work',            sub: 'Production Systems · Live Projects' },
  stack:    { num: 'EP.03', title: 'The Arsenal',         sub: 'Technical Stack · Core Competencies' },
  archive:  { num: 'EP.04', title: 'The Archive',         sub: 'GitHub · Repository Index' },
  contact:  { num: 'EP.05', title: 'Unfinished Business', sub: 'Contact · Hire · Collaborate' },
};

/* ─── STATE ──────────────────────────────────────────────────────────────────── */
let state = {
  inContent: false,
  activeEp:  null,
  lenis:     null,
};

/* ─── ENTRY ──────────────────────────────────────────────────────────────────── */
window.addEventListener('load', function () {
  initCursor();
  initMenuClock();
  initMenuKeyboard();
  initMenuClicks();
  initContentNav();
  initEndCard();
  initProjectFilter();

  // GSAP + Lenis init — only needed once we enter content
  // Guard in case CDN failed
  if (typeof gsap === 'undefined') {
    console.warn('[Portfolio] GSAP not loaded — animations disabled');
  }
});

/* ════════════════════════════════════════════════════════════════════
   CURSOR
   ════════════════════════════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Hide on touch devices
  if ('ontouchstart' in window) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const hoverSel = 'a, button, .episode-item, .pf, .af, .tag, .proj-link, .contact-link, .cnav-ep, .cnav-back, .ep-continue-btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = ring.style.opacity = '1';
  });
}

/* ════════════════════════════════════════════════════════════════════
   MENU CLOCK
   ════════════════════════════════════════════════════════════════════ */
function initMenuClock() {
  const el = document.getElementById('menu-time');
  if (!el) return;

  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    el.textContent = h + ':' + m;
  }
  tick();
  setInterval(tick, 30000);
}

/* ════════════════════════════════════════════════════════════════════
   MENU — KEYBOARD NAVIGATION
   ════════════════════════════════════════════════════════════════════ */
function initMenuKeyboard() {
  const items = Array.from(document.querySelectorAll('.episode-item'));
  if (!items.length) return;

  let activeIdx = 0;

  function setActive(idx) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === idx);
    });
    activeIdx = idx;
  }

  document.addEventListener('keydown', (e) => {
    // Only fire when menu is visible
    if (state.inContent) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setActive((activeIdx - 1 + items.length) % items.length);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive((activeIdx + 1) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        const target = items[activeIdx].dataset.target;
        if (target) enterEpisode(target);
        break;
    }
  });
}

/* ════════════════════════════════════════════════════════════════════
   MENU — CLICK SELECT
   ════════════════════════════════════════════════════════════════════ */
function initMenuClicks() {
  document.querySelectorAll('.episode-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      if (target) enterEpisode(target);
    });

    // Hover sets active state
    item.addEventListener('mouseenter', () => {
      document.querySelectorAll('.episode-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   ENTER EPISODE — core transition
   ════════════════════════════════════════════════════════════════════ */
function enterEpisode(sectionId) {
  const ep = EPISODES[sectionId];
  if (!ep) return;

  state.activeEp = sectionId;

  // 1. Show title card
  showTitleCard(ep, () => {
    // 2. Hide menu, show content
    const menu    = document.getElementById('menu-screen');
    const content = document.getElementById('main-content');
    const cnav    = document.getElementById('content-nav');

    if (menu)    menu.classList.add('hidden');
    if (content) {
      content.classList.add('visible');
      content.style.opacity = '1';
      content.style.pointerEvents = 'all';
    }
    if (cnav) cnav.classList.add('visible');

    state.inContent = true;

    // 3. Scroll to target section
    const section = document.getElementById(sectionId);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'instant' });
        // 4. Init animations now that content is visible
        initContentAnimations();
      }, 50);
    }
  });
}

/* ════════════════════════════════════════════════════════════════════
   TITLE CARD
   ════════════════════════════════════════════════════════════════════ */
function showTitleCard(ep, onComplete) {
  const card = document.getElementById('ep-titlecard');
  const num  = document.getElementById('tc-ep-num');
  const title = document.getElementById('tc-ep-title');
  const sub   = document.getElementById('tc-ep-sub');

  if (!card) { onComplete(); return; }

  if (num)   num.textContent   = ep.num;
  if (title) title.textContent = ep.title;
  if (sub)   sub.textContent   = ep.sub;

  card.classList.add('show');

  // Title card animation is 1.6s, fire callback at ~1.2s so content ready
  setTimeout(() => {
    onComplete();
  }, 1200);

  setTimeout(() => {
    card.classList.remove('show');
  }, 1700);
}

/* ════════════════════════════════════════════════════════════════════
   CONTENT NAV
   ════════════════════════════════════════════════════════════════════ */
function initContentNav() {
  // Back to menu
  const backBtn = document.getElementById('cnav-back');
  if (backBtn) {
    backBtn.addEventListener('click', returnToMenu);
  }

  // End card return button
  const endReturn = document.getElementById('end-card-return');
  if (endReturn) {
    endReturn.addEventListener('click', returnToMenu);
  }

  // EP nav links — update active state on scroll
  initEpNavTracking();
}

function returnToMenu() {
  const menu    = document.getElementById('menu-screen');
  const content = document.getElementById('main-content');
  const cnav    = document.getElementById('content-nav');

  // Scroll content to top before hiding
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (menu) {
    menu.classList.remove('hidden');
  }
  if (content) {
    content.classList.remove('visible');
    content.style.opacity = '0';
    content.style.pointerEvents = 'none';
  }
  if (cnav) cnav.classList.remove('visible');

  state.inContent = false;
  state.activeEp  = null;
}

/* ════════════════════════════════════════════════════════════════════
   EP NAV ACTIVE TRACKING
   ════════════════════════════════════════════════════════════════════ */
function initEpNavTracking() {
  const epLinks = document.querySelectorAll('.cnav-ep');
  if (!epLinks.length) return;

  const epMap = {
    'EP.01': 'about',
    'EP.02': 'projects',
    'EP.03': 'stack',
    'EP.04': 'archive',
    'EP.05': 'contact',
  };

  // Smooth scroll on ep nav click
  epLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const section = document.querySelector(href);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Intersection observer to set active ep
  const sections = document.querySelectorAll('.episode[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        epLinks.forEach(link => {
          const epNum = link.dataset.ep;
          link.classList.toggle('active', epMap[epNum] === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════════════════════════════
   END CARD
   ════════════════════════════════════════════════════════════════════ */
function initEndCard() {
  // Already handled in initContentNav
}

/* ════════════════════════════════════════════════════════════════════
   CONTENT ANIMATIONS — init once on first entry
   ════════════════════════════════════════════════════════════════════ */
let animationsInitialised = false;

function initContentAnimations() {
  if (animationsInitialised) return;
  animationsInitialised = true;

  initLenis();
  initScrollReveals();
  initSkillBars();
  initProjectFilter();
}

/* ════════════════════════════════════════════════════════════════════
   LENIS
   ════════════════════════════════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  state.lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
  });

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => state.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      state.lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* ════════════════════════════════════════════════════════════════════
   SCROLL REVEALS
   ════════════════════════════════════════════════════════════════════ */
function initScrollReveals() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => el.classList.add('revealed'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════════════════════════
   SKILL BARS
   ════════════════════════════════════════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.sk-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const pct  = parseInt(fill.dataset.pct, 10) || 0;
        fill.style.width = pct + '%';
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => {
    fill.style.width = '0%';
    observer.observe(fill);
  });
}

/* ════════════════════════════════════════════════════════════════════
   PROJECT FILTER
   ════════════════════════════════════════════════════════════════════ */
function initProjectFilter() {
  const btns  = document.querySelectorAll('#proj-filters .pf');
  const cards = document.querySelectorAll('.proj-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const f = btn.dataset.f;

      cards.forEach(card => {
        const tags = (card.dataset.t || '').toLowerCase();
        const show = f === 'all' || tags.includes(f.toLowerCase());
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        }
      });
    });
  });
}