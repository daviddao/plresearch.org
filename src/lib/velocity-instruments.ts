// ── Velocity instruments — the single source of truth ─────────────────────────
//
// The five instruments we read a field's velocity with. The full description
// prose lives HERE and is rendered in exactly one place: the individual
// instrument definition modal. The aggregate "Field velocity" modal shows
// readings and charts only, and links each instrument title back here.
//
// Instrument records are declared PER FOCUS AREA and are deliberately ragged: a
// field declares only the instruments that apply to it. Where a reading is not
// live, the record is `unwired` (a named candidate metric plus its blocker) or
// `not_applicable` (a reason). We never fabricate a value, trend, date, or
// series — an honest `unwired` is a correct answer.

import type { FocusAreaKey } from '@/lib/inflection-points'
import { LIVE_COLOR } from '@/lib/inflection-points'

export type InstrumentId =
  | 'performance_curves'
  | 'latency_compression'
  | 'idea_vintage'
  | 'revealed_commitments'
  | 'markets'

export type VelocityInstrument = {
  id: InstrumentId
  label: string
  /** Short, scannable description of what the instrument is. */
  subtitle: string
  /** Fuller description — the only copy of this prose in the codebase. */
  description: string
}

// Prose moved verbatim from the previous VELOCITY_MEASURES.
export const VELOCITY_INSTRUMENTS: VelocityInstrument[] = [
  {
    id: 'performance_curves',
    label: 'Performance curves',
    subtitle: 'Cost or capability per unit, tracked over time.',
    description:
      'How much a fixed unit of output costs, or how much capability one unit buys, tracked over time: dollars per genome sequenced, per watt of solar, per kWh of battery, transistors per chip. These are real rates with units attached, and they tend to fall along steady curves, which makes them the most predictable trend in a field. The first job in each field is to find its gating unit, the single cost that everything downstream waits on.',
  },
  {
    id: 'latency_compression',
    label: 'Latency compression',
    subtitle: 'The lag between pipeline stages, and whether it is shrinking.',
    description:
      'The time it takes work to move from one stage to the next, and whether that lag is getting shorter: a preprint to a replication, a published method to a working open-source implementation, a demo to a shipped product. This tracks the pipeline itself rather than how much is flowing through it, so a shrinking lag is a direct read on acceleration.',
  },
  {
    id: 'idea_vintage',
    label: 'Idea vintage',
    subtitle: 'The age of the ideas new work builds on.',
    description:
      'How old the concepts are that new work builds on. Fast-moving fields lean on young ideas; stagnant fields keep recombining old ones. It can be computed from the text a field already produces, which makes it cheap to track over time.',
  },
  {
    id: 'revealed_commitments',
    label: 'Revealed commitments',
    subtitle: 'Where people put money and careers, not just attention.',
    description:
      'Where people actually place bets: talent switching into the field, external capital forming around it, and job postings that name the technology. Money and careers are commitments and carry more signal than press or social attention, which is easy to manufacture.',
  },
  {
    id: 'markets',
    label: 'Markets',
    subtitle: 'What forecast markets imply about when a milestone arrives.',
    description:
      'What forecast markets and prediction platforms imply about when a milestone will arrive, and whether that date is pulling in. Asking the same milestone at several time horizons gives a term structure, a kind of yield curve for a field, where an earlier implied date means expected acceleration. These need careful reading: markets can be thin, questions can resolve ambiguously, and for an org whose main channel is attention, our own work can move the very markets we are reading.',
  },
]

export const INSTRUMENT_BY_ID: Record<InstrumentId, VelocityInstrument> = Object.fromEntries(
  VELOCITY_INSTRUMENTS.map((i) => [i.id, i]),
) as Record<InstrumentId, VelocityInstrument>

// Rendered as an extra definition card alongside the five instruments in the
// methodology. Not an instrument, so it is never part of a reading record.
export const INFLECTION_EXPLAINER = {
  id: 'inflection_points',
  label: 'Inflection points',
  subtitle: 'Dated, falsifiable shifts we expect an accelerating field to produce.',
  description:
    'Alongside the five instruments, each field names a small set of inflection points: specific, dated, falsifiable shifts that an accelerating field should produce, each paired with a live signal. They are markers rather than targets. Reaching one is evidence the field is moving, and the live signal shows how close it is.',
}

// ── Instrument records ────────────────────────────────────────────────────────

export type InstrumentState = 'reading' | 'unwired' | 'not_applicable'
export type Direction = 'accelerating' | 'flat' | 'decelerating' | 'unclear'

export type InstrumentRecord = {
  instrument: InstrumentId
  state: InstrumentState

  // state: 'reading'
  metric?: string
  value?: string
  trend?: string
  direction?: Direction
  window?: string
  asOf?: string // ISO date
  /** Primary series. `lo`/`hi` drive an optional confidence band; `reliable:false`
   *  marks trailing points that render dashed and are excluded from direction. */
  series?: { x: string | number; y: number; lo?: number; hi?: number; reliable?: boolean }[]
  /** Rendering hint for the sparkline; doubling trends read best on a log axis. */
  seriesScale?: 'linear' | 'log'
  /** Optional secondary line (e.g. a normalizer), rendered dashed and muted. */
  series2?: { x: string | number; y: number }[]
  series2Label?: string
  /** Frozen provenance surfaced in the modal so a series stays self-comparable. */
  provenance?: { query?: string; generated?: string }
  sources?: { label: string; url: string }[]

  // state: 'unwired'
  candidateMetric?: string
  blocker?: string
  owner?: string

  // state: 'not_applicable'
  reason?: string
}

