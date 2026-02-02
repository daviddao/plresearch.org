import Link from 'next/link'
import type { Metadata } from 'next'
import opportunityData from '@/data/fa2/opportunityspaces.json'

export const metadata: Metadata = {
  title: 'Opportunity Spaces',
  description: 'Convergence zones where multiple subfields unite to create transformative opportunities.',
}

export default function OpportunitySpacesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      {/* Breadcrumb */}
      <Link
        href="/areas/upgrade-economies-governance/"
        className="text-xs text-gray-400 hover:text-black transition-colors mb-8 inline-block"
      >
        ← Economies & Governance
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-lg font-semibold mb-2">{opportunityData.meta.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
          {opportunityData.meta.subtitle}
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-px bg-gray-200">
        {opportunityData.opportunities.map((opp) => (
          <Link
            key={opp.id}
            href={`/areas/upgrade-economies-governance/opportunity-spaces/${opp.id}/`}
            className="bg-white p-6 hover:bg-gray-50 transition-colors relative overflow-hidden group"
          >
            <OppCardGeo />
            {opp.image && (
              <div className="h-24 mb-4 bg-gray-100 overflow-hidden rounded-sm">
                <img
                  src={opp.image}
                  alt={opp.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            )}
            <h3 className="relative z-10 font-medium text-black group-hover:text-blue transition-colors mb-1">
              {opp.title}
            </h3>
            {opp.tagline && (
              <p className="relative z-10 text-xs text-gray-400 mb-2">{opp.tagline}</p>
            )}
            <p className="relative z-10 text-sm text-gray-600 leading-relaxed mb-3">
              {opp.description.slice(0, 140)}...
            </p>
            {opp.subfields.length > 0 && (
              <div className="relative z-10 flex flex-wrap gap-1">
                {opp.subfields.map((sf) => (
                  <span key={sf} className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-sm">
                    {sf}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function OppCardGeo() {
  return (
    <svg
      className="absolute right-2 top-2 w-14 h-14 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 ease-out pointer-events-none select-none"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="24" stroke="#C3E1FF" strokeWidth="0.75" strokeDasharray="3 2" />
      <circle cx="30" cy="30" r="16" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="30" cy="6" r="2" fill="#C3E1FF" />
      <circle cx="54" cy="30" r="2" fill="#C3E1FF" />
      <circle cx="6" cy="30" r="2" fill="#C3E1FF" />
      <line x1="30" y1="6" x2="30" y2="14" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="46" y1="30" x2="54" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="6" y1="30" x2="14" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
    </svg>
  )
}
