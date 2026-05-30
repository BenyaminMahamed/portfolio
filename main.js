/* ════════════════════════════════════════════════════════════
   main.js — Cinematic interactions & animation orchestration
   Loader · Cursor · Reveal · Skills · Projects · Petals · Nav
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════
   LOADER
   ══════════════════════════════════════════ */
const Loader = (() => {
  const el      = $('#loader');
  const bar     = $('#ld-bar');
  const status  = $('#ld-status');
  const btn     = $('#ld-enter');
  let started   = false;
  let prog      = 0;
  let msgIdx    = 0;

  const messages = [
    { pct: 15,  txt: 'Mounting assets…'      },
    { pct: 38,  txt: 'Loading sakura…'       },
    { pct: 62,  txt: 'Sharpening blade…'     },
    { pct: 84,  txt: 'Preparing portfolio…'  },
    { pct: 100, txt: 'Ready.'                },
  ];

  const tick = () => {
    if (prog >= 100) return;
    const step = Math.random() * 3 + 0.6;
    prog = Math.min(100, prog + step);
    if (bar) bar.style.width = prog + '%';
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
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
      });
    }
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !started) enter();
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════ */
const Cursor = (() => {
  const dot   = $('.cursor');
  const trail = $('.cursor-trail');
  let mx = -200, my = -200;
  let tx = -200, ty = -200;

  const move = e => { mx = e.clientX; my = e.clientY; };

  const loop = () => {
    tx += (mx - tx) * 0.13;
    ty += (my - ty) * 0.13;
    if (dot)   dot.style.transform   = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (trail) trail.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };

  /* Scale cursor on interactive elements */
  const addHoverScaling = () => {
    const targets = $$('a, button, [role="button"], .proj-card, .gh-card');
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot?.classList.add('cursor--hover');
        trail?.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', () => {
        dot?.classList.remove('cursor--hover');
        trail?.classList.remove('cursor--hover');
      });
    });
  };

  const init = () => {
    if (window.matchMedia('(hover:none)').matches) return;
    document.addEventListener('mousemove', move);
    loop();
    /* Delay hover scaling until DOM is fully set up */
    setTimeout(addHoverScaling, 400);
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

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY + 10 && y > 100) {
          nav?.classList.add('hidden');
        } else if (y < lastY - 10) {
          nav?.classList.remove('hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  };

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

    /* Smooth scroll all anchor links */
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

    /* Active nav link highlighting */
    const sections = $$('section[id]');
    const links    = $$('.nav-links a[href^="#"]');

    const setActive = () => {
      const scrollY = window.scrollY + 120;
      sections.forEach(sec => {
        const top    = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        const id     = sec.getAttribute('id');
        if (scrollY >= top && scrollY < bottom) {
          links.forEach(l => {
            l.classList.toggle('nav-active', l.getAttribute('href') === `#${id}`);
          });
        }
      });
    };
    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
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
    }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

    $$('[data-reveal]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
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
      setTimeout(() => { bar.style.width = pct + '%'; }, i * 70);
    });
  };

  const init = () => {
    const section = $('#skills');
    if (!section) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animate(); observer.disconnect(); }
    }, { threshold: 0.18 });
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

        cards.forEach((card, i) => {
          const tags = card.dataset.t || '';
          const show = f === 'all' || tags.includes(f);
          /* Staggered fade */
          setTimeout(() => {
            card.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(0.16,1,0.3,1)';
            card.style.opacity    = show ? '1' : '0.12';
            card.style.transform  = show ? 'translateX(0)' : 'translateX(8px)';
          }, i * 40);
        });
      });
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CANVAS PETAL SYSTEM
   Falling sakura petals over hero illustration
   ══════════════════════════════════════════ */
