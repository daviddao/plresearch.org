'use client'

// Card view of the concrete examples behind one PL R&D intervention, shown
// inside the methodology tool modal. Filterable by focus area.
//
// Two sources, merged and deduped:
//   • The real `interventions` set from inflection-points, tagged with the focus
//     area(s) they serve (this is what carries the focus-area pills).
//   • The curated `examples` on the toolkit entry (no focus-area tag).
// Generic "latest insights" feed links are dropped — not concrete examples.

import { useMemo, useState } from 'react'
import {
  INFLECTION_POINTS,
  FOCUS_AREAS,
  type PLRole,
  type FocusAreaKey,
} from '@/lib/inflection-points'
import type { ToolId, ToolkitEntry } from '@/lib/field-velocity'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

// Toolkit categories map onto the pre-registered PL roles on inflection points.
// (culture has no role on the points yet — it falls back to curated examples.)
const TOOL_ROLE: Partial<Record<ToolId, PLRole>> = {
  legibility: 'legibility',
  connection: 'connection',
  funding: 'capital',
  policy: 'permission',
  infrastructure: 'infrastructure',
  translation: 'translation',
}

type Card = {
  key: string
  label: string
  href?: string
  sub?: string
  areas: FocusAreaKey[]
}

const norm = (s: string) => s.trim().toLowerCase()

function cardsForTool(tool: ToolkitEntry): Card[] {
  const map = new Map<string, Card>()
  const role = TOOL_ROLE[tool.id]

  // 1) Real, focus-area-tagged interventions for this role.
  if (role) {
    for (const p of INFLECTION_POINTS) {
      for (const it of p.interventions ?? []) {
        if (it.role !== role) continue
        if (it.href && it.href.startsWith('/insights')) continue
        const key = it.href ? norm(it.href) : norm(it.label)
        const existing = map.get(key)
        if (existing) {
          if (!existing.areas.includes(p.area)) existing.areas.push(p.area)
        } else {
          map.set(key, { key, label: it.label, href: it.href, sub: p.opportunitySpace, areas: [p.area] })
        }
      }
    }
  }

  // 2) Curated toolkit examples not already represented (no focus-area tag).
  for (const ex of tool.examples ?? []) {
    const key = ex.href ? norm(ex.href) : norm(ex.label)
    if (map.has(key)) continue
    map.set(key, { key, label: ex.label, href: ex.href, sub: ex.blurb, areas: [] })
  }

  return [...map.values()]
}

type FilterKey = FocusAreaKey | 'all'

export default function InterventionExampleCards({ tool }: { tool: ToolkitEntry }) {
  const cards = useMemo(() => cardsForTool(tool), [tool])
  const [filter, setFilter] = useState<FilterKey>('all')

  // Which focus areas actually appear — pills only render when there is a real
  // choice to make.
  const presentAreas = useMemo(() => {
    const set = new Set<FocusAreaKey>()
    cards.forEach((c) => c.areas.forEach((a) => set.add(a)))
    return FOCUS_AREAS.filter((fa) => set.has(fa.key))
  }, [cards])

  const visible = useMemo(
    () => (filter === 'all' ? cards : cards.filter((c) => c.areas.includes(filter))),
    [cards, filter],
  )

  if (!cards.length) return null

  const showPills = presentAreas.length > 1
  // Only ever preview two cards — this keeps the modal height constant across
  // filter changes, so the scroll position doesn't jump when a pill is clicked.
  const PREVIEW = 2
  const preview = visible.slice(0, PREVIEW)
  const remaining = visible.length - preview.length

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Examples</div>
        {showPills && (
          <div className="flex flex-wrap gap-1.5">
            <MiniPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            {presentAreas.map((fa) => (
              <MiniPill
                key={fa.key}
                label={fa.label}
                icon={FA_ICON[fa.key]}
                active={filter === fa.key}
                onClick={() => setFilter(fa.key)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          {preview.map((c) => (
            <ExampleCard key={c.key} card={c} />
          ))}
        </div>
        {remaining > 0 && (
          <div
            aria-hidden
            className="flex shrink-0 flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-3 py-3 text-gray-400 sm:w-16 sm:flex-col sm:py-4"
            title={`${remaining} more`}
          >
            <span className="text-sm font-semibold">+{remaining}</span>
            <span className="text-[10px] font-medium uppercase tracking-wide">more</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-3">
        {/* Dead for now — will point to a full interventions listing. */}
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-blue hover:underline"
        >
          See all interventions
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function MiniPill({
  label,
  active,
  icon,
  onClick,
}: {
  label: string
  active: boolean
  icon?: AreaIconType
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
        active
          ? 'border-gray-300 bg-white text-black shadow-sm'
          : 'border-gray-200 bg-transparent text-gray-500 hover:bg-white/70 hover:text-black'
      }`}
    >
      {icon && (
        <span
          className="flex h-3.5 w-3.5 items-center justify-center"
          style={{ color: active ? 'var(--impact-hand)' : '#9ca3af' }}
        >
          <AreaIcon type={icon} className="block h-3 w-3" />
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}

function ExampleCard({ card }: { card: Card }) {
  const external = !!card.href && /^https?:\/\//.test(card.href)
  const body = (
    <>
      {(card.areas.length > 0 || card.href) && (
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1">
            {card.areas.map((a) => (
              <span
                key={a}
                title={FOCUS_AREAS.find((f) => f.key === a)?.label}
                className="flex h-4 w-4 items-center justify-center text-gray-300"
              >
                <AreaIcon type={FA_ICON[a]} className="block h-3.5 w-3.5" />
              </span>
            ))}
          </div>
          {card.href && (
            <svg
              className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {/* Up-right arrow = leaves for another property; chevron = stays on site. */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={external ? 'M7 17L17 7M7 7h10v10' : 'M9 5l7 7-7 7'}
              />
            </svg>
          )}
        </div>
      )}
      <span className="block text-sm font-semibold leading-snug text-black">{card.label}</span>
      {card.sub && <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{card.sub}</span>}
    </>
  )
  const cls = 'group flex flex-col rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 transition-all'

  if (!card.href) return <div className={cls}>{body}</div>
  return (
    <a
      href={card.href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${cls} hover:border-gray-300 hover:bg-white hover:shadow-sm`}
    >
      {body}
    </a>
  )
}
