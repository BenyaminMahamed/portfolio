import { useEffect, useMemo, useRef, useState } from 'react'
import { Reveal, StageHead } from './Core'
import { PROJECTS, FILTERS, SKILL_GROUPS, CONTACT_LINKS } from '../data/content'

/* ── DETECTIONS — SYS.02 (Projects) ─────────────────────────── */
export function Detections() {
  const [filter, setFilter] = useState('all')

  const visible = useMemo(
    () => PROJECTS.filter(p => filter === 'all' || p.tags.includes(filter)),
    [filter]
  )

  return (
    <section className="section section--panel" id="detections">
      <div className="wrap">
        <div className="stage-head-row">
          <div>
            <StageHead num="SYS.02" name="detections" title="Objects detected: production systems." />
          </div>
          <Reveal className="filters" delay={100} role="group" aria-label="Filter projects">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-btn mono ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
              >
                {f.label}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="det-grid">
          {visible.map((p, i) => (
            <Reveal
              key={p.id}
              as="article"
              delay={i * 70}
              className={`det-card ${p.featured ? 'det-card--featured' : ''}`}
            >
              <span className="dc-tick dc-tick-tl" aria-hidden="true" />
              <span className="dc-tick dc-tick-tr" aria-hidden="true" />
              <span className="dc-tick dc-tick-bl" aria-hidden="true" />
              <span className="dc-tick dc-tick-br" aria-hidden="true" />

              <div className="dc-meta mono">
                <span className="dc-id">det_{String(p.id).padStart(2, '0')}</span>
                <span className="dc-conf">conf {p.conf}</span>
                <span className={`dc-status dc-status--${p.statusType}`}>
                  {p.statusType === 'live' && <span className="status-dot" aria-hidden="true" />}
                  {p.status}
                </span>
              </div>

              <h3 className="dc-title">{p.title}</h3>
              <p className="dc-desc">{p.desc}</p>

              {p.stats.length > 0 && (
                <div className="dc-stats mono">
                  {p.stats.map(s => (
                    <span key={s.label}><strong>{s.val}</strong> {s.label}</span>
                  ))}
                </div>
              )}

              <ul className="dc-tech mono" aria-label="Technologies">
                {p.tech.map(t => <li key={t}>{t}</li>)}
              </ul>

              <div className="dc-links">
                {p.links.map(l => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`dc-link mono ${l.primary ? 'dc-link--primary' : ''}`}
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── WEIGHTS — SYS.03 (Skills) ──────────────────────────────── */
function WeightBar({ name, pct }) {
  const ref = useRef(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setW(pct)
          obs.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [pct])

  return (
    <div className="weight-row" ref={ref}>
      <span className="weight-name">{name}</span>
      <span className="weight-val mono">{(pct / 100).toFixed(2)}</span>
      <div
        className="weight-bar"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} proficiency`}
      >
        <div className="weight-fill" style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}

export function Weights() {
  return (
    <section className="section" id="weights">
      <div className="wrap">
        <StageHead num="SYS.03" name="weights" title="Model weights." />
        <div className="weights-grid">
          {SKILL_GROUPS.map((g, gi) => (
            <Reveal key={g.num} className="weight-group" delay={gi * 80}>
              <div className="wg-head mono">
                <span className="wg-num">{g.num}</span>
                <span>{g.title}</span>
              </div>
              {g.skills.map(s => <WeightBar key={s.name} {...s} />)}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── BUFFER — SYS.04 (GitHub archive) ───────────────────────── */
const GH_USER = 'BenyaminMahamed'
const HIDDEN_PATTERNS = [/jpmc/i, /forage/i, /blueprint/i]

const FEATURED_REPO = {
  name: 'The Blueprint Brief',
  description: 'Production Django + PostgreSQL editorial platform. Private repository — the live site is the demo.',
  language: 'Django',
  liveUrl: 'https://theblueprintbrief.com',
}

export function Buffer() {
  const [repos, setRepos] = useState(null)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState('all')

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`)
      .then(r => {
        if (!r.ok) throw new Error(`GitHub API ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        const cleaned = data
          .filter(r => !r.fork)
          .filter(r => !HIDDEN_PATTERNS.some(p => p.test(r.name)))
          .sort((a, b) =>
            b.stargazers_count - a.stargazers_count ||
            new Date(b.pushed_at) - new Date(a.pushed_at)
          )
        setRepos(cleaned)
      })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  const langs = useMemo(
    () => (repos ? [...new Set(repos.map(r => r.language).filter(Boolean))] : []),
    [repos]
  )

  const visible = useMemo(() => {
    if (!repos) return []
    const q = search.trim().toLowerCase()
    return repos.filter(r => {
      const matchLang = lang === 'all' || r.language === lang
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      return matchLang && matchQ
    })
  }, [repos, search, lang])

  const showFeatured =
    lang === 'all' &&
    (!search.trim() ||
      FEATURED_REPO.name.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <section className="section section--panel" id="buffer">
      <div className="wrap">
        <div className="stage-head-row">
          <div>
            <StageHead num="SYS.04" name="buffer" title="Frame buffer: repository index." />
          </div>
          <Reveal className="buffer-controls" delay={100}>
            <input
              type="search"
              className="buffer-search mono"
              placeholder="grep repositories…"
              aria-label="Search repositories"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="filters" role="group" aria-label="Filter by language">
              <button
                className={`filter-btn mono ${lang === 'all' ? 'active' : ''}`}
                onClick={() => setLang('all')}
                aria-pressed={lang === 'all'}
              >
                All
              </button>
              {langs.map(l => (
                <button
                  key={l}
                  className={`filter-btn mono ${lang === l ? 'active' : ''}`}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                >
                  {l}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="repo-grid" aria-live="polite">
          {error && (
            <div className="repo-msg mono">connection refused — open the profile directly below.</div>
          )}
          {!error && repos === null && (
            <div className="repo-msg mono">reading buffer<span className="caret">▮</span></div>
          )}
          {!error && repos !== null && (
            <>
              {showFeatured && (
                <article className="repo-card repo-card--featured">
                  <h3 className="repo-name">
                    {FEATURED_REPO.name}
                    <span className="repo-badge mono">featured</span>
                  </h3>
                  <p className="repo-desc">{FEATURED_REPO.description}</p>
                  <div className="repo-meta mono">
                    <span className="repo-lang">{FEATURED_REPO.language}</span>
                    <a
                      href={FEATURED_REPO.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link repo-link--live"
                    >
                      live →
                    </a>
                  </div>
                </article>
              )}
              {visible.map(r => (
                <article key={r.id} className="repo-card">
                  <h3 className="repo-name">{r.name}</h3>
                  <p className="repo-desc">{r.description || 'No description provided.'}</p>
                  <div className="repo-meta mono">
                    {r.language && <span className="repo-lang">{r.language}</span>}
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      view →
                    </a>
                    {r.stargazers_count > 0 && (
                      <span className="repo-stars">★ {r.stargazers_count}</span>
                    )}
                  </div>
                </article>
              ))}
              {visible.length === 0 && !showFeatured && (
                <div className="repo-msg mono">0 results — adjust filter.</div>
              )}
            </>
          )}
        </div>

        <div className="buffer-foot">
          <a
            href={`https://github.com/${GH_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            Full GitHub profile →
          </a>
        </div>
      </div>
    </section>
  )
}

/* ── TRANSMIT — SYS.05 (Contact) ────────────────────────────── */
export function Transmit() {
  return (
    <section className="section" id="transmit">
      <div className="wrap">
        <StageHead num="SYS.05" name="transmit" title="Open a channel." />
        <div className="transmit-grid">
          <div>
            <Reveal as="p" className="transmit-sub" delay={80}>
              Seeking graduate software engineering, AI/ML, and full-stack roles
              in London. Available immediately — open to hybrid and on-site.
            </Reveal>
            <Reveal delay={140}>
              <a href="mailto:benyaminmahamed@gmail.com" className="btn btn-primary">
                Transmit message →
              </a>
            </Reveal>
          </div>
          <Reveal className="channel-list" delay={120}>
            {CONTACT_LINKS.map(c => (
              <a
                key={c.platform}
                href={c.url}
                target={c.url.startsWith('mailto') ? undefined : '_blank'}
                rel={c.url.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="channel-row"
              >
                <span className="channel-platform mono">{c.platform}</span>
                <span className="channel-handle">{c.handle}</span>
                <span className="channel-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </Reveal>
        </div>

        <footer className="endcard">
          <p className="endcard-line mono">
            end_of_stream · benyamin_mahamed · software_engineer · london · 2026 <span className="caret caret-idle">▮</span>
          </p>
        </footer>
      </div>
    </section>
  )
}