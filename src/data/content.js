export const PROJECTS = [
  {
    id: 1,
    title: 'The Blueprint Brief',
    status: 'LIVE PRODUCTION',
    statusType: 'live',
    featured: true,
    tags: ['python', 'django', 'sql', 'javascript'],
    desc: 'Co-founded and solo-engineered a full-stack editorial CMS serving 1,000+ registered users in production. Backend architecture, infrastructure, DNS, and transactional email delivery.',
    stats: [
      { val: '1,000+', label: 'Registered users' },
      { val: '100%', label: 'Solo-engineered' },
    ],
    tech: ['Django', 'PostgreSQL', 'Python', 'Linux'],
    links: [{ label: 'Visit live platform', url: 'https://theblueprintbrief.com', primary: true }],
  },
  {
    id: 2,
    title: 'Autonomous Navigation System',
    status: 'FINAL YEAR DISSERTATION',
    statusType: 'diss',
    featured: false,
    tags: ['python', 'opencv', 'embedded'],
    desc: 'Real-time lane detection and obstacle avoidance on Raspberry Pi 5. Classical CV pipeline — Canny edge detection, Hough Transform, proportional steering. ~10ms latency at ~14 FPS across a 10,298-frame live session.',
    stats: [
      { val: '~14 FPS', label: 'Frame rate' },
      { val: '~10ms', label: 'Latency' },
    ],
    tech: ['Python', 'OpenCV', 'NumPy', 'Raspberry Pi 5'],
    links: [
      { label: 'Repository', url: 'https://github.com/BenyaminMahamed/FINALYEARPROJECT' },
      { label: 'Watch demo', url: 'https://www.youtube.com/watch?v=ol9_oAe9Ogk', primary: true },
    ],
  },
  {
    id: 3,
    title: 'Lexis — AI Research Assistant',
    status: 'PERSONAL PROJECT',
    statusType: 'personal',
    featured: false,
    tags: ['python', 'django', 'ai'],
    desc: 'Custom RAG pipeline built without LangChain abstractions. PDFs chunked into overlapping 500-word windows, embedded with all-MiniLM-L6-v2, indexed in FAISS. Every answer cites exact source chunks and page numbers.',
    stats: [],
    tech: ['FAISS', 'Sentence-Transformers', 'Gemini 2.0 Flash', 'Django'],
    links: [{ label: 'Repository', url: 'https://github.com/BenyaminMahamed/AI-Research-Assistant' }],
  },
  {
    id: 4,
    title: 'Sky TV Voting Platform',
    status: 'TEAM · FIRST CLASS',
    statusType: 'group',
    featured: false,
    tags: ['python', 'django', 'sql', 'javascript'],
    desc: 'Led a team of four building a Django voting workflow with authentication, profile management, and a portal dashboard. Selected to present to a panel of Sky engineers. Awarded 84% — First Class.',
    stats: [],
    tech: ['Python', 'Django', 'SQL', 'JavaScript'],
    links: [{ label: 'Repository', url: 'https://github.com/simonepietraroia/Sky-TV-Project' }],
  },
]

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'python', label: 'Python' },
  { id: 'django', label: 'Django' },
  { id: 'opencv', label: 'Computer Vision' },
  { id: 'ai', label: 'AI / RAG' },
]

export const SKILL_GROUPS = [
  {
    num: '01',
    title: 'Backend & Core',
    skills: [
      { name: 'Python', pct: 90 },
      { name: 'Django / DRF', pct: 82 },
      { name: 'PostgreSQL / SQL', pct: 72 },
      { name: 'REST API design', pct: 78 },
    ],
  },
  {
    num: '02',
    title: 'AI / Computer Vision',
    skills: [
      { name: 'OpenCV', pct: 78 },
      { name: 'FAISS / RAG', pct: 72 },
      { name: 'NumPy / SciPy', pct: 74 },
      { name: 'Embedded / IoT', pct: 65 },
    ],
  },
  {
    num: '03',
    title: 'Frontend & DevOps',
    skills: [
      { name: 'JavaScript / React', pct: 76 },
      { name: 'Git / GitHub', pct: 80 },
      { name: 'Linux / Bash', pct: 68 },
      { name: 'Java', pct: 60 },
    ],
  },
]

export const EPISODES = [
  { id: 'about', num: 'EP.01', title: 'The Wanderer' },
  { id: 'work', num: 'EP.02', title: 'The Work' },
  { id: 'arsenal', num: 'EP.03', title: 'The Arsenal' },
  { id: 'archive', num: 'EP.04', title: 'The Archive' },
  { id: 'contact', num: 'EP.05', title: 'Unfinished Business' },
]