'use client'

// Impact Dashboard — field velocity. Horizontal, sticky focus-area tabs sit
// above a wide "field velocity" box (the five velocity instruments, each with a
// direction indicator, opening a modal) and the inflection points we track,
// laid out as four cards in two rows with their live signals. The inflection
// cards mirror the PR #29 design; shared primitives are imported, never forked.

import { useEffect, useMemo, useState } from 'react'
import {
  ROLE_META,
  PL_ROLE_ORDER,
  FIELD_STAGES,
  HOW_TO_READ,
  TEAM_LINKS,
  stageIndexForStatus,
  type PLRole,
} from '@/lib/inflection-points'
import {
  FOCUS_AREAS,
  INFLECTION_POINTS,
  FIELD_COLOR,
  FIELD_INK,
  FIELD_TRACK,
  HAND_COLOR,
  LIVE_COLOR,
  type FocusAreaKey,
  type InflectionPoint,
} from '@/lib/field-velocity'
import {
  instrumentsForArea,
  INSTRUMENT_BY_ID,
  DIRECTION_META,
  type InstrumentId,
  type InstrumentRecord,
  type Direction,
} from '@/lib/velocity-instruments'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import type { MarketSignal } from '@/lib/market-signals'

/** Live output metrics for a point, keyed by the point's title. Fetched server-side. */
export type LiveMetric = { value: string; label: string }
export type LiveOutputs = Record<string, LiveMetric[]>
export type MarketSignals = Record<string, MarketSignal>

const PLATFORM_LABEL: Record<'polymarket' | 'kalshi' | 'metaculus', string> = {
  polymarket: 'Polymarket',
  kalshi: 'Kalshi',
  metaculus: 'Metaculus',
}

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

export default function ImpactDashboardV2({
  liveOutputs = {},
  marketSignals = {},
}: {
  liveOutputs?: LiveOutputs
  marketSignals?: MarketSignals
}) {
  const [filter, setFilter] = useState<FocusAreaKey>('digital-human-rights')
  const [active, setActive] = useState<InflectionPoint | null>(null)
  const [howToOpen, setHowToOpen] = useState(false)
  const [velocityOpen, setVelocityOpen] = useState(false)
  const [defInstrument, setDefInstrument] = useState<InstrumentId | null>(null)

  const visible = useMemo(() => INFLECTION_POINTS.filter((p) => p.area === filter), [filter])

  return (
    <>
      {/* "How to read this" — a persistent affordance above the grid. */}
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => setHowToOpen(true)}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-black"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to read this
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
        {/* Vertical tabs (PR #29 layout) */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Filter by focus area"
          className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-2 lg:mx-0 lg:mb-0 lg:flex-col lg:overflow-visible lg:self-start lg:px-0 lg:pb-0 lg:sticky lg:top-20"
        >
          {FOCUS_AREAS.map((fa) => (
            <Tab
              key={fa.key}
              label={fa.label}
              count={INFLECTION_POINTS.filter((p) => p.area === fa.key).length}
              forthcoming={fa.forthcoming}
              icon={FA_ICON[fa.key]}
              active={filter === fa.key}
              onClick={() => setFilter(fa.key)}
            />
          ))}
        </div>

        {/* Content: field velocity box + inflection points */}
        <div>
          {/* Field velocity — label outside the box; the box previews the five
              instruments and opens a modal. */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
              Field velocity
            </span>
            <span className="text-[11px] text-gray-400">· Is the field speeding up?</span>
          </div>
          <FieldVelocityBox area={filter} onOpen={() => setVelocityOpen(true)} />

          {/* Inflection points — four cards in two rows, with live signals. */}
          <div className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Inflection points we&rsquo;re tracking
          </div>
          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {visible.map((p) => (
                <InflectionCard
                  key={`${p.area}-${p.title}`}
                  point={p}
                  metrics={liveOutputs[p.title]}
                  signal={marketSignals[p.title]}
                  onOpen={() => setActive(p)}
                />
              ))}
            </div>
          ) : (
            <EmptyState filter={filter} />
          )}
        </div>
      </div>

      {active && (
        <InflectionModal
          point={active}
          metrics={liveOutputs[active.title]}
          signal={marketSignals[active.title]}
          onClose={() => setActive(null)}
        />
      )}
      {velocityOpen && (
        <VelocityModal area={filter} onClose={() => setVelocityOpen(false)} onOpenDef={setDefInstrument} />
      )}
      {defInstrument && (
        <InstrumentDefinitionModal id={defInstrument} onClose={() => setDefInstrument(null)} />
      )}
      {howToOpen && <HowToReadModal onClose={() => setHowToOpen(false)} />}
    </>
  )
}