export const DIRECTION_META: Record<
  Direction,
  { label: string; glyph: string; color: string }
> = {
  accelerating: { label: 'Accelerating', glyph: '↗', color: LIVE_COLOR },
  flat: { label: 'Flat', glyph: '→', color: '#6b7280' },
  decelerating: { label: 'Decelerating', glyph: '↘', color: '#d0894b' },
  unclear: { label: 'Unclear', glyph: '~', color: '#9ca3af' },
}

// Per-focus-area instrument sets. Ragged by design: a field lists only the
// instruments that apply. Every `reading` is sourced; everything else is an
// honest `unwired` or `not_applicable`. See the seeding notes per field.
export const INSTRUMENT_RECORDS: Partial<Record<FocusAreaKey, InstrumentRecord[]>> = {
  'digital-human-rights': [
    {
      instrument: 'performance_curves',
      state: 'unwired',
      candidateMetric: 'Cost of verifiable storage per TB-year (Filecoin / Arweave vs. a centralized baseline)',
      blocker: 'No apples-to-apples public series exists yet across providers and durability guarantees.',
    },
    {
      instrument: 'latency_compression',
      state: 'unwired',
      candidateMetric:
        'Lag from a cryptographic primitive being published to a production open-source implementation (SNARK libraries are the cleanest series)',
      blocker: 'Needs a curated corpus of primitive-to-implementation dates before a lag can be computed.',
    },
    {
      instrument: 'idea_vintage',
      state: 'unwired',
      candidateMetric: 'Mean reference age in content-addressing and peer-to-peer literature (OpenAlex-computable)',
      blocker: 'The citation-extraction pipeline is not built.',
    },
    {
      instrument: 'revealed_commitments',
      state: 'reading',
      metric: 'Open-source crypto-ecosystem developers (a proxy for the builder base this field draws on)',
      value: '23,613 monthly active developers (Nov 2024)',
      trend: 'Total developers down ~7% year over year; established developers (2+ years) up 27%',
      direction: 'flat',
      window: '2023 → 2024',
      asOf: '2024-12-12',
      sources: [
        { label: 'Electric Capital — 2024 Developer Report', url: 'https://www.developerreport.com/developer-report' },
        {
          label: 'CoinDesk — coverage of the 2024 report',
          url: 'https://www.coindesk.com/tech/2024/12/12/solana-was-the-biggest-draw-for-new-crypto-developers-in-2024-electric-capital',
        },
      ],
    },
    {
      instrument: 'markets',
      state: 'not_applicable',
      reason:
        'No liquid forecast market prices censorship-resistant communication or stateless personhood at scale, so there is no market signal to read. The per-marker crowd-forecast white space records that gap directly.',
    },
  ],
  'economies-governance': [
    {
      instrument: 'performance_curves',
      state: 'not_applicable',
      reason:
        'Programmable allocation and governance have no single manufactured unit whose cost gates the field, so there is no performance curve to read. Cost shows up as administrative overhead, tracked under revealed commitments instead.',
    },
    {
      instrument: 'latency_compression',
      state: 'unwired',
      candidateMetric: 'Pilot-to-production lag for digital public infrastructure',
      blocker: 'Too few completed pilot-to-production transitions exist yet to time a lag.',
    },
    {
      instrument: 'idea_vintage',
      state: 'unwired',
      candidateMetric: 'Reference age in mechanism-design and public-goods-funding literature',
      blocker: 'The citation-extraction pipeline is not built.',
    },
    {
      instrument: 'revealed_commitments',
      state: 'unwired',
      candidateMetric: 'Capital moved through programmable allocation (Gitcoin, Hypercerts, retroactive funding rounds)',
      blocker: 'Figures are scattered across rounds with no single audited time series.',
    },
    {
      instrument: 'markets',
      state: 'unwired',
      candidateMetric: 'Implied arrival dates from crypto-governance and stablecoin-adoption forecast questions',
      blocker: 'Liquidity is not yet verified, and the term-structure aggregation is not built.',
    },
  ],
  'ai-robotics': [
    {
      instrument: 'performance_curves',
      state: 'reading',
      metric: '50%-task-completion time horizon on software tasks (the task length an agent finishes half the time)',
      value: 'Doubling roughly every 7 months',
      trend: '≈7-month doubling over six years',
      direction: 'accelerating',
      window: '2019 → 2025',
      asOf: '2025-03-19',
      sources: [
        {
          label: 'METR — Measuring AI Ability to Complete Long Tasks',
          url: 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/',
        },
        { label: 'arXiv:2503.14499', url: 'https://arxiv.org/abs/2503.14499' },
      ],
    },
    {
      instrument: 'latency_compression',
      state: 'unwired',
      candidateMetric: "Lag from a paper's publication to an open-weights reimplementation",
      blocker: 'Needs a curated paper-to-reimplementation corpus.',
    },
    {
      instrument: 'idea_vintage',
      state: 'unwired',
      candidateMetric: 'Reference age in decentralized-training and agent-coordination literature',
      blocker: 'The citation-extraction pipeline is not built.',
    },
    {
      instrument: 'revealed_commitments',
      state: 'unwired',
      candidateMetric:
        'Job postings naming the technology, plus the parameter scale trained on decentralized compute',
      blocker: 'No single audited public series exists yet.',
    },
    {
      instrument: 'markets',
      state: 'unwired',
      candidateMetric: 'Implied arrival date across the mapped AI milestone markets (their term structure)',
      blocker:
        'The term-structure aggregation is not built, and the reflexivity caveat bites hardest here — our own work can move these markets.',
    },
  ],
  neurotech: [
    {
      instrument: 'performance_curves',
      state: 'reading',
      metric: 'Simultaneously recorded neurons',
      value: 'Up to ~3,000 neurons (dataset record)',
      trend: 'Doubling roughly every 7 years since the 1950s',
      direction: 'accelerating',
      window: '1957 → 2022',
      asOf: '2022-10-01',
      // Frontier (running-maximum) points transcribed from the tracked dataset;
      // plotted on a log axis, which is how this doubling trend is standardly shown.
      series: [
        { x: 1957, y: 2 },
        { x: 1970, y: 8 },
        { x: 1981, y: 18 },
        { x: 1991, y: 82 },
        { x: 1993, y: 148 },
        { x: 2009, y: 744 },
        { x: 2014, y: 3200 },
      ],
      seriesScale: 'log',
      sources: [
        { label: 'Stevenson — Tracking Advances in Neural Recording (UConn)', url: 'https://stevenson.lab.uconn.edu/scaling/' },
        {
          label: 'Stevenson & Kording (2011), Nature Neuroscience',
          url: 'https://www.nature.com/articles/nn.2731',
        },
      ],
    },
    {
      instrument: 'latency_compression',
      state: 'unwired',
      candidateMetric: 'Lag from animal study to first human trial, and from IDE approval to first implant',
      blocker: 'The sample of completed transitions is too small to trend.',
    },
    {
      instrument: 'idea_vintage',
      state: 'unwired',
      candidateMetric: 'Reference age in connectomics and BCI literature',
      blocker: 'The citation-extraction pipeline is not built.',
    },
    {
      instrument: 'revealed_commitments',
      state: 'unwired',
      candidateMetric: 'Implants placed against the 10k-by-2030 milestone, and capital raised by BCI companies',
      blocker: 'Implant counts are not centrally reported, and capital figures are scattered.',
    },
    // `markets` is deliberately not declared here: the field's thin market signal
    // is already read at the marker level (the Metaculus WBE/BCI crowd forecasts),
    // so a duplicate field-level market instrument would add nothing.
  ],
}

