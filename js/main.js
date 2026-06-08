/**
 * SAMURAI CHAMPLOO PORTFOLIO — MAIN.JS
 * Benyamin Mahamed · 2026
 *
 * FLOW:
 * Menu (fixed) → slash transition → title card → long scroll page
 *
 * On episode select:
 * 1. Slash covers screen
 * 2. Menu hides, content shows, scroll to section
 * 3. Hero canvas slides in, ink reveals fire
 * 4. Slash reveals
 * 5. Normal scroll from there — scroll reveals, skill bars, parallax scene breaks
 */

'use strict';

/* ─── EPISODE MAP ────────────────────────────────────────────────────────────── */
const EPISODES = [
  { id: 'about',    num: 'EP.01', title: 'The Wanderer',        sub: 'About · Origins · Philosophy' },
  { id: 'projects', num: 'EP.02', title: 'The Work',            sub: 'Production Systems · Live Projects' },
  { id: 'stack',    num: 'EP.03', title: 'The Arsenal',         sub: 'Technical Stack · Core Competencies' },
  { id: 'archive',  num: 'EP.04', title: 'The Archive',         sub: 'GitHub · Repository Index' },
  { id: 'contact',  num: 'EP.05', title: 'Unfinished Business', sub: 'Contact · Hire · Collaborate' },
];

/* ─── STATE ──────────────────────────────────────────────────────────────────── */
const S = {
  menuActiveIdx: 0,
  transitioning: false,
  contentVisible: false,
  revealObserver: null,
  skillObserver: null,
};

/* ─── ENTRY ──────────────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  initCursor();
  initMenuClock();
  initMenuItems();
  initMenuKeyboard();
  initContentNav();
  initProjectFilter();
  setMenuActive(0);
});

/* ════════════════════════════════════════════════════════════════════
   CURSOR
   ════════════════════════════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  if ('ontouchstart' in window) {
    dot.style.display = ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    document.querySelectorAll('button, a').forEach(el => el.style.cursor = 'pointer');
    return;
  }

  let mx = -300, my = -300, rx = -300, ry = -300;

  window.addEventListener('mousemove', e => {
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

  const HOVER = 'a, button, .ep-item, .pf, .af, .tag, .plink, .clink, .cnav-ep, .cnav-back, .ghost-btn, .repo-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER)) document.body.classList.add('c-active');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER)) document.body.classList.remove('c-active');
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
  const tick = () => {
    const d = new Date();
    el.textContent = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  };
  tick();
  setInterval(tick, 30000);
}

/* ════════════════════════════════════════════════════════════════════
   MENU ITEMS
   ════════════════════════════════════════════════════════════════════ */
function initMenuItems() {
  const items = Array.from(document.querySelectorAll('.ep-item'));

  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => setMenuActive(i));
    item.addEventListener('click', () => goToEpisode(item.dataset.target));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToEpisode(item.dataset.target);
      }
    });
  });
}

function setMenuActive(idx) {
  document.querySelectorAll('.ep-item').forEach((item, i) => {
    item.classList.toggle('is-active', i === idx);
  });
  S.menuActiveIdx = idx;
}

/* ════════════════════════════════════════════════════════════════════
   MENU KEYBOARD
   ════════════════════════════════════════════════════════════════════ */
function initMenuKeyboard() {
  document.addEventListener('keydown', e => {
    if (S.contentVisible || S.transitioning) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setMenuActive((S.menuActiveIdx - 1 + EPISODES.length) % EPISODES.length);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setMenuActive((S.menuActiveIdx + 1) % EPISODES.length);
        break;
      case 'Enter':
        e.preventDefault();
        goToEpisode(EPISODES[S.menuActiveIdx].id);
        break;
    }
  });
}

/* ════════════════════════════════════════════════════════════════════
   GO TO EPISODE — master transition
   ════════════════════════════════════════════════════════════════════ */
