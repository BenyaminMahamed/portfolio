/* ════════════════════════════════════════════════════════════
   main.js — Cinematic interactions & animation orchestration
   Loader · Cursor · Reveal · Skills · Projects · Petals · Nav
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ══════════════════════════════════════════
   LOADER
   ══════════════════════════════════════════ */
const Loader = (() => {
  const el    = $('#loader');
  const bar   = $('#ld-bar');
  const status = $('#ld-status');
  const btn   = $('#ld-enter');
  let started = false;

  const messages = [
    { pct: 18,  txt: 'Mounting assets…'     },
    { pct: 42,  txt: 'Loading sakura…'      },
    { pct: 68,  txt: 'Sharpening blade…'    },
    { pct: 88,  txt: 'Preparing portfolio…' },
    { pct: 100, txt: 'Ready.'               },
  ];

  // Simulate progress
  let prog = 0;
  let msgIdx = 0;
  const tick = () => {
    if (prog >= 100) return;
    // Random increments — feels organic
    const step = Math.random() * 3.5 + 0.8;
    prog = Math.min(100, prog + step);
    if (bar) bar.style.width = prog + '%';
    // Update message
    while (msgIdx < messages.length && prog >= messages[msgIdx].pct) {
      if (status) status.textContent = messages[msgIdx].txt;
      msgIdx++;
    }
    requestAnimationFrame(tick);
  };

  const enter = () => {
    if (started) return;
    started = true;
    if (el) {
      el.classList.add('out');
      setTimeout(() => {
        el.style.display = 'none';
        Main.init();
      }, 900);
    } else {
      Main.init();
    }
  };

  const init = () => {
    requestAnimationFrame(tick);
    if (btn) {
      btn.addEventListener('click', enter);
      btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') enter(); });
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !started && el && el.style.display !== 'none') enter();
    });
  };

  return { init, enter };
})();


/* ══════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════ */
const Cursor = (() => {
  const dot   = $('.cursor');
  const trail = $('.cursor-trail');
  let mx = -100, my = -100;
  let tx = -100, ty = -100;
  let rafId;

  const move = e => { mx = e.clientX; my = e.clientY; };

  const loop = () => {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    if (dot)   dot.style.transform   = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (trail) trail.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    rafId = requestAnimationFrame(loop);
  };

  const init = () => {
    if (window.matchMedia('(hover:none)').matches) return;
    document.addEventListener('mousemove', move);
    loop();
  };

  return { init };
})();


/* ══════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════ */
const Nav = (() => {
  const nav    = $('#nav');
  const burger = $('#nav-burger');
  const menu   = $('#mobile-menu');
  let lastY = 0, ticking = false;

  // Hide/show on scroll
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY + 8 && y > 80) {
          nav?.classList.add('hidden');
        } else if (y < lastY - 8) {
          nav?.classList.remove('hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  };

  // Mobile menu
  const toggleMenu = () => {
    const open = burger?.getAttribute('aria-expanded') === 'true';
    burger?.setAttribute('aria-expanded', String(!open));
    menu?.setAttribute('aria-hidden', String(open));
    menu?.classList.toggle('open', !open);
    document.body.style.overflow = open ? '' : 'hidden';
  };

  const closeMenu = () => {
    burger?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-hidden', 'true');
    menu?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const init = () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    burger?.addEventListener('click', toggleMenu);
    $$('.mm-link').forEach(a => a.addEventListener('click', closeMenu));

    // Smooth scroll for all anchor links
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = $(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          closeMenu();
        }
      });
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════ */
const Reveal = (() => {
  let observer;

  const init = () => {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

    $$('[data-reveal]').forEach(el => {
      // Already in viewport on load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   SKILL BARS
   ══════════════════════════════════════════ */
const Skills = (() => {
  let triggered = false;

  const animate = () => {
    if (triggered) return;
    triggered = true;
    $$('.si-fill').forEach((bar, i) => {
      const pct = bar.dataset.pct || '0';
      setTimeout(() => {
        bar.style.width = pct + '%';
      }, i * 60);
    });
  };

  const init = () => {
    const section = $('#skills');
    if (!section) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animate();
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(section);
  };

  return { init };
})();


/* ══════════════════════════════════════════
   PROJECT FILTER
   ══════════════════════════════════════════ */
const Projects = (() => {
  const init = () => {
    const filters = $$('#proj-filters .fb');
    const cards   = $$('#proj-grid .proj-card');

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.f;

        cards.forEach(card => {
          const tags = card.dataset.t || '';
          const show = f === 'all' || tags.includes(f);
          card.style.opacity    = show ? '1' : '0.15';
          card.style.transition = 'opacity .35s ease';
        });
      });
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CANVAS PETAL SYSTEM
   Lightweight falling sakura petals on hero
   ══════════════════════════════════════════ */
const Petals = (() => {
  let canvas, ctx, W, H, petals = [], rafId, active = false;

  const PETAL_COUNT = 22;
  const COLORS = ['#cc5878','#d06888','#e07888','#b84068','#d4607a'];

  class Petal {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x   = Math.random() * W;
      this.y   = randomY ? Math.random() * H : -20;
      this.r   = Math.random() * 5 + 3;
      this.rot = Math.random() * Math.PI * 2;
      this.vx  = (Math.random() - 0.5) * 0.6;
      this.vy  = Math.random() * 0.8 + 0.4;
      this.vr  = (Math.random() - 0.5) * 0.04;
      this.alpha = Math.random() * 0.35 + 0.2;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.phase = Math.random() * Math.PI * 2;
    }

    update(t) {
      this.x   += this.vx + Math.sin(t * 0.001 + this.phase) * 0.3;
      this.y   += this.vy;
      this.rot += this.vr;
      if (this.y > H + 20) this.reset();
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      // Elliptical petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, this.r, this.r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const resize = () => {
    const parent = canvas.parentElement;
    W = canvas.width  = parent.offsetWidth;
    H = canvas.height = parent.offsetHeight;
  };

  const loop = (t) => {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => { p.update(t); p.draw(ctx); });
    rafId = requestAnimationFrame(loop);
  };

  const init = () => {
    canvas = $('#petal-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal());
    active = true;
    requestAnimationFrame(loop);
  };

  const stop = () => {
    active = false;
    cancelAnimationFrame(rafId);
  };

  return { init, stop };
})();


/* ══════════════════════════════════════════
   PARALLAX — subtle depth on about visual
   ══════════════════════════════════════════ */
const Parallax = (() => {
  const items = [];

  const init = () => {
    $$('[data-parallax]').forEach(el => {
      items.push({ el, speed: parseFloat(el.dataset.parallax) || 0.2 });
    });
    if (!items.length) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const onScroll = () => {
    const scrollY = window.scrollY;
    items.forEach(({ el, speed }) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translateY(${center * speed * -0.1}px)`;
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MAIN — init after loader
   ══════════════════════════════════════════ */
const Main = {
  init() {
    Cursor.init();
    Nav.init();
    Reveal.init();
    Skills.init();
    Projects.init();
    Petals.init();
    Parallax.init();
    // GitHub module initialises itself (github.js)
  }
};


/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  Cursor.init(); // cursor active immediately
  Loader.init();
});