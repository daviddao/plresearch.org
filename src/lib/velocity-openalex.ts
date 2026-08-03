// ── OpenAlex CSV ingestion (build-time, server only) ──────────────────────────
//
// Parses one CSV per focus area written by scripts/velocity/field_velocity_openalex.py
// and turns it into a serializable OpenAlexArea payload merged into the instrument
// records (see withOpenAlex). Parsing happens here, at build time, never in the
// browser. If a field has no CSV, this returns null and the instrument stays the
// documented `unwired` record.
//
// CSV contract:
//   Leading `#` lines are provenance (generated timestamp, source, the frozen
//   query string, the reliability cutoff year, sampling parameters). Then:
//   year,field_works,all_works,corpus_share_per_100k,first_time_authors,
//   idea_vintage_median_years,vintage_ci_lo,vintage_ci_hi,n_refs_sampled,reliable

import fs from 'node:fs'
import path from 'node:path'
import type { FocusAreaKey } from '@/lib/inflection-points'
import type { Direction, OpenAlexArea } from '@/lib/velocity-instruments'
import { ideaVintageDirection, trailingSlope, windowMeans } from '../../scripts/velocity/vintage-direction.mjs'

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'velocity')
const AREA_SLUGS: FocusAreaKey[] = [
  'digital-human-rights',
  'economies-governance',
  'ai-robotics',
  'neurotech',
]

type Row = {
  year: number
  corpusShare: number | null
  firstTimeAuthors: number | null
  median: number | null
  ciLo: number | null
  ciHi: number | null
  reliable: boolean
}

function num(s: string | undefined): number | null {
  if (s == null) return null
  const t = s.trim()
  if (t === '' || t.toLowerCase() === 'na' || t.toLowerCase() === 'null') return null
  const v = Number(t)
  return Number.isFinite(v) ? v : null
}

function parseCsv(text: string): { provenance: Record<string, string>; raw: string[]; rows: Row[] } {
  const lines = text.split(/\r?\n/)
  const provenance: Record<string, string> = {}
  const raw: string[] = []
  const rows: Row[] = []
  let header: string[] | null = null

  for (const line of lines) {
    if (!line.trim()) continue
    if (line.startsWith('#')) {
      raw.push(line)
      const m = line.replace(/^#\s*/, '')
      const idx = m.indexOf(':')
      if (idx > -1) {
        const key = m.slice(0, idx).trim().toLowerCase()
        provenance[key] = m.slice(idx + 1).trim()
      }
      continue
    }
    const cols = line.split(',')
    if (!header) {
      header = cols.map((c) => c.trim())
      continue
    }
    const get = (name: string) => cols[header!.indexOf(name)]
    const year = num(get('year'))
    if (year == null) continue
    const reliableRaw = (get('reliable') ?? '').trim().toLowerCase()
    rows.push({
      year,
      corpusShare: num(get('corpus_share_per_100k')),
      firstTimeAuthors: num(get('first_time_authors')),
      median: num(get('idea_vintage_median_years')),
      ciLo: num(get('vintage_ci_lo')),
      ciHi: num(get('vintage_ci_hi')),
      reliable: reliableRaw === '1' || reliableRaw === 'true',
    })
  }
  return { provenance, raw, rows }
}

/** Loosely find a provenance value by trying several key spellings. */
function prov(provenance: Record<string, string>, keys: string[]): string | undefined {
  for (const k of Object.keys(provenance)) {
    if (keys.some((want) => k.includes(want))) return provenance[k]
  }
  return undefined
}

/** Direction of a rising-is-good count series (talent entry). */
function countDirection(points: { x: number; y: number }[]): Direction {
  const slope = trailingSlope(points)
  if (slope == null) return 'unclear'
  const mean = points.slice(-5).reduce((a, p) => a + p.y, 0) / Math.min(points.length, 5)
  const rel = mean > 0 ? (slope * 5) / mean : slope
  if (rel > 0.05) return 'accelerating'
  if (rel < -0.05) return 'decelerating'
  return 'flat'
}

function toPayload(parsed: ReturnType<typeof parseCsv>): OpenAlexArea {
  const { provenance, rows } = parsed
  const query = prov(provenance, ['query', 'search'])
  const generated = prov(provenance, ['generated', 'timestamp', 'date'])

  // idea vintage
  const vintageRows = rows.filter((r) => r.median != null)
  const series = vintageRows.map((r) => ({
    x: r.year,
    y: r.median as number,
    lo: r.ciLo ?? undefined,
    hi: r.ciHi ?? undefined,
    reliable: r.reliable,
  }))
  const reliableVintage = vintageRows.filter((r) => r.reliable)
  const reliablePts = reliableVintage.map((r) => ({ x: r.year, y: r.median as number }))
  const latestReliable = reliableVintage.length
    ? reliableVintage[reliableVintage.length - 1]
    : null
  const wm = reliablePts.length >= 2 ? windowMeans(reliablePts, 3) : null
  const ideaVintage = series.length
    ? {
        series,
        latest: latestReliable ? { year: latestReliable.year, median: latestReliable.median as number } : null,
        early: wm ? { mean: wm.early, from: wm.earlyRange[0] as number, to: wm.earlyRange[1] as number } : null,
        recent: wm ? { mean: wm.late, from: wm.lateRange[0] as number, to: wm.lateRange[1] as number } : null,
        reliableWindow: reliableVintage.length
          ? `${reliableVintage[0].year}\u2013${reliableVintage[reliableVintage.length - 1].year}`
          : '\u2014',
        direction: ideaVintageDirection(reliablePts) as Direction,
        query,
        generated,
      }
    : undefined

  // revealed commitments (talent entry + corpus-share normalizer)
  const entrants = rows
    .filter((r) => r.firstTimeAuthors != null && r.reliable)
    .map((r) => ({ x: r.year, y: r.firstTimeAuthors as number }))
  const corpusShare = rows
    .filter((r) => r.corpusShare != null && r.reliable)
    .map((r) => ({ x: r.year, y: r.corpusShare as number }))
  const latestEntrant = entrants.length ? entrants[entrants.length - 1] : null
  const revealed = entrants.length
    ? {
        entrants,
        corpusShare,
        latest: latestEntrant ? { year: latestEntrant.x, entrants: latestEntrant.y } : null,
        window: entrants.length ? `${entrants[0].x}\u2013${entrants[entrants.length - 1].x}` : '\u2014',
        direction: countDirection(entrants),
        query,
        generated,
      }
    : undefined

  return { ideaVintage, revealed }
}

function loadArea(area: FocusAreaKey): OpenAlexArea | null {
  const file = path.join(DATA_DIR, `${area}.csv`)
  let text: string
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }
  const parsed = parseCsv(text)
  if (!parsed.rows.length) return null
  return toPayload(parsed)
}

export function loadAllOpenAlex(): Partial<Record<FocusAreaKey, OpenAlexArea>> {
  const out: Partial<Record<FocusAreaKey, OpenAlexArea>> = {}
  for (const area of AREA_SLUGS) {
    const payload = loadArea(area)
    if (payload) out[area] = payload
  }
  return out
}
