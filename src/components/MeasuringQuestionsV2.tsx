'use client'

// Methodology section. Two blocks joined by a downward divider that reads as
// "these interventions drive the below": (1) the PL R&D interventions (the
// toolkit), and (2) observed field velocity, the five instruments we read the
// result with. Both the toolkit tools and the velocity instruments open modals.

import { useEffect, useState } from 'react'
import {
  HAND_COLOR,
  FIELD_COLOR,
  TOOLKIT_V2,
  VELOCITY_MEASURES,
  type ToolkitEntry,
  type VelocityMeasure,
} from '@/lib/field-velocity'

type Modal =
  | { kind: 'tool'; entry: ToolkitEntry }
  | { kind: 'measure'; entry: VelocityMeasure }

export default function MeasuringQuestionsV2() {
  const [modal, setModal] = useState<Modal | null>(null)

  return (
    <div>
      {/* Block 1 — the interventions (our toolkit) */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">PL R&amp;D interventions</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              A fixed toolkit we bring to every field. Pick the ones a field is missing, then push.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOOLKIT_V2.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setModal({ kind: 'tool', entry: t })}
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

      {/* Downward divider — interventions drive the observed velocity below. */}
      <div className="relative my-12" aria-hidden>
        <div className="border-t border-gray-200" />
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {/* Block 2 — observed field velocity, the result we watch */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">Observed field velocity</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              The interventions are the input. Field velocity, the rate a field is moving, is what tells
              us whether they landed. We read it through five instruments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VELOCITY_MEASURES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModal({ kind: 'measure', entry: m })}
                aria-haspopup="dialog"
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm"
              >
                <span className="mb-1 text-sm font-semibold text-black">{m.title}</span>
                <p className="text-xs leading-relaxed text-gray-600">{m.oneLiner}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {modal && <InfoModal modal={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

function InfoModal({ modal, onClose }: { modal: Modal; onClose: () => void }) {
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

  const isTool = modal.kind === 'tool'
  const eyebrow = isTool ? 'Intervention' : 'Field velocity'
  const eyebrowColor = isTool ? HAND_COLOR : FIELD_COLOR
  const title = modal.entry.title
  const subtitle = isTool ? modal.entry.subtitle : undefined
  const proposed = isTool ? modal.entry.proposed : false
  const description = modal.entry.description

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: eyebrowColor }}>
              {eyebrow}
            </span>
            {proposed && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                Proposed — our wildcard
              </span>
            )}
          </div>
          <h2 className="mb-1 text-2xl font-semibold leading-tight tracking-tight text-black">{title}</h2>
          {subtitle && <div className="mb-5 text-sm text-gray-500">{subtitle}</div>}
          <p className={`${subtitle ? '' : 'mt-4 '}text-sm leading-relaxed text-gray-700`}>{description}</p>
        </div>
      </div>
    </div>
  )
}
