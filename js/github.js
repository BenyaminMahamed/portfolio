/**
 * NAKAZAWA PORTFOLIO — GITHUB.JS
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE:
 * 1. Static Blueprint Brief card — always first, always visible
 * 2. GitHub API fetch — paginated, all public repos
 * 3. Filter pipeline — excludes HIDDEN_REPOS & HIDDEN_PATTERNS
 * 4. Sort — updated_at descending
 * 5. Render — grid cards (mobile friendly)
 * 6. Search + language filter
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─── CONFIG ─────────────────────────────────────────────────────────────────── */
const GH_CONFIG = {
  username: 'BenyaminMahamed',
  perPage:  100,
  maxPages: 3,
};

const HIDDEN_REPOS = new Set([
  'blueprint-brief-architecture',
  'blueprint-brief',
  'jpmc-task',
  'jpmorgan-task',
  'jpmc-internship',
  'jpmorgan-chase-task',
  'jpmc-application-task',
  'j-p-morgan-task',
  'forage-jpmc',
  'forage-jpmorgan',
  'jpmc-forage',
  'jp-morgan-task',
]);

const HIDDEN_PATTERNS = [
  'jpmc',
  'jpmorgan',
  'jp-morgan',
  'j.p.morgan',
  'forage',
  'blueprint-brief-arch',
];

const LANG_COLOURS = {
  'Python':       '#3572A5',
  'JavaScript':   '#f1e05a',
  'TypeScript':   '#2b7489',
  'HTML':         '#e34c26',
  'CSS':          '#563d7c',
  'Java':         '#b07219',
  'C':            '#555555',
  'C++':          '#f34b7d',
  'C#':           '#178600',
  'Shell':        '#89e051',
  'Bash':         '#89e051',
  'Go':           '#00ADD8',
  'Rust':         '#dea584',
  'Ruby':         '#701516',
  'Swift':        '#ffac45',
  'Kotlin':       '#F18E33',
  'Dart':         '#00B4AB',
  'PHP':          '#4F5D95',
  'Jupyter Notebook': '#DA5B0B',
  'SCSS':         '#c6538c',
  'Vue':          '#2c3e50',
  'default':      '#8a8278',
};

/* ─── DOM ELEMENTS ───────────────────────────────────────────────────────────── */
const DOM = {
  grid:        null,
  loading:     null,
  search:      null,
  langFilters: null,
};

let allCards = [];

/* ─── INITIALISE ─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initGithub);

async function initGithub() {
  DOM.grid        = document.getElementById('gh-grid');
  DOM.loading     = document.getElementById('gh-loading');
  DOM.search      = document.getElementById('gh-search');
  DOM.langFilters = document.getElementById('gh-lang-filters');

  if (!DOM.grid) return;

  renderBlueprintBriefAnchor();

  try {
    const repos = await fetchAllRepos();
    const filtered = filterRepos(repos);
    const sorted   = sortRepos(filtered);

    hideLoading();
    renderRepoCards(sorted);
    buildLanguageFilters(sorted);
    initSearch();
    initLangFilter();

  } catch (err) {
    hideLoading();
    renderError(err);
  }
}

/* ─── STATIC BLUEPRINT BRIEF ANCHOR ─────────────────────────────────────────── */
function renderBlueprintBriefAnchor() {
  if (!DOM.grid) return;

  const card = document.createElement('article');
  card.className = 'repo-card repo-card--featured repo-card--blueprint';
  card.dataset.name = 'the-blueprint-brief';
  card.dataset.lang = 'django';
  card.setAttribute('role', 'article');

  card.innerHTML = `
    <div class="repo-card-header" style="flex-wrap: wrap; gap: 0.5rem;">
      <h3 class="repo-name">The Blueprint Brief</h3>
      <span class="repo-featured-badge">● Live Production</span>
    </div>
    <p class="repo-desc">
      Co-founded and architected a full-stack editorial CMS — custom Django
      RBAC, signal-driven editorial workflow, automated SEO metadata, and
      newsletter distribution. Solved N+1 queries and tuned Gunicorn
      worker config for real concurrent traffic. Running in production
      since launch serving <strong>1,000+ active users</strong>.
    </p>
    <div class="repo-footer">
      <div class="repo-meta" style="flex-wrap: wrap; gap: 0.5rem;">
        <span class="repo-lang">
          <span class="repo-lang-dot" style="background:${LANG_COLOURS['Python']}"></span>
          Python · Django
        </span>
        <span class="repo-lang">
          <span class="repo-lang-dot" style="background:${LANG_COLOURS['CSS']}"></span>
          PostgreSQL
        </span>
      </div>
      <div class="repo-bp-links" style="margin-top: 0.5rem;">
        <a href="https://theblueprintbrief.com"
           target="_blank" rel="noopener"
           class="repo-link repo-link--live"
           aria-label="Visit The Blueprint Brief live">
          Visit Live Platform →
        </a>
      </div>
    </div>
  `;

  if (DOM.loading && DOM.loading.parentNode === DOM.grid) {
    DOM.grid.insertBefore(card, DOM.loading);
  } else {
    DOM.grid.insertBefore(card, DOM.grid.firstChild);
  }

  allCards.push(card);
}

