import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import ImpactDashboardV2 from '@/components/ImpactDashboardV2'
import MeasuringQuestionsV2 from '@/components/MeasuringQuestionsV2'
import { resolveAllSignals } from '@/lib/market-signals'
import { FIELD_COLOR, HAND_COLOR } from '@/lib/field-velocity'

// v2 of the impact dashboard — acceleration-centered. Reuses the same live
// crowd-forecast integration as v1 (resolveAllSignals) on the field axis.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Impact (v2 — acceleration)',
  description:
    'A draft reframe of the impact dashboard: the target is field acceleration itself, measured by a velocity basket per focus area. Inflection points are demoted to pre-registered sensors.',
}

export default async function ImpactV2Page() {
  const marketSignals = await resolveAllSignals()
  return (
    <div>
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Breadcrumb items={[{ label: 'Impact (v2)' }]} />
        <div className="pt-8 pb-10">
          <span className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Draft for review · acceleration reframe
          </span>
          <h1 className="text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-2xl">
            Is the field accelerating?
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            The target is <strong className="font-semibold text-black">field acceleration itself</strong> —
            measured by a basket of velocity signals per focus area. Our{' '}
            <strong className="font-semibold" style={{ color: HAND_COLOR }}>inflection points</strong> are
            demoted to <strong className="font-semibold text-black">pre-registered sensors</strong>: dated,
            falsifiable markers we expect acceleration to produce. Being wrong about a marker is a logged
            learning event, not a failure — the markers stay on the board.
          </p>
          <a
            href="#methodology"
            className="mt-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-[15px]"
          >
            How we read this
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          {/* Low-key cross-link back to the original methodology (v2 only). */}
          <p className="mt-4 text-[13px] text-gray-400">
            Original methodology (inflection-point framing):{' '}
            <a href="/impact/" className="underline decoration-dotted underline-offset-2 hover:text-gray-700">
              /impact
            </a>
          </p>
        </div>
      </div>

      {/* Dashboard — grey full-bleed section to set it apart from the rest of the site */}
      <section className="border-y border-gray-200 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">
            Field acceleration, focus area by focus area
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-8">
            Select a focus area. The field card leads with the velocity basket — is the field moving
            faster — then lists our inflection-point sensors. The hand card shows the conditions we are
            pushing on, and whether they moved.
          </p>
          <ImpactDashboardV2 marketSignals={marketSignals} />
        </div>
      </section>

      {/* Methodology */}
      <div id="methodology" className="max-w-6xl mx-auto px-6 py-14 lg:py-16 scroll-mt-24">
        <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">Our methodology</h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-10">
          Three questions we hold apart — the field (
          <strong className="font-semibold" style={{ color: FIELD_COLOR }}>Y</strong>), our hand (
          <strong className="font-semibold" style={{ color: HAND_COLOR }}>X</strong>), and the attribution
          that connects them.
        </p>
        <MeasuringQuestionsV2 />
      </div>
    </div>
  )
}
