// ── Latency-compression ingestion (build-time, server only) ───────────────────
//
// Reads a curated, human-reviewable corpus of (standard -> first implementation)
// dates from src/data/velocity/corpora/ and turns it into a latency_compression
// reading, merged into a field's instrument records (see withLatency). Parsing
// happens here at build time, never in the browser. No corpus -> the instrument
// stays the documented `unwired` record.
//
// Real data only: every corpus entry carries a source URL for both the standard
// and the implementing release. We never synthesise an entry.

import fs from 'node:fs'
import path from 'node:path'
import type { FocusAreaKey } from '@/lib/inflection-points'
import type { Direction, InstrumentRecord } from '@/lib/velocity-instruments'

const CORPORA_DIR = path.join(process.cwd(), 'src', 'data', 'velocity', 'corpora')

// Which corpus file feeds which field's latency instrument.
const LATENCY_CORPUS: Partial<Record<FocusAreaKey, string>> = {
  'digital-human-rights': 'dhr-latency-crypto.json',
}

type Entry = {
  primitive: string
  standard: string
  standardDate: string
  standardUrl: string
  impl: string
  implDate: string
  implUrl: string
}
type Corpus = {
  meta: { metric?: string; referenceImplementation?: string; generated?: string }
  entries: Entry[]
}

const DAY = 24 * 60 * 60 * 1000

function yearsBetween(a: string, b: string): number | null {
  const t0 = new Date(a).getTime()
  const t1 = new Date(b).getTime()
  if (Number.isNaN(t0) || Number.isNaN(t1)) return null
  return (t1 - t0) / DAY / 365.25
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

export type LatencyPayload = {
  /** Per-standard-year median lag in years (the plotted series). */
  series: { x: number; y: number }[]
  overallMedianYears: number
  earlyMedianYears: number
  recentMedianYears: number
  splitYear: number
  n: number
  window: string
  lastImplDate: string
  direction: Direction
  generated?: string
  metric?: string
  referenceImplementation?: string
}

function toPayload(corpus: Corpus): LatencyPayload | null {
  const rows = corpus.entries
    .map((e) => {
      const lag = yearsBetween(e.standardDate, e.implDate)
      const year = new Date(e.standardDate).getUTCFullYear()
      return lag != null && Number.isFinite(year) ? { year, lag, implDate: e.implDate } : null
    })
    .filter((x): x is { year: number; lag: number; implDate: string } => x != null)
  if (rows.length < 3) return null

  // Per-standard-year median lag → a clean, monotone-x series for the sparkline.
  const byYear = new Map<number, number[]>()
  for (const r of rows) byYear.set(r.year, [...(byYear.get(r.year) ?? []), r.lag])
  const series = [...byYear.entries()]
    .map(([x, lags]) => ({ x, y: Number(median(lags).toFixed(2)) }))
    .sort((a, b) => a.x - b.x)

  // Direction from an early vs recent cohort split (falling lag = accelerating).
  // Median-based so a single implementation-led outlier cannot flip the call.
  const splitYear = 2017
  const early = rows.filter((r) => r.year <= splitYear).map((r) => r.lag)
  const recent = rows.filter((r) => r.year > splitYear).map((r) => r.lag)
  const earlyMed = early.length ? median(early) : NaN
  const recentMed = recent.length ? median(recent) : NaN
  const BAND = 0.5 // years; below this the shift is not called
  let direction: Direction = 'unclear'
  if (early.length >= 2 && recent.length >= 2 && Number.isFinite(earlyMed) && Number.isFinite(recentMed)) {
    const delta = recentMed - earlyMed
    direction = Math.abs(delta) <= BAND ? 'flat' : delta < 0 ? 'accelerating' : 'decelerating'
  }

  const years = rows.map((r) => r.year)
  const lastImplDate = rows.map((r) => r.implDate).sort().at(-1) as string
  return {
    series,
    overallMedianYears: Number(median(rows.map((r) => r.lag)).toFixed(2)),
    earlyMedianYears: Number((Number.isFinite(earlyMed) ? earlyMed : 0).toFixed(2)),
    recentMedianYears: Number((Number.isFinite(recentMed) ? recentMed : 0).toFixed(2)),
    splitYear,
    n: rows.length,
    window: `${Math.min(...years)} \u2192 ${new Date(lastImplDate).getUTCFullYear()}`,
    lastImplDate,
    direction,
    generated: corpus.meta.generated,
    metric: corpus.meta.metric,
    referenceImplementation: corpus.meta.referenceImplementation,
  }
}

function loadCorpus(file: string): LatencyPayload | null {
  try {
    const text = fs.readFileSync(path.join(CORPORA_DIR, file), 'utf8')
    return toPayload(JSON.parse(text) as Corpus)
  } catch {
    return null
  }
}

export function loadAllLatency(): Partial<Record<FocusAreaKey, LatencyPayload>> {
  const out: Partial<Record<FocusAreaKey, LatencyPayload>> = {}
  for (const [area, file] of Object.entries(LATENCY_CORPUS)) {
    const payload = loadCorpus(file)
    if (payload) out[area as FocusAreaKey] = payload
  }
  return out
}

const CORPUS_SOURCE = {
  label: 'Curated corpus: crypto standard \u2192 first OpenSSL release',
  url: 'https://github.com/protocol/plrd.org/blob/main/src/data/velocity/corpora/dhr-latency-crypto.json',
}

/** Merge a latency payload into a field's records, converting the
 *  latency_compression record to a reading. Absent payload is a no-op. */
export function withLatency(records: InstrumentRecord[], data?: LatencyPayload | null): InstrumentRecord[] {
  if (!data) return records
  return records.map((r) => {
    if (r.instrument !== 'latency_compression') return r
    return {
      instrument: 'latency_compression',
      state: 'reading',
      metric:
        data.metric ??
        'Days from a cryptographic standard (RFC / FIPS) to its first stable OpenSSL release',
      value: `Median ~${data.overallMedianYears.toFixed(1)} years, standard to first open implementation (${data.n} primitives)`,
      trend: `Early cohort (\u2264${data.splitYear}) ~${data.earlyMedianYears.toFixed(1)}y to first implementation; recent (>${data.splitYear}) ~${data.recentMedianYears.toFixed(1)}y. A falling lag means the field ships standards faster.`,
      direction: data.direction,
      window: data.window,
      measuredAt: data.lastImplDate,
      checkedAt: data.generated,
      series: data.series,
      seriesScale: 'linear',
      provenance: {
        query: `reference implementation: ${data.referenceImplementation ?? 'OpenSSL'}; standard \u2192 first stable release`,
        generated: data.generated,
      },
      sources: [
        CORPUS_SOURCE,
        { label: 'IETF Datatracker (RFC dates)', url: 'https://datatracker.ietf.org/' },
        { label: 'OpenSSL release tags', url: 'https://github.com/openssl/openssl/releases' },
      ],
    }
  })
}