const Petals = (() => {
  let canvas, ctx, W, H, petals = [], rafId, active = false;

  const COUNT  = 24;
  const COLORS = ['#cc5878','#d06888','#e07888','#b84068','#d4607a','#e890a0'];

  class Petal {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x      = Math.random() * W;
      this.y      = randomY ? Math.random() * H : -16;
      this.r      = Math.random() * 5 + 3;
      this.rx     = this.r;
      this.ry     = this.r * 0.45;
      this.rot    = Math.random() * Math.PI * 2;
      this.vx     = (Math.random() - 0.5) * 0.5;
      this.vy     = Math.random() * 0.7 + 0.35;
      this.vr     = (Math.random() - 0.5) * 0.035;
      this.alpha  = Math.random() * 0.32 + 0.15;
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.phase  = Math.random() * Math.PI * 2;
      this.wobble = Math.random() * 0.008 + 0.003;
    }

    update(t) {
      this.x   += this.vx + Math.sin(t * this.wobble + this.phase) * 0.4;
      this.y   += this.vy;
      this.rot += this.vr;
      /* Slight tumble on ry */
      this.ry = Math.abs(Math.sin(this.rot)) * this.r * 0.5 + 1;
      if (this.y > H + 20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const resize = () => {
    const parent = canvas.parentElement;
    W = canvas.width  = parent.offsetWidth;
    H = canvas.height = parent.offsetHeight;
  };

  const loop = t => {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => { p.update(t); p.draw(); });
    rafId = requestAnimationFrame(loop);
  };

  const init = () => {
    canvas = $('#petal-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < COUNT; i++) petals.push(new Petal());
    active = true;
    requestAnimationFrame(loop);
  };

  return { init };
})();


/* ══════════════════════════════════════════
   PARALLAX — subtle depth on about visual
   ══════════════════════════════════════════ */
const Parallax = (() => {
  const items = [];

  const onScroll = () => {
    const scrollY = window.scrollY;
    items.forEach(({ el, speed }) => {
      const rect   = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translateY(${center * speed * -0.08}px)`;
    });
  };

  const init = () => {
    $$('[data-parallax]').forEach(el => {
      items.push({ el, speed: parseFloat(el.dataset.parallax) || 0.2 });
    });
    if (!items.length) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MAGNETIC BUTTONS — subtle pull-toward effect
   ══════════════════════════════════════════ */
const Magnetic = (() => {
  const init = () => {
    if (window.matchMedia('(hover:none)').matches) return;

    $$('.btn-primary, .nav-cta, .ld-enter').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * 0.25;
        const dy   = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform  = 'translate(0,0)';
        setTimeout(() => { btn.style.transition = ''; }, 500);
      });
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MARQUEE — pause on hover
   ══════════════════════════════════════════ */
const Marquee = (() => {
  const init = () => {
    const strip = $('.marquee-strip');
    const inner = $('.marquee-inner');
    if (!strip || !inner) return;

    strip.addEventListener('mouseenter', () => {
      inner.style.animationPlayState = 'paused';
    });
    strip.addEventListener('mouseleave', () => {
      inner.style.animationPlayState = 'running';
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   SECTION COUNTER — animated number count-up
   ══════════════════════════════════════════ */
const Counter = (() => {
  const countUp = (el, target, duration = 1200) => {
    const start = performance.now();
    const isText = isNaN(parseInt(target));
    if (isText) return; /* Skip non-numeric like "BSc" */

    const num = parseInt(target);
    const suffix = target.replace(/[0-9]/g, '');

    const step = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease out expo */
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * num);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const init = () => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const vals = entry.target.querySelectorAll('.stat-val, .ccs-v');
        vals.forEach(el => {
          const raw = el.textContent.trim();
          countUp(el, raw);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    $$('.about-stats, .cc-stats').forEach(el => observer.observe(el));
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CURSOR TRAIL INK EFFECT on hero
   Subtle ink-spread on mouse move over hero canvas
   ══════════════════════════════════════════ */
const InkTrail = (() => {
  let canvas, ctx, W, H, drops = [];
  let active = false;

  class Drop {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 0;
      this.maxR = Math.random() * 22 + 8;
      this.alpha = 0.12;
      this.growing = true;
    }
    update() {
      if (this.growing) {
        this.r += 1.2;
        if (this.r >= this.maxR) this.growing = false;
      } else {
        this.alpha -= 0.003;
      }
      return this.alpha > 0;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,16,46,1)';
      ctx.fill();
      ctx.restore();
    }
  }

  const loop = () => {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    drops = drops.filter(d => {
      const alive = d.update();
      if (alive) d.draw();
      return alive;
    });
    requestAnimationFrame(loop);
  };

  const init = () => {
    const heroCanvas = document.createElement('canvas');
    heroCanvas.id = 'ink-canvas';
    heroCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;mix-blend-mode:multiply;';
    const heroSection = $('#hero .hero-canvas');
    if (!heroSection) return;
    heroSection.appendChild(heroCanvas);
    canvas = heroCanvas;
    ctx = canvas.getContext('2d');

    const resize = () => {
      W = canvas.width  = heroSection.offsetWidth;
      H = canvas.height = heroSection.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      if (drops.length < 30) {
        drops.push(new Drop(e.clientX - rect.left, e.clientY - rect.top));
      }
    });

    active = true;
    requestAnimationFrame(loop);
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MAIN — orchestrates all modules after loader
   ══════════════════════════════════════════ */
const Main = {
  init() {
    Nav.init();
    Reveal.init();
    Skills.init();
    Projects.init();
    Petals.init();
    Parallax.init();
    Magnetic.init();
    Marquee.init();
    Counter.init();
    InkTrail.init();
    /* GitHub module self-initialises via github.js */
  }
};


/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  Cursor.init();
  Loader.init();
});