import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import ImpactDashboardV2 from '@/components/ImpactDashboardV2'
import MeasuringQuestionsV2 from '@/components/MeasuringQuestionsV2'
import { resolveAllSignals } from '@/lib/market-signals'

// The impact page reads field velocity: our interventions on the left, the rate
// each field is moving on the right, with the live crowd forecasts folded in.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Impact',
  description:
    'How we judge PL R&D: whether the fields we back are speeding up. We name the interventions we run, then read field velocity from talent, capital, tool cost, output cadence, and live forecasts.',
}

export default async function ImpactPage() {
  const marketSignals = await resolveAllSignals()
  return (
    <div>
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Breadcrumb items={[{ label: 'Impact' }]} />
        <div className="pt-8 pb-10">
          <span className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Draft for review
          </span>
          <h1 className="text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-2xl">
            Is the field accelerating?
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            We back fields we think are ready to move, then check whether they do.{' '}
            <strong className="font-semibold text-black">Field velocity</strong> is that rate of change:
            how fast talent enters, capital forms, tool costs fall, output ships, and the{' '}
            <strong className="font-semibold text-black">inflection points</strong> we named come true.
            Inflection points are one of the markers we read, dated and falsifiable shifts an
            accelerating field should produce.
          </p>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            The way we measure velocity is the same research design as the work itself. How we do field
            acceleration is a research program, and testing whether it works is research that runs across
            all four focus areas.
          </p>
          <a
            href="#methodology"
            className="mt-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-[15px]"
          >
            How we measure this
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Field velocity — grey full-bleed section to set it apart from the rest of the site */}
      <section className="border-y border-gray-200 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">Field velocity</h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-8">
            Pick a focus area. On the left is our hand, the interventions we are pushing with. On the
            right is the field&rsquo;s velocity and the live signals we read.
          </p>
          <ImpactDashboardV2 marketSignals={marketSignals} />
        </div>
      </section>

      {/* Methodology */}
      <div id="methodology" className="max-w-6xl mx-auto px-6 py-14 lg:py-16 scroll-mt-24">
        <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">Our methodology</h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-10">
          The method is the meta-research design of how we do field acceleration. We name the
          interventions we run, then read field velocity as the result. Same design, every focus area.
        </p>
        <MeasuringQuestionsV2 />
      </div>
    </div>
  )
}
