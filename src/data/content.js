// src/data/content.js
// Kinetic Minimalist — data layer. Old HUD exports (STAGES, FILTERS) removed.

export const LINKS = {
  email: 'mailto:benyaminmahamed@gmail.com',
  github: 'https://github.com/BenyaminMahamed',
  linkedin: 'https://www.linkedin.com/in/benyamin-mahamed/',
  blueprint: 'https://theblueprintbrief.com',
}

export const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
]

export const PROJECTS = [
  {
    id: 'blueprint',
    num: '01',
    status: 'LIVE · PRODUCTION',
    title: 'The Blueprint Brief',
    desc: 'Co-founded and engineered a full-stack editorial platform serving 1,000+ registered users. I own the deployment, media pipeline, DNS and transactional email in production.',
    tech: ['Django', 'PostgreSQL', 'Python', 'Cloudinary', 'Linux'],
    stats: [{ val: '1,000+', label: 'registered users' }],
    dark: true,
    study: {
      problem:
        'A student-run publication needed a real platform — authentication, editorial workflow, media management and its own domain — not a newsletter tool with a coat of paint.',
      build:
        "Django + PostgreSQL CMS built by a three-person team. My side: the Render deployment, the Cloudinary media layer, DNS and domain setup, and transactional email over Zoho SMTP — including a subscription-gated Student Resources area with a code-redemption flow. I'm also the primary debugging owner when production misbehaves.",
      result:
        'Live and actively maintained, with 1,000+ registered users and a working editorial pipeline from submission notifications through to publishing.',
    },
    links: [{ label: 'Live platform', url: 'https://theblueprintbrief.com', primary: true }],
  },
  {
    id: 'fyp',
    num: '02',
    status: 'FINAL YEAR PROJECT',
    title: 'Autonomous Navigation System',
    desc: 'Real-time lane following and obstacle avoidance on a Raspberry Pi 5 — a classical computer vision pipeline built as affordable assistive mobility tech.',
    tech: ['Python', 'OpenCV', 'NumPy', 'Raspberry Pi 5'],
    stats: [
      { val: '~10ms', label: 'mean latency' },
      { val: '~14', label: 'fps sustained' },
      { val: '100%', label: 'obstacle detection' },
    ],
    study: {
      problem:
        'Commercial assistive-mobility navigation costs £5,000+. The research question: can classical computer vision deliver the core capability for under £200 on CPU-only embedded hardware?',
      build:
        'An OpenCV pipeline on a Raspberry Pi 5 — Canny edge detection and Hough transforms for lane geometry, blob detection for obstacles, proportional steering control. Classical CV over deep learning was a deliberate call: YOLO on a Pi CPU burns 80–120ms per frame before anything else runs; blob detection lands in under 5ms and meets the reliability bar that matters for a safety-critical system.',
      result:
        'Across a 10,298-frame integration session: ~10ms average processing latency against a 200ms target, ~14 FPS sustained, 100% obstacle-detection reliability, and sub-10ms manual override — no GPU, no cloud inference.',
    },
    links: [
      { label: 'Watch demo', url: 'https://www.youtube.com/watch?v=ol9_oAe9Ogk', primary: true },
      { label: 'Repository', url: 'https://github.com/BenyaminMahamed/FINALYEARPROJECT' },
    ],
  },
  {
    id: 'lexis',
    num: '03',
    status: 'PERSONAL PROJECT',
    title: 'Lexis — AI Research Assistant',
    desc: 'A retrieval-augmented generation pipeline built from scratch — no LangChain, no abstractions. Every answer cites its exact source chunks and page numbers.',
    tech: ['FAISS', 'Sentence-Transformers', 'Gemini 2.0 Flash', 'Django', 'DRF'],
    stats: [],
    study: {
      problem:
        "LLM answers without sources aren't research tools. Lexis exists to make citations non-negotiable — grounded answers or nothing.",
      build:
        'PDFs extracted page-by-page with PyMuPDF, chunked into overlapping 500-word windows, embedded with all-MiniLM-L6-v2 (384-dim) and indexed in FAISS. Queries hit the same embedding model, run nearest-neighbour search and feed the top-k chunks to Gemini 2.0 Flash as grounded context. Served through a Django REST Framework API, with four modes: Q&A, structured summarisation, peer-review critique and multi-paper comparison.',
      result:
        'Every response surfaces the exact chunks and page numbers it drew from — no hallucination hiding behind vague answers.',
    },
    links: [{ label: 'Repository', url: 'https://github.com/BenyaminMahamed/AI-Research-Assistant', primary: true }],
  },
  {
    id: 'sky',
    num: '04',
    status: 'TEAM · FIRST CLASS · 84%',
    title: 'Sky TV Voting Platform',
    desc: 'Led a four-person team building a Django voting workflow — authentication, profile management and a portal dashboard. Selected to present to a panel of Sky engineers.',
    tech: ['Python', 'Django', 'SQL', 'JavaScript'],
    stats: [],
    study: {
      problem:
        'An end-to-end voting product built against a live Sky brief, on a term deadline, with a team of four who had never shipped together.',
      build:
        'I led the team and owned the architecture and integration: Django authentication, user profiles, the voting workflow and a portal dashboard, with SQL persistence and a JavaScript front end.',
      result:
        'Marked at First Class (84%) and selected to present the platform to a panel of Sky engineers.',
    },
    links: [{ label: 'Repository', url: 'https://github.com/simonepietraroia/Sky-TV-Project', primary: true }],
  },
]

export const STACK = [
  { group: 'Backend & Core', items: ['Python', 'Django / DRF', 'PostgreSQL', 'REST API design', 'SQL', 'Java'] },
  { group: 'AI & Computer Vision', items: ['OpenCV', 'FAISS / RAG', 'Sentence-Transformers', 'NumPy', 'Embedded / IoT'] },
  { group: 'Frontend & Tooling', items: ['JavaScript (ES6+)', 'React', 'HTML / CSS', 'Git / GitHub', 'Docker', 'Linux / Bash'] },
]

export const FACTS = [
  ['Location', 'London, UK'],
  ['Status', 'Open to junior roles'],
  ['Education', 'BSc (Hons) CS — Westminster'],
  ['Currently', 'Mac Engineer, AGK Tech'],
]