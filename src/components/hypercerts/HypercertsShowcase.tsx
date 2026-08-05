'use client'

// Focus-area filter bubbles over the hypercert carousel. Today every live
// claim is Economies & Governance; the other focus areas have none yet, so
// selecting them shows a "Coming soon" panel instead of the coverflow. Only
// used on the Impact preview (funding enabled).

import { useState } from 'react'
import type { Hypercert } from '@/data/hypercerts'
import { ImpactExperience } from '@/components/hypercerts/ImpactExperience'
import { FOCUS_AREAS, type FocusAreaKey } from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

// Which focus areas have live hypercerts today.
const LIVE: Record<FocusAreaKey, boolean> = {
  'digital-human-rights': false,
  'economies-governance': true,
  'ai-robotics': false,
  neurotech: false,
}

export function HypercertsShowcase({ certs }: { certs: Hypercert[] }) {
  const [area, setArea] = useState<FocusAreaKey>('economies-governance')
  const meta = FOCUS_AREAS.find((f) => f.key === area)
  const accent = meta?.accent ?? '#1982F4'
  const live = LIVE[area]

  return (
    <div>
      {/* Filter bubbles */}
      <div className="mb-7 flex flex-wrap gap-2">
        {FOCUS_AREAS.map((fa) => {
          const active = area === fa.key
          const has = LIVE[fa.key]
          return (
            <button
              key={fa.key}
              type="button"
              aria-pressed={active}
              onClick={() => setArea(fa.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                active
                  ? 'shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-black'
              }`}
              style={
                active
                  ? { borderColor: accent, color: accent, background: `${accent}12` }
                  : undefined
              }
            >
              <AreaIcon type={FA_ICON[fa.key]} className="h-3.5 w-3.5" />
              {fa.label}
              {!has && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                    active ? 'bg-white/70 text-gray-500' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  Soon
                </span>
              )}
            </button>
          )
        })}
      </div>

      {live ? (
        <ImpactExperience certs={certs} detailVariant="modal" showFunding />
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-20 text-center"
          style={{ borderColor: `${accent}59`, background: `linear-gradient(160deg, ${accent}12, transparent 70%)` }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: `${accent}1f`, color: accent }}
          >
            <AreaIcon type={FA_ICON[area]} className="h-7 w-7" />
          </span>
          <div
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
            style={{ borderColor: `${accent}66`, color: accent }}
          >
            Coming soon
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-black">
            No {meta?.label} claims yet
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            We haven&apos;t recorded {meta?.label} hypercerts yet. As PL R&amp;D backs work in this field,
            its impact claims will show up here — verifiable, and fundable.
          </p>
        </div>
      )}
    </div>
  )
}
