import Link from 'next/link'
import type { Metadata } from 'next'
import opportunityData from '@/data/fa2/opportunityspaces.json'

export const metadata: Metadata = {
  title: 'Opportunity Spaces',
  description: 'Convergence zones where multiple subfields unite to create transformative opportunities for FA2.',
}

export default function OpportunitySpacesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">
              Focus Area 2
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-almost-black mb-6 leading-tight tracking-tight">
              {opportunityData.meta.title}
            </h1>
            <p className="text-base text-gray-600 leading-relaxed font-light">
              {opportunityData.meta.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-12 md:py-16">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-10">
            Opportunity Spaces
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {opportunityData.opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/areas/fa2-upgrade-economies-governance-systems/opportunity-spaces/${opp.id}/`}
                className="group block"
              >
                <div className="h-32 mb-5 bg-gray-100 overflow-hidden">
                  <img
                    src={opp.image}
                    alt={opp.title}
                    className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  />
                </div>

                <h3 className="text-lg font-light text-almost-black mb-2 group-hover:text-blue transition-colors">
                  {opp.title}
                </h3>

                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">
                  {opp.tagline}
                </p>

                <p className="text-sm text-gray-500 leading-relaxed mb-4 font-light">
                  {opp.description.slice(0, 200)}...
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {opp.subfields.map((sf) => (
                    <span
                      key={sf}
                      className="text-[8px] px-2 py-1 bg-gray-900 text-white uppercase tracking-wider"
                    >
                      {sf}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Back */}
      <section className="max-w-5xl mx-auto px-4 md:px-10 py-12">
        <Link
          href="/areas/fa2-upgrade-economies-governance-systems/"
          className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-light"
        >
          ← Back to FA2
        </Link>
      </section>
    </div>
  )
}
