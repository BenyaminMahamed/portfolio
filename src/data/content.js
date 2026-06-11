export const STAGES = [
  { id: 'input', num: 'SYS.01', title: 'Input' },
  { id: 'detections', num: 'SYS.02', title: 'Detections' },
  { id: 'weights', num: 'SYS.03', title: 'Weights' },
  { id: 'buffer', num: 'SYS.04', title: 'Buffer' },
  { id: 'transmit', num: 'SYS.05', title: 'Transmit' },
]

export const PROJECTS = [
  {
    id: 1,
    title: 'The Blueprint Brief',
    conf: '0.99',
    status: 'LIVE PRODUCTION',
    statusType: 'live',
    featured: true,
    tags: ['python', 'django', 'sql', 'javascript'],
    desc: 'Co-founded and engineered a full-stack editorial CMS serving 1,000+ registered users in production. Backend architecture, infrastructure, DNS, and transactional email delivery.',
    stats: [
      { val: '1,000+', label: 'registered_users' },
    ],
    tech: ['Django', 'PostgreSQL', 'Python', 'Linux'],
    links: [{ label: 'Live platform', url: 'https://theblueprintbrief.com', primary: true }],
  },
  {
    id: 2,
    title: 'Autonomous Navigation System',
    conf: '0.97',
    status: 'FINAL YEAR DISSERTATION',
    statusType: 'diss',
    featured: false,
    tags: ['python', 'opencv', 'embedded'],
    desc: 'Real-time lane detection and obstacle avoidance on Raspberry Pi 5. Classical CV pipeline — Canny edge detection, Hough Transform, proportional steering. The system this site is modelled on.',
    stats: [
      { val: '~14', label: 'fps' },
      { val: '~10ms', label: 'latency' },
      { val: '10,298', label: 'frames' },
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
    conf: '0.95',
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
    conf: '0.92',
    status: 'TEAM · FIRST CLASS · 84%',
    statusType: 'group',
    featured: false,
    tags: ['python', 'django', 'sql', 'javascript'],
    desc: 'Led a team of four building a Django voting workflow with authentication, profile management, and a portal dashboard. Selected to present to a panel of Sky engineers.',
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
    num: 'W.01',
    title: 'Backend & Core',
    skills: [
      { name: 'Python', pct: 90 },
      { name: 'Django / DRF', pct: 82 },
      { name: 'PostgreSQL / SQL', pct: 72 },
      { name: 'REST API design', pct: 78 },
    ],
  },
  {
    num: 'W.02',
    title: 'AI / Computer Vision',
    skills: [
      { name: 'OpenCV', pct: 78 },
      { name: 'FAISS / RAG', pct: 72 },
      { name: 'NumPy / SciPy', pct: 74 },
      { name: 'Embedded / IoT', pct: 65 },
    ],
  },
  {
    num: 'W.03',
    title: 'Frontend & DevOps',
    skills: [
      { name: 'JavaScript / React', pct: 76 },
      { name: 'Git / GitHub', pct: 80 },
      { name: 'Linux / Bash', pct: 68 },
      { name: 'Java', pct: 60 },
    ],
  },
]

export const CONTACT_LINKS = [
  { platform: 'email', handle: 'benyaminmahamed@gmail.com', url: 'mailto:benyaminmahamed@gmail.com' },
  { platform: 'github', handle: 'BenyaminMahamed', url: 'https://github.com/BenyaminMahamed' },
  { platform: 'linkedin', handle: 'benyamin-mahamed', url: 'https://www.linkedin.com/in/benyamin-mahamed/' },
  { platform: 'live_platform', handle: 'theblueprintbrief.com', url: 'https://theblueprintbrief.com' },
]