// ── Focus-area tab (vertical, PR #29 layout) ─────────────────────────────────
function Tab({
  label,
  count,
  forthcoming = false,
  active,
  icon,
  onClick,
}: {
  label: string
  count: number
  forthcoming?: boolean
  active: boolean
  icon?: AreaIconType
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium transition-all lg:w-full ${
        active
          ? 'border-gray-200 bg-white text-black shadow-sm'
          : 'border-transparent text-gray-500 hover:bg-white/60 hover:text-black'
      }`}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center"
        style={{ color: active ? 'var(--impact-field)' : '#9ca3af' }}
      >
        {icon && <AreaIcon type={icon} className="block h-5 w-5" />}
      </span>
      <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{label}</span>
      {forthcoming ? (
        <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-gray-400">Soon</span>
      ) : (
        <span className="text-xs tabular-nums text-gray-400">{count}</span>
      )}
    </button>
  )
}

// ── Field velocity box (wide) + its modal ─────────────────────────────────────

function DirectionChip({ direction, size = 'sm' }: { direction: Direction; size?: 'sm' | 'lg' }) {
  const meta = DIRECTION_META[direction]
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${size === 'lg' ? 'text-sm' : 'text-[11px]'}`}
      style={{ color: meta.color }}
    >
      <span className="tabular-nums" aria-hidden>{meta.glyph}</span>
      {meta.label}
    </span>
  )
}

type SeriesPoint = { x: number | string; y: number; lo?: number; hi?: number; reliable?: boolean }

/**
 * Inline SVG sparkline. Supports a log axis, a confidence band (lo/hi), a
 * dashed segment for unreliable trailing points, and an optional secondary
 * dashed normalizer line. No axis labels — the value, window, and as-of date
 * are shown beside it.
 */
