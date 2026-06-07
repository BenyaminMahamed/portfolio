/**
 * SAMURAI CHAMPLOO PORTFOLIO — MAIN.JS
 * Benyamin Mahamed · 2026
 *
 * ARCHITECTURE: Scene-switcher. No page scroll between episodes.
 * Each episode is a fixed full-viewport scene, hidden until selected.
 *
 * FLOW:
 * 1. Load → menu visible, all scenes hidden
 * 2. Select episode → slash transition → scene activates
 * 3. Content within scenes scrolls internally via .scene-inner--scroll
 * 4. continue-btn / cnav-ep → transition to next scene
 * 5. cnav-back → return to menu
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
  inContent:     false,
  activeScene:   null,   // current scene id string
  menuActiveIdx: 0,      // keyboard nav index on menu
  transitioning: false,  // lock during slash animation
  skillsFired:   false,  // skill bars fire once
};

/* ─── DOM CACHE ──────────────────────────────────────────────────────────────── */
const DOM = {};

/* ─── INIT ───────────────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  DOM.menu         = document.getElementById('menu-screen');
  DOM.mainContent  = document.getElementById('main-content');
  DOM.contentNav   = document.getElementById('content-nav');
  DOM.cnav_back    = document.getElementById('cnav-back');
  DOM.slashOverlay = document.getElementById('slash-overlay');
  DOM.titleCard    = document.getElementById('ep-titlecard');
  DOM.tc_num       = document.getElementById('tc-ep-num');
  DOM.tc_title     = document.getElementById('tc-ep-title');
  DOM.tc_sub       = document.getElementById('tc-ep-sub');
  DOM.menuItems    = Array.from(document.querySelectorAll('.episode-item'));
  DOM.cnavEps      = Array.from(document.querySelectorAll('.cnav-ep'));
  DOM.scenes       = Array.from(document.querySelectorAll('.scene'));
  DOM.endReturn    = document.getElementById('end-card-return');
  DOM.menuTime     = document.getElementById('menu-time');

  initCursor();
  initMenuClock();
  initMenuItems();
  initMenuKeyboard();
  initContinueButtons();
  initContentNav();
  initProjectFilter();

  // Set first menu item active
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

  const HOVER = 'a, button, .episode-item, .pf, .af, .atag, .plink, .clink, .cnav-ep, .continue-btn, .ghost-btn, .repo-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER)) body.classList.add('cursor-active');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER)) body.classList.remove('cursor-active');
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = ring.style.opacity = '1';
  });
}

const body = document.body;

/* ════════════════════════════════════════════════════════════════════
   MENU CLOCK
   ════════════════════════════════════════════════════════════════════ */
function initMenuClock() {
  if (!DOM.menuTime) return;
  const tick = () => {
    const now = new Date();
    DOM.menuTime.textContent =
      String(now.getHours()).padStart(2,'0') + ':' +
      String(now.getMinutes()).padStart(2,'0');
  };
  tick();
  setInterval(tick, 30000);
}

/* ════════════════════════════════════════════════════════════════════
   MENU ITEMS
   ════════════════════════════════════════════════════════════════════ */
function initMenuItems() {
  DOM.menuItems.forEach((item, i) => {
    item.addEventListener('mouseenter', () => setMenuActive(i));
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      if (target) goToEpisode(target);
    });
  });
}

function setMenuActive(idx) {
  DOM.menuItems.forEach((item, i) => item.classList.toggle('active', i === idx));
  S.menuActiveIdx = idx;
}

/* ════════════════════════════════════════════════════════════════════
   MENU KEYBOARD
   ════════════════════════════════════════════════════════════════════ */
function initMenuKeyboard() {
  document.addEventListener('keydown', e => {
    if (S.inContent || S.transitioning) return;

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
      case 'Escape':
        if (S.inContent) returnToMenu();
        break;
    }
  });
}

/* ════════════════════════════════════════════════════════════════════
   CONTINUE BUTTONS (inside scenes)
   ════════════════════════════════════════════════════════════════════ */
function initContinueButtons() {
  document.querySelectorAll('.continue-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target) goToEpisode(target);
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   CONTENT NAV
   ════════════════════════════════════════════════════════════════════ */
function initContentNav() {
  // Back button
  if (DOM.cnav_back) {
    DOM.cnav_back.addEventListener('click', returnToMenu);
  }

  // End card return
  if (DOM.endReturn) {
    DOM.endReturn.addEventListener('click', returnToMenu);
  }

  // EP buttons in nav
  DOM.cnavEps.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target && target !== S.activeScene) goToEpisode(target);
    });
  });
}

function setCnavActive(id) {
  DOM.cnavEps.forEach(btn => btn.classList.toggle('active', btn.dataset.target === id));
}

/* ════════════════════════════════════════════════════════════════════
   GO TO EPISODE — main transition controller
   ════════════════════════════════════════════════════════════════════ */
