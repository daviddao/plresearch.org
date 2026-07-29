'use client'

// v2 methodology section — the counterpart to v1's MeasuringQuestions, expanded
// into three compact blocks: (1) the X→Y logic model, (2) the three questions,
// (3) the toolkit checked against history. Separate component tree from v1.

import { useEffect, useState } from 'react'
import {
  FIELD_COLOR,
  FIELD_INK,
  HAND_COLOR,
  METHODOLOGY_PARAGRAPH,
  THREE_QUESTIONS,
  TOOLKIT_FRAMING,
  TOOLKIT_V2,
  CO_FUNDER_GAPS,
  type ToolkitEntry,
} from '@/lib/field-velocity'

function Badge({ letter, color, ink = '#ffffff' }: { letter: string; color: string; ink?: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
      style={{ backgroundColor: color, color: ink }}
    >
      {letter}
    </span>
  )
}

export default function MeasuringQuestionsV2() {
  const [tool, setTool] = useState<ToolkitEntry | null>(null)

  return (
    <div className="space-y-14">
      {/* Block 1 — the X→Y logic model */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">The logic model</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              We push on <strong style={{ color: HAND_COLOR }}>conditions (X)</strong> so the{' '}
              <strong style={{ color: FIELD_COLOR }}>field accelerates (Y)</strong>. Inflection points
              are the sensors in between.
            </p>
          </div>
          <p className="text-base leading-relaxed text-gray-700">{METHODOLOGY_PARAGRAPH}</p>
        </div>
      </section>

      {/* Block 2 — the three questions */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">Three questions</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Different jobs that should not be collapsed into a single score.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {THREE_QUESTIONS.map((item, i) => {
              const isField = item.axis === 'field'
              const color = isField ? FIELD_COLOR : HAND_COLOR
              const ink = isField ? FIELD_INK : '#ffffff'
              return (
                <div key={i} className="flex flex-col rounded-xl border border-gray-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <Badge letter={String(i + 1)} color={color} ink={ink} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: item.axis === 'attribution' ? HAND_COLOR : color }}
                    >
                      {item.axis === 'field' ? 'The field' : item.axis === 'hand' ? 'Our hand' : 'Attribution'}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold leading-snug tracking-tight text-black">{item.q}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.gloss}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Block 3 — the toolkit, checked against history */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">The toolkit, checked against history</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{TOOLKIT_FRAMING}</p>
            <p className="mt-3 text-xs italic leading-relaxed text-gray-400">
              Draft — the sharpened toolkit and co-funder plan are pending Molly + FA-lead review.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TOOLKIT_V2.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTool(t)}
                  aria-haspopup="dialog"
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{t.title}</span>
                    <span className="text-xs text-gray-400">— {t.subtitle}</span>
                    {t.proposed && (
                      <span className="ml-auto rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                        Proposed
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600">{t.oneLiner}</p>
                  <p className="mt-2 text-[11px] italic leading-relaxed text-gray-400">
                    releases:{' '}
                    {t.releases.map((r, i) => (
                      <span key={i}>
                        {i > 0 ? '; ' : ''}
                        {r.label}
                        {r.conditions.length > 0 ? ` (${r.conditions.join(', ')})` : ''}
                      </span>
                    ))}
                  </p>
                  {t.coFunderGap && (
                    <span className="mt-2 inline-flex items-center gap-1 self-start text-[10px] font-medium text-gray-400 group-hover:text-blue">
                      needs co-funders →
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Co-funder gaps — the honesty / work-plan artifact */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h4 className="text-sm font-semibold text-black">Where we need co-funders</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Four insertions are only honest if partners carry part of the load. Each row is a named
                bottleneck, why PL alone falls short, and the orgs to approach first (✳ = current PL
                co-funder).
              </p>
              <ul className="mt-4 space-y-3">
                {CO_FUNDER_GAPS.map((g) => (
                  <li key={g.tool} className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-medium text-black">{g.gap}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
                        {g.tool}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{g.why}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {g.partners.map((p, i) => (
                        <span key={i}>
                          {i > 0 ? ' · ' : ''}
                          {p.name}
                          {p.current ? ' ✳' : ''}
                        </span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {tool && <ToolkitModal tool={tool} onClose={() => setTool(null)} />}
    </div>
  )
}

function ToolkitModal({ tool, onClose }: { tool: ToolkitEntry; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tool.title}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 lg:p-10"
      onClick={onClose}
    >
      <div className="relative my-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
              Toolkit
            </span>
            {tool.proposed && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                Proposed — our wildcard
              </span>
            )}
          </div>
          <h2 className="mb-1 text-2xl font-semibold leading-tight tracking-tight text-black">{tool.title}</h2>
          <div className="mb-5 text-sm text-gray-500">{tool.subtitle}</div>

          {/* Full description */}
          <p className="text-sm leading-relaxed text-gray-700">{tool.description}</p>

          {/* Releases */}
          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Releases</div>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {tool.releases.map((r, i) => (
                <span key={i}>
                  {i > 0 ? '; ' : ''}
                  {r.label}
                  {r.conditions.length > 0 ? ` (${r.conditions.join(', ')})` : ''}
                </span>
              ))}
            </p>
          </div>

          {/* What changed */}
          {tool.whatChanged && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                What changed &amp; which condition it closes
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                <span className="font-medium text-black">Insertion:</span> {tool.whatChanged.insertion}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                <span className="font-medium text-black">Condition closed:</span> {tool.whatChanged.conditionClosed}
              </p>
            </div>
          )}

          {/* Co-funder gap */}
          {tool.coFunderGap && (
            <div className="mt-4 rounded-xl border border-dashed p-4" style={{ borderColor: '#e0b489' }}>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#b06a2e' }}>
                We can&rsquo;t close this alone
              </div>
              <p className="mt-1 text-sm font-medium text-black">{tool.coFunderGap.gap}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{tool.coFunderGap.why}</p>
              <div className="mt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Candidate partners</span>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {tool.coFunderGap.partners.map((p, i) => (
                    <span key={i}>
                      {i > 0 ? ' · ' : ''}
                      {p.name}
                      {p.current ? ' ✳' : ''}
                    </span>
                  ))}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">✳ = current PL co-funder</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
