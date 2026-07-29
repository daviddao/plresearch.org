'use client'

// Impact Dashboard v2 — acceleration-centered. Separate component tree from the
// v1 ImpactDashboard so the two can be compared side by side. Shared primitives
// (colors, market-signals, focus-area metadata) are imported, never forked.

import { useEffect, useMemo, useState } from 'react'
import {
  FOCUS_AREAS,
  INFLECTION_POINTS,
  FIELD_COLOR,
  FIELD_INK,
  HAND_COLOR,
  LIVE_COLOR,
  FIELD_VELOCITY,
  VELOCITY_KIND_META,
  DIRECTION_META,
  CONTRIBUTIONS_V2,
  CONDITION_LABEL,
  TOOLKIT_V2,
  SENSOR_SEMANTICS,
  SENSOR_STATUS_META,
  SENSOR_STATUS_MICROCOPY,
  MISSED_FIELD_MOVED_MICROCOPY,
  HOW_TO_READ_V2,
  sensorFor,
  type FocusAreaKey,
  type InflectionPoint,
  type VelocitySignal,
  type VelocityDirection,
  type ContributionV2,
  type ToolId,
} from '@/lib/field-velocity'
import { TEAM_LINKS } from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import type { MarketSignal } from '@/lib/market-signals'

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

const TOOL_TITLE: Record<ToolId, string> = Object.fromEntries(
  TOOLKIT_V2.map((t) => [t.id, t.title]),
) as Record<ToolId, string>
const TOOL_PROPOSED: Record<ToolId, boolean> = Object.fromEntries(
  TOOLKIT_V2.map((t) => [t.id, !!t.proposed]),
) as Record<ToolId, boolean>

export default function ImpactDashboardV2({
  marketSignals = {},
}: {
  marketSignals?: MarketSignals
}) {
  const [filter, setFilter] = useState<FocusAreaKey>('digital-human-rights')
  const [active, setActive] = useState<InflectionPoint | null>(null)
  const [howToOpen, setHowToOpen] = useState(false)

  const sensors = useMemo(
    () => INFLECTION_POINTS.filter((p) => p.area === filter),
    [filter],
  )
  const velocity = FIELD_VELOCITY[filter] ?? []
  const contributions = CONTRIBUTIONS_V2[filter] ?? []

  return (
    <>
      {/* How to read this — persistent affordance above the grid. */}
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
        {/* Vertical tabs */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Filter by focus area"
          className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-2 lg:mx-0 lg:mb-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
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

        {/* Content: field (Y) + our hand (X) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FieldCard
            velocity={velocity}
            sensors={sensors}
            onOpenSensor={(p) => setActive(p)}
          />
          <HandCard contributions={contributions} />
        </div>
      </div>

      {active && (
        <SensorModal
          point={active}
          signal={marketSignals[active.title]}
          onClose={() => setActive(null)}
        />
      )}
      {howToOpen && <HowToReadModalV2 onClose={() => setHowToOpen(false)} />}
    </>
  )
}

// ── Focus-area tab (mirrors v1 styling) ───────────────────────────────────────
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

// ── Y — the field card ────────────────────────────────────────────────────────
function directionColor(dir: VelocityDirection): string {
  switch (DIRECTION_META[dir].tone) {
    case 'up':
      return LIVE_COLOR
    case 'down':
      return '#d0894b'
    case 'flat':
      return '#6b7280'
    default:
      return '#9ca3af'
  }
}

/** Minimal three-bar trend glyph; unknown renders as an honest flat grey. */
function TrendGlyph({ dir }: { dir: VelocityDirection }) {
  const color = directionColor(dir)
  const heights =
    dir === 'accelerating'
      ? [5, 9, 13]
      : dir === 'decelerating'
        ? [13, 9, 5]
        : dir === 'flat'
          ? [9, 9, 9]
          : [4, 4, 4]
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full"
          style={{ height: h, backgroundColor: dir === 'unknown' ? '#d1d5db' : color }}
        />
      ))}
      <span className="ml-1 text-sm font-semibold tabular-nums" style={{ color }}>
        {DIRECTION_META[dir].glyph}
      </span>
    </span>
  )
}

function VelocityRow({ signal }: { signal: VelocitySignal }) {
  const unknown = signal.direction === 'unknown'
  return (
    <div className="border-t border-gray-100 py-3 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {VELOCITY_KIND_META[signal.kind].label}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <TrendGlyph dir={signal.direction} />
          <span
            className="text-[11px] font-medium"
            style={{ color: unknown ? '#9ca3af' : directionColor(signal.direction) }}
          >
            {DIRECTION_META[signal.direction].label}
          </span>
        </span>
      </div>
      <p className="mt-1 text-sm font-medium leading-snug text-black">{signal.label}</p>
      <p className={`mt-1 text-xs leading-relaxed ${unknown ? 'text-gray-400' : 'text-gray-600'}`}>
        <Linkify text={signal.evidence} />
      </p>
    </div>
  )
}