function goToEpisode(id) {
  if (S.transitioning) return;
  if (S.inContent && id === S.activeScene) return;

  S.transitioning = true;

  const ep = EPISODES.find(e => e.id === id);
  if (!ep) { S.transitioning = false; return; }

  const fromMenu = !S.inContent;

  // Phase 1: slash covers screen
  slashIn(() => {
    // Phase 2: swap scenes under the cover
    if (fromMenu) {
      // Hide menu, show content wrapper
      DOM.menu.classList.remove('screen-active');
      DOM.mainContent.style.display = 'block';
      DOM.contentNav.classList.add('visible');
      S.inContent = true;
    }

    // Deactivate all scenes
    DOM.scenes.forEach(scene => scene.classList.remove('scene-active'));

    // Activate target scene
    const targetScene = document.getElementById('scene-' + id);
    if (targetScene) {
      targetScene.classList.add('scene-active');
      // Reset internal scroll to top
      const scrollInner = targetScene.querySelector('.scene-inner--scroll');
      if (scrollInner) scrollInner.scrollTop = 0;
    }

    S.activeScene = id;
    setCnavActive(id);

    // Show title card (layered above slash reveal)
    showTitleCard(ep);

    // Phase 3: slash reveals new scene
    slashOut(() => {
      S.transitioning = false;

      // Fire scene entry effects
      onSceneEnter(id);
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
    // Deactivate all scenes
    DOM.scenes.forEach(scene => scene.classList.remove('scene-active'));

    // Hide content, show menu
    DOM.mainContent.style.display = 'none';
    DOM.contentNav.classList.remove('visible');
    DOM.menu.classList.add('screen-active');

    S.inContent   = false;
    S.activeScene = null;

    slashOut(() => {
      S.transitioning = false;
    });
  });
}

/* ════════════════════════════════════════════════════════════════════
   SLASH TRANSITION
   ════════════════════════════════════════════════════════════════════ */
function slashIn(cb) {
  if (!DOM.slashOverlay) { cb(); return; }

  DOM.slashOverlay.classList.remove('slash-out');
  DOM.slashOverlay.classList.add('slash-in');

  // Cover takes ~220ms total (panel-a: 180ms + panel-b: 40ms offset + 180ms)
  setTimeout(cb, 240);
}

function slashOut(cb) {
  if (!DOM.slashOverlay) { cb(); return; }

  DOM.slashOverlay.classList.remove('slash-in');
  DOM.slashOverlay.classList.add('slash-out');

  setTimeout(() => {
    DOM.slashOverlay.classList.remove('slash-out');
    cb();
  }, 280);
}

/* ════════════════════════════════════════════════════════════════════
   EPISODE TITLE CARD
   ════════════════════════════════════════════════════════════════════ */
function showTitleCard(ep) {
  if (!DOM.titleCard) return;

  if (DOM.tc_num)   DOM.tc_num.textContent   = ep.num;
  if (DOM.tc_title) DOM.tc_title.textContent = ep.title;
  if (DOM.tc_sub)   DOM.tc_sub.textContent   = ep.sub;

  // Remove then re-add to restart animation
  DOM.titleCard.classList.remove('show');
  void DOM.titleCard.offsetWidth; // force reflow
  DOM.titleCard.classList.add('show');

  setTimeout(() => DOM.titleCard.classList.remove('show'), 1900);
}

/* ════════════════════════════════════════════════════════════════════
   SCENE ENTRY EFFECTS — fires when a scene becomes active
   ════════════════════════════════════════════════════════════════════ */
function onSceneEnter(id) {
  // Reveal animations for the active scene
  const scene = document.getElementById('scene-' + id);
  if (!scene) return;

  // Trigger data-reveal elements in this scene
  const revealEls = scene.querySelectorAll('[data-reveal]');
  revealEls.forEach(el => el.classList.remove('revealed'));

  // Stagger reveals
  revealEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 80 + i * 60);
  });

  // Skill bars — fire once when stack scene entered
  if (id === 'stack' && !S.skillsFired) {
    S.skillsFired = true;
    setTimeout(() => fireSkillBars(scene), 400);
  }

  // Re-fire skill bars each time stack is visited
  if (id === 'stack') {
    setTimeout(() => fireSkillBars(scene), 400);
  }
}

/* ════════════════════════════════════════════════════════════════════
   SKILL BARS
   ════════════════════════════════════════════════════════════════════ */
function fireSkillBars(scene) {
  scene.querySelectorAll('.ski-fill').forEach(fill => {
    const pct = parseInt(fill.dataset.pct, 10) || 0;
    fill.style.width = '0%';
    // Small delay so CSS transition fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = pct + '%';
      });
    });
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
      cards.forEach((card, i) => {
        const tags = (card.dataset.t || '').toLowerCase();
        const show = f === 'all' || tags.includes(f);

        if (show) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 35);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}