function Sparkline({
  series,
  series2,
  scale = 'linear',
  width = 116,
  height = 34,
  band = false,
}: {
  series: SeriesPoint[]
  series2?: { x: number | string; y: number }[]
  scale?: 'linear' | 'log'
  width?: number
  height?: number
  band?: boolean
}) {
  if (!series.length) return null
  const tf = (v: number) => (scale === 'log' ? Math.log10(Math.max(v, 1e-6)) : v)
  const xOf = (p: { x: number | string }, i: number) => (typeof p.x === 'number' ? p.x : i)

  const xsAll = [
    ...series.map((p, i) => xOf(p, i)),
    ...(series2 ? series2.map((p, i) => xOf(p, i)) : []),
  ]
  const minX = Math.min(...xsAll)
  const maxX = Math.max(...xsAll)
  const spanX = maxX - minX || 1

  const ysAll: number[] = []
  series.forEach((p) => {
    ysAll.push(tf(p.y))
    if (band && p.lo != null) ysAll.push(tf(p.lo))
    if (band && p.hi != null) ysAll.push(tf(p.hi))
  })
  if (series2) series2.forEach((p) => ysAll.push(tf(p.y)))
  const minY = Math.min(...ysAll)
  const maxY = Math.max(...ysAll)
  const spanY = maxY - minY || 1

  const px = (x: number) => ((x - minX) / spanX) * (width - 4) + 2
  const py = (v: number) => height - 3 - ((tf(v) - minY) / spanY) * (height - 6)

  const pt = (p: SeriesPoint, i: number) => `${px(xOf(p, i)).toFixed(1)},${py(p.y).toFixed(1)}`

  // Split into reliable (solid) and the trailing unreliable tail (dashed).
  const hasReliableFlags = series.some((p) => p.reliable === false)
  const reliablePts = hasReliableFlags ? series.filter((p) => p.reliable !== false) : series
  const lastReliableIdx = hasReliableFlags
    ? series.reduce((acc, p, i) => (p.reliable !== false ? i : acc), 0)
    : series.length - 1
  const tailPts = hasReliableFlags ? series.slice(lastReliableIdx) : []

  // Confidence band polygon (hi across, then lo back).
  let bandPath = ''
  if (band && series.every((p) => p.lo != null && p.hi != null)) {
    const top = series.map((p, i) => `${px(xOf(p, i)).toFixed(1)},${py(p.hi as number).toFixed(1)}`)
    const bot = [...series].reverse().map((p, i) => {
      const idx = series.length - 1 - i
      return `${px(xOf(p, idx)).toFixed(1)},${py(p.lo as number).toFixed(1)}`
    })
    bandPath = `${top.join(' ')} ${bot.join(' ')}`
  }

  const last = series[series.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      {bandPath && (
        <polygon points={bandPath} fill="var(--impact-field)" opacity={0.1} />
      )}
      {series2 && (
        <polyline
          points={series2.map((p, i) => `${px(xOf(p, i)).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.25}
          strokeDasharray="3 3"
        />
      )}
      <polyline
        points={reliablePts.map((p, i) => pt(p, series.indexOf(p) >= 0 ? series.indexOf(p) : i)).join(' ')}
        fill="none"
        stroke="var(--impact-field)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {tailPts.length > 1 && (
        <polyline
          points={tailPts.map((p) => pt(p, series.indexOf(p))).join(' ')}
          fill="none"
          stroke="var(--impact-field)"
          strokeWidth={1.75}
          strokeDasharray="2 2"
          opacity={0.45}
        />
      )}
      <circle cx={px(xOf(last, series.length - 1))} cy={py(last.y)} r={1.9} fill="var(--impact-field)" />
    </svg>
  )
}

/**
 * Ghost chart for an `unwired` instrument: a single fixed, abstract, blurred
 * shape carrying no data, no numbers, and no axis. Identical across instruments
 * so it reads as a system state. aria-hidden — the state is in adjacent text.
 */
function GhostChart({ width = 116, height = 34 }: { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="text-gray-400"
      style={{ filter: 'blur(3.5px)', opacity: 0.28 }}
    >
      <ellipse cx={width * 0.42} cy={height * 0.55} rx={width * 0.34} ry={height * 0.26} fill="currentColor" />
      <ellipse cx={width * 0.66} cy={height * 0.42} rx={width * 0.22} ry={height * 0.2} fill="currentColor" />
    </svg>
  )
}

function InstrumentCell({ record }: { record: InstrumentRecord }) {
  const inst = INSTRUMENT_BY_ID[record.instrument]
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-gray-100 pl-3">
      <span className="text-sm font-medium leading-snug text-black">{inst.label}</span>
      {record.state === 'reading' && (
        <>
          {record.series && record.series.length > 1 && (
            <Sparkline
              series={record.series as SeriesPoint[]}
              scale={record.seriesScale}
              band={record.series.some((p) => (p as SeriesPoint).lo != null)}
            />
          )}
          <span className="line-clamp-2 text-sm font-semibold leading-snug text-black">{record.value}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
            {record.direction && <DirectionChip direction={record.direction} />}
            {record.asOf && <span className="tabular-nums">as of {record.asOf}</span>}
          </span>
        </>
      )}
      {record.state === 'unwired' && (
        <>
          <GhostChart />
          <span className="text-[11px] font-medium text-gray-400">not yet wired</span>
        </>
      )}
      {record.state === 'not_applicable' && (
        <span className="text-[11px] italic text-gray-400">not applicable to this field</span>
      )}
    </div>
  )
}

function FieldVelocityBox({ area, onOpen }: { area: FocusAreaKey; onOpen: () => void }) {
  const records = instrumentsForArea(area)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative flex w-full flex-col rounded-xl border border-gray-200 bg-white p-6 pt-10 text-left transition-all hover:border-gray-300 hover:shadow-md"
    >
      <span className="absolute right-4 top-4 inline-flex items-center gap-0.5 text-xs font-medium text-gray-300 transition-colors group-hover:text-blue">
        Detail
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>

      {/* Ragged by design — a field lists only the instruments that apply. */}
      <div className="grid grid-cols-2 items-start gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        {records.map((r) => (
          <InstrumentCell key={r.instrument} record={r} />
        ))}
      </div>
    </button>
  )
}

function SourceLinks({ sources }: { sources: { label: string; url: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {sources.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue hover:underline"
        >
          {s.label}
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      ))}
    </div>
  )
}

function VelocityModal({
  area,
  onClose,
  onOpenDef,
}: {
  area: FocusAreaKey
  onClose: () => void
  onOpenDef: (id: InstrumentId) => void
}) {
  useModalChrome(onClose)
  const fa = FOCUS_AREAS.find((f) => f.key === area)!
  const records = instrumentsForArea(area)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Field velocity"
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
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="flex h-5 w-5 items-center justify-center text-gray-400">
              <AreaIcon type={FA_ICON[fa.key]} className="block h-4 w-4" />
            </span>
            {fa.label}
          </div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
            Field velocity
          </div>
          <h2 className="mb-2 text-2xl font-semibold leading-tight tracking-tight text-black">
            The rate the field is moving
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            The five instruments we read velocity with. Where a reading is live, it carries a date and a
            source. Where it is not, we name the metric we intend to use and what is blocking it. Where an
            instrument does not fit this field, we say so.
          </p>

          <div className="space-y-5">
            {records.map((r) => {
              const inst = INSTRUMENT_BY_ID[r.instrument]
              return (
                <div key={r.instrument} className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDef(r.instrument)}
                      className="group inline-flex items-center gap-1 text-base font-semibold tracking-tight text-black hover:text-blue"
                    >
                      {inst.label}
                      <svg className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    {r.state === 'reading' && r.direction && (
                      <span className="ml-auto">
                        <DirectionChip direction={r.direction} size="lg" />
                      </span>
                    )}
                    {r.state === 'unwired' && (
                      <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-gray-400">not yet wired</span>
                    )}
                    {r.state === 'not_applicable' && (
                      <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-gray-400">not applicable to this field</span>
                    )}
                  </div>

                  {r.state === 'reading' && (
                    <div>
                      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                        {r.series && r.series.length > 1 && (
                          <div className="shrink-0">
                            <Sparkline
                              series={r.series as SeriesPoint[]}
                              scale={r.seriesScale}
                              band={r.series.some((p) => (p as SeriesPoint).lo != null)}
                              width={180}
                              height={48}
                            />
                          </div>
                        )}
                        {r.series2 && r.series2.length > 1 && (
                          <div className="shrink-0">
                            <Sparkline series={r.series2 as SeriesPoint[]} width={140} height={44} />
                            <div className="mt-1 text-[10px] text-gray-400">{r.series2Label ?? 'normalizer'}</div>
                          </div>
                        )}
                        <div className="min-w-[10rem] flex-1">
                          <div className="text-lg font-semibold leading-tight text-black">{r.value}</div>
                          {r.metric && <div className="mt-0.5 text-xs text-gray-500">{r.metric}</div>}
                          {r.trend && <div className="mt-1 text-xs text-gray-500">{r.trend}</div>}
                          <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-gray-400">
                            {r.window && <span>window {r.window}</span>}
                            {r.asOf && <span className="tabular-nums">as of {r.asOf}</span>}
                          </div>
                        </div>
                      </div>
                      {r.provenance && (r.provenance.query || r.provenance.generated) && (
                        <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                          {r.provenance.query && (
                            <>
                              Query: <span className="font-mono">{r.provenance.query}</span>
                              {r.provenance.generated ? ' · ' : ''}
                            </>
                          )}
                          {r.provenance.generated && <>generated {r.provenance.generated}</>}
                        </p>
                      )}
                      {r.sources && <SourceLinks sources={r.sources} />}
                    </div>
                  )}

                  {r.state === 'unwired' && (
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 pt-1">
                        <GhostChart width={140} height={44} />
                      </div>
                      <div className="text-sm leading-relaxed text-gray-500">
                        <p><span className="font-medium text-gray-700">Intended metric:</span> {r.candidateMetric}</p>
                        <p className="mt-1"><span className="font-medium text-gray-700">Blocked by:</span> {r.blocker}</p>
                        {r.owner && <p className="mt-1 text-xs text-gray-400">Owner: {r.owner}</p>}
                      </div>
                    </div>
                  )}

                  {r.state === 'not_applicable' && (
                    <p className="text-sm italic leading-relaxed text-gray-400">{r.reason}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function InstrumentDefinitionModal({ id, onClose }: { id: InstrumentId; onClose: () => void }) {
  useModalChrome(onClose)
  const inst = INSTRUMENT_BY_ID[id]
  const researchSide = id === 'idea_vintage' || id === 'revealed_commitments'
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={inst.label}
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 lg:p-10"
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
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
            Field velocity
          </div>
          <h2 className="mb-1 text-2xl font-semibold leading-tight tracking-tight text-black">{inst.label}</h2>
          <div className="mb-5 text-sm text-gray-500">{inst.subtitle}</div>
          <p className="text-sm leading-relaxed text-gray-700">{inst.description}</p>
          {researchSide && (
            <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm italic leading-relaxed text-gray-500">
              This reads the research side of the field. It does not observe invention directly, and the
              two can decouple.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inflection cards (PR #29 design) ──────────────────────────────────────────
function FieldMeter({ status }: { status: InflectionPoint['status'] }) {
  const reached = stageIndexForStatus(status)
  return (
    <div>
      <div className="flex gap-1">
        {FIELD_STAGES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i <= reached ? FIELD_COLOR : FIELD_TRACK }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
        {FIELD_STAGES.map((s, i) => (
          <span key={s} className={i === reached ? 'font-medium text-gray-600' : ''}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function RoleChips({ roles }: { roles: PLRole[] }) {
  const ordered = PL_ROLE_ORDER.filter((r) => roles.includes(r))
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {ordered.map((r) => (
        <span key={r} className="group/role relative inline-flex">
          <span
            className="inline-flex cursor-help items-center rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{
              color: HAND_COLOR,
              borderColor: 'color-mix(in srgb, var(--impact-hand) 34%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--impact-hand) 8%, transparent)',
            }}
          >
            {ROLE_META[r].label}
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/role:opacity-100"
          >
            <span className="font-semibold">{ROLE_META[r].label}</span> — {ROLE_META[r].description}
          </span>
        </span>
      ))}
    </span>
  )
}

function InflectionCard({
  point,
  metrics,
  signal,
  onOpen,
}: {
  point: InflectionPoint
  metrics?: LiveMetric[]
  signal?: MarketSignal
  onOpen: () => void
}) {
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!
  const stageLabel = FIELD_STAGES[stageIndexForStatus(point.status)]
  const hasLiveSignal = !!(
    point.liveEvidence?.length ||
    (metrics && metrics.length) ||
    (signal && signal.match !== 'gap')
  )

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-300 hover:shadow-md"
    >
      <span className="absolute right-4 top-4 inline-flex items-center gap-0.5 text-xs font-medium text-gray-300 transition-colors group-hover:text-blue">
        Detail
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>

      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <span className="flex h-4 w-4 items-center justify-center text-gray-400">
          <AreaIcon type={FA_ICON[fa.key]} className="block h-3.5 w-3.5" />
        </span>
        {fa.label}
      </div>

      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">{point.opportunitySpace}</div>
      <h3 className="mb-2 text-lg font-medium leading-snug text-black">{point.title}</h3>
      <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600">{point.signal}</p>

      <div className="mt-auto border-t border-gray-100 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
            The field
          </span>
          <span className="ml-auto text-[11px] font-medium" style={{ color: FIELD_COLOR }}>{stageLabel}</span>
        </div>
        <FieldMeter status={point.status} />
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
            Our hand
          </span>
          <span className="text-[11px] text-gray-400">· PL R&D interventions</span>
        </div>
        <RoleChips roles={point.roles} />
      </div>

      {hasLiveSignal && (
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
          </span>
          Live signal
        </div>
      )}
    </button>
  )
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function CrowdForecast({ signal, divider = false }: { signal: MarketSignal; divider?: boolean }) {
  const pct = signal.prob != null ? Math.round(signal.prob * 100) : null
  return (
    <div className={divider ? 'mt-3 border-t border-gray-100 pt-3' : ''}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Crowd forecast</span>
        {signal.platform && (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {PLATFORM_LABEL[signal.platform]}
            {signal.viaFallback ? ' (fallback)' : ''}
          </span>
        )}
        {signal.volume != null && (
          <span className="text-[11px] tabular-nums text-gray-400" title="Total money traded through this market">
            {formatUSD(signal.volume)} at stake
          </span>
        )}
        <span className="ml-auto text-2xl font-semibold tabular-nums" style={{ color: FIELD_COLOR }}>
          {signal.readout ?? (pct != null ? `${pct}%` : '—')}
        </span>
      </div>
      {signal.url && (
        <a href={signal.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-700 hover:underline">
          {signal.question}
        </a>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
        {signal.note} An independent read on whether the field is moving — not a settled outcome.
      </p>
    </div>
  )
}

function useModalChrome(onClose: () => void) {
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
}

function InflectionModal({
  point,
  metrics,
  signal,
  onClose,
}: {
  point: InflectionPoint
  metrics?: LiveMetric[]
  signal?: MarketSignal
  onClose: () => void
}) {
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!
  useModalChrome(onClose)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={point.title}
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
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="flex h-5 w-5 items-center justify-center text-gray-400">
              <AreaIcon type={FA_ICON[fa.key]} className="block h-4 w-4" />
            </span>
            {fa.label}
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">{point.opportunitySpace}</span>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
              The field
            </div>
            <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-tight text-black">{point.title}</h2>
            <div className="mb-6 space-y-5">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Outcome</div>
                <p className="text-sm leading-relaxed text-gray-600">{point.signal}</p>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Impact</div>
                <p className="text-sm leading-relaxed text-gray-600">{point.cascade}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
                Progress against inflection point
              </div>
              <FieldMeter status={point.status} />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
              Our hand
            </div>
            <div className="mb-4 text-sm font-semibold text-black">PL R&D interventions</div>
            <RoleChips roles={point.roles} />
            <div className="mt-5">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">In practice</div>
              <p className="text-sm leading-relaxed text-gray-600"><Linkify text={point.contribution.activities} /></p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500"><Linkify text={point.contribution.outputs} /></p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
              </span>
              Live signal
            </div>
            {(point.liveEvidence?.length || (metrics && metrics.length) || (signal && signal.match !== 'gap')) && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                {point.liveEvidence?.map((ev, i) => {
                  const external = /^https?:\/\//.test(ev.href)
                  return (
                    <a
                      key={ev.href}
                      href={ev.href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={`-m-1 block rounded-lg p-1 no-underline transition-colors hover:bg-gray-50 ${i > 0 ? 'mt-3 border-t border-gray-100 pt-3' : ''}`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-black">
                        {ev.label}
                        <svg className="ml-auto h-4 w-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      {i === 0 && metrics && metrics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                          {metrics.map((m) => (
                            <span key={m.label} className="flex items-baseline gap-1.5">
                              <span className="text-lg font-semibold text-black">{m.value}</span>
                              <span className="text-xs text-gray-500">{m.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-gray-500">{ev.note}</p>
                    </a>
                  )
                })}

                {!point.liveEvidence?.length && metrics && metrics.length > 0 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {metrics.map((m) => (
                      <span key={m.label} className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-black">{m.value}</span>
                        <span className="text-xs text-gray-500">{m.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {signal && signal.match !== 'gap' && (
                  <CrowdForecast signal={signal} divider={!!point.liveEvidence?.length} />
                )}
              </div>
            )}

            {signal && signal.match === 'gap' && (
              <div className="mb-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Crowd forecast</div>
                <p className="text-sm leading-relaxed text-gray-500">{signal.note}</p>
              </div>
            )}

            <a
              href={`/insights/?area=${point.area}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue hover:underline"
            >
              See the latest {fa.label} insights
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter: FocusAreaKey }) {
  const fa = FOCUS_AREAS.find((f) => f.key === filter)
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <p className="text-base font-medium text-black">
        {fa?.label ?? 'This focus area'} is forthcoming.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Its inflection points will appear here as the focus area comes online.
      </p>
    </div>
  )
}

// ── Team-name linkify (reuses the shared TEAM_LINKS map, read-only) ───────────
const TEAM_LINK_PATTERN = new RegExp(
  '(' +
    Object.keys(TEAM_LINKS)
      .sort((a, b) => b.length - a.length)
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')',
  'g',
)

function Linkify({ text }: { text: string }) {
  const parts = text.split(TEAM_LINK_PATTERN)
  return (
    <>
      {parts.map((part, i) =>
        TEAM_LINKS[part] ? (
          <a
            key={i}
            href={TEAM_LINKS[part]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-black"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

// ── How to read this ──────────────────────────────────────────────────────────
function HowToReadModal({ onClose }: { onClose: () => void }) {
  useModalChrome(onClose)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How to read this"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 lg:p-10"
      onClick={onClose}
    >
      <div className="relative my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
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

        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">How to read this</div>
        <p className="mb-7 max-w-xl text-lg leading-relaxed text-black">{HOW_TO_READ}</p>

        <div className="space-y-4 border-t border-gray-100 pt-6">
          <LegendRow color={FIELD_COLOR} ink={FIELD_INK} label="The field">
            The change in the world: did it happen (outcome) and did it matter (impact). Moves with or without us.
          </LegendRow>
          <LegendRow color={HAND_COLOR} ink="#ffffff" label="Our hand">
            Our contribution: the PL instruments on the critical path. The axis we control with our partners.
          </LegendRow>
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
              </span>
            </span>
            <p className="text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-black">Live signal</span> — real-world evidence for and against, refreshed from the field. Never a settled outcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendRow({
  color,
  ink,
  label,
  children,
}: {
  color: string
  ink: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold"
        style={{ backgroundColor: color, color: ink }}
        aria-hidden
      />
      <p className="text-sm leading-relaxed text-gray-600">
        <span className="font-semibold" style={{ color }}>{label}</span> — {children}
      </p>
    </div>
  )
}
