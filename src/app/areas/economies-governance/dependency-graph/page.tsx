import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Dependency Graph',
  description: 'Strategic dependency trees mapping inflection points through bottlenecks, decision gates, program strands, and interventions.',
}

const CARDS = [
  { num: '01', title: 'Sovereign Digital Public Infrastructure', sub: 'Nation-state runs core systems on crypto-rails with measurable advantage', slug: 'sovereign-dpi', color: '#B07D10' },
  { num: '02', title: 'Public Goods Funding', sub: 'AI/crypto-native PGF allocates capital at billion-dollar scale', slug: 'public-goods-funding', color: '#7C52C9' },
  { num: '03', title: 'Governance & Democracy', sub: 'Crypto governance adopted as institutional necessity', slug: 'governance-democracy', color: '#1982F4' },
  { num: '04', title: 'Climate Infrastructure', sub: 'DePIN climate projects coordinate at planetary scale', slug: 'climate-infrastructure', color: '#2D8A50' },
]

export default function DependencyGraphPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Areas', href: '/areas' },
          { label: 'Economies & Governance', href: '/areas/economies-governance' },
          { label: 'Dependency Graph' },
        ]}
      />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl lg:text-[36px] font-semibold mb-3">Dependency Graph</h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
          Each inflection point visualized as an interactive force-directed graph —
          from bottlenecks and checkpoints to program strands and interventions.
          Click any node to explore.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS.map((card) => (
          <Link
            key={card.slug}
            href={`/areas/economies-governance/dependency-graph/${card.slug}`}
            className="flex bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Left color accent bar */}
            <div className="w-1 flex-shrink-0" style={{ backgroundColor: card.color }} />
            <div className="p-6">
              <div className="text-sm font-semibold mb-2" style={{ color: card.color }}>
                IP {card.num}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
