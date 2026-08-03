'use client'

// Methodology section. Two blocks: (1) the interventions we run (the toolkit),
// and (2) field velocity as the result we watch, with the instruments we read
// it with. No sensor ledger, no historical-conditions framing — just what we do
// and what we measure.

import { useEffect, useState } from 'react'
import {
  HAND_COLOR,
  TOOLKIT_V2,
  VELOCITY_MEASURES,
  type ToolkitEntry,
} from '@/lib/field-velocity'

export default function MeasuringQuestionsV2() {
  const [tool, setTool] = useState<ToolkitEntry | null>(null)

  return (
    <div className="space-y-14">
      {/* Block 1 — the interventions (our toolkit) */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">The interventions</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              A fixed toolkit we bring to every field. Pick the ones a field is missing, then push.
            </p>
            <p className="mt-3 text-xs italic leading-relaxed text-gray-400">
              Draft — the toolkit is pending Molly + FA-lead review.
            </p>
          </div>

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
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Block 2 — field velocity, the result we watch */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">The difference they make</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              The interventions are the input. Field velocity, the rate a field is moving, is what tells
              us whether they landed. We read it in a few different ways.
            </p>
          </div>

          <div className="space-y-5">
            {VELOCITY_MEASURES.map((m) => (
              <div key={m.id} className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
                <h4 className="text-base font-semibold tracking-tight text-black">{m.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{m.body}</p>
              </div>
            ))}
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
          <p className="text-sm leading-relaxed text-gray-700">{tool.description}</p>
        </div>
      </div>
    </div>
  )
}
