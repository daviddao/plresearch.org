import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { areas, publications, talks } from '@/lib/content'
import AuthorCard from '@/components/AuthorCard'

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
      {/* Hero */}
      <div className="relative pt-12 pb-10 mb-10 overflow-hidden">
        <AreaGeo slug={slug} />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          {stripFaPrefix(area.title)}
        </h1>
        {area.summary && (
          <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl mb-6">
            {area.summary}
          </p>
        )}
        {AREA_LEADS[slug] && (
          <div className="relative z-10 flex flex-wrap gap-3">
            {AREA_LEADS[slug].map((authorSlug) => (
              <AuthorCard key={authorSlug} slug={authorSlug} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {area.html && (
        <div className="mb-10 pb-10 border-b border-gray-100">
          <div className="page-content text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: area.html }} />
        </div>
      )}

      {/* Publications */}
      {areaPubs.length > 0 && (
        <div className="mb-10 pb-10 border-b border-gray-100">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Publications</h2>
          <div className="divide-y divide-gray-100">
            {areaPubs.map((p) => (
              <div key={p.slug} className="py-3">
                <Link href={`/publications/${p.slug}`} className="text-sm text-black hover:text-blue transition-colors">
                  {p.title}
                </Link>
                <div className="text-xs text-gray-400 mt-0.5">
                  {p.venue}{p.date && ` · ${new Date(p.date).getFullYear()}`}
                </div>
              </div>
            ))}
          </div>
          <Link href="/publications" className="text-xs text-blue hover:underline mt-4 inline-block">
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
              <div key={t.slug} className="py-3">
                <Link href={`/talks/${t.slug}`} className="text-sm text-black hover:text-blue transition-colors">
                  {t.title}
                </Link>
                <div className="text-xs text-gray-400 mt-0.5">
                  {t.venue}{t.date && ` · ${new Date(t.date).getFullYear()}`}
                </div>
              </div>
            ))}
          </div>
          <Link href="/talks" className="text-xs text-blue hover:underline mt-4 inline-block">
            All talks →
          </Link>
        </div>
      )}
    </div>
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
