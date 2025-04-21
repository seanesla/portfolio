export interface Project {
  id: string
  name: string
  hackathon: string
  date: string
  isWinner: boolean
  award?: string
  description: string
  tech: string[]
  links: { github?: string; devpost?: string; live?: string; demo?: string }
  media?: {
    video?: string
    images?: { src: string; caption: string }[]
  }
}

export const PROJECTS: Project[] = [
  {
    id: 'sunnyview',
    name: 'sunnyview',
    hackathon: 'SFHacks 2026',
    date: 'Feb 2026',
    isWinner: true,
    award: 'Best Use of Gemini API',
    description:
      'Solar roof assessment tool — trace your roof outline, get optimal panel layout, energy production estimates, and CO2 savings.',
    tech: ['Next.js', 'TypeScript', 'Python', 'Gemini API'],
    links: {
      github: 'https://github.com/seanesla/sunnyviewSFHacks',
      devpost: 'https://devpost.com/software/sunnyview',
      live: 'https://sunnyview-sf-hacks.vercel.app',
    },
    media: {
      video: '/media/projectdemos/sunnyview/sunnyviewdemo.mp4',
      images: [{ src: '/media/projectdemos/sunnyview/sunnyviewlanding.png', caption: 'landing page' }],
    },
  },
  {
    id: 'realibuddy',
    name: 'Realibuddy',
    hackathon: 'HackCC Fall 2025',
    date: 'Nov 2025',
    isWinner: true,
    award: 'Best AI/ML',
    description:
      'AI voice coach that listens in real-time — Deepgram transcribes, Perplexity fact-checks, Pavlok shocks you when you\'re wrong.',
    tech: ['Node.js', 'TypeScript', 'Deepgram', 'Perplexity AI', 'Pavlok API', 'WebSocket'],
    links: {
      github: 'https://github.com/seanesla/Realibuddy',
      devpost: 'https://devpost.com/software/pavshock',
    },
    media: {
      video: '/media/projectdemos/realibuddy/demo.mp4',
    },
  },
  {
    id: 'norot',
    name: 'noRot',
    hackathon: 'Hack For Humanity 2026',
    date: 'Mar 2026',
    isWinner: false,
    description:
      'Desktop distraction tracker with escalating AI voice nudges and real-time focus scoring.',
    tech: ['Electron', 'React', 'TypeScript', 'FastAPI', 'Three.js', 'Gemini AI', 'ElevenLabs'],
    links: {
      github: 'https://github.com/Safkatul-Islam/noRot',
      devpost: 'https://devpost.com/software/norot-zp04sh',
    },
    media: {
      video: '/media/projectdemos/noRot/demo.mp4',
      images: [{ src: '/media/projectdemos/noRot/noRotdashboard.jpg', caption: 'focus dashboard' }],
    },
  },
  {
    id: 'kanari',
    name: 'kanari',
    hackathon: 'Google Gemini 3 Hackathon',
    date: 'Feb 2026',
    isWinner: false,
    description:
      'Burnout forecaster — AI voice check-ins analyze acoustic biomarkers to predict crash risk 3–7 days out.',
    tech: ['Next.js', 'React', 'Gemini 3', 'Web Audio API', 'IndexedDB'],
    links: {
      github: 'https://github.com/seanesla/kanari',
      devpost: 'https://devpost.com/software/kanari-catch-the-crash-before-it-hits',
      live: 'https://kanari.space',
    },
    media: {
      video: '/media/projectdemos/kanari/demo.mp4',
    },
  },
  {
    id: 'ryn',
    name: 'Ryn',
    hackathon: 'Kiroween',
    date: 'Dec 2025',
    isWinner: false,
    description:
      'Local-first SOC 2 compliance scanner with regex + AI analysis, one-click fixes, and embedded LSP.',
    tech: ['Rust', 'Tauri', 'Tree-sitter', 'Next.js', 'SQLite', 'Claude API'],
    links: {
      devpost: 'https://devpost.com/software/ryn-soc-2-compliance-scanner',
      demo: 'https://ryn-tau.vercel.app/',
    },
    media: {
      video: '/media/projectdemos/ryn/demo.mp4',
    },
  },
  {
    id: 'water-quality',
    name: 'Water Quality Prediction',
    hackathon: 'AI4ALL Ignite Capstone',
    date: 'Oct–Dec 2025',
    isWinner: false,
    description:
      'ML-powered water quality index from ZIP code using USGS/EPA data, Random Forest + SHAP explainability.',
    tech: ['Python', 'Streamlit', 'scikit-learn', 'SHAP'],
    links: {
      github: 'https://github.com/seanesla/group11C',
      live: 'https://seanesla.github.io/group11C/',
    },
    media: {
      video: '/media/projectdemos/waterqualitypredictor/ai4alldemovideo.mp4',
      images: [{ src: '/media/projectdemos/waterqualitypredictor/screenshotofwaterqualitypredictorsite.png', caption: 'prediction results' }],
    },
  },
]
