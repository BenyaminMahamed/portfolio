import { useEffect, useMemo, useRef, useState } from 'react'
import { Eyebrow, Reveal } from './Core'
import { PROJECTS, FILTERS, SKILL_GROUPS } from '../data/content'

/* ── WORK — EP.02 ───────────────────────────────────────────── */
export function Work() {
  const [filter, setFilter] = useState('all')

  const visible = useMemo(
    () => PROJECTS.filter(p => filter === 'all' || p.tags.includes(filter)),
    [filter]
  )

  return (
    <section className="section section--navy" id="work">
      <div className="wrap">
        <Eyebrow num="EP.02" title="The Work" />
        <div className="work-head">
          <Reveal as="h2" className="section-title">
            Production <em>architecture.</em>
          </Reveal>
          <Reveal className="filters" delay={80} role="group" aria-label="Filter projects">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
              >
                {f.label}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="project-grid">
          {visible.map((p, i) => (
            <Reveal
              key={p.id}
              as="article"
              delay={i * 60}
              className={`project-card ${p.featured ? 'project-card--featured' : ''}`}
            >
              <span className="project-ghost" aria-hidden="true">
                {String(p.id).padStart(2, '0')}
              </span>
              <div className={`project-status st-${p.statusType}`}>
                {p.statusType === 'live' && <span className="status-dot" aria-hidden="true" />}
                <span className="mono">{p.status}</span>
              </div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              {p.stats.length > 0 && (
                <div className="project-stats">
                  {p.stats.map(s => (
                    <div key={s.label}>
                      <strong>{s.val}</strong>
                      <span className="mono">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <ul className="tech-row" aria-label="Technologies">
                {p.tech.map(t => <li key={t}>{t}</li>)}
              </ul>
              <div className="project-links">
                {p.links.map(l => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`project-link ${l.primary ? 'project-link--primary' : ''}`}
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

/* ── ARSENAL — EP.03 ────────────────────────────────────────── */
function SkillBar({ name, pct }) {
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
    <div className="skill-row" ref={ref}>
      <span className="skill-name">{name}</span>
      <span className="skill-val mono" aria-hidden="true">{pct}</span>
      <div
        className="skill-bar"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} proficiency`}
        style={{ gridColumn: '1 / -1' }}
      >
        <div className="skill-fill" style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}

export function Arsenal() {
  return (
    <section className="section" id="arsenal">
      <div className="wrap">
        <Eyebrow num="EP.03" title="The Arsenal" />
        <Reveal as="h2" className="section-title">
          Core <em>competencies.</em>
        </Reveal>
        <div className="skills-grid">
          {SKILL_GROUPS.map((g, gi) => (
            <Reveal key={g.num} className="skill-group" delay={gi * 70}>
              <div className="skill-group-head">
                <span className="skill-group-num" aria-hidden="true">{g.num}</span>
                <h3 className="skill-group-title mono">{g.title}</h3>
              </div>
              {g.skills.map(s => <SkillBar key={s.name} {...s} />)}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── ARCHIVE — EP.04 — live GitHub ──────────────────────────── */
const GH_USER = 'BenyaminMahamed'
const HIDDEN_PATTERNS = [/jpmc/i, /forage/i, /blueprint/i]

const FEATURED_REPO = {
  id: 'featured-bpb',
  name: 'The Blueprint Brief',
  description:
    'Production Django + PostgreSQL editorial platform. Private repository — the live site is the demo.',
  language: 'Django',
  featured: true,
  liveUrl: 'https://theblueprintbrief.com',
}

export function Archive() {
  const [repos, setRepos] = useState(null) // null = loading, [] = loaded
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
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        setRepos(cleaned)
      })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  const langs = useMemo(() => {
    if (!repos) return []
    return [...new Set(repos.map(r => r.language).filter(Boolean))]
  }, [repos])

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
    <section className="section section--soft" id="archive">
      <div className="wrap">
        <Eyebrow num="EP.04" title="The Archive" />
        <div className="archive-head">
          <Reveal as="h2" className="section-title">
            Repository <em>index.</em>
          </Reveal>
          <Reveal className="archive-controls" delay={80}>
            <input
              type="search"
              className="archive-search"
              placeholder="Search repositories…"
              aria-label="Search repositories"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="filters" role="group" aria-label="Filter by language">
              <button
                className={`filter-btn ${lang === 'all' ? 'active' : ''}`}
                onClick={() => setLang('all')}
                aria-pressed={lang === 'all'}
              >
                All
              </button>
              {langs.map(l => (
                <button
                  key={l}
                  className={`filter-btn ${lang === l ? 'active' : ''}`}
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
            <div className="repo-msg mono">
              Couldn't reach GitHub — view the profile directly below.
            </div>
          )}
          {!error && repos === null && (
            <div className="repo-msg mono">Fetching repositories…</div>
          )}
          {!error && repos !== null && (
            <>
              {showFeatured && (
                <article className="repo-card repo-card--featured">
                  <h3 className="repo-name">
                    {FEATURED_REPO.name}
                    <span className="repo-badge">Featured</span>
                  </h3>
                  <p className="repo-desc">{FEATURED_REPO.description}</p>
                  <div className="repo-meta">
                    <span className="repo-lang">{FEATURED_REPO.language}</span>
                    <a
                      href={FEATURED_REPO.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link repo-link--live"
                    >
                      Live site →
                    </a>
                  </div>
                </article>
              )}
              {visible.map(r => (
                <article key={r.id} className="repo-card">
                  <h3 className="repo-name">{r.name}</h3>
                  <p className="repo-desc">{r.description || 'No description provided.'}</p>
                  <div className="repo-meta">
                    {r.language && <span className="repo-lang">{r.language}</span>}
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      View →
                    </a>
                    {r.stargazers_count > 0 && (
                      <span className="repo-stars">★ {r.stargazers_count}</span>
                    )}
                  </div>
                </article>
              ))}
              {visible.length === 0 && !showFeatured && (
                <div className="repo-msg mono">No repositories match that filter.</div>
              )}
            </>
          )}
        </div>

        <div className="archive-foot">
          <a
            href={`https://github.com/${GH_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            View full GitHub profile →
          </a>
        </div>
      </div>
    </section>
  )
}

/* ── CONTACT — EP.05 ────────────────────────────────────────── */
const CONTACT_LINKS = [
  { platform: 'Email', handle: 'benyaminmahamed@gmail.com', url: 'mailto:benyaminmahamed@gmail.com' },
  { platform: 'GitHub', handle: 'BenyaminMahamed', url: 'https://github.com/BenyaminMahamed' },
  { platform: 'LinkedIn', handle: 'benyamin-mahamed', url: 'https://www.linkedin.com/in/benyamin-mahamed/' },
  { platform: 'Live platform', handle: 'theblueprintbrief.com', url: 'https://theblueprintbrief.com' },
]

export function Contact() {
  return (
    <section className="section section--navy" id="contact">
      <div className="wrap">
        <Eyebrow num="EP.05" title="Unfinished Business" />
        <div className="contact-grid">
          <div>
            <Reveal as="h2" className="section-title">
              Let's build <em>something real.</em>
            </Reveal>
            <Reveal as="p" className="contact-sub" delay={80}>
              Seeking graduate software engineering, AI/ML, and full-stack roles
              in London. Available immediately — open to hybrid and on-site.
            </Reveal>
            <Reveal delay={140}>
              <a href="mailto:benyaminmahamed@gmail.com" className="btn btn-primary">
                Start a conversation
              </a>
            </Reveal>
          </div>
          <Reveal className="contact-list" delay={120}>
            {CONTACT_LINKS.map(c => (
              <a
                key={c.platform}
                href={c.url}
                target={c.url.startsWith('mailto') ? undefined : '_blank'}
                rel={c.url.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="contact-row"
              >
                <span>
                  <span className="contact-row-platform mono">{c.platform}</span>
                  <span className="contact-row-handle">{c.handle}</span>
                </span>
                <span className="contact-row-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </Reveal>
        </div>

        <footer className="endcard">
          <div className="endcard-rule" aria-hidden="true" />
          <p className="endcard-title">To Be Continued…</p>
          <p className="endcard-sub mono">
            Benyamin Mahamed · Software Engineer · London · 2026
          </p>
        </footer>
      </div>
    </section>
  )
}