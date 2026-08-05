'use client'

// Hypercert examples — a toned-down, cross-focus-area view of PL R&D's "Our hand"
// work, re-cut as impact-claim cards and grouped into intervention buckets (the
// PL toolkit categories), with focus-area pill filters up top.
//
// The full, live experience lives on the Economies & Governance hypercerts page
// (glossy Research Retreat editions read from the hypercerts indexer). This is a
// deliberately muted echo of that idea, honest about what is real:
//
//   • The Research Retreat editions are ALREADY published as on-network
//     hypercerts (org.hypercerts.claim.activity). They carry a solid "Hypercert"
//     badge and link to their live claim.
//   • Everything else is a concrete intervention behind an inflection bet — the
//     kind of work we record as an impact claim, shown with a muted tag. Nothing
//     here is invented: the data is the real `interventions` set from
//     inflection-points; generic "latest insights" feed links are dropped.

import { useMemo, useState } from 'react'
import {
  INFLECTION_POINTS,
  FOCUS_AREAS,
  ROLE_META,
  PL_ROLE_ORDER,
  HAND_COLOR,
  type PLRole,
  type FocusAreaKey,
} from '@/lib/inflection-points'
import { HYPERCERTS } from '@/data/hypercerts'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

const HYPERCERTS_HREF = '/areas/economies-governance/impact/hypercerts/'

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

type Claim = {
  key: string
  label: string
  href?: string
  role: PLRole
  areas: FocusAreaKey[]
  /** Small line above the title — opportunity space, or location for editions. */
  sub: string
  /** True only for editions already published as on-network hypercerts. */
  published?: boolean
  /** Human timeframe, shown on published editions. */
  dateLabel?: string
}

// Research Retreat editions that are live, published hypercerts — the real thing.
// They are convenings (the connection bucket) in Economies & Governance.
const PUBLISHED: Claim[] = HYPERCERTS.filter((h) => h.status !== 'upcoming').map((h) => ({
  key: `hc-${h.rkey}`,
  label: h.title,
  href: HYPERCERTS_HREF,
  role: 'connection',
  areas: ['economies-governance'],
  sub: h.location,
  published: true,
  dateLabel: h.dateLabel,
}))

// Flatten every point's interventions into deduped impact claims, tagged with the
// focus area(s) they serve. A claim that shows up under two fields (e.g. the
// open-compute portfolio) is merged and carries both.
const INTERVENTIONS: Claim[] = (() => {
  const map = new Map<string, Claim>()
  for (const p of INFLECTION_POINTS) {
    for (const it of p.interventions ?? []) {
      // Drop navigation-only links to the insights feed — not claimable work.
      if (it.href && it.href.startsWith('/insights')) continue
      const key = `${it.role}::${it.label}`
      const existing = map.get(key)
      if (existing) {
        if (!existing.areas.includes(p.area)) existing.areas.push(p.area)
      } else {
        map.set(key, {
          key,
          label: it.label,
          href: it.href,
          role: it.role,
          areas: [p.area],
          sub: p.opportunitySpace,
        })
      }
    }
  }
  return [...map.values()]
})()

// Published hypercerts lead, then the interventions.
const CLAIMS: Claim[] = [...PUBLISHED, ...INTERVENTIONS]

type FilterKey = FocusAreaKey | 'all'

export default function HypercertExamples() {
  const [filter, setFilter] = useState<FilterKey>('all')

  const visible = useMemo(
    () => (filter === 'all' ? CLAIMS : CLAIMS.filter((c) => c.areas.includes(filter))),
    [filter],
  )

  // Buckets in the canonical toolkit order, keeping only those with claims.
  const buckets = useMemo(
    () =>
      PL_ROLE_ORDER.map((role) => ({ role, items: visible.filter((c) => c.role === role) })).filter(
        (b) => b.items.length > 0,
      ),
    [visible],
  )

  const countFor = (key: FilterKey) =>
    key === 'all' ? CLAIMS.length : CLAIMS.filter((c) => c.areas.includes(key)).length

  return (
    <div>
      {/* Focus-area pill filters */}
      <div className="-mx-1 mb-8 flex flex-wrap gap-2 px-1">
        <FilterPill label="All fields" count={countFor('all')} active={filter === 'all'} onClick={() => setFilter('all')} />
        {FOCUS_AREAS.map((fa) => (
          <FilterPill
            key={fa.key}
            label={fa.label}
            icon={FA_ICON[fa.key]}
            count={countFor(fa.key)}
            active={filter === fa.key}
            onClick={() => setFilter(fa.key)}
          />
        ))}
      </div>

      {/* Intervention buckets, each a labelled row of muted claim cards */}
      <div className="space-y-8">
        {buckets.map(({ role, items }) => (
          <div key={role}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                style={{
                  color: HAND_COLOR,
                  borderColor: 'color-mix(in srgb, var(--impact-hand) 34%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--impact-hand) 8%, transparent)',
                }}
              >
                {ROLE_META[role].label}
              </span>
              <span className="text-[13px] leading-snug text-gray-500">{ROLE_META[role].description}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <ClaimCard key={c.key} claim={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  icon?: AreaIconType
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'border-gray-300 bg-white text-black shadow-sm'
          : 'border-gray-200 bg-transparent text-gray-500 hover:bg-white/70 hover:text-black'
      }`}
    >
      {icon && (
        <span
          className="flex h-4 w-4 items-center justify-center"
          style={{ color: active ? 'var(--impact-hand)' : '#9ca3af' }}
        >
          <AreaIcon type={icon} className="block h-3.5 w-3.5" />
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
      <span className="text-xs tabular-nums text-gray-400">{count}</span>
    </button>
  )
}

// A single toned-down "impact claim" card — the muted, imageless echo of the
// glossy hypercert cards on the live page. Published editions get a real badge.
function ClaimCard({ claim }: { claim: Claim }) {
  const external = !!claim.href && /^https?:\/\//.test(claim.href)
  const body = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        {claim.published ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]"
            style={{
              color: HAND_COLOR,
              backgroundColor: 'color-mix(in srgb, var(--impact-hand) 10%, transparent)',
            }}
          >
            <span aria-hidden className="text-[8px]">◆</span>
            Hypercert
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            Impact claim
          </span>
        )}
        <span className="flex items-center gap-1">
          {claim.areas.map((a) => (
            <span
              key={a}
              title={FOCUS_AREAS.find((f) => f.key === a)?.label}
              className="flex h-4 w-4 items-center justify-center text-gray-300"
            >
              <AreaIcon type={FA_ICON[a]} className="block h-3.5 w-3.5" />
            </span>
          ))}
        </span>
      </div>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
        {claim.dateLabel ? `${claim.sub} · ${claim.dateLabel}` : claim.sub}
      </div>
      <div className="text-sm font-medium leading-snug text-black">{claim.label}</div>
      {claim.href && (
        <span className="mt-3 inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-400 transition-colors group-hover:text-blue">
          {claim.published ? 'View impact claim' : 'View'}
          <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </>
  )

  const cls = 'group flex flex-col rounded-xl border border-gray-200 bg-gray-50/60 p-4 transition-all'

  if (!claim.href) {
    return <div className={cls}>{body}</div>
  }
  return (
    <a
      href={claim.href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${cls} hover:border-gray-300 hover:bg-white hover:shadow-sm`}
    >
      {body}
    </a>
  )
}
