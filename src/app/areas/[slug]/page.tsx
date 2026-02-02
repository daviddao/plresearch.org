import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { areas, publications, talks } from '@/lib/content'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'

type Props = { params: Promise<{ slug: string }> }

const HARDCODED_AREA_SLUGS = ['upgrade-economies-governance']

const AREA_LEADS: Record<string, string[]> = {
  'digital-human-rights': ['will-scott'],
  'ai-robotics': ['molly-mackinlay'],
  'neurotech': ['sean-escola'],
}

function stripFaPrefix(title: string): string {
  return title.replace(/^FA\d+:\s*/, '')
}

export function generateStaticParams() {
  return areas
    .filter((a) => !HARDCODED_AREA_SLUGS.includes(a.slug))
    .map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const area = areas.find((a) => a.slug === slug)
  if (!area) return { title: 'Not Found' }
  return { title: stripFaPrefix(area.title), description: area.summary }
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params
  const area = areas.find((a) => a.slug === slug)
  if (!area) notFound()

  const areaPubs = publications.filter((p) => p.areas.includes(slug)).slice(0, 8)
  const areaTalks = talks.filter((t) => t.areas.includes(slug)).slice(0, 6)

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Focus Areas', href: '/areas/' }, { label: stripFaPrefix(area.title) }]} />
      {/* Hero */}
      <div className="relative pt-8 pb-12 mb-12 overflow-hidden">
        <AreaGeo slug={slug} />
        <div className="flex items-start gap-5 mb-6">
          <AreaIcon slug={slug} />
          <h1 className="relative z-10 text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight max-w-xl">
            {stripFaPrefix(area.title)}
          </h1>
        </div>
        {area.summary && (
          <p className="relative z-10 text-lg text-gray-600 leading-relaxed max-w-2xl mb-8">
            {area.summary}
          </p>
        )}
        {AREA_LEADS[slug] && (
          <div className="relative z-10 flex flex-wrap gap-4">
            {AREA_LEADS[slug].map((authorSlug) => (
              <AuthorCard key={authorSlug} slug={authorSlug} variant="lead" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {area.html && (
        <div className="mb-12 pb-12 border-b border-gray-100">
          <div className="page-content text-base text-gray-700 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: area.html }} />
        </div>
      )}

      {/* Publications */}
      {areaPubs.length > 0 && (
        <div className="mb-12 pb-12 border-b border-gray-100">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Publications</h2>
          <div className="divide-y divide-gray-100">
            {areaPubs.map((p) => (
              <div key={p.slug} className="py-4">
                <Link href={`/publications/${p.slug}`} className="text-base text-black hover:text-blue transition-colors">
                  {p.title}
                </Link>
                <div className="text-sm text-gray-400 mt-1">
                  {p.venue}{p.date && ` · ${new Date(p.date).getFullYear()}`}
                </div>
              </div>
            ))}
          </div>
          <Link href="/publications" className="text-sm text-blue hover:underline mt-6 inline-block">
            All publications →
          </Link>
        </div>
      )}

      {/* Talks */}
      {areaTalks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Talks</h2>
          <div className="divide-y divide-gray-100">
            {areaTalks.map((t) => (
              <div key={t.slug} className="py-4">
                <Link href={`/talks/${t.slug}`} className="text-base text-black hover:text-blue transition-colors">
                  {t.title}
                </Link>
                <div className="text-sm text-gray-400 mt-1">
                  {t.venue}{t.date && ` · ${new Date(t.date).getFullYear()}`}
                </div>
              </div>
            ))}
          </div>
          <Link href="/talks" className="text-sm text-blue hover:underline mt-6 inline-block">
            All talks →
          </Link>
        </div>
      )}
    </div>
  )
}

function AreaIcon({ slug }: { slug: string }) {
  const baseClass = "w-14 h-14 lg:w-16 lg:h-16 shrink-0 text-blue/70"
  
  switch (slug) {
    case 'digital-human-rights':
      return <ShieldIcon className={baseClass} />
    case 'ai-robotics':
      return <NeuralIcon className={baseClass} />
    case 'neurotech':
      return <BrainIcon className={baseClass} />
    default:
      return <HexagonIcon className={baseClass} />
  }
}

// Digital Human Rights - Shield with grid pattern
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 4L6 10V18C6 26.8 12 34.4 20 36C28 34.4 34 26.8 34 18V10L20 4Z"
        className="stroke-current"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      >
        <animate attributeName="stroke-dasharray" values="0 100;100 0" dur="2s" fill="freeze" />
      </path>
      <line x1="14" y1="14" x2="26" y2="14" className="stroke-current" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
      </line>
      <line x1="14" y1="20" x2="26" y2="20" className="stroke-current" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </line>
      <line x1="14" y1="26" x2="26" y2="26" className="stroke-current" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" begin="1s" />
      </line>
      <line x1="20" y1="10" x2="20" y2="30" className="stroke-current" strokeWidth="1" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" begin="0.25s" />
      </line>
    </svg>
  )
}

// Economies & Governance - Hexagon network
function HexagonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <polygon
        points="20,6 30,12 30,24 20,30 10,24 10,12"
        className="stroke-current"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      >
        <animateTransform attributeName="transform" type="rotate" values="0 20 18;360 20 18" dur="30s" repeatCount="indefinite" />
      </polygon>
      <circle cx="20" cy="6" r="2" className="fill-current" opacity="0.6">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="12" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="30" cy="24" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="20" cy="30" r="2" className="fill-current" opacity="0.6">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" begin="0.9s" />
      </circle>
      <circle cx="10" cy="24" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="1.2s" />
      </circle>
      <circle cx="10" cy="12" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="20" cy="18" r="3" className="stroke-current" strokeWidth="1" fill="none" opacity="0.5">
        <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// AI & Robotics - Neural network / branching tree
function NeuralIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="8" r="3" className="fill-current" opacity="0.7">
        <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <line x1="20" y1="11" x2="12" y2="20" className="stroke-current" strokeWidth="1.5" opacity="0.6" />
      <line x1="20" y1="11" x2="28" y2="20" className="stroke-current" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="20" r="2.5" className="fill-current" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="28" cy="20" r="2.5" className="fill-current" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <line x1="12" y1="22.5" x2="8" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="22.5" x2="16" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="22.5" x2="24" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="22.5" x2="32" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="0.9s" />
      </circle>
      <circle cx="16" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="1.2s" />
      </circle>
      <circle cx="24" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="32" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="1.8s" />
      </circle>
    </svg>
  )
}

