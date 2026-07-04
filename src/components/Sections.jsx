// src/components/Sections.jsx
// Kinetic Minimalist — Work grid, Letterbox modal, About, Stack, Contact.
import { useEffect, useRef, useState } from 'react'
import { Reveal, Sq } from './Core'
import { PROJECTS, STACK, FACTS, LINKS } from '../data/content'

/* ── Stat row (shared by panels + modal) ────────────────────── */
function StatRow({ stats, dark }) {
  if (!stats.length) return null
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6">
      {stats.map(s => (
        <div key={s.label}>
          <div className="disp" style={{ fontSize: '1.7rem' }}>{s.val}</div>
          <div className="mono" style={{ fontSize: '.6rem', opacity: dark ? 0.75 : 0.65, fontWeight: 500 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Project panel ──────────────────────────────────────────── */
function Panel({ p, span, delay, onOpen }) {
  return (
    <Reveal delay={delay} className={span}>
      <button className={`panel b3 h-full ${p.dark ? 'panel-dark' : ''}`}
        style={p.dark ? { borderColor: 'var(--ink)' } : undefined}
        onClick={e => onOpen(p, e)} aria-haspopup="dialog">
        <div className="panel-head mono" style={{ fontSize: '.62rem', fontWeight: 600 }}>
          <span>{p.num}</span>
          <span style={{ color: p.dark ? 'var(--yellow)' : 'var(--crimson)' }}>{p.status}</span>
        </div>
        <div className={`flex flex-col flex-1 p-5 md:p-7 ${p.dark ? 'halftone-paper' : ''}`}>
          <h3 className="disp h-panel">{p.title}</h3>
          <p className="mt-4 text-sm md:text-base" style={{ lineHeight: 1.6, maxWidth: 520, opacity: p.dark ? 0.92 : 1 }}>
            {p.desc}
          </p>
          <StatRow stats={p.stats} dark={p.dark} />
          <div className="flex flex-wrap gap-2 mt-6">
            {p.tech.map(t => <span className="badge" key={t}>{t}</span>)}
          </div>
          <div className="mt-auto pt-8">
            <span className="panel-cta mono inline-flex items-center gap-2"
              style={{ fontSize: '.68rem', fontWeight: 600, border: '2px solid currentColor', padding: '.55rem .9rem', minHeight: 40 }}>
              Open case study →
            </span>
          </div>
        </div>
      </button>
    </Reveal>
  )
}

/* ── Work grid — uneven manga panels ────────────────────────── */
export function Work({ onOpen }) {
  const spans = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7']
  return (
    <section id="work" className="px-5 md:px-14 pt-24 pb-8">
      <Reveal>
        <div style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '1.1rem', marginBottom: '2.6rem' }}>
          <p className="mono flex items-center gap-3" style={{ fontSize: '.72rem', fontWeight: 600 }}>
            <Sq c="var(--crimson)" />
            Selected work — read in order
          </p>
          <h2 className="disp h-sec text-right" style={{ marginTop: '.6rem' }}>
            Projects<span style={{ color: 'var(--crimson)' }}>.</span>
          </h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6" style={{ gridAutoRows: '1fr' }}>
        {PROJECTS.map((p, i) => (
          <Panel key={p.id} p={p} span={spans[i]} delay={(i % 2) * 70} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

/* ── Letterbox case-study modal ─────────────────────────────── */
export function Letterbox({ project, onClose }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => setOpen(true))
    const t = setTimeout(() => closeRef.current && closeRef.current.focus(), 260)
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const rows = [
    ['Problem', project.study.problem],
    ['Build', project.study.build],
    ['Result', project.study.result],
  ]

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'lb-open' : ''}`}
      role="dialog" aria-modal="true" aria-labelledby="lb-title">
      <div className="absolute inset-0" style={{ background: 'rgba(20,17,21,.55)' }} onClick={onClose} />
      <div className="lb-bar" style={{ top: 0 }} aria-hidden="true" />
      <div className="lb-bar" style={{ bottom: 0 }} aria-hidden="true" />
      <button ref={closeRef} className="lb-close" onClick={onClose} aria-label="Close case study">✕</button>

      <div className="lb-frame">
        <div className="mx-auto px-5 md:px-10 py-8 md:py-12" style={{ maxWidth: 820 }}>
          <p className="mono flex items-center justify-between"
            style={{ fontSize: '.64rem', fontWeight: 600, color: 'var(--crimson)' }}>
            <span>Case study — {project.num}</span>
            <span>{project.status}</span>
          </p>
          <h3 id="lb-title" className="disp h-modal mt-4"
            style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '1rem' }}>
            {project.title}
          </h3>

          <div className="flex flex-wrap gap-2 mt-5">
            {project.tech.map(t => <span className="badge" key={t}>{t}</span>)}
          </div>

          {rows.map(([h, body]) => (
            <div key={h} className="mt-8">
              <h4 className="mono" style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--crimson)', margin: 0 }}>
                {h}
              </h4>
              <p className="mt-2 text-sm md:text-base" style={{ lineHeight: 1.7, margin: '.5rem 0 0' }}>
                {body}
              </p>
            </div>
          ))}

          {project.stats.length > 0 && (
            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-10 b3 p-5"
              style={{ background: 'var(--indigo)', color: 'var(--paper)' }}>
              {project.stats.map(s => (
                <div key={s.label}>
                  <div className="disp" style={{ fontSize: '2.1rem' }}>{s.val}</div>
                  <div className="mono" style={{ fontSize: '.6rem', opacity: 0.8, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-10 pb-4">
            {project.links.map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer"
                className={`btn ${l.primary ? 'btn-yellow' : 'btn-ghost'}`}>
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── About ──────────────────────────────────────────────────── */
export function About() {
  return (
    <section id="about" className="px-5 md:px-14 pt-24 pb-4">
      <Reveal>
        <p className="mono flex items-center gap-3" style={{ fontSize: '.72rem', fontWeight: 600 }}>
          <Sq />
          About
        </p>
        <h2 className="disp h-sec" style={{ marginTop: '.6rem' }}>
          The short version<span style={{ color: 'var(--crimson)' }}>.</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10">
        <Reveal className="md:col-span-7">
          <p className="text-base md:text-lg" style={{ lineHeight: 1.7, maxWidth: 600 }}>
            Computer science graduate working across the stack — Django, PostgreSQL and REST
            APIs behind the scenes, JavaScript and React in front. Most of my production
            mileage comes from The Blueprint Brief, a live editorial platform I co-founded
            and keep running for 1,000+ users.
          </p>
          <p className="text-base md:text-lg mt-5" style={{ lineHeight: 1.7, maxWidth: 600 }}>
            Currently a Mac Engineer at AGK Tech Solutions while interviewing for junior
            software engineering roles in London. Away from a keyboard: competitive
            basketball, and an ongoing habit of turning box scores into datasets.
          </p>
        </Reveal>
        <Reveal delay={90} className="md:col-span-5">
          <div className="b3 shadow-hard halftone-paper p-6" style={{ background: 'var(--indigo)', color: 'var(--paper)' }}>
            {FACTS.map(([k, v], i) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-3"
                style={{ borderBottom: i < FACTS.length - 1 ? '1px solid rgba(241,237,227,.25)' : 'none' }}>
                <span className="mono" style={{ fontSize: '.62rem', fontWeight: 600, color: 'var(--yellow)' }}>{k}</span>
                <span className="text-sm text-right" style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Stack ──────────────────────────────────────────────────── */
export function Stack() {
  return (
    <section id="stack" className="px-5 md:px-14 pt-24 pb-24">
      <Reveal>
        <p className="mono flex items-center gap-3" style={{ fontSize: '.72rem', fontWeight: 600 }}>
          <Sq c="var(--crimson)" />
          Tech stack
        </p>
        <h2 className="disp h-sec text-right"
          style={{ marginTop: '.6rem', borderBottom: '3px solid var(--ink)', paddingBottom: '1.1rem' }}>
          Tools of the trade<span style={{ color: 'var(--crimson)' }}>.</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {STACK.map((g, gi) => (
          <Reveal key={g.group} delay={gi * 70}>
            <div className="b3 p-5 h-full" style={{ background: 'var(--paper)' }}>
              <h3 className="disp" style={{ fontSize: '1.3rem', borderBottom: '3px solid var(--ink)', paddingBottom: '.6rem' }}>
                {g.group}
              </h3>
              <div className="flex flex-wrap gap-2 mt-5">
                {g.items.map(s => <span className="badge badge-hot" key={s}>{s}</span>)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── Contact + footer ───────────────────────────────────────── */
export function Contact() {
  return (
    <section id="contact" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
      <div className="px-5 md:px-14 pt-24 pb-10">
        <Reveal>
          <p className="mono flex items-center gap-3" style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--yellow)' }}>
            <Sq />
            Contact
          </p>
          <h2 className="disp" style={{ fontSize: 'clamp(3rem,11vw,7.5rem)', marginTop: '.8rem' }}>
            Let&rsquo;s talk<span style={{ color: 'var(--yellow)' }}>.</span>
          </h2>
          <p className="mt-6 text-base md:text-lg" style={{ maxWidth: 480, lineHeight: 1.65, opacity: 0.9 }}>
            Hiring for a junior engineering role, or just want to talk shop? My inbox is open
            and I answer fast.
          </p>
        </Reveal>
        <Reveal delay={90}>
          <div className="flex flex-wrap gap-4 mt-10">
            <a href={LINKS.email} className="btn btn-yellow">Email me</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="btn btn-paper">LinkedIn ↗</a>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="btn btn-paper">GitHub ↗</a>
          </div>
          <a href={LINKS.blueprint} target="_blank" rel="noreferrer" className="mono inline-block mt-8"
            style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--yellow)', textUnderlineOffset: 5 }}>
            Latest shipped work → theblueprintbrief.com
          </a>
        </Reveal>

        <div className="flex items-center justify-between gap-4 mt-20 pt-6 mono"
          style={{ borderTop: '1px solid rgba(241,237,227,.25)', fontSize: '.62rem', fontWeight: 500, opacity: 0.85 }}>
          <span>© 2026 Benyamin Mahamed — London</span>
          <a href="#top" className="flex items-center justify-center b3p"
            style={{ width: 48, height: 48, color: 'var(--paper)', textDecoration: 'none', flex: 'none' }}
            aria-label="Back to top">↑</a>
        </div>
      </div>
    </section>
  )
}