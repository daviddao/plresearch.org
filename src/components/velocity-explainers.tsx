// Shared instrument-explainer content, so the same rich card renders whether an
// instrument is opened from the field-velocity modal or the methodology section.
// (Previously the field-velocity modal showed a short version and the
// methodology section a rich one — they must match.)

import { Sparkline, type SeriesPoint } from '@/components/VelocitySparkline'

export type IdeaVintageExample = { label: string; series: SeriesPoint[]; scale: 'linear' | 'log' }

// Small multiples + the OpenAlex methodology and its artefact caveats. Rendered
// inside the idea-vintage explainer in both places it can be opened from.
export function IdeaVintageExamples({ examples }: { examples: IdeaVintageExample[] }) {
  if (!examples.length) return null
  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <div className="text-sm font-semibold text-black">What it looks like today</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Median age of the references cited in new work, in years, per focus area on a shared axis. The
        solid line is reliable years, the shaded band is the 95% interval, and the dashed tail is the most
        recent years, still under-indexed. A lower line means the field is building on fresher ideas.
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
        <div className="text-sm font-semibold text-black">How we build this from OpenAlex</div>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          The source is OpenAlex, an open, CC0 catalogue of more than 250 million works and the reference
          lists that connect them. For each year we take a random sample of works whose title or abstract
          matches a fixed keyword query for the field, and we store that query with every series. For each
          work we read the publication year of every reference it cites, pool them, and take the median
          age, which is the work&rsquo;s year minus the reference&rsquo;s year. The shaded band is a
          bootstrap 95% interval on that median. Direction compares the mean of the earliest three reliable
          years with the most recent three, and calls a trend only once the shift clears a flat band, so
          sampling noise stays flat. Treat the number as directional.
        </p>
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="text-sm font-semibold text-black">Reading OpenAlex without its artefacts</div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          OpenAlex is a moving target: it grows and re-labels in large batches, and it lags on recent
          work. Three habits keep those artefacts out of the reading:
        </p>
        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-gray-600">
          <li className="flex gap-2">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
            <span>
              <span className="font-medium text-black">Size is not velocity.</span> We read an age, not a
              count, so a bulk addition to the catalogue (one recent backfill added on the order of 190
              million works) cannot show up as acceleration. Any instrument that does count is normalized
              against total corpus growth, as a share per 100,000 works, never a raw total.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
            <span>
              <span className="font-medium text-black">Labels drift; keywords hold.</span> We define each
              field with a fixed title-and-abstract keyword query rather than OpenAlex&rsquo;s own topic
              labels, so a large re-classification (like the 2026 backlog clearance) cannot look like a
              field taking off. Each series stores its query and the date it was pulled, and every refresh
              is a new versioned pull.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
            <span>
              <span className="font-medium text-black">Recent years lag.</span> The last two years are
              under-indexed and always look like a slowdown, so we mark them dashed, drop them from the
              direction, and compare matching year windows.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

// The named-vs-mattered framing for the inflection-points explainer.
export function InflectionQuadrant() {
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
