/* ════════════════════════════════════════════════════════════
   github.js — Live GitHub Archive
   Fetches, categorises, filters & renders repos cinematically
   ════════════════════════════════════════════════════════════ */

'use strict';

const GitHub = (() => {

  /* ── Config ── */
  const USERNAME   = 'BenyaminMahamed';
  const API_BASE   = 'https://api.github.com';
  const PER_PAGE   = 30;
  const CACHE_KEY  = 'bm_gh_cache';
  const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes

  /* ── State ── */
  let allRepos     = [];
  let filtered     = [];
  let activeLang   = 'all';
  let searchQuery  = '';

  /* ── DOM refs ── */
  const grid       = document.getElementById('gh-grid');
  const loading    = document.getElementById('gh-loading');
  const langFilters = document.getElementById('gh-lang-filters');
  const searchInput = document.getElementById('gh-search');

  /* ── Language colour map (GitHub palette) ── */
  const LANG_COLORS = {
    Python:     '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    HTML:       '#e34c26',
    CSS:        '#563d7c',
    Java:       '#b07219',
    'C++':      '#f34b7d',
    C:          '#555555',
    Shell:      '#89e051',
    Ruby:       '#701516',
    Go:         '#00ADD8',
    Rust:       '#dea584',
    Swift:      '#ffac45',
    Kotlin:     '#F18E33',
    Dart:       '#00B4AB',
    MicroPython:'#2b6ba0',
    Jupyter:    '#DA5B0B',
  };

  /* ── Categorise a repo by its topics / language / name ── */
  const categorise = repo => {
    const name  = (repo.name || '').toLowerCase();
    const desc  = (repo.description || '').toLowerCase();
    const lang  = (repo.language || '').toLowerCase();
    const topics = (repo.topics || []).map(t => t.toLowerCase());

    const has = (...words) => words.some(w =>
      name.includes(w) || desc.includes(w) || topics.includes(w)
    );

    if (has('ai', 'ml', 'machine-learning', 'deep-learning', 'neural', 'rag', 'faiss', 'llm', 'vision', 'opencv', 'autonomous', 'navigation'))
      return 'AI / Vision';
    if (has('django', 'flask', 'fastapi', 'api', 'backend', 'server', 'rest', 'postgresql', 'database'))
      return 'Backend';
    if (has('web', 'html', 'css', 'frontend', 'react', 'vue', 'svelte', 'portfolio', 'landing'))
      return 'Frontend';
    if (has('iot', 'raspberry', 'pico', 'embedded', 'sensor', 'micropython', 'hardware', 'arduino'))
      return 'Embedded / IoT';
    if (has('security', 'cyber', 'kali', 'pentest', 'ctf', 'exploit', 'wireshark'))
      return 'Security';
    if (lang === 'python') return 'Python';
    if (lang === 'javascript' || lang === 'typescript') return 'JavaScript';
    return 'Other';
  };

  /* ── Time ago helper ── */
  const timeAgo = dateStr => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60)    return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)    return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30)    return `${d}d ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12)   return `${mo}mo ago`;
    return `${Math.floor(mo / 12)}y ago`;
  };

  /* ── Build a single repo card ── */
  const buildCard = repo => {
    const card = document.createElement('article');
    card.className = 'gh-card';
    card.dataset.lang = (repo.language || '').toLowerCase();
    card.dataset.cat  = repo._category;

    const langColor = LANG_COLORS[repo.language] || 'rgba(255,255,255,.18)';
    const desc = repo.description
      ? repo.description.length > 80
        ? repo.description.slice(0, 80) + '…'
        : repo.description
      : 'No description.';

    card.innerHTML = `
      <div class="gh-card-top">
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="gh-card-name"
           aria-label="Open ${repo.name} on GitHub">
          ${repo.name}
        </a>
        ${repo.stargazers_count > 0
          ? `<span class="gh-card-stars" aria-label="${repo.stargazers_count} stars">★ ${repo.stargazers_count}</span>`
          : ''}
      </div>
      <p class="gh-card-desc">${desc}</p>
      <div class="gh-card-bottom">
        ${repo.language
          ? `<span class="gh-lang-tag" style="border-color:${langColor}33;color:${langColor}">
               <span class="gh-lang-dot" style="background:${langColor}"></span>
               ${repo.language}
             </span>`
          : ''}
        ${repo.fork ? `<span class="gh-card-fork">Fork</span>` : ''}
        <span class="gh-card-cat">${repo._category}</span>
        <span class="gh-card-updated" aria-label="Last updated">${timeAgo(repo.pushed_at)}</span>
      </div>
    `;

    /* Staggered entry animation */
    card.style.opacity   = '0';
    card.style.transform = 'translateY(16px)';
    return card;
  };

  /* ── Animate cards in cinematically ── */
  const animateIn = cards => {
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.style.transition = 'opacity .55s cubic-bezier(0.16,1,0.3,1), transform .55s cubic-bezier(0.16,1,0.3,1)';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, i * 55);
    });
  };

  /* ── Render the filtered set ── */
  const render = () => {
    /* Clear non-loading children */
    Array.from(grid.children).forEach(child => {
      if (child !== loading) child.remove();
    });

    /* Apply filters */
    filtered = allRepos.filter(r => {
      const matchLang = activeLang === 'all' ||
        (r.language || '').toLowerCase() === activeLang ||
        r._category.toLowerCase().includes(activeLang);
      const matchSearch = !searchQuery ||
        r.name.toLowerCase().includes(searchQuery) ||
        (r.description || '').toLowerCase().includes(searchQuery) ||
        (r.language || '').toLowerCase().includes(searchQuery) ||
        r._category.toLowerCase().includes(searchQuery);
      return matchLang && matchSearch;
    });

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'gh-empty';
      empty.innerHTML = `No repositories match <em>"${searchQuery || activeLang}"</em>. 
        <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener">Browse all on GitHub →</a>`;
      grid.appendChild(empty);
      return;
    }

    const cards = filtered.map(buildCard);
    cards.forEach(c => grid.appendChild(c));
    animateIn(cards);
  };

  /* ── Build language filter buttons ── */
  const buildLangFilters = () => {
    const langs = [...new Set(
      allRepos
        .map(r => r.language)
        .filter(Boolean)
    )].sort();

    langs.forEach(lang => {
      const btn = document.createElement('button');
      btn.className   = 'gh-fb';
      btn.dataset.lang = lang.toLowerCase();
      btn.textContent  = lang;
      const dot = document.createElement('span');
      dot.className = 'gh-fb-dot';
      dot.style.background = LANG_COLORS[lang] || 'rgba(255,255,255,.3)';
      btn.prepend(dot);
      btn.addEventListener('click', () => setLang(lang.toLowerCase(), btn));
      langFilters?.appendChild(btn);
    });
  };

  /* ── Set active language filter ── */
  const setLang = (lang, clickedBtn) => {
    activeLang = lang;
    langFilters?.querySelectorAll('.gh-fb').forEach(b => b.classList.remove('active'));
    clickedBtn?.classList.add('active');
    render();
  };

  /* ── Fetch from API or cache ── */
  const fetchRepos = async () => {
    /* Check cache */
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
      }
    } catch (_) {}

    /* Fetch pages */
    let repos = [];
    let page  = 1;
    while (true) {
      const res = await fetch(
        `${API_BASE}/users/${USERNAME}/repos?sort=pushed&per_page=${PER_PAGE}&page=${page}`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) break;
      repos = repos.concat(data);
      if (data.length < PER_PAGE) break;
      page++;
    }

    /* Cache result */
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: repos }));
    } catch (_) {}

    return repos;
  };

  /* ── Progress simulation for loading state ── */
  const simulateProgress = () => {
    const ring = loading?.querySelector('.gh-loader-ring');
    if (!ring) return;
    /* The CSS spinner handles the visual — nothing extra needed */
  };

  /* ── Main init ── */
  const init = async () => {
    if (!grid) return;

    /* Show loading */
    if (loading) loading.style.display = 'flex';
    simulateProgress();

    try {
      const raw = await fetchRepos();

      /* Sort: pinned/featured first (most stars), then by last push */
      allRepos = raw
        .filter(r => !r.private)
        .map(r => ({ ...r, _category: categorise(r) }))
        .sort((a, b) => {
          if (b.stargazers_count !== a.stargazers_count)
            return b.stargazers_count - a.stargazers_count;
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });

      /* Hide loader */
      if (loading) loading.style.display = 'none';

      /* Build filter buttons */
      buildLangFilters();

      /* Initial render */
      render();

      /* Wire up search */
      if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(() => {
            searchQuery = searchInput.value.trim().toLowerCase();
            render();
          }, 220);
        });
      }

      /* Wire up "All" button */
      const allBtn = langFilters?.querySelector('[data-lang="all"]');
      if (allBtn) {
        allBtn.addEventListener('click', () => setLang('all', allBtn));
      }

    } catch (err) {
      console.error('[GitHub]', err);
      if (loading) loading.style.display = 'none';
      const errEl = document.createElement('div');
      errEl.className = 'gh-empty';
      errEl.innerHTML = `Could not load repositories. 
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