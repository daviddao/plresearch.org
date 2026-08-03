'use client'

// Impact Dashboard — field velocity. Horizontal, sticky focus-area tabs sit
// above a two-column read: our hand (the interventions we push on) on the left,
// field velocity (talent, capital, tool cost, cadence, plus the live crowd
// forecasts) on the right. Shared primitives (colors, market signals, focus-area
// metadata) are imported, never forked.

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
  TOOLKIT_V2,
  HOW_TO_READ_V2,
  type FocusAreaKey,
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
  const [howToOpen, setHowToOpen] = useState(false)

  const velocity = FIELD_VELOCITY[filter] ?? []
  const contributions = CONTRIBUTIONS_V2[filter] ?? []

  // Live signal: the crowd forecasts mapped to this focus area's markers, kept
  // only where a real number (or a date readout) is available.
  const liveSignals = useMemo(
    () =>
      INFLECTION_POINTS.filter((p) => p.area === filter)
        .map((p) => marketSignals[p.title])
        .filter((s): s is MarketSignal => !!s && (s.prob != null || !!s.readout)),
    [filter, marketSignals],
  )

  return (
    <>
      {/* Sticky, horizontal focus-area tabs. Sticky is scoped to the dashboard
          section, so the bar scrolls out once the methodology section begins. */}
      <div className="sticky top-16 z-30 -mx-6 mb-6 bg-gray-100/95 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Filter by focus area"
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1"
          >
            {FOCUS_AREAS.map((fa) => (
              <Tab
                key={fa.key}
                label={fa.label}
                forthcoming={fa.forthcoming}
                icon={FA_ICON[fa.key]}
                active={filter === fa.key}
                onClick={() => setFilter(fa.key)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHowToOpen(true)}
            aria-haspopup="dialog"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-black sm:inline-flex"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to read this
          </button>
        </div>
      </div>

      {/* Our hand (left) · field velocity (right) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <HandCard contributions={contributions} />
        <FieldCard velocity={velocity} liveSignals={liveSignals} />
      </div>

      {howToOpen && <HowToReadModalV2 onClose={() => setHowToOpen(false)} />}
    </>
  )
}

// ── Focus-area tab (horizontal pill) ──────────────────────────────────────────
function Tab({
  label,
  forthcoming = false,
  active,
  icon,
  onClick,
}: {
  label: string
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
      className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-left text-sm font-medium transition-all ${
        active
          ? 'border-gray-200 bg-white text-black shadow-sm'
          : 'border-transparent text-gray-500 hover:bg-white/60 hover:text-black'
      }`}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        style={{ color: active ? 'var(--impact-field)' : '#9ca3af' }}
      >
        {icon && <AreaIcon type={icon} className="block h-5 w-5" />}
      </span>
      <span className="whitespace-nowrap">{label}</span>
      {forthcoming && (
        <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-gray-400">Soon</span>
      )}
    </button>
  )
}

// ── Field velocity card (right) ───────────────────────────────────────────────
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

function FieldCard({
  velocity,
  liveSignals,
}: {
  velocity: VelocitySignal[]
  liveSignals: MarketSignal[]
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
        Field velocity
      </div>
      <h3 className="mb-4 text-xl font-semibold tracking-tight text-black">Is the field speeding up?</h3>

      {velocity.length > 0 ? (
        <div>
          {velocity.map((s) => (
            <VelocityRow key={s.id} signal={s} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Curating — velocity signals for this focus area are being defined.</p>
      )}

      {/* Live signal — external crowd forecasts mapped to this field. */}
      {liveSignals.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="mb-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: LIVE_COLOR }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Live signal</span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-gray-500">
            An independent read on whether the field is moving, from the forecast markets mapped to this
            focus area.
          </p>
          <div className="space-y-2.5">
            {liveSignals.map((s, i) => (
              <LiveSignalRow key={i} signal={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Our hand card (left) ──────────────────────────────────────────────────────
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
      <h3 className="mb-4 text-xl font-semibold tracking-tight text-black">The interventions we&rsquo;re pushing with</h3>

      {contributions.length > 0 ? (
        <div className="space-y-4">
          {contributions.map((c, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2">
                <ToolBadge tool={c.tool} />
              </div>
              <div className="mb-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">What we did</div>
                <p className="text-sm leading-relaxed text-gray-700"><Linkify text={c.whatWeDid} /></p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
                  Observed movement
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600"><Linkify text={c.observedMovement} /></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
          The interventions this focus area is running will appear once its bets are set.
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

// ── Live signal row (reuses market-signals) ───────────────────────────────────
function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function LiveSignalRow({ signal }: { signal: MarketSignal }) {
  const pct = signal.prob != null ? Math.round(signal.prob * 100) : null
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="mb-1 flex items-center gap-2">
        {signal.platform && (
          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {PLATFORM_LABEL[signal.platform]}
            {signal.viaFallback ? ' (fallback)' : ''}
          </span>
        )}
        {signal.volume != null && (
          <span className="text-[11px] tabular-nums text-gray-400">{formatUSD(signal.volume)} at stake</span>
        )}
        <span className="ml-auto text-xl font-semibold tabular-nums" style={{ color: FIELD_COLOR }}>
          {signal.readout ?? (pct != null ? `${pct}%` : '—')}
        </span>
      </div>
      {signal.url ? (
        <a href={signal.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-700 hover:underline">
          {signal.question}
        </a>
      ) : (
        <span className="block text-sm text-gray-700">{signal.question}</span>
      )}
    </div>
  )
}

// ── How to read this ──────────────────────────────────────────────────────────
function HowToReadModalV2({ onClose }: { onClose: () => void }) {
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
          <LegendRow color={HAND_COLOR} ink="#ffffff" label="Our hand">
            The interventions we push on with the toolkit, and the movement we saw in the field.
          </LegendRow>
          <LegendRow color={FIELD_COLOR} ink={FIELD_INK} label="Field velocity">
            The rate the field is moving, read from talent, capital, tool cost, output cadence, and the live crowd forecasts.
          </LegendRow>
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