export function instrumentsForArea(area: FocusAreaKey): InstrumentRecord[] {
  return INSTRUMENT_RECORDS[area] ?? []
}

// ── Build-time assertion ──────────────────────────────────────────────────────
// Runs when the data is imported during `next build`; a malformed record fails
// the build rather than shipping a silent gap. This is the enforcement the spec
// asks for (no test runner is configured in this repo).

export function assertInstrumentRecords(): void {
  const ids = new Set<InstrumentId>(VELOCITY_INSTRUMENTS.map((i) => i.id))
  for (const [area, records] of Object.entries(INSTRUMENT_RECORDS)) {
    const seen = new Set<InstrumentId>()
    for (const r of records ?? []) {
      const where = `${area}/${r.instrument}`
      if (!ids.has(r.instrument)) throw new Error(`velocity-instruments: unknown instrument ${where}`)
      if (seen.has(r.instrument)) throw new Error(`velocity-instruments: duplicate instrument ${where}`)
      seen.add(r.instrument)

      if (r.state === 'reading') {
        if (!r.value) throw new Error(`velocity-instruments: reading ${where} needs a value`)
        if (!r.asOf) throw new Error(`velocity-instruments: reading ${where} needs an asOf date`)
        if (!r.sources || r.sources.length < 1)
          throw new Error(`velocity-instruments: reading ${where} needs >=1 source`)
        for (const s of r.sources) {
          if (!s.url || !/^https?:\/\//.test(s.url))
            throw new Error(`velocity-instruments: reading ${where} has a source without a valid URL`)
        }
      } else if (r.state === 'unwired') {
        if (!r.candidateMetric) throw new Error(`velocity-instruments: unwired ${where} needs a candidateMetric`)
        if (!r.blocker) throw new Error(`velocity-instruments: unwired ${where} needs a blocker`)
      } else if (r.state === 'not_applicable') {
        if (!r.reason) throw new Error(`velocity-instruments: not_applicable ${where} needs a reason`)
      } else {
        throw new Error(`velocity-instruments: unknown state at ${where}`)
      }
    }
  }
}

assertInstrumentRecords()
