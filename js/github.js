/* ════════════════════════════════════════════════════════════
   github.js — Live GitHub Archive
   Fetches, filters, categorises & renders repos cinematically
   ════════════════════════════════════════════════════════════ */

'use strict';

const GitHub = (() => {

  /* ── Config ── */
  const USERNAME  = 'BenyaminMahamed';
  const API_BASE  = 'https://api.github.com';
  const PER_PAGE  = 100;
  const CACHE_KEY = 'bm_gh_cache_v2';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /* ════════════════════════════════════════════════════════
     FILTER BLOCKLIST
     Repos matching any of these patterns are permanently
     hidden from the public archive display.
     ════════════════════════════════════════════════════════ */
  const HIDDEN_REPOS = [
    // Blueprint Brief internal architecture / infra repos
    'blueprint-brief-architecture',
    'blueprint-brief-infra',
    'blueprint-brief-private',

    // JPMorgan Chase (JPMC) task/assignment repos
    'jpmc',
    'jpmorgan',
    'jp-morgan',
    'forage-jpmc',
    'forage_jpmc',
    'quantitative-research',
    'software-engineering-virtual',
  ];

  /* Returns true if repo should be hidden */
  const isHidden = repo => {
    const name   = (repo.name || '').toLowerCase();
    const desc   = (repo.description || '').toLowerCase();
    const topics = (repo.topics || []).map(t => t.toLowerCase());

    // Check name against blocklist
    if (HIDDEN_REPOS.some(blocked => name.includes(blocked))) return true;

    // Check topics
    if (topics.some(t => HIDDEN_REPOS.some(blocked => t.includes(blocked)))) return true;

    // Hide private repos (belt-and-braces; API shouldn't return them without auth)
    if (repo.private) return true;

    return false;
  };

  /* ── State ── */
  let allRepos    = [];
  let activeLang  = 'all';
  let searchQuery = '';

  /* ── DOM refs ── */
  const grid        = document.getElementById('gh-grid');
  const loading     = document.getElementById('gh-loading');
  const langFilters = document.getElementById('gh-lang-filters');
  const searchInput = document.getElementById('gh-search');

  /* ── Language colour map (GitHub palette) ── */
  const LANG_COLORS = {
    Python:      '#3572A5',
    JavaScript:  '#f1e05a',
    TypeScript:  '#2b7489',
    HTML:        '#e34c26',
    CSS:         '#563d7c',
    Java:        '#b07219',
    'C++':       '#f34b7d',
    C:           '#555555',
    Shell:       '#89e051',
    Ruby:        '#701516',
    Go:          '#00ADD8',
    Rust:        '#dea584',
    Swift:       '#ffac45',
    Kotlin:      '#F18E33',
    Dart:        '#00B4AB',
    MicroPython: '#2b6ba0',
    Jupyter:     '#DA5B0B',
  };

  /* ── Categorise a repo ── */
  const categorise = repo => {
    const name   = (repo.name        || '').toLowerCase();
    const desc   = (repo.description || '').toLowerCase();
    const lang   = (repo.language    || '').toLowerCase();
    const topics = (repo.topics      || []).map(t => t.toLowerCase());

    const has = (...words) =>
      words.some(w => name.includes(w) || desc.includes(w) || topics.includes(w));

    if (has('ai', 'ml', 'machine-learning', 'deep-learning', 'neural', 'rag',
            'faiss', 'llm', 'vision', 'opencv', 'autonomous', 'navigation',
            'embedding', 'transformer'))
      return 'AI / Vision';

    if (has('django', 'flask', 'fastapi', 'api', 'backend', 'server', 'rest',
            'postgresql', 'database', 'drf'))
      return 'Backend';

    if (has('web', 'html', 'css', 'frontend', 'react', 'vue', 'svelte',
            'portfolio', 'landing', 'sass'))
      return 'Frontend';

    if (has('iot', 'raspberry', 'pico', 'embedded', 'sensor', 'micropython',
            'hardware', 'arduino', 'picar'))
      return 'Embedded / IoT';

    if (has('security', 'cyber', 'kali', 'pentest', 'ctf', 'exploit',
            'wireshark', 'network'))
      return 'Security';

    if (lang === 'python')                            return 'Python';
    if (lang === 'javascript' || lang === 'typescript') return 'JavaScript';
    if (lang === 'java')                              return 'Java';

    return 'Other';
  };

  /* ── Time ago helper ── */
  const timeAgo = dateStr => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m    = Math.floor(diff / 60000);
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30)  return `${d}d ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(mo / 12)}y ago`;
  };

  /* ── Build a single repo card ── */
  const buildCard = repo => {
    const card = document.createElement('article');
    card.className         = 'repo-card';
    card.dataset.lang      = (repo.language || '').toLowerCase();
    card.dataset.cat       = repo._category;
    card.setAttribute('role', 'article');

    const langColor = LANG_COLORS[repo.language] || 'rgba(17,17,21,.35)';
    const desc      = repo.description
      ? repo.description.length > 90
        ? repo.description.slice(0, 90) + '…'
        : repo.description
      : 'No description provided.';

    card.innerHTML = `
      <div class="repo-top">
        <a href="${repo.html_url}"
           target="_blank"
           rel="noopener noreferrer"
           class="repo-name"
           aria-label="Open ${repo.name} on GitHub">
          ${repo.name}
        </a>
        ${repo.stargazers_count > 0
          ? `<span class="repo-stars" aria-label="${repo.stargazers_count} stars">★ ${repo.stargazers_count}</span>`
          : ''}
      </div>

      <p class="repo-desc">${desc}</p>

      <div class="repo-bottom">
        ${repo.language
          ? `<span class="repo-lang"
               style="border-color:${langColor}40;color:${langColor}">
               <span class="repo-lang-dot" style="background:${langColor}"></span>
               ${repo.language}
             </span>`
          : ''}
        ${repo.fork ? `<span class="repo-fork">Fork</span>` : ''}
        <span class="repo-cat">${repo._category}</span>
        <span class="repo-updated">${timeAgo(repo.pushed_at)}</span>
      </div>
    `;

    /* Initial hidden state — animated in */
    card.style.opacity   = '0';
    card.style.transform = 'translateY(14px)';

    return card;
  };

  /* ── Animate cards in cinematically ── */
  const animateIn = cards => {
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.style.transition =
          'opacity .55s cubic-bezier(0.16,1,0.3,1), transform .55s cubic-bezier(0.16,1,0.3,1)';
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      }, i * 48);
    });
  };

  /* ── Render the filtered set ── */
  const render = () => {
    // Clear non-loading children
    Array.from(grid.children).forEach(child => {
      if (child !== loading) child.remove();
    });

    // Apply active lang filter + search query
    const filtered = allRepos.filter(r => {
      const lang = (r.language || '').toLowerCase();
      const cat  = (r._category || '').toLowerCase();

      const matchLang =
        activeLang === 'all' ||
        lang === activeLang ||
        cat.includes(activeLang);

      const matchSearch =
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery)        ||
        (r.description || '').toLowerCase().includes(searchQuery) ||
        lang.includes(searchQuery)                         ||
        cat.includes(searchQuery);

      return matchLang && matchSearch;
    });

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'archive-empty';
      empty.innerHTML = `
        No repositories match <em>"${searchQuery || activeLang}"</em>.
        <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener">
          Browse all on GitHub →
        </a>`;
      grid.appendChild(empty);
      return;
    }

    const cards = filtered.map(buildCard);
    cards.forEach(c => grid.appendChild(c));
    animateIn(cards);
  };

  /* ── Build language filter buttons ── */
  const buildLangFilters = () => {
    if (!langFilters) return;

    const langs = [
      ...new Set(allRepos.map(r => r.language).filter(Boolean))
    ].sort();

    langs.forEach(lang => {
      const btn          = document.createElement('button');
      btn.className      = 'af';
      btn.dataset.lang   = lang.toLowerCase();
      btn.setAttribute('type', 'button');

      const dot          = document.createElement('span');
      dot.className      = 'af-dot';
      dot.style.background = LANG_COLORS[lang] || 'rgba(17,17,21,.3)';

      btn.appendChild(dot);
      btn.appendChild(document.createTextNode(lang));

      btn.addEventListener('click', () => setLang(lang.toLowerCase(), btn));
      langFilters.appendChild(btn);
    });
  };

  /* ── Set active language filter ── */
  const setLang = (lang, clickedBtn) => {
    activeLang = lang;
    langFilters?.querySelectorAll('.af').forEach(b => b.classList.remove('active'));
    clickedBtn?.classList.add('active');
    render();
  };

  /* ── Fetch all public repos (paginated) ── */
  const fetchRepos = async () => {
    // Check session cache first
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
      }
    } catch (_) { /* ignore parse errors */ }

    // Fetch all pages
    let repos = [];
    let page  = 1;

    while (true) {
      const res = await fetch(
        `${API_BASE}/users/${USERNAME}/repos?sort=pushed&per_page=${PER_PAGE}&page=${page}`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('GitHub API rate limit reached. Please try again shortly.');
        }
        throw new Error(`GitHub API returned ${res.status}.`);
      }

      const data = await res.json();
      if (!Array.isArray(data) || !data.length) break;
      repos = repos.concat(data);
      if (data.length < PER_PAGE) break;
      page++;
    }

    // Store in cache
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: repos }));
    } catch (_) { /* storage quota exceeded — silent fail */ }

    return repos;
  };

  /* ── Main init ── */
  const init = async () => {
    if (!grid) return;

    // Show loading state
    if (loading) loading.style.display = 'flex';

    try {
      const raw = await fetchRepos();

      // Apply blocklist filter, add category, sort by stars then recency
      allRepos = raw
        .filter(r => !isHidden(r))
        .map(r => ({ ...r, _category: categorise(r) }))
        .sort((a, b) => {
          if (b.stargazers_count !== a.stargazers_count)
            return b.stargazers_count - a.stargazers_count;
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });

      // Hide loader
      if (loading) loading.style.display = 'none';

      // Build language filter buttons
      buildLangFilters();

      // Initial render
      render();

      // Wire search input with debounce
      if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(() => {
            searchQuery = searchInput.value.trim().toLowerCase();
            render();
          }, 220);
        });
        // Clear on Escape
        searchInput.addEventListener('keydown', e => {
          if (e.key === 'Escape') {
            searchInput.value = '';
            searchQuery = '';
            render();
          }
        });
      }

      // Wire "All" lang button
      const allBtn = langFilters?.querySelector('[data-lang="all"]');
      if (allBtn) {
        allBtn.addEventListener('click', () => setLang('all', allBtn));
      }

    } catch (err) {
      console.error('[GitHub Archive]', err);

      if (loading) loading.style.display = 'none';

      const errEl = document.createElement('div');
      errEl.className = 'archive-empty';
      errEl.innerHTML = `
        Could not load repositories.
        ${err.message ? `<br><small>${err.message}</small>` : ''}
        <br>
        <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener">
          View GitHub directly →
        </a>`;
      grid.appendChild(errEl);
    }
  };

  return { init };

})();

/* ── Auto-init when DOM is ready ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', GitHub.init);
} else {
  GitHub.init();
}