// Neurotechnology - Brain waves / neural connections
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <ellipse cx="20" cy="18" rx="14" ry="12" className="stroke-current" strokeWidth="1.5" fill="none" opacity="0.6">
        <animate attributeName="ry" values="11;13;11" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <path d="M10 18 Q 15 14, 20 18 T 30 18" className="stroke-current" strokeWidth="1" fill="none" opacity="0.5">
        <animate attributeName="d" values="M10 18 Q 15 14, 20 18 T 30 18;M10 18 Q 15 22, 20 18 T 30 18;M10 18 Q 15 14, 20 18 T 30 18" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M12 14 Q 17 10, 22 14 T 28 14" className="stroke-current" strokeWidth="1" fill="none" opacity="0.4">
        <animate attributeName="d" values="M12 14 Q 17 10, 22 14 T 28 14;M12 14 Q 17 18, 22 14 T 28 14;M12 14 Q 17 10, 22 14 T 28 14" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </path>
      <path d="M12 22 Q 17 26, 22 22 T 28 22" className="stroke-current" strokeWidth="1" fill="none" opacity="0.4">
        <animate attributeName="d" values="M12 22 Q 17 26, 22 22 T 28 22;M12 22 Q 17 18, 22 22 T 28 22;M12 22 Q 17 26, 22 22 T 28 22" dur="3s" repeatCount="indefinite" begin="1s" />
      </path>
      <circle cx="14" cy="18" r="1.5" className="fill-current" opacity="0.6">
        <animate attributeName="cx" values="14;26;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <line x1="20" y1="30" x2="20" y2="36" className="stroke-current" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="36" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function AreaGeo({ slug }: { slug: string }) {
  const cls = "absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"

  if (slug === 'digital-human-rights') {
    // Grid/lattice pattern suggesting digital infrastructure
    return (
      <svg className={cls} viewBox="0 0 700 500" fill="none" aria-hidden="true">
        <rect x="400" y="80" width="120" height="120" stroke="#C3E1FF" strokeWidth="0.75" />
        <rect x="520" y="200" width="100" height="100" stroke="#C3E1FF" strokeWidth="0.75" />
        <rect x="380" y="240" width="80" height="80" stroke="#C3E1FF" strokeWidth="0.75" />
        <rect x="460" y="340" width="110" height="110" stroke="#C3E1FF" strokeWidth="0.75" />
        <line x1="460" y1="140" x2="570" y2="250" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="520" y1="200" x2="460" y2="280" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="460" y1="320" x2="515" y2="340" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="400" y1="200" x2="520" y2="200" stroke="#C3E1FF" strokeWidth="0.5" />
        <circle cx="460" cy="140" r="3" fill="#C3E1FF" />
        <circle cx="520" cy="200" r="3" fill="#C3E1FF" />
        <circle cx="460" cy="280" r="3" fill="#C3E1FF" />
        <circle cx="570" cy="250" r="3" fill="#C3E1FF" />
        <circle cx="515" cy="340" r="3" fill="#C3E1FF" />
      </svg>
    )
  }

  if (slug === 'ai-robotics') {
    // Branching tree pattern suggesting neural networks / AI
    return (
      <svg className={cls} viewBox="0 0 700 500" fill="none" aria-hidden="true">
        <circle cx="500" cy="100" r="40" stroke="#C3E1FF" strokeWidth="0.75" />
        <circle cx="420" cy="220" r="30" stroke="#C3E1FF" strokeWidth="0.75" />
        <circle cx="580" cy="200" r="35" stroke="#C3E1FF" strokeWidth="0.75" />
        <circle cx="380" cy="350" r="25" stroke="#C3E1FF" strokeWidth="0.75" />
        <circle cx="470" cy="370" r="28" stroke="#C3E1FF" strokeWidth="0.75" />
        <circle cx="560" cy="340" r="32" stroke="#C3E1FF" strokeWidth="0.75" />
        <circle cx="620" cy="400" r="20" stroke="#C3E1FF" strokeWidth="0.75" />
        <line x1="500" y1="140" x2="420" y2="190" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="500" y1="140" x2="580" y2="165" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="420" y1="250" x2="380" y2="325" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="420" y1="250" x2="470" y2="342" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="580" y1="235" x2="560" y2="308" stroke="#C3E1FF" strokeWidth="0.5" />
        <line x1="580" y1="235" x2="620" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
        <circle cx="500" cy="100" r="3" fill="#C3E1FF" />
        <circle cx="420" cy="220" r="3" fill="#C3E1FF" />
        <circle cx="580" cy="200" r="3" fill="#C3E1FF" />
        <circle cx="380" cy="350" r="3" fill="#C3E1FF" />
        <circle cx="470" cy="370" r="3" fill="#C3E1FF" />
        <circle cx="560" cy="340" r="3" fill="#C3E1FF" />
        <circle cx="620" cy="400" r="3" fill="#C3E1FF" />
      </svg>
    )
  }

  if (slug === 'neurotech') {
    // Organic curved paths suggesting neural pathways
    return (
      <svg className={cls} viewBox="0 0 700 500" fill="none" aria-hidden="true">
        <ellipse cx="480" cy="150" rx="60" ry="45" stroke="#C3E1FF" strokeWidth="0.75" />
        <ellipse cx="560" cy="280" rx="50" ry="40" stroke="#C3E1FF" strokeWidth="0.75" />
        <ellipse cx="420" cy="320" rx="55" ry="35" stroke="#C3E1FF" strokeWidth="0.75" />
        <ellipse cx="520" cy="420" rx="45" ry="38" stroke="#C3E1FF" strokeWidth="0.75" />
        <path d="M 480 195 Q 520 230 560 240" stroke="#C3E1FF" strokeWidth="0.5" fill="none" />
        <path d="M 450 185 Q 420 250 420 285" stroke="#C3E1FF" strokeWidth="0.5" fill="none" />
        <path d="M 540 310 Q 530 360 520 382" stroke="#C3E1FF" strokeWidth="0.5" fill="none" />
        <path d="M 440 350 Q 470 380 500 400" stroke="#C3E1FF" strokeWidth="0.5" fill="none" />
        <circle cx="480" cy="150" r="3" fill="#C3E1FF" />
        <circle cx="560" cy="280" r="3" fill="#C3E1FF" />
        <circle cx="420" cy="320" r="3" fill="#C3E1FF" />
        <circle cx="520" cy="420" r="3" fill="#C3E1FF" />
        <circle cx="480" cy="195" r="2" fill="#C3E1FF" />
        <circle cx="560" cy="240" r="2" fill="#C3E1FF" />
      </svg>
    )
  }

  // Default fallback
  return (
    <svg className={cls} viewBox="0 0 700 500" fill="none" aria-hidden="true">
      <circle cx="480" cy="130" r="70" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="560" cy="250" r="50" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="400" cy="260" r="90" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="520" cy="380" r="55" stroke="#C3E1FF" strokeWidth="1" />
      <line x1="480" y1="130" x2="560" y2="250" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="560" y1="250" x2="520" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="400" y1="260" x2="480" y2="130" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="400" y1="260" x2="520" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="480" cy="130" r="3" fill="#C3E1FF" />
      <circle cx="560" cy="250" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="260" r="3" fill="#C3E1FF" />
      <circle cx="520" cy="380" r="3" fill="#C3E1FF" />
    </svg>
  )
}
