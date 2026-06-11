import { useEffect, useRef, useState } from 'react'
import { STAGES } from '../data/content'

/* ── Reveal — bracket-flash frame capture ───────────────────── */
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

/* ── Typed text hook ────────────────────────────────────────── */
function useTyped(lines, { charDelay = 18, lineDelay = 260, start = true } = {}) {
  const [output, setOutput] = useState(() => lines.map(() => ''))
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!start) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setOutput(lines)
      setDone(true)
      return
    }
    let li = 0
    let ci = 0
    let cancelled = false
    const timers = []

    function tick() {
      if (cancelled) return
      if (li >= lines.length) { setDone(true); return }
      ci++
      const snapshot = lines.map((l, i) =>
        i < li ? l : i === li ? l.slice(0, ci) : ''
      )
      setOutput(snapshot)
      if (ci >= lines[li].length) {
        li++; ci = 0
        timers.push(setTimeout(tick, lineDelay))
      } else {
        timers.push(setTimeout(tick, charDelay))
      }
    }
    timers.push(setTimeout(tick, 300))
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [start]) // eslint-disable-line react-hooks/exhaustive-deps

  return [output, done]
}

/* ── Live FPS meter — measures the actual page ──────────────── */
function useFps() {
  const [fps, setFps] = useState(60)
  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf
    const loop = now => {
      frames++
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}

/* ── HUD chrome — fixed corner brackets + telemetry ─────────── */
export function HudChrome() {
  const fps = useFps()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setClock(
        [n.getHours(), n.getMinutes(), n.getSeconds()]
          .map(v => String(v).padStart(2, '0'))
          .join(':')
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-corner hud-tl" />
      <span className="hud-corner hud-tr" />
      <span className="hud-corner hud-bl" />
      <span className="hud-corner hud-br" />
      <div className="hud-top-left mono">
        <span className="rec-dot" /> feed_01 · live
      </div>
      <div className="hud-top-right mono">{fps} fps · {clock}</div>
      <div className="hud-bottom mono">
        <span>sys: benyamin_mahamed</span>
        <span>loc: london_uk</span>
        <span>status: available_now</span>
      </div>
    </div>
  )
}

/* ── NAV ────────────────────────────────────────────────────── */
export function Nav() {
  const [active, setActive] = useState('input')

  useEffect(() => {
    const sections = STAGES.map(s => document.getElementById(s.id)).filter(Boolean)
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -55% 0px' }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#top" className="nav-logo mono" aria-label="Benyamin Mahamed — home">
          BM<span className="nav-logo-cursor">▮</span>
        </a>
        <nav className="nav-links" aria-label="Pipeline stages">
          {STAGES.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`nav-link mono ${active === s.id ? 'active' : ''}`}
            >
              {s.num}
            </a>
          ))}
        </nav>
        <a href="#transmit" className="nav-status mono">
          <span className="status-dot" aria-hidden="true" />
          available
        </a>
      </div>
    </header>
  )
}

/* ── HERO — the detection sequence ──────────────────────────── */
export function Hero() {
  const [boxDrawn, setBoxDrawn] = useState(false)
  const [typedLines, typedDone] = useTyped(
    [
      '> role: software_engineer',
      '> stack: django · opencv · faiss · postgresql',
      '> education: bsc_computer_science · westminster',
      '> status: available_now · london',
    ],
    { start: boxDrawn }
  )

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setBoxDrawn(true), reduced ? 0 : 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="hero" id="top">
      <div className="scanline" aria-hidden="true" />
      <div className="hero-inner">
        <p className="hero-pre mono">subject acquired</p>

        <div className={`det-box ${boxDrawn ? 'drawn' : ''}`}>
          <span className="det-tick det-tick-tl" aria-hidden="true" />
          <span className="det-tick det-tick-tr" aria-hidden="true" />
          <span className="det-tick det-tick-bl" aria-hidden="true" />
          <span className="det-tick det-tick-br" aria-hidden="true" />
          <h1 className="hero-title">
            Benyamin<br />Mahamed
          </h1>
        </div>

        <div className="hero-typed mono" aria-label="Profile summary">
          {typedLines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
          <span className={`caret ${typedDone ? 'caret-idle' : ''}`} aria-hidden="true">▮</span>
        </div>

        <div className="hero-ctas">
          <a href="#detections" className="btn btn-primary">View detections</a>
          <a href="mailto:benyaminmahamed@gmail.com" className="btn btn-ghost">Transmit →</a>
        </div>

        <div className="hero-telemetry mono" aria-label="System metrics from final-year vision project">
          <span><strong>~14</strong> fps_pipeline</span>
          <span><strong>~10ms</strong> latency</span>
          <span><strong>10,298</strong> frames_processed</span>
          <span><strong>1,000+</strong> users_in_prod</span>
        </div>
      </div>
    </section>
  )
}

/* ── Stage header ───────────────────────────────────────────── */
export function StageHead({ num, name, title }) {
  return (
    <>
      <Reveal className="stage-eyebrow">
        <span className="mono stage-num">{num}</span>
        <span className="mono stage-name">/ {name}</span>
        <span className="stage-rule" aria-hidden="true" />
      </Reveal>
      <Reveal as="h2" className="stage-title" delay={60}>{title}</Reveal>
    </>
  )
}

/* ── INPUT — SYS.01 (About) ─────────────────────────────────── */
export function Input() {
  return (
    <section className="section" id="input">
      <div className="wrap">
        <StageHead num="SYS.01" name="input" title="Subject profile." />
        <div className="input-grid">
          <Reveal className="profile-panel" delay={100}>
            <div className="pp-head mono">subject_data</div>
            <dl className="pp-rows">
              <div><dt className="mono">name</dt><dd>Benyamin Mahamed</dd></div>
              <div><dt className="mono">role</dt><dd>Software Engineer</dd></div>
              <div><dt className="mono">education</dt><dd>BSc Computer Science, University of Westminster</dd></div>
              <div><dt className="mono">location</dt><dd>London, United Kingdom</dd></div>
              <div><dt className="mono">languages</dt><dd>7+ spoken · Python primary</dd></div>
              <div><dt className="mono">availability</dt><dd className="pp-avail">Immediate</dd></div>
            </dl>
          </Reveal>
          <div>
            <Reveal className="input-copy" delay={140}>
              <p>
                I engineer systems that ship. Backend architecture, database design,
                computer vision pipelines, and AI integration — running in production
                rather than sitting in a repo.
              </p>
              <p>
                I co-founded <strong>The Blueprint Brief</strong>, a live editorial
                platform serving over 1,000 registered users, built end-to-end with
                Django and PostgreSQL. My final-year dissertation produced a real-time
                autonomous navigation system on a Raspberry Pi 5 — the vision pipeline
                this site's interface is modelled on.
              </p>
            </Reveal>
            <Reveal className="tag-row" delay={200}>
              {['Full-stack development', 'AI / ML', 'Computer vision', 'Embedded systems', 'REST APIs', 'Database architecture'].map(t => (
                <span key={t} className="tag mono">{t}</span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}