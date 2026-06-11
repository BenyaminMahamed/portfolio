import { useEffect, useRef, useState } from 'react'
import { EPISODES } from '../data/content'

/* ── Reveal hook — IntersectionObserver wrapper ─────────────── */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('in'), delay)
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

/* ── Section eyebrow ────────────────────────────────────────── */
export function Eyebrow({ num, title }) {
  return (
    <Reveal className="section-eyebrow">
      <span className="mono">{num} — {title}</span>
      <span className="section-eyebrow-rule" aria-hidden="true" />
    </Reveal>
  )
}

/* ── NAV ────────────────────────────────────────────────────── */
export function Nav() {
  const [active, setActive] = useState('about')

  useEffect(() => {
    const sections = EPISODES
      .map(ep => document.getElementById(ep.id))
      .filter(Boolean)
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-35% 0px -55% 0px' }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#top" className="nav-logo" aria-label="Benyamin Mahamed — home">
          B<em>/</em>M
        </a>
        <nav className="nav-links" aria-label="Sections">
          {EPISODES.map(ep => (
            <a
              key={ep.id}
              href={`#${ep.id}`}
              className={`nav-link mono ${active === ep.id ? 'active' : ''}`}
            >
              {ep.num}
            </a>
          ))}
        </nav>
        <a href="#contact" className="nav-status mono">
          <span className="status-dot" aria-hidden="true" />
          Available now
        </a>
      </div>
    </header>
  )
}

/* ── HERO ───────────────────────────────────────────────────── */
export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" aria-hidden="true" />
            <span className="mono">Software Engineer · London · 2026</span>
          </div>
          <h1 className="hero-title">
            Benyamin Mahamed
            <em>builds production systems.</em>
          </h1>
          <p className="hero-sub">
            BSc Computer Science, University of Westminster. Co-founder and sole
            engineer of <strong>The Blueprint Brief</strong> — a live Django platform
            with 1,000+ users. Backend-first, AI-capable, always deploying.
          </p>
          <div className="hero-ctas">
            <a href="#work" className="btn btn-primary">View the work</a>
            <a href="mailto:benyaminmahamed@gmail.com" className="btn btn-ghost">Email me</a>
          </div>
          <div className="hero-meta">
            <span className="mono"><strong>1,000+</strong>Platform users</span>
            <span className="mono"><strong>~14 FPS</strong>Real-time CV</span>
            <span className="mono"><strong>4+</strong>Live projects</span>
          </div>
        </div>
        <figure className="hero-frame">
          <img
            src="/assets/frames/hero.png"
            alt="Silhouetted swordsman against an orange sunset — Samurai Champloo opening frame"
            fetchpriority="high"
          />
          <figcaption className="hero-frame-label mono">
            Tribute · Samurai Champloo
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ── ABOUT — EP.01 ──────────────────────────────────────────── */
export function About() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <Eyebrow num="EP.01" title="The Wanderer" />
        <Reveal as="h2" className="section-title">
          Engineer. <em>Builder.</em> Architect.
        </Reveal>
        <div className="about-grid">
          <Reveal className="about-panel" delay={80}>
            <img
              src="/assets/frames/scroll.png"
              alt="Aged parchment scroll with calligraphy and graffiti typography"
              loading="lazy"
            />
            <span className="about-panel-kanji" aria-hidden="true">旅人</span>
            <span className="about-panel-label mono">London · 2026</span>
          </Reveal>
          <div>
            <Reveal className="about-copy" delay={120}>
              <p>
                CS graduate from the <strong>University of Westminster</strong>. I
                engineer systems that ship — backend architecture, database design,
                computer vision pipelines, and AI integration, running in production
                rather than sitting in a repo.
              </p>
              <p>
                I co-founded <strong>The Blueprint Brief</strong>, a live editorial
                platform serving over 1,000 registered users, built end-to-end with
                Django and PostgreSQL. My final-year dissertation produced a
                real-time autonomous navigation system running at ~14 FPS on a
                Raspberry Pi 5.
              </p>
            </Reveal>
            <Reveal className="stat-strip" delay={180}>
              <div className="stat-cell"><strong>1,000+</strong><span className="mono">Users</span></div>
              <div className="stat-cell"><strong>7+</strong><span className="mono">Languages</span></div>
              <div className="stat-cell"><strong>4+</strong><span className="mono">Projects</span></div>
              <div className="stat-cell"><strong>BSc</strong><span className="mono">CS Honours</span></div>
            </Reveal>
            <Reveal className="tag-row" delay={220}>
              {['Full-stack development', 'AI / ML', 'Computer vision', 'Embedded systems', 'REST APIs', 'Database architecture'].map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}