function StatusChip({ point }: { point: InflectionPoint }) {
  const sensor = sensorFor(point)
  const meta = SENSOR_STATUS_META[sensor.status]
  const fieldMoved = sensor.status === 'missed' && sensor.fieldMovedAnyway
  const label = fieldMoved ? 'Missed · field moved' : meta.label
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {label}
    </span>
  )
}

function FieldCard({
  velocity,
  sensors,
  onOpenSensor,
}: {
  velocity: VelocitySignal[]
  sensors: InflectionPoint[]
  onOpenSensor: (p: InflectionPoint) => void
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
        The field
      </div>
      <h3 className="mb-4 text-xl font-semibold tracking-tight text-black">Is the field accelerating?</h3>

      {/* Velocity basket — leads the card. */}
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        Velocity basket
      </div>
      {velocity.length > 0 ? (
        <div>
          {velocity.map((s) => (
            <VelocityRow key={s.id} signal={s} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Curating — velocity signals for this focus area are being defined.</p>
      )}

      {/* Sensors — inflection points demoted to a sensors list. */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="mb-1 text-sm font-semibold text-black">Our sensors: inflection points</div>
        <p className="mb-3 text-xs leading-relaxed text-gray-500">
          Dated, falsifiable markers we expect acceleration to produce. They grade our model of the
          field — not the field.{' '}
          <span className="italic text-gray-400">Illustrative draft ledger — statuses are proposed, not ratified.</span>
        </p>
        {sensors.length > 0 ? (
          <ul className="space-y-1.5">
            {sensors.map((p) => {
              const sensor = sensorFor(p)
              const fieldMoved = sensor.status === 'missed' && sensor.fieldMovedAnyway
              return (
                <li key={p.title}>
                  <button
                    type="button"
                    onClick={() => onOpenSensor(p)}
                    aria-haspopup="dialog"
                    className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 ${
                      fieldMoved ? 'border-dashed' : 'border-gray-200'
                    }`}
                    style={fieldMoved ? { borderColor: '#e0b489' } : undefined}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-black">{p.title}</span>
                      <span className="mt-0.5 block text-[11px] text-gray-400">
                        by {sensor.predictedBy} · {fieldMoved ? MISSED_FIELD_MOVED_MICROCOPY : SENSOR_STATUS_MICROCOPY[sensor.status]}
                      </span>
                    </span>
                    <StatusChip point={p} />
                    <svg className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
            Sensors for this focus area are being defined — not zero, just not yet.
          </p>
        )}
      </div>
    </div>
  )
}

// ── X — our hand card ─────────────────────────────────────────────────────────
function ToolBadge({ tool }: { tool: ToolId }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
        style={{
          color: HAND_COLOR,
          borderColor: 'color-mix(in srgb, var(--impact-hand) 34%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--impact-hand) 8%, transparent)',
        }}
      >
        {TOOL_TITLE[tool]}
      </span>
      {TOOL_PROPOSED[tool] && (
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
          Proposed tool
        </span>
      )}
    </span>
  )
}

function HandCard({ contributions }: { contributions: ContributionV2[] }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
        Our hand
      </div>
      <h3 className="mb-4 text-xl font-semibold tracking-tight text-black">The conditions we&rsquo;re pushing on</h3>

      {contributions.length > 0 ? (
        <div className="space-y-4">
          {contributions.map((c, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <ToolBadge tool={c.tool} />
                <svg className="h-3.5 w-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-medium text-gray-600">{CONDITION_LABEL[c.targetedCondition]}</span>
              </div>
              <div className="mb-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">What we did</div>
                <p className="text-sm leading-relaxed text-gray-700"><Linkify text={c.whatWeDid} /></p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
                  Observed movement
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{c.observedMovement}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
          The conditions this focus area is pushing on will appear once its bets are set.
        </p>
      )}
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

// ── Crowd forecast (reuses market-signals on the field axis) ──────────────────
function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function CrowdForecast({ signal }: { signal: MarketSignal }) {
  const pct = signal.prob != null ? Math.round(signal.prob * 100) : null
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Crowd read</span>
        {signal.platform && (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {PLATFORM_LABEL[signal.platform]}
            {signal.viaFallback ? ' (fallback)' : ''}
          </span>
        )}
        {signal.volume != null && (
          <span className="text-[11px] tabular-nums text-gray-400">{formatUSD(signal.volume)} at stake</span>
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
        {signal.note} A Y-sensor: an independent read on whether the field is moving — not our contribution, not a settled outcome.
      </p>
    </div>
  )
}

// ── Sensor modal ──────────────────────────────────────────────────────────────
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

function SensorModal({
  point,
  signal,
  onClose,
}: {
  point: InflectionPoint
  signal?: MarketSignal
  onClose: () => void
}) {
  useModalChrome(onClose)
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!
  const sensor = sensorFor(point)
  const meta = SENSOR_STATUS_META[sensor.status]
  const fieldMoved = sensor.status === 'missed' && sensor.fieldMovedAnyway

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

          {/* Sensor card */}
          <div className="rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
                Sensor · inflection point
              </span>
              <span
                className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: meta.color, backgroundColor: meta.bg }}
              >
                {fieldMoved ? 'Missed · field moved' : meta.label}
              </span>
            </div>
            <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-black">{point.title}</h2>

            <div className="space-y-4">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">The marker (what we predicted)</div>
                <p className="text-sm leading-relaxed text-gray-600">{point.signal}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Predicted by</div>
                  <p className="text-sm font-medium text-black">{sensor.predictedBy}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</div>
                  <p className="text-sm font-medium" style={{ color: meta.color }}>
                    {fieldMoved ? MISSED_FIELD_MOVED_MICROCOPY : SENSOR_STATUS_MICROCOPY[sensor.status]}
                  </p>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Falsification condition</div>
                <p className="text-sm leading-relaxed text-gray-600">{sensor.falsificationCondition}</p>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">If it matters (cascade)</div>
                <p className="text-sm leading-relaxed text-gray-600">{point.cascade}</p>
              </div>
              {sensor.postMortem && (
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: fieldMoved ? '#e0b489' : '#e5e7eb',
                    backgroundColor: fieldMoved ? 'color-mix(in srgb, #d0894b 8%, white)' : 'white',
                  }}
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: fieldMoved ? '#b06a2e' : '#6b7280' }}>
                    {fieldMoved ? 'Post-mortem — the field accelerated via another path' : 'Post-mortem'}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{sensor.postMortem}</p>
                </div>
              )}
            </div>
          </div>

          {/* Crowd read — reused market signal on the field axis */}
          {signal && signal.match !== 'gap' && (
            <div className="mt-4 rounded-xl bg-gray-50 p-5 sm:p-6">
              <CrowdForecast signal={signal} />
            </div>
          )}
          {signal && signal.match === 'gap' && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Crowd read</div>
              <p className="text-sm leading-relaxed text-gray-500">{signal.note}</p>
            </div>
          )}

          <a
            href={`/insights/?area=${point.area}`}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue hover:underline"
          >
            See the latest {fa.label} insights
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

// ── How to read this (v2) ─────────────────────────────────────────────────────
function HowToReadModalV2({ onClose }: { onClose: () => void }) {
  useModalChrome(onClose)
  const statuses: { key: keyof typeof SENSOR_STATUS_META | 'field-moved'; label: string; micro: string }[] = [
    { key: 'pending', label: SENSOR_STATUS_META.pending.label, micro: SENSOR_STATUS_MICROCOPY.pending },
    { key: 'hit', label: SENSOR_STATUS_META.hit.label, micro: SENSOR_STATUS_MICROCOPY.hit },
    { key: 'missed', label: SENSOR_STATUS_META.missed.label, micro: SENSOR_STATUS_MICROCOPY.missed },
    { key: 'field-moved', label: 'Missed · field moved', micro: MISSED_FIELD_MOVED_MICROCOPY },
    { key: 'retired', label: SENSOR_STATUS_META.retired.label, micro: SENSOR_STATUS_MICROCOPY.retired },
  ]
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
        <p className="mb-7 max-w-xl text-lg leading-relaxed text-black">{HOW_TO_READ_V2}</p>

        <div className="space-y-4 border-t border-gray-100 pt-6">
          <LegendRow color={FIELD_COLOR} ink={FIELD_INK} label="The field (Y)">
            Is the field accelerating — read from the velocity basket. Moves with or without us.
          </LegendRow>
          <LegendRow color={HAND_COLOR} ink="#ffffff" label="Our hand (X)">
            The conditions we push on with the toolkit, judged by whether the condition actually moved.
          </LegendRow>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Sensor statuses</div>
          <ul className="space-y-2">
            {statuses.map((s) => (
              <li key={s.key} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 font-semibold text-black">{s.label}</span>
                <span className="text-gray-400">— {s.micro}</span>
              </li>
            ))}
          </ul>
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
