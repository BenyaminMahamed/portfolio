// src/components/Core.jsx
// Kinetic Minimalist — shell components: Reveal, SideNav, MobileNav, Hero, Marquee.
import { useEffect, useRef, useState } from 'react'
import { NAV, LINKS } from '../data/content'

/* ── Reveal — one fast slide on scroll, no lazy fades ───────── */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVis(true); obs.disconnect() }
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`reveal ${vis ? 'in ' : ''}${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ── Accent square ──────────────────────────────────────────── */
export const Sq = ({ c = 'var(--yellow)' }) => (
  <span
    aria-hidden="true"
    style={{ width: 12, height: 12, background: c, display: 'inline-block', flex: 'none' }}
  />
)

/* ── Side rail nav (desktop) — with scroll-spy ──────────────── */
export function SideNav() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = NAV.map(n => document.getElementById(n.href.slice(1))).filter(Boolean)
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -55% 0px' }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <header className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center justify-between"
      style={{ width: 64, background: 'var(--paper)', borderRight: '3px solid var(--ink)' }}>
      <a href="#top" className="disp flex items-center justify-center w-full"
        style={{ height: 64, fontSize: '1.15rem', borderBottom: '3px solid var(--ink)', color: 'var(--ink)', textDecoration: 'none' }}
        aria-label="Back to top">
        BM<span style={{ color: 'var(--crimson)' }}>.</span>
      </a>
      <nav className="vert flex items-center gap-1" aria-label="Primary">
        {NAV.map(n => (
          <a key={n.href} href={n.href} className={`navlink ${active === n.href.slice(1) ? 'active' : ''}`}>
            {n.label}
          </a>
        ))}
      </nav>
      <div className="vert mono flex items-center gap-3 pb-5"
        style={{ fontSize: '.6rem', color: 'var(--crimson)', fontWeight: 600 }}>
        <Sq />
        <span>Open to work — 2026</span>
      </div>
    </header>
  )
}

/* ── Top bar + full-screen menu (mobile) ────────────────────── */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{ height: 64, background: 'var(--paper)', borderBottom: '3px solid var(--ink)' }}>
        <a href="#top" className="disp" style={{ fontSize: '1.2rem', color: 'var(--ink)', textDecoration: 'none' }}>
          BM<span style={{ color: 'var(--crimson)' }}>.</span>
        </a>
        <button className="btn btn-ghost" style={{ minHeight: 48, padding: '0 1rem' }}
          onClick={() => setOpen(true)} aria-expanded={open} aria-label="Open menu">
          Menu
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--ink)' }}
          role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between px-4" style={{ height: 64, borderBottom: '3px solid var(--paper)' }}>
            <span className="disp" style={{ fontSize: '1.2rem', color: 'var(--paper)' }}>
              BM<span style={{ color: 'var(--yellow)' }}>.</span>
            </span>
            <button className="flex items-center justify-center"
              style={{
                width: 48, height: 48, border: '3px solid var(--yellow)', color: 'var(--yellow)',
                background: 'transparent', fontFamily: 'var(--mono)', fontSize: '1rem', cursor: 'pointer',
              }}
              onClick={() => setOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <nav className="flex flex-col justify-center flex-1 px-6 gap-2" aria-label="Primary">
            {NAV.map((n, i) => (
              <a key={n.href} href={n.href} className="mm-link"
                style={{ animationDelay: `${60 + i * 55}ms` }} onClick={() => setOpen(false)}>
                {n.label}
              </a>
            ))}
          </nav>
          <a href={LINKS.email} className="px-6 pb-8 mono"
            style={{ fontSize: '.7rem', color: 'var(--yellow)', textDecoration: 'none' }}>
            {LINKS.email.replace('mailto:', '')}
          </a>
        </div>
      )}
    </>
  )
}
/* ── Hero ───────────────────────────────────────────────────── */
export function Hero() {
  return (
    <section
      id="top"
      className="relative flex flex-col justify-center overflow-hidden px-5 md:px-14"
      style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 88 }}
    >
      {/* vertical print-tone rail, desktop only */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-0 bottom-0 right-0 halftone"
        style={{ width: 104, borderLeft: '3px solid var(--ink)', opacity: 0.28 }}
      />
      <div
        aria-hidden="true"
        className="hidden lg:flex vert absolute top-0 right-0 items-center gap-4 mono"
        style={{
          height: '100%', width: 104, justifyContent: 'center', fontSize: '.62rem',
          fontWeight: 600, color: 'var(--crimson)', letterSpacing: '.4em',
        }}
      >
        Portfolio — London — 2026
      </div>

      <div style={{ maxWidth: 1060 }}>
        <Reveal>
          <p className="mono flex items-center gap-3" style={{ fontSize: '.72rem', fontWeight: 600 }}>
            <Sq />
            Full-stack / frontend developer — London, UK
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="disp h-hero" style={{ margin: '1.4rem 0 0' }}>
            <span className="block">Benyamin</span>
            <span className="inline-block b3 shadow-hard px-3 md:px-6 mt-2 md:mt-3 md:ml-24" style={{ background: 'var(--yellow)' }}>
              Mahamed
            </span>
          </h1>
        </Reveal>

        <Reveal delay={130}>
          <p className="mt-10 text-base md:text-lg" style={{ maxWidth: 560, lineHeight: 1.6 }}>
            I build production web platforms and applied-ML tools — Django and PostgreSQL doing
            the heavy lifting, fast JavaScript up front. BSc (Hons) Computer Science, University
            of Westminster.
          </p>
        </Reveal>

        <Reveal delay={190}>
          <div className="flex flex-wrap gap-4 mt-10">
            <a href="#work" className="btn btn-solid">View selected work ↓</a>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub ↗</a>
          </div>
        </Reveal>
      </div>

      <div className="absolute flex items-center gap-3 mono" style={{ bottom: 26, left: 20, fontSize: '.62rem', fontWeight: 600 }}>
        <span className="b3 flex items-center justify-center" style={{ width: 48, height: 48 }} aria-hidden="true">↓</span>
        Scroll
      </div>
      <div aria-hidden="true" className="absolute" style={{ bottom: 26, right: 130, width: 14, height: 14, background: 'var(--crimson)' }} />
    </section>
  )
}

/* ── Diagonal availability marquee ──────────────────────────── */
export function Marquee() {
  const items = Array.from({ length: 8 })
  const row = key => (
    <div className="flex" key={key} aria-hidden="true">
      {items.map((_, i) => (
        <span className="mq-item" key={i}>
          <span className="mq-sq" />
          Open to junior software engineering roles — London, UK
        </span>
      ))}
    </div>
  )
  return (
    <div style={{ margin: '0 -3%', width: '106%' }}>
      <p className="sr-only">Open to junior software engineering roles — London, UK.</p>
      <div className="mq-wrap" aria-hidden="true">
        <div className="mq-track">
          {row('a')}
          {row('b')}
        </div>
      </div>
    </div>
  )
}