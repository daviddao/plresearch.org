import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import opportunityData from '@/data/fa2/opportunityspaces.json'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return opportunityData.opportunities.map((opp) => ({
    slug: opp.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const opp = opportunityData.opportunities.find((o) => o.id === slug)
  if (!opp) return { title: 'Not Found' }
  return {
    title: opp.title,
    description: opp.description.slice(0, 160),
  }
}

export default async function OpportunityDetailPage({ params }: Props) {
  const { slug } = await params
  const opp = opportunityData.opportunities.find((o) => o.id === slug)
  if (!opp) notFound()

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      {/* Breadcrumb */}
      <Link
        href="/areas/upgrade-economies-governance/opportunity-spaces/"
        className="text-xs text-gray-400 hover:text-black transition-colors mb-8 inline-block"
      >
        ← Opportunity Spaces
      </Link>

      {/* Hero */}
      <div className="relative pt-12 pb-10 mb-10 overflow-hidden">
        <OppGeo />
        <h1 className="relative z-10 text-xl lg:text-[36px] font-semibold leading-[1.15] tracking-tight mb-3 max-w-lg">
          {opp.title}
        </h1>
        {opp.tagline && (
          <p className="relative z-10 text-sm text-gray-400 mb-4">{opp.tagline}</p>
        )}
        <p className="relative z-10 text-sm text-gray-600 leading-relaxed max-w-xl">{opp.description}</p>

        {/* Subfields */}
        {opp.subfields.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-2 mt-5">
            {opp.subfields.map((sf) => (
              <span key={sf} className="text-[10px] text-gray-400 border border-gray-200 px-2 py-0.5 rounded-sm">
                {sf}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Inflection Point */}
      {opp.inflectionPoint && (
        <div className="mb-10 pb-10 border-b border-gray-100">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Inflection Point</h2>
          <p className="text-sm text-black leading-relaxed font-medium mb-5">{opp.inflectionPoint}</p>

          {opp.shift && (
            <div className="border-l-2 border-blue/40 pl-4 mb-5">
              <p className="text-sm text-gray-600 italic">{opp.shift}</p>
            </div>
          )}

          {opp.tippingSignals && opp.tippingSignals.length > 0 && (
            <div>
              <h3 className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">Tipping Signals</h3>
              <div className="flex flex-wrap gap-1.5">
                {opp.tippingSignals.map((signal, i) => (
                  <span key={i} className="text-[11px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-sm">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* The Opportunity (vision) */}
      {opp.theOpportunity && (
        <div className="mb-10 pb-10 border-b border-gray-100">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">The Opportunity</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{opp.theOpportunity}</p>
        </div>
      )}

      {/* Context & Friction side by side */}
      <div className="mb-10 pb-10 border-b border-gray-100 grid md:grid-cols-2 gap-10">
        {/* Context */}
        {opp.keyAssumptions.length > 0 && (
          <div>
            <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Context</h2>
            <div className="space-y-3">
              {opp.keyAssumptions.map((assumption, i) => (
                <p key={i} className="text-xs text-gray-600 leading-relaxed">{assumption}</p>
              ))}
            </div>
          </div>
        )}

        {/* Friction */}
        {opp.observations.length > 0 && (
          <div>
            <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Friction</h2>
            <div className="space-y-3">
              {opp.observations.map((obs, i) => (
                <p key={i} className="text-xs text-gray-600 leading-relaxed">{obs}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Field Signals */}
      {opp.fieldSignals && opp.fieldSignals.length > 0 && (
        <div>
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Field Signals</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {opp.fieldSignals.map((signal, i) => (
              <div key={i} className="border-l-2 border-gray-100 pl-4 py-1">
                <span className="text-xs font-medium text-black">{signal.kpi}</span>
                <p className="text-[11px] text-gray-400 mt-0.5">{signal.measurement}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OppGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="500" cy="120" r="65" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="580" cy="260" r="50" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="420" cy="300" r="70" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="540" cy="400" r="45" stroke="#C3E1FF" strokeWidth="1" />
      <line x1="500" y1="120" x2="580" y2="260" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="260" x2="540" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="420" y1="300" x2="500" y2="120" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="420" y1="300" x2="540" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="500" y1="120" x2="540" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="500" cy="120" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="260" r="3" fill="#C3E1FF" />
      <circle cx="420" cy="300" r="3" fill="#C3E1FF" />
      <circle cx="540" cy="400" r="3" fill="#C3E1FF" />
    </svg>
  )
}
