import Link from 'next/link'
import { publications, talks } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { AreaIcon } from '@/components/AreaIcons'

type UpdateItem = {
  title: string
  date: string
  type: string
  permalink: string
  slug: string
  areas: string[]
}

function getLatestUpdates(count: number): UpdateItem[] {
  const pubs = publications.map((p) => ({
    title: p.title || p.slug,
    date: p.date || '',
    type: 'Publication',
    permalink: `/publications/${p.slug}`,
    slug: p.slug,
    areas: p.areas || [],
  }))

  const talkItems = talks.map((t) => ({
    title: t.title || t.slug,
    date: t.date || '',
    type: 'Talk',
    permalink: `/talks/${t.slug}`,
    slug: t.slug,
    areas: (t.areas || []).filter(Boolean) as string[],
  }))

  return [...pubs, ...talkItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

// Deterministic pseudo-random from a string seed
function seededRand(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return (n: number) => {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0
    return (((h ^ (h >>> 16)) >>> 0) / 0xffffffff) * n
  }
}

// Area → gradient pair (matches site palette)
const AREA_GRADIENTS: Record<string, [string, string]> = {
  'distributed-systems':  ['#1e40af', '#3b82f6'],
  'cryptography':         ['#1d4ed8', '#60a5fa'],
  'networking':           ['#1e3a8a', '#2563eb'],
  'consensus':            ['#1e40af', '#7c3aed'],
  'knowledge-systems':    ['#0f766e', '#0ea5e9'],
  'ai-robotics':          ['#7c3aed', '#a78bfa'],
  'neurotech':            ['#6d28d9', '#c084fc'],
  'economies-governance': ['#0369a1', '#38bdf8'],
  'digital-human-rights': ['#1e3a8a', '#6366f1'],
}

function getGradient(areas: string[]): [string, string] {
  for (const a of areas) {
    const key = Object.keys(AREA_GRADIENTS).find(k => a.toLowerCase().includes(k.replace(/-/g, '')) || k.includes(a.toLowerCase().replace(/\s/g, '-')))
    if (key) return AREA_GRADIENTS[key]
  }
  return ['#1e3a8a', '#3b82f6']
}

function CardIllustration({ slug, areas }: { slug: string; areas: string[] }) {
  const rand = seededRand(slug)
  const [c1, c2] = getGradient(areas)
  const id = `grad-${slug.replace(/[^a-z0-9]/g, '')}`

  // Generate 2–3 shapes: polygon, circle, ellipse
  const shapes = [
    // Large background polygon (half-cropped off right edge like ARIA)
    {
      type: 'polygon' as const,
      points: (() => {
        const cx = 260 + rand(60)
        const cy = 30 + rand(30)
        const r = 90 + rand(40)
        const sides = Math.floor(3 + rand(4)) // 3–6 sides
        return Array.from({ length: sides }, (_, i) => {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
          return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
        }).join(' ')
      })(),
      opacity: 0.55,
      dur: `${6 + rand(4)}s`,
      dy: 8 + rand(6),
    },
    // Medium circle
    {
      type: 'circle' as const,
      cx: 80 + rand(120),
      cy: 40 + rand(50),
      r: 30 + rand(30),
      opacity: 0.35,
      dur: `${5 + rand(5)}s`,
      dy: 6 + rand(8),
    },
    // Small accent polygon
    {
      type: 'polygon' as const,
      points: (() => {
        const cx = 40 + rand(200)
        const cy = 20 + rand(60)
        const r = 15 + rand(20)
        const sides = Math.floor(3 + rand(3))
        return Array.from({ length: sides }, (_, i) => {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 6
          return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
        }).join(' ')
      })(),
      opacity: 0.25,
      dur: `${4 + rand(4)}s`,
      dy: 10 + rand(8),
    },
  ]

  return (
    <svg
      viewBox="0 0 320 120"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect width="320" height="120" />
        </clipPath>
      </defs>
      {/* Background */}
      <rect width="320" height="120" fill={`url(#${id})`} />
      {/* Shapes clipped to card */}
      <g clipPath={`url(#clip-${id})`} fill="white">
        {shapes.map((s, i) =>
          s.type === 'circle' ? (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fillOpacity={s.opacity}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; 0,${-s.dy}; 0,0`}
                dur={s.dur}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              />
            </circle>
          ) : (
            <polygon key={i} points={s.points} fillOpacity={s.opacity}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; 0,${-s.dy}; 0,0`}
                dur={s.dur}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              />
            </polygon>
          )
        )}
      </g>
    </svg>
  )
}


export default function HomePage() {
  const updates = getLatestUpdates(8)

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="relative pt-20 pb-20 md:pt-32 md:pb-28 lg:pt-44 lg:pb-36" style={{ clipPath: 'inset(0 -100vw 0 0)' }}>
        {/* Hero banner image - extends to screen edge */}
        <div 
          className="absolute top-1/2 -translate-y-[60%] h-[140%] pointer-events-none select-none"
          style={{
            right: 'calc(-50vw + 50%)',
            width: '70vw',
            backgroundImage: 'url(/images/hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.35,
            maskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <h1 className="relative z-10 font-serif text-[36px] md:text-[52px] lg:text-[64px] font-normal leading-[1.1] tracking-tight mb-8">
          Driving R&D breakthroughs to push humanity forward.
        </h1>
        <div className="relative z-10 flex flex-wrap gap-4">
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
          >
            About us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link 
            href="/areas" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
          >
            Focus areas
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="relative z-10 mt-16 lg:mt-24">
          <svg className="w-6 h-6 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>

      {/* R&D approach section */}
      <div className="pb-20 lg:pb-28 border-t border-gray-200 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight mb-6">
              Use-inspired research across four frontiers
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-10">
              We work in <a href="https://en.wikipedia.org/wiki/Pasteur%27s_quadrant" target="_blank" rel="noopener noreferrer" className="text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700 transition-colors">Pasteur&apos;s Quadrant</a> — pursuing fundamental understanding while staying anchored to real-world impact. Our four focus areas span the most consequential frontiers in computing, society, and human cognition.
            </p>

          </div>
          <div className="flex flex-col lg:sticky lg:top-24 gap-4">
            <Link href="/areas/digital-human-rights" className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group">
              <AreaIcon type="shield" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black group-hover:text-blue transition-colors mb-1">Digital Human Rights</div>
                <div className="text-sm text-gray-500 leading-relaxed">Building decentralized infrastructure that enshrines freedom and safety in the digital age.</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/areas/economies-governance" className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group">
              <AreaIcon type="hexagon" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black group-hover:text-blue transition-colors mb-1">Economies &amp; Governance</div>
                <div className="text-sm text-gray-500 leading-relaxed">Crypto-native tools for more efficient, equitable coordination at global scale.</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/areas/ai-robotics" className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group">
              <AreaIcon type="neural" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black group-hover:text-blue transition-colors mb-1">AI &amp; Robotics</div>
                <div className="text-sm text-gray-500 leading-relaxed">Responsible advancement in AGI, robotics, and immersive technologies that reshape how we interact with the world.</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/areas/neurotech" className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group">
              <AreaIcon type="brain" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black group-hover:text-blue transition-colors mb-1">Neurotechnology</div>
                <div className="text-sm text-gray-500 leading-relaxed">Accelerating brain-computer interfaces and NeuroAI to expand human cognition and treat brain disorders.</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>



      {/* Latest from PL R&D — horizontal scroll cards */}
      <div className="pb-20 lg:pb-28">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide">Insights from PL R&amp;D</h2>
          <div className="flex gap-4">
            <Link
              href="/publications"
              className="text-sm text-gray-400 hover:text-blue transition-colors"
            >
              Publications
            </Link>
            <Link
              href="/talks"
              className="text-sm text-gray-400 hover:text-blue transition-colors"
            >
              Talks
            </Link>
          </div>
        </div>
        {/* Scroll track — bleeds to the right edge of the viewport */}
        <div
          className="flex gap-5 overflow-x-auto pb-6 -mr-6"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {updates.map((item) => (
            <Link
              key={item.permalink}
              href={item.permalink}
              className="group flex-none w-[280px] md:w-[300px] flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue transition-all duration-200"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Illustration */}
              <div className="overflow-hidden">
                <CardIllustration slug={item.slug} areas={item.areas} />
              </div>
              {/* Content */}
              <div className="flex flex-col flex-1 justify-between p-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 group-hover:bg-blue/10 group-hover:text-blue transition-colors">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="text-sm font-medium text-black leading-snug group-hover:text-blue transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-blue transition-colors">
                  Read more
                  <svg className="w-3.5 h-3.5 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
          {/* Trailing spacer so last card doesn't sit flush against viewport edge */}
          <div className="flex-none w-2" aria-hidden="true" />
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Team</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mb-6">
          A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity.
        </p>
        <Link 
          href="/authors" 
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
        >
          Meet the team
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}


