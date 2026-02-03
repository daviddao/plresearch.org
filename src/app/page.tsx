import Link from 'next/link'
import { publications, talks, areas } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

type UpdateItem = {
  title: string
  date: string
  type: string
  permalink: string
}

function getLatestUpdates(count: number): UpdateItem[] {
  const pubs = publications.map((p) => ({
    title: p.title || p.slug,
    date: p.date || '',
    type: 'Publication',
    permalink: `/publications/${p.slug}`,
  }))

  const talkItems = talks.map((t) => ({
    title: t.title || t.slug,
    date: t.date || '',
    type: 'Talk',
    permalink: `/talks/${t.slug}`,
  }))

  return [...pubs, ...talkItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

function getAreaDescription(slug: string): string {
  const area = areas.find((a) => a.slug === slug)
  if (!area?.summary) return ''
  return area.summary.length > 100 ? area.summary.slice(0, 100) + '...' : area.summary
}

export default function HomePage() {
  const updates = getLatestUpdates(5)

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="relative pt-12 pb-14 md:pt-20 md:pb-16 lg:pt-32 lg:pb-24" style={{ clipPath: 'inset(0 -100vw 0 0)' }}>
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

        <h1 className="relative z-10 text-[32px] md:text-[44px] lg:text-[56px] font-semibold leading-[1.1] tracking-tight mb-6">
          Driving breakthroughs in computing to push humanity forward.
        </h1>
        <p className="relative z-10 text-gray-600 text-lg md:text-xl lg:text-[22px] leading-relaxed max-w-2xl mb-8">
          Protocol Labs R&D explores the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity.
        </p>
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
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          <AreaCard 
            title="Digital Human Rights" 
            href="/areas/digital-human-rights" 
            description={getAreaDescription('digital-human-rights')}
            icon="shield"
          />
          <AreaCard 
            title="Economies & Governance" 
            href="/areas/upgrade-economies-governance" 
            description={getAreaDescription('upgrade-economies-governance')}
            icon="hexagon"
          />
          <AreaCard 
            title="AI & Robotics" 
            href="/areas/ai-robotics" 
            description={getAreaDescription('ai-robotics')}
            icon="neural"
          />
          <AreaCard 
            title="Neurotechnology" 
            href="/areas/neurotech" 
            description={getAreaDescription('neurotech')}
            icon="brain"
          />
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">Recent</h2>
        <div className="divide-y divide-gray-200">
          {updates.map((item) => (
            <div key={item.permalink} className="py-5 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
              <div className="flex items-baseline gap-4 shrink-0">
                <span className="text-base text-gray-400 w-[110px]">{formatDate(item.date)}</span>
                <span className="text-base text-gray-400 w-[90px]">{item.type}</span>
              </div>
              <Link href={item.permalink} className="text-lg text-black hover:text-blue leading-snug">
                {item.title}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link 
            href="/publications" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
          >
            All publications
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link 
            href="/talks" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
          >
            All talks
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
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

function AreaCard({ title, href, description, icon }: { title: string; href: string; description: string; icon: AreaIconType }) {
  return (
    <Link href={href} className="bg-white p-8 hover:bg-blue/[0.02] border border-transparent hover:border-blue/20 hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-start gap-5">
        <AreaIcon type={icon} />
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2 group-hover:text-blue transition-colors flex items-center gap-2">
            {title}
            <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </h3>
          <p className="text-base text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}