/* ─── GITHUB API FETCH ──────────────────────────────────────────────────────── */
async function fetchAllRepos() {
  const allRepos = [];
  for (let page = 1; page <= GH_CONFIG.maxPages; page++) {
    const url = `https://api.github.com/users/${GH_CONFIG.username}/repos?per_page=${GH_CONFIG.perPage}&page=${page}&sort=updated&type=public`;
    const response = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });

    if (!response.ok) {
      if (response.status === 403) throw new Error(`GitHub API rate limit reached. Please try again later.`);
      if (response.status === 404) throw new Error(`GitHub user '${GH_CONFIG.username}' not found.`);
      throw new Error(`GitHub API error: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected GitHub API response format.');

    allRepos.push(...data);
    if (data.length < GH_CONFIG.perPage) break;
  }
  return allRepos;
}

/* ─── FILTER & SORT ─────────────────────────────────────────────────────────── */
function filterRepos(repos) {
  return repos.filter(repo => {
    const name = repo.name.toLowerCase();
    if (HIDDEN_REPOS.has(name)) return false;
    for (const pattern of HIDDEN_PATTERNS) {
      if (name.includes(pattern.toLowerCase())) return false;
    }
    if (name === 'portfolio') return false;
    if (repo.fork) return false;
    return true;
  });
}

function sortRepos(repos) {
  return [...repos].sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
}

/* ─── RENDER CARDS ───────────────────────────────────────────────────────────── */
function renderRepoCards(repos) {
  if (!DOM.grid) return;
  if (repos.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'archive-empty mono-label';
    empty.textContent = 'No public repositories found.';
    DOM.grid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  repos.forEach(repo => {
    const card = buildRepoCard(repo);
    fragment.appendChild(card);
    allCards.push(card);
  });
  DOM.grid.appendChild(fragment);

  if (typeof gsap !== 'undefined') {
    const newCards = Array.from(DOM.grid.querySelectorAll('.repo-card:not(.repo-card--blueprint)'));
    gsap.fromTo(newCards, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', delay: 0.1 });
  }
}

function buildRepoCard(repo) {
  const card = document.createElement('article');
  card.className = 'repo-card';
  card.dataset.name = repo.name.toLowerCase();
  card.dataset.lang = (repo.language || 'unknown').toLowerCase().replace(/\s+/g, '-');
  card.setAttribute('role', 'article');

  const langColour = LANG_COLOURS[repo.language] || LANG_COLOURS['default'];
  const updatedDate = formatRelativeDate(repo.pushed_at || repo.updated_at);
  const description = repo.description
    ? escapeHtml(repo.description).slice(0, 140) + (repo.description.length > 140 ? '…' : '')
    : 'No description provided.';

  const topicsHtml = (repo.topics || []).slice(0, 4).map(t =>
    `<span class="repo-topic">${escapeHtml(t)}</span>`
  ).join('');

  card.innerHTML = `
    <div class="repo-card-header" style="flex-wrap: wrap; gap: 0.5rem;">
      <h3 class="repo-name" style="word-break: break-word;">${escapeHtml(repo.name.replace(/-/g, ' ').replace(/_/g, ' '))}</h3>
      ${repo.stargazers_count > 0 ? `<span class="repo-stars">★ ${repo.stargazers_count}</span>` : ''}
    </div>
    <p class="repo-desc">${description}</p>
    ${topicsHtml ? `<div class="repo-topics">${topicsHtml}</div>` : ''}
    <div class="repo-footer">
      <div class="repo-meta" style="flex-wrap: wrap; gap: 0.5rem;">
        ${repo.language ? `
          <span class="repo-lang">
            <span class="repo-lang-dot" style="background:${langColour}"></span>
            ${escapeHtml(repo.language)}
          </span>` : ''}
        <span class="repo-updated">${updatedDate}</span>
      </div>
      <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="repo-link" style="margin-top: 0.5rem;">
        View →
      </a>
    </div>
  `;
  return card;
}

/* ─── FILTERS & SEARCH ───────────────────────────────────────────────────────── */
function buildLanguageFilters(repos) {
  if (!DOM.langFilters) return;
  const langs = new Map();
  repos.forEach(repo => { if (repo.language) langs.set(repo.language, (langs.get(repo.language) || 0) + 1); });
  const sorted = [...langs.entries()].sort((a, b) => b[1] - a[1]);
  sorted.forEach(([lang]) => {
    const btn = document.createElement('button');
    btn.className = 'af';
    btn.dataset.lang = lang.toLowerCase().replace(/\s+/g, '-');
    btn.innerHTML = `<span>${lang}</span>`;
    DOM.langFilters.appendChild(btn);
  });
}

function initSearch() {
  if (!DOM.search) return;
  DOM.search.addEventListener('input', () => applyFilters(DOM.search.value.toLowerCase().trim(), getActiveLang()));
}

function initLangFilter() {
  if (!DOM.langFilters) return;
  DOM.langFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.af');
    if (!btn) return;
    DOM.langFilters.querySelectorAll('.af').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters(getSearchQuery(), btn.dataset.lang);
  });
}

function getSearchQuery() { return DOM.search ? DOM.search.value.toLowerCase().trim() : ''; }
function getActiveLang() {
  const active = DOM.langFilters ? DOM.langFilters.querySelector('.af.active') : null;
  return active ? active.dataset.lang : 'all';
}

function applyFilters(query, lang) {
  const cards = DOM.grid ? DOM.grid.querySelectorAll('.repo-card') : [];
  cards.forEach(card => {
    const nameMatch = !query || card.dataset.name.includes(query) || (card.querySelector('.repo-desc')?.textContent.toLowerCase().includes(query)) || (card.querySelector('.repo-name')?.textContent.toLowerCase().includes(query));
    const cardLang = card.dataset.lang || '';
    const langMatch = lang === 'all' || lang === '' || cardLang.includes(lang);
    const visible = nameMatch && langMatch;

    if (visible) {
      card.style.display = '';
      if (typeof gsap !== 'undefined') gsap.fromTo(card, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    } else {
      card.style.display = 'none';
    }
  });
}

/* ─── UTILITIES ──────────────────────────────────────────────────────────────── */
function hideLoading() { if (DOM.loading) DOM.loading.style.display = 'none'; }
function renderError(err) {
  if (!DOM.grid) return;
  const errEl = document.createElement('div');
  errEl.className = 'archive-error';
  errEl.style.cssText = `grid-column: 1 / -1; padding: 2rem; font-family: var(--f-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--c-ink-mid); border: 1px solid var(--c-ink-whisper); text-transform: uppercase;`;
  errEl.innerHTML = `<span style="color:var(--c-crimson)">API Error</span> — ${escapeHtml(err.message)}<br><a href="https://github.com/${GH_CONFIG.username}?tab=repositories" target="_blank" rel="noopener" style="color:var(--c-ink); text-decoration:underline; margin-top:0.5rem; display:inline-block;">View repositories directly on GitHub →</a>`;
  DOM.grid.appendChild(errEl);
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const [MINUTE, HOUR, DAY, WEEK, MONTH, YEAR] = [60000, 3600000, 86400000, 604800000, 2592000000, 31536000000];
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`;
  return `${Math.floor(diff / YEAR)}y ago`;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}