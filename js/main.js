/* ════════════════════════════════════════════════════════════
   main.js — Cinematic interactions & animation orchestration
   Lenis · GSAP ScrollTrigger · Cursor · Reveal · Skills
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
   ══════════════════════════════════════════ */
const SmoothScroll = (() => {
  let lenis = null;

  const init = () => {
    // Only initialise if Lenis is available
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Sync GSAP ScrollTrigger with Lenis
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback: standard RAF
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  };

  // Expose for smooth-scroll anchor links
  const scrollTo = (target, offset = -80) => {
    if (lenis) {
      lenis.scrollTo(target, { offset });
    } else {
      const el = typeof target === 'string' ? $(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return { init, scrollTo };
})();


/* ══════════════════════════════════════════
   LOADER
   ══════════════════════════════════════════ */
const Loader = (() => {
  const el  = $('#loader');
  const bar = $('#ld-bar');
  const pct = $('#ld-pct');
  const btn = $('#ld-enter');

  let started = false;
  let prog    = 0;

  // Simulate asset loading progress
  const tick = () => {
    if (prog >= 100) return;
    const step = Math.random() * 2.8 + 0.5;
    prog = Math.min(100, prog + step);

    if (bar) bar.style.width = prog + '%';
    if (pct) pct.textContent = Math.floor(prog) + '%';

    // Slow down near end for dramatic effect
    const delay = prog > 85 ? 80 : 28;
    setTimeout(() => requestAnimationFrame(tick), delay);
  };

  const enter = () => {
    if (started) return;
    started = true;

    if (el) {
      el.classList.add('out');
      el.addEventListener('transitionend', () => {
        el.style.display = 'none';
        Main.init();
      }, { once: true });
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

    // Allow pressing Enter / Space anywhere on the page to enter
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
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  let mx = -200, my = -200;
  let tx = -200, ty = -200;

  const onMove = e => { mx = e.clientX; my = e.clientY; };

  const loop = () => {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    if (dot)  dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (ring) ring.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };

  const addHoverScaling = () => {
    $$('a, button, [role="button"], .proj-item, .repo-card, .contact-link').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot?.classList.add('hov');
        ring?.classList.add('hov');
      });
      el.addEventListener('mouseleave', () => {
        dot?.classList.remove('hov');
        ring?.classList.remove('hov');
      });
    });
  };

  const init = () => {
    if (window.matchMedia('(hover: none)').matches) return;
    document.addEventListener('mousemove', onMove, { passive: true });
    loop();
    setTimeout(addHoverScaling, 600);
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
        nav?.classList.toggle('scrolled', y > 20);

        if (y > lastY + 12 && y > 120) {
          nav?.classList.add('hidden');
        } else if (y < lastY - 12) {
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

  const initActiveHighlight = () => {
    const sections = $$('section[id]');
    const links    = $$('.nav-links a[href^="#"]');

    const setActive = () => {
      const scrollY = window.scrollY + 140;
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

  const init = () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    burger?.addEventListener('click', toggleMenu);
    $$('.mm-link').forEach(a => a.addEventListener('click', closeMenu));

    // Smooth scroll anchor links
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = $(href);
        if (target) {
          e.preventDefault();
          closeMenu();
          SmoothScroll.scrollTo(href);
        }
      });
    });

    initActiveHighlight();
  };

  return { init };
})();


/* ══════════════════════════════════════════
   GSAP SCROLL REVEAL
   ══════════════════════════════════════════ */
const Reveal = (() => {
  const init = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: immediately show all revealed elements
      $$('[data-gsap-reveal], [data-gsap-proj]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // General reveal elements
    $$('[data-gsap-reveal]').forEach(el => {
      const delay = parseFloat(el.dataset.delay || '0');
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    });

    // Project items — staggered within their section
    const projItems = $$('[data-gsap-proj]');
    if (projItems.length) {
      projItems.forEach((item, i) => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: i * 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            once: true,
          },
        });
      });
    }
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CINEMATIC PARALLAX — multi-layer depth
   ══════════════════════════════════════════ */
