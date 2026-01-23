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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 section-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-12 md:py-16">
          <div className="mb-12">
            <Link
              href="/areas/fa2-upgrade-economies-governance-systems/opportunity-spaces/"
              className="inline-flex items-center text-[10px] text-gray-400 hover:text-blue transition-colors uppercase tracking-[0.2em] group"
            >
              <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
              Opportunity Spaces
            </Link>
          </div>

          <div className="h-32 mb-10 bg-gray-100 overflow-hidden rounded-sm relative group">
            <img
              src={opp.image}
              alt={opp.title}
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 border border-black/5 pointer-events-none" />
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extralight text-almost-black mb-4 leading-tight tracking-tight">
              {opp.title}
            </h1>
            <p className="text-[11px] text-blue uppercase tracking-[0.25em] mb-10 font-medium opacity-80">
              {opp.tagline}
            </p>
            <p className="text-base text-gray-600 leading-relaxed font-light">
              {opp.description}
            </p>
          </div>
        </div>
      </section>

      {/* Key Assumptions */}
      <section className="bg-white border-b border-gray-100 section-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-16 md:py-24">
          <div className="flex items-center mb-16">
            <div className="h-[1px] w-8 bg-blue mr-4" />
            <h2 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.3em]">
              The Context
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {opp.keyAssumptions.map((assumption, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] font-bold text-blue mb-4 tracking-tighter">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed font-light border-l-2 border-blue/30 pl-6">
                  {assumption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Observations */}
      <section className="bg-white border-b border-gray-100 section-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-16 md:py-24">
          <div className="flex items-center mb-16 px-6 py-4 bg-orange-50 border border-orange-200 rounded-sm inline-flex">
            <h2 className="text-[10px] font-semibold text-orange-600 uppercase tracking-[0.3em]">
              Status Quo & Friction
            </h2>
          </div>

          <div className="space-y-12 max-w-3xl">
            {opp.observations.map((obs, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-0 top-3 w-6 h-[2px] bg-orange-500" />
                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-light italic">
                  &ldquo;{obs}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="bg-blue/5 border-b border-gray-100 relative overflow-hidden section-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-20 md:py-32 relative z-10">
          <h2 className="text-[10px] font-semibold text-blue uppercase tracking-[0.4em] mb-12">
            A New Horizon
          </h2>
          <p className="text-xl md:text-2xl text-almost-black leading-[1.5] font-light max-w-3xl tracking-tight">
            {opp.theOpportunity}
          </p>
        </div>
      </section>

      {/* Field Signals */}
      {opp.fieldSignals && (
        <section className="bg-white border-b border-gray-100 section-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="max-w-5xl mx-auto px-4 md:px-10 py-16 md:py-24">
            <div className="flex items-center mb-16">
              <div className="h-[1px] w-8 bg-emerald-500 mr-4" />
              <h2 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.3em]">
                Field Signals
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-10 max-w-2xl font-light leading-relaxed">
              Key indicators that signal progress in this opportunity space. These are
              the measurable outcomes that demonstrate meaningful advancement.
            </p>

            <div className="overflow-hidden rounded-sm border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em] w-1/3">
                      KPI
                    </th>
                    <th className="text-left py-4 px-6 text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em]">
                      Measurement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opp.fieldSignals.map((signal, i) => (
                    <tr
                      key={i}
                      className={`${i % 2 ? 'bg-gray-50/50' : 'bg-white'} border-b border-gray-100 last:border-b-0`}
                    >
                      <td className="py-4 px-6 text-sm text-gray-800 font-medium italic">
                        {signal.kpi}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-light leading-relaxed">
                        {signal.measurement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Back */}
      <section className="max-w-5xl mx-auto px-4 md:px-10 py-12 section-fade-in" style={{ animationDelay: '0.6s' }}>
        <Link
          href="/areas/fa2-upgrade-economies-governance-systems/opportunity-spaces/"
          className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-light"
        >
          ← Back to FA2 Opportunity Spaces
        </Link>
      </section>
    </div>
  )
}