function goToEpisode(id) {
  if (S.transitioning) return;
  S.transitioning = true;

  const ep = EPISODES.find(e => e.id === id);
  if (!ep) { S.transitioning = false; return; }

  // Phase 1: slash covers
  slashIn(() => {

    // Determine target scroll position
    const targetSection = document.getElementById(id);

    // Show content, hide menu
    const menu    = document.getElementById('menu-screen');
    const content = document.getElementById('portfolio');
    const cnav    = document.getElementById('content-nav');

    if (menu) {
      menu.classList.remove('is-active');
    }

    if (content) {
      content.classList.add('is-visible');
      content.removeAttribute('aria-hidden');
    }

    if (cnav) cnav.classList.add('is-visible');

    S.contentVisible = true;

    // Scroll instantly to target section
    if (targetSection) {
      const offset = targetSection.getBoundingClientRect().top + window.scrollY - 52;
      window.scrollTo({ top: Math.max(0, offset), behavior: 'instant' });
    }

    // Set correct cnav active
    setCnavActive(id);

    // Phase 2: title card fires over the slash reveal
    showTitleCard(ep);

    // Phase 3: slash reveals
    slashOut(() => {
      S.transitioning = false;

      // Fire hero entrance if going to about/top
      if (id === 'about') {
        fireHeroEntrance();
      }

      // Init all scroll-based animations now content is live
      initScrollAnimations();
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   RETURN TO MENU
   ════════════════════════════════════════════════════════════════════ */
function returnToMenu() {
  if (S.transitioning) return;
  S.transitioning = true;

  slashIn(() => {
    const menu    = document.getElementById('menu-screen');
    const content = document.getElementById('portfolio');
    const cnav    = document.getElementById('content-nav');

    // Scroll to top before hiding
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (content) {
      content.classList.remove('is-visible');
      content.setAttribute('aria-hidden', 'true');
    }
    if (cnav) cnav.classList.remove('is-visible');
    if (menu) menu.classList.add('is-active');

    S.contentVisible = false;

    // Reset hero canvas for next entry
    const canvas = document.querySelector('.hero-canvas');
    if (canvas) canvas.classList.remove('is-revealed');

    // Reset ink reveals
    document.querySelectorAll('[data-ink]').forEach(el => {
      el.classList.remove('inked');
    });
    const identity = document.querySelector('.hero-identity');
    if (identity) identity.classList.remove('inked');
    const kanji = document.querySelector('.hero-kanji');
    if (kanji) kanji.classList.remove('is-revealed');

    slashOut(() => {
      S.transitioning = false;
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   CONTENT NAV
   ════════════════════════════════════════════════════════════════════ */
function initContentNav() {
  const back    = document.getElementById('cnav-back');
  const endBack = document.getElementById('end-card-back');

  if (back)    back.addEventListener('click', returnToMenu);
  if (endBack) endBack.addEventListener('click', returnToMenu);

  // EP nav buttons — scroll to section
  document.querySelectorAll('.cnav-ep').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      if (!id) return;

      if (!S.contentVisible) {
        goToEpisode(id);
        return;
      }

      const section = document.getElementById(id);
      if (!section) return;

      const offset = section.getBoundingClientRect().top + window.scrollY - 52;
      window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
      setCnavActive(id);
    });
  });

  // Track active section on scroll
  initScrollTracking();
}

function setCnavActive(id) {
  document.querySelectorAll('.cnav-ep').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.target === id);
  });
}

/* ════════════════════════════════════════════════════════════════════
   SCROLL TRACKING — update cnav active state
   ════════════════════════════════════════════════════════════════════ */
function initScrollTracking() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setCnavActive(entry.target.id);
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════════════════════════════
   SLASH TRANSITION
   ════════════════════════════════════════════════════════════════════ */
function slashIn(cb) {
  const overlay = document.getElementById('slash-overlay');
  if (!overlay) { setTimeout(cb, 50); return; }

  overlay.classList.remove('slash-out');
  overlay.classList.add('slash-in');
  setTimeout(cb, 260);
}

function slashOut(cb) {
  const overlay = document.getElementById('slash-overlay');
  if (!overlay) { setTimeout(cb, 50); return; }

  overlay.classList.remove('slash-in');
  overlay.classList.add('slash-out');
  setTimeout(() => {
    overlay.classList.remove('slash-out');
    if (cb) cb();
  }, 300);
}

/* ════════════════════════════════════════════════════════════════════
   TITLE CARD
   ════════════════════════════════════════════════════════════════════ */
function showTitleCard(ep) {
  const card  = document.getElementById('ep-titlecard');
  const num   = document.getElementById('tc-num');
  const title = document.getElementById('tc-title');
  const sub   = document.getElementById('tc-sub');

  if (!card) return;

  if (num)   num.textContent   = ep.num;
  if (title) title.textContent = ep.title;
  if (sub)   sub.textContent   = ep.sub;

  card.classList.remove('show');
  void card.offsetWidth; // force reflow to restart animation
  card.classList.add('show');

  setTimeout(() => card.classList.remove('show'), 1900);
}

/* ════════════════════════════════════════════════════════════════════
   HERO ENTRANCE — canvas slides in, ink reveals fire
   ════════════════════════════════════════════════════════════════════ */
function fireHeroEntrance() {
  const canvas   = document.querySelector('.hero-canvas');
  const identity = document.querySelector('.hero-identity');
  const kanji    = document.querySelector('.hero-kanji');
  const inkEls   = document.querySelectorAll('[data-ink]');
  const prompt   = document.querySelector('.hero-scroll-prompt');

  // Canvas slides in from right
  if (canvas) {
    setTimeout(() => canvas.classList.add('is-revealed'), 50);
  }

  // Kanji ghost fades in
  if (kanji) {
    setTimeout(() => kanji.classList.add('is-revealed'), 200);
  }

  // Ink reveals stagger
  if (identity) {
    setTimeout(() => identity.classList.add('inked'), 150);
  }

  inkEls.forEach(el => {
    const delay = parseInt(el.dataset.inkDelay || 0) * 200;
    setTimeout(() => el.classList.add('inked'), 150 + delay);
  });
}

/* ════════════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS — init once when content first shown
   ════════════════════════════════════════════════════════════════════ */
let scrollAnimsInited = false;

function initScrollAnimations() {
  if (scrollAnimsInited) return;
  scrollAnimsInited = true;

  initRevealObserver();
  initSkillBars();
  initParallaxBreaks();
}

/* ════════════════════════════════════════════════════════════════════
   SCROLL REVEALS
   ════════════════════════════════════════════════════════════════════ */
function initRevealObserver() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  S.revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(el.dataset.delay || 0) * 1000;
      setTimeout(() => el.classList.add('is-revealed'), delay);
      S.revealObserver.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => S.revealObserver.observe(el));
}

/* ════════════════════════════════════════════════════════════════════
   SKILL BARS
   ════════════════════════════════════════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.sr-fill');
  if (!fills.length) return;

  S.skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      const pct  = parseInt(fill.dataset.pct, 10) || 0;
      // Double rAF to ensure CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = pct + '%';
        });
      });
      S.skillObserver.unobserve(fill);
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => {
    fill.style.width = '0%';
    S.skillObserver.observe(fill);
  });
}

/* ════════════════════════════════════════════════════════════════════
   PARALLAX SCENE BREAKS
   ════════════════════════════════════════════════════════════════════ */
function initParallaxBreaks() {
  const breaks = document.querySelectorAll('.scene-break');
  if (!breaks.length) return;

  const onScroll = () => {
    breaks.forEach(br => {
      const img  = br.querySelector('.sb-img');
      if (!img) return;
      const rect = br.getBoundingClientRect();
      const vh   = window.innerHeight;
      // Only process when visible
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (vh - rect.top) / (vh + rect.height);
      const offset   = (progress - 0.5) * 80;
      img.style.transform = `translateY(${offset}px) scale(1.15)`;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once immediately
}

/* ════════════════════════════════════════════════════════════════════
   PROJECT FILTER
   ════════════════════════════════════════════════════════════════════ */
function initProjectFilter() {
  const btns  = document.querySelectorAll('#proj-filters .pf');
  const hero  = document.querySelector('.proj-hero');
  const cards = document.querySelectorAll('.proj-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const f = btn.dataset.f;

      // Handle hero card
      if (hero) {
        const tags = (hero.dataset.t || '').toLowerCase();
        const show = f === 'all' || tags.includes(f);
        hero.style.display = show ? '' : 'none';
      }

      // Handle grid cards
      cards.forEach((card, i) => {
        const tags = (card.dataset.t || '').toLowerCase();
        const show = f === 'all' || tags.includes(f);

        if (show) {
          card.classList.remove('hidden');
          card.style.opacity    = '0';
          card.style.transform  = 'translateY(10px)';
          card.style.transition = 'none';
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.transition = 'opacity .3s ease, transform .3s ease';
              card.style.opacity    = '1';
              card.style.transform  = 'translateY(0)';
            }, i * 40);
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}