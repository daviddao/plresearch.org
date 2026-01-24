import Link from 'next/link'
import { sections, publications, talks, tutorials } from '@/lib/content'

export const metadata = { title: 'Research' }

export default function ResearchPage() {
  const section = sections.research
  const recentPubs = publications.slice(0, 10)

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
      {/* Hero */}
      <div className="relative pt-12 pb-10 mb-10 overflow-hidden">
        <PageGeo />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          {section?.title || 'Research'}
        </h1>
        <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl">
          Exploring the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity.
        </p>
      </div>

      {/* Subpages */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResearchCard
            href="/publications"
            title="Publications"
            description="Papers and articles advancing the frontiers of decentralized systems, cryptography, and more."
            count={publications.length}
          />
          <ResearchCard
            href="/talks"
            title="Talks"
            description="Presentations and lectures from conferences and events around the world."
            count={talks.length}
          />
          <ResearchCard
            href="/tutorials"
            title="Tutorials"
            description="In-depth guides and educational materials on core research topics."
            count={tutorials.length}
          />
        </div>
      </div>

      {/* Content */}
      {section?.html && (
        <div className="mb-10 pb-10 border-b border-gray-100">
          <div className="page-content text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.html }} />
        </div>
      )}

      {/* Recent Publications */}
      {recentPubs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Recent Publications</h2>
          <div className="divide-y divide-gray-100">
            {recentPubs.map((p) => (
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
    </div>
  )
}

function ResearchCard({ href, title, description, count }: { href: string; title: string; description: string; count: number }) {
  return (
    <Link href={href} className="border border-gray-300 p-6 hover:border-blue hover:shadow-sm transition-all block">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <span className="text-xs text-gray-400">{count} entries</span>
    </Link>
  )
}

function PageGeo() {
  // Overlapping triangles suggesting exploration/discovery
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <polygon points="480,80 580,250 380,250" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="520,180 620,350 420,350" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="450,260 550,430 350,430" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="480" y1="80" x2="520" y2="180" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="250" x2="620" y2="350" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="420" y1="350" x2="450" y2="260" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="480" cy="80" r="3" fill="#C3E1FF" />
      <circle cx="520" cy="180" r="3" fill="#C3E1FF" />
      <circle cx="450" cy="260" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="250" r="3" fill="#C3E1FF" />
      <circle cx="620" cy="350" r="3" fill="#C3E1FF" />
    </svg>
  )
}