const Parallax = (() => {
  const init = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Hero panel subtle upward drift
    const heroPanel = $('#hero-img-panel');
    if (heroPanel) {
      gsap.to(heroPanel, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    // Contact landscape band drift
    const landscape = $('.contact-landscape-band');
    if (landscape) {
      gsap.to(landscape, {
        y: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-contact',
          start: 'top bottom',
          end: 'top top',
          scrub: 2,
        },
      });
    }

    // Section title horizontal scrub — very subtle
    $$('.section-title').forEach((title, i) => {
      const dir = i % 2 === 0 ? -12 : 12;
      gsap.fromTo(title,
        { x: 0 },
        {
          x: dir,
          ease: 'none',
          scrollTrigger: {
            trigger: title,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2.5,
          },
        }
      );
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   SKILL BARS — animated on scroll entry
   ══════════════════════════════════════════ */
const Skills = (() => {
  let triggered = false;

  const animate = () => {
    if (triggered) return;
    triggered = true;

    $$('.sk-fill').forEach((bar, i) => {
      const pct = bar.dataset.pct || '0';
      setTimeout(() => { bar.style.width = pct + '%'; }, i * 75);
    });
  };

  const init = () => {
    const section = $('#stack');
    if (!section) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { animate(); observer.disconnect(); }
      }, { threshold: 0.15 });
      observer.observe(section);
    } else {
      animate();
    }
  };

  return { init };
})();


/* ══════════════════════════════════════════
   PROJECT FILTER
   ══════════════════════════════════════════ */
const Projects = (() => {
  const init = () => {
    const filters = $$('#proj-filters .pf');
    const items   = $$('#proj-grid .proj-item');

    if (!filters.length || !items.length) return;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.f;

        items.forEach((item, i) => {
          const tags = item.dataset.t || '';
          const show = f === 'all' || tags.split(',').some(t => t.trim() === f);

          setTimeout(() => {
            item.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(0.16,1,0.3,1)';
            if (show) {
              item.style.opacity   = '1';
              item.style.transform = 'translateX(0)';
              item.style.pointerEvents = '';
            } else {
              item.style.opacity   = '0.1';
              item.style.transform = 'translateX(6px)';
              item.style.pointerEvents = 'none';
            }
          }, i * 40);
        });
      });
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MAGNETIC BUTTONS — subtle pull-toward
   ══════════════════════════════════════════ */
const Magnetic = (() => {
  const init = () => {
    if (window.matchMedia('(hover: none)').matches) return;

    $$('.btn-primary, .nav-cta, .ld-enter').forEach(btn => {
      let resetTimer;

      btn.addEventListener('mousemove', e => {
        clearTimeout(resetTimer);
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.22;
        const dy = (e.clientY - cy) * 0.22;
        btn.style.transition = 'transform .2s ease';
        btn.style.transform  = `translate(${dx}px,${dy}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform  = 'translate(0,0)';
        resetTimer = setTimeout(() => { btn.style.transition = ''; }, 520);
      });
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CINEMATIC INK LINE REVEALS
   Horizontal border lines slice in on scroll
   ══════════════════════════════════════════ */
const InkLines = (() => {
  const init = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Eyebrow rules slice in from left
    $$('.eyebrow-rule').forEach(rule => {
      gsap.from(rule, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: rule,
          start: 'top 92%',
          once: true,
        },
      });
    });

    // Credential grid reveal — stagger items
    const credItems = $$('.credential-item');
    if (credItems.length) {
      gsap.from(credItems, {
        y: 20,
        opacity: 0,
        duration: .9,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.credential-grid',
          start: 'top 88%',
          once: true,
        },
      });
    }

    // About tags — stagger pop-in
    const tags = $$('.about-tags .tag');
    if (tags.length) {
      gsap.from(tags, {
        y: 12,
        opacity: 0,
        duration: .7,
        stagger: 0.04,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.about-tags',
          start: 'top 90%',
          once: true,
        },
      });
    }
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MARQUEE — pause on hover
   ══════════════════════════════════════════ */
const Marquee = (() => {
  const init = () => {
    const strip = $('.marquee-strip');
    const track = $('.marquee-track');
    if (!strip || !track) return;

    strip.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    strip.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   GSAP HERO SLASH ENTRANCE
   Crimson slash/line reveals slicing in
   ══════════════════════════════════════════ */
const HeroEntrance = (() => {
  const init = () => {
    if (typeof gsap === 'undefined') return;

    // After loader exits, the GSAP hero animations are already driven by CSS.
    // This module wires up ScrollTrigger for any post-hero elements that
    // need slicing-in line treatments.

    // Horizontal rule under section eyebrows — already handled in InkLines.
    // Nothing additional needed at hero level (CSS keyframes handle loader/entry).
  };

  return { init };
})();


/* ══════════════════════════════════════════
   CONTACT LINKS — hover line wipe
   ══════════════════════════════════════════ */
const ContactInteractions = (() => {
  const init = () => {
    $$('.contact-link').forEach(link => {
      const arrow = link.querySelector('.cl-arrow');
      if (arrow) {
        link.addEventListener('mouseenter', () => {
          if (typeof gsap !== 'undefined') {
            gsap.to(arrow, { x: 6, duration: .3, ease: 'expo.out' });
          }
        });
        link.addEventListener('mouseleave', () => {
          if (typeof gsap !== 'undefined') {
            gsap.to(arrow, { x: 0, duration: .4, ease: 'expo.out' });
          }
        });
      }
    });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   REPO CARD HOVER — GSAP enhanced
   ══════════════════════════════════════════ */
const RepoCards = (() => {
  const enhanceCards = () => {
    if (typeof gsap === 'undefined') return;

    $$('.repo-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -3, duration: .3, ease: 'expo.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: .4, ease: 'expo.out' });
      });
    });
  };

  // Called after GitHub cards are rendered
  const init = () => {
    // MutationObserver watches for new cards being added
    const grid = $('#gh-grid');
    if (!grid) return;

    const observer = new MutationObserver(() => { enhanceCards(); });
    observer.observe(grid, { childList: true });
  };

  return { init };
})();


/* ══════════════════════════════════════════
   MAIN — orchestrates all modules after loader
   ══════════════════════════════════════════ */
const Main = {
  init() {
    SmoothScroll.init();
    Nav.init();
    Reveal.init();
    Skills.init();
    Projects.init();
    Parallax.init();
    Magnetic.init();
    Marquee.init();
    InkLines.init();
    HeroEntrance.init();
    ContactInteractions.init();
    RepoCards.init();
    // GitHub module self-initialises via github.js
  }
};


/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  Cursor.init();
  Loader.init();
});