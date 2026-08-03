'use client'

// Methodology section. Two blocks joined by a downward divider that reads as
// "these interventions drive the below": (1) the PL R&D interventions (the
// toolkit), and (2) observed field velocity, the five instruments we read the
// result with. Both the toolkit tools and the velocity instruments open modals.

import { useEffect, useState } from 'react'
import { HAND_COLOR, FIELD_COLOR, TOOLKIT_V2, type ToolkitEntry } from '@/lib/field-velocity'
import { VELOCITY_INSTRUMENTS, INFLECTION_EXPLAINER } from '@/lib/velocity-instruments'
import { Sparkline, type SeriesPoint } from '@/components/VelocitySparkline'

type DefEntry = { id: string; label: string; subtitle: string; description: string }
export type IdeaVintageExample = { label: string; series: SeriesPoint[]; scale: 'linear' | 'log' }
type Modal =
  | { kind: 'tool'; entry: ToolkitEntry }
  | { kind: 'measure'; entry: DefEntry }

export default function MeasuringQuestionsV2({
  ideaVintageExamples = [],
}: {
  ideaVintageExamples?: IdeaVintageExample[]
}) {
  const [modal, setModal] = useState<Modal | null>(null)

  return (
    <div>
      {/* Block 1 — the interventions (our toolkit) */}
      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
              Our hand
            </div>
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
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
              The field
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-black">Observed velocity</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              The interventions are the input. Field velocity, the rate a field is moving, is what tells
              us whether they landed. We read it through five instruments.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Not every instrument fits every field. A field with no single gating unit cost has no
              performance curve to read, and a field no forecast market has priced has no market signal.
              We show the instruments that apply and name the ones that do not.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[...VELOCITY_INSTRUMENTS, INFLECTION_EXPLAINER].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModal({ kind: 'measure', entry: m })}
                aria-haspopup="dialog"
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm"
              >
                <span className="mb-1 text-sm font-semibold text-black">{m.label}</span>
                <p className="text-xs leading-relaxed text-gray-600">{m.subtitle}</p>
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-gray-400">
            These instruments read the research and capital sides of a field. They do not observe
            invention directly &mdash; prototypes, designs, datasets, and negative results largely lack
            identifiers to count. Closing that gap is itself part of the work.
          </p>
        </div>
      </section>

      {modal && (
        <InfoModal modal={modal} ideaVintageExamples={ideaVintageExamples} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

// Abbreviated named-vs-mattered framing for the inflection-points modal.
function InflectionQuadrant() {
  const quad = (title: string, body: string, tone: string) => (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="text-[11px] font-semibold" style={{ color: tone }}>{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{body}</p>
    </div>
  )
  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <div className="text-sm font-semibold text-black">What got named vs. what actually mattered</div>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">
        Two independent axes. <span className="font-medium text-black">Named in advance</span>: was this the
        milestone the field, its funders, and its press had publicly designated as the thing to watch?{' '}
        <span className="font-medium text-black">Mattered</span>: did crossing it measurably change the
        field&rsquo;s trajectory &mdash; cost curves, entry rates, capital formation, deployment?
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quad('Named · mattered', 'The good case. Prediction and consequence aligned; a public call was gradeable and correct.', '#16a34a')}
        {quad('Named · didn’t matter', 'Trap 1: the hit that doesn’t lift. The sensor resolves true, the field doesn’t move. Pair every marker with a “did it matter” test.', '#dc2626')}
        {quad('Not named · mattered', 'Trap 2: acceleration through a door nobody was watching. Only a continuous velocity basket catches it.', '#d0894b')}
        {quad('Not named · didn’t matter', 'Noise. Not interesting, but where most events live — which is why precision matters.', '#6b7280')}
      </div>

      <div className="mt-4 space-y-1.5 text-xs leading-relaxed text-gray-600">
        <p><span className="font-medium text-black">Named &amp; mattered:</span> the $1,000 genome (2014); AlphaFold&nbsp;2 at CASP14 (2020) &mdash; a named unit-cost or benchmark that was also the field&rsquo;s rate-limiter.</p>
        <p><span className="font-medium text-black">Named, didn&rsquo;t matter:</span> Watson wins Jeopardy! (2011); Deep Blue (1997) &mdash; staged demos that didn&rsquo;t bend the trajectory.</p>
        <p><span className="font-medium text-black">Unnamed, mattered:</span> AlexNet (2012), transformers (2017), HTS fusion magnets at 20&nbsp;T (2021) &mdash; the largest recent accelerations, none on a roadmap.</p>
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
        <div className="mb-1 font-semibold text-black">What it implies for the dashboard</div>
        <p>Six of eleven canonical cases sit in the two trap quadrants. So: named markers can&rsquo;t be the only instrument (the velocity basket catches unnamed acceleration); prefer cost thresholds and capability curves over demos; and write a &ldquo;did it matter&rdquo; test next to every marker.</p>
      </div>
    </div>
  )
}

function IdeaVintageExamples({ examples }: { examples: IdeaVintageExample[] }) {
  if (!examples.length) return null
  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <div className="text-sm font-semibold text-black">What it looks like today</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Median age of the references cited in new work, in years, per focus area on a shared axis. The
        solid line is reliable years; the shaded band is the 95% interval; the dashed tail is the most
        recent years, still under-indexed. Lower means the field is building on fresher ideas.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {examples.map((e) => (
          <div key={e.label} className="rounded-lg border border-gray-200 p-3">
            <div className="mb-1 text-xs font-medium text-black">{e.label}</div>
            <Sparkline series={e.series} scale={e.scale} band width={220} height={60} axis unit="y" />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-black">How the chart is built</div>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          For each year we draw a random sample of works whose title or abstract matches a frozen keyword
          query for the field (the query is recorded with every series). For each sampled work we look up
          the publication year of every reference it cites, then pool those and take the median age (the
          work&rsquo;s year minus the reference&rsquo;s year). The band is a bootstrap 95% interval on that
          median. The direction compares the mean of the earliest three reliable years against the most
          recent three, and only calls a trend when the shift clears a flat band, so sampling noise reads
          as flat. It is a sampled estimate, comparable against itself, not a precise census.
        </p>
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="text-sm font-semibold text-black">What we guard against in OpenAlex</div>
        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-gray-600">
          <li>
            <span className="font-medium text-black">Size is not velocity.</span> We read an age, not a
            count, so OpenAlex adding works in bulk (a recent backfill added on the order of 190M) does not
            register as acceleration. Where an instrument uses counts, we normalize against total corpus
            growth (share per 100k), never raw totals.
          </li>
          <li>
            <span className="font-medium text-black">Labels drift; keywords don&rsquo;t.</span> Fields are
            defined by a frozen title-and-abstract keyword query, not OpenAlex topic labels, so a large
            re-classification (such as the 2026 backlog clearance) cannot look like a field taking off.
            Every series stores its exact query and retrieval date, and each re-pull is versioned.
          </li>
          <li>
            <span className="font-medium text-black">Recent years lag.</span> The last two years or so are
            under-indexed and always look like a slowdown, so we draw them dashed, leave them out of the
            direction, and compare like year-over-year windows.
          </li>
        </ul>
      </div>
    </div>
  )
}

function InfoModal({
  modal,
  ideaVintageExamples,
  onClose,
}: {
  modal: Modal
  ideaVintageExamples: IdeaVintageExample[]
  onClose: () => void
}) {
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
  const title = isTool ? modal.entry.title : modal.entry.label
  const subtitle = modal.entry.subtitle
  const proposed = isTool ? modal.entry.proposed : false
  const description = modal.entry.description
  const researchSide =
    modal.kind === 'measure' &&
    (modal.entry.id === 'idea_vintage' || modal.entry.id === 'revealed_commitments')
  const isIdeaVintage = modal.kind === 'measure' && modal.entry.id === 'idea_vintage'
  const isInflection = modal.kind === 'measure' && modal.entry.id === 'inflection_points'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 lg:p-10"
      onClick={onClose}
    >
      <div className="relative my-4 w-full max-w-3xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
          {researchSide && (
            <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm italic leading-relaxed text-gray-500">
              This reads the research side of the field. It does not observe invention directly, and the
              two can decouple.
            </p>
          )}
          {isIdeaVintage && <IdeaVintageExamples examples={ideaVintageExamples} />}
          {isInflection && <InflectionQuadrant />}
        </div>
      </div>
    </div>
  )
}
