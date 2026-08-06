'use client'

// "Fund this effort" — a GoFundMe-style funding mockup for the hypercerts.
// PROTOTYPE only: no payment is taken and no data leaves the browser.
//
// Opened from inside a hypercert's detail modal as a contained pop-out (the
// rest of plrd.org stays dimmed behind it). The funder can:
//   • select individual hypercerts, OR pick a per-focus-area collection, on
//     the left where every card is presented (focus areas with no live claims
//     yet show blurred "coming soon" placeholders);
//   • choose a consumer-scale amount from chips, or enter an open-ended amount;
//   • run a mock checkout (USDC / Card / PayPal / Apple Pay / Wire).
// There is no price on any effort — the funder chooses what to give.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hypercert } from '@/data/hypercerts'
import { FOCUS_AREAS, INFLECTION_POINTS, inflectionSlug, type FocusAreaKey } from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import { TOOLKIT_V2, HAND_COLOR, type ToolId } from '@/lib/field-velocity'

// Public URL of this prototype page, used for the share-on-X link.
const SHARE_URL = 'https://www.plrd.org/impact-preview-eb61fba1b98e/'

/** Viewport rect of the detail hero at click time, so the checkout can fly a
 *  clone of that card down into its contact-sheet slot. */
export type MorphFrom = { top: number; left: number; width: number; height: number; image: string }

// Consumer-scale preset tiers (GoFundMe-style). Not a price — a suggestion.
const PRESETS = [25, 50, 100, 250]
const DEFAULT_AMOUNT = 50

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

// The real hypercerts all sit under Economies & Governance.
const LIVE_AREA: FocusAreaKey = 'economies-governance'

// Placeholder efforts for focus areas without live claims yet — rendered as
// blurred "coming soon" cards so every focus area has something to show.
const MOCK_EFFORTS: { id: string; area: FocusAreaKey; title: string; interventions: ToolId[] }[] = [
  { id: 'dhr-1', area: 'digital-human-rights', title: 'Censorship-resistant comms retreat', interventions: ['connection', 'infrastructure'] },
  { id: 'dhr-2', area: 'digital-human-rights', title: 'Provenance & attestation sprint', interventions: ['infrastructure', 'legibility'] },
  { id: 'air-1', area: 'ai-robotics', title: 'Open agent-infrastructure lab', interventions: ['infrastructure', 'translation'] },
  { id: 'air-2', area: 'ai-robotics', title: 'Robotics safety residency', interventions: ['connection', 'policy'] },
  { id: 'neuro-1', area: 'neurotech', title: 'BCI open-data workshop', interventions: ['legibility', 'connection'] },
  { id: 'neuro-2', area: 'neurotech', title: 'NeuroAI methods retreat', interventions: ['connection', 'funding'] },
]

// Mock intervention tags for the live claims (prototype). Real claims would
// carry these on the record itself.
const CERT_INTERVENTIONS: Record<string, ToolId[]> = {
  'ierr-2025': ['connection', 'funding', 'legibility'],
  'dacc-2025': ['connection', 'funding', 'culture'],
  'rr-2026': ['connection', 'funding', 'legibility'],
}

function certInterventions(rkey: string): ToolId[] {
  return CERT_INTERVENTIONS[rkey] ?? ['connection', 'funding']
}

// Popularity proxy for the “Most popular” sort (prototype): documented spend
// plus the length of the evidence trail.
function certPopularity(c: Hypercert): number {
  return (c.funding?.costUsd ?? 0) + (c.evidence?.length ?? 0) * 1000
}

function certTime(c: Hypercert): number {
  return new Date(c.startDate || c.endDate || 0).getTime()
}

function accentFor(area: FocusAreaKey): string {
  return FOCUS_AREAS.find((f) => f.key === area)?.accent ?? '#1982F4'
}

function labelFor(area: FocusAreaKey): string {
  return FOCUS_AREAS.find((f) => f.key === area)?.label ?? area
}

function usd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

type Mode = 'individual' | 'collections'
// A collection's provenance. Also the id of the collection *type* the reader
// first picks in the two-step Collections flow.
type CollectionGroup = 'focus' | 'intervention' | 'inflection' | 'curated'

// Curated, human/movement-picked bundles (prototype). Each backs the live
// claims; the framing is who assembled it and why.
const CURATED: { key: string; label: string; badge: string; oneLiner: string }[] = [
  {
    key: 'juan-benet',
    label: "Juan Benet's collection",
    badge: 'JB',
    oneLiner: 'Frontier bets Juan is personally backing across PL R&D.',
  },
  {
    key: 'e-accel',
    label: 'e/accel collection',
    badge: 'e/',
    oneLiner: 'Efforts that compound the rate of progress itself.',
  },
  {
    key: 'fridays-for-future',
    label: 'Fridays for Future collection',
    badge: 'FF',
    oneLiner: 'Climate-aligned work, verified on open infrastructure.',
  },
]

// The collection *types* the reader picks between, top level of the flow.
const COLLECTION_TYPES: { id: CollectionGroup; label: string; blurb: string }[] = [
  { id: 'focus', label: 'Focus areas', blurb: 'Back a whole PL R&D field in one gift.' },
  { id: 'intervention', label: 'Intervention types', blurb: 'Fund a kind of work from the PL R&D toolkit.' },
  { id: 'inflection', label: 'Inflection points', blurb: 'Fund progress toward a specific field shift we are betting on.' },
  { id: 'curated', label: 'Curated collections', blurb: 'Hand-picked bundles from people and movements.' },
]
type Step = 'select' | 'pay' | 'done'
type PayMethod = 'USDC' | 'Card' | 'PayPal' | 'Apple Pay' | 'Wire'
type SortKey = 'recent' | 'popular' | 'title'
type AreaFilter = FocusAreaKey | 'all'
type InterventionFilter = ToolId | 'all'

// A collection selected into the cart, rendered as a single line item.
type ActiveCollection = { key: string; group: CollectionGroup; label: string; images: string[]; rkeys: string[]; count: number }

// How many effort cards to reveal before the reader scrolls for more.
const PAGE_SIZE = 6

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'recent', label: 'Most recent' },
  { id: 'popular', label: 'Most popular' },
  { id: 'title', label: 'A–Z' },
]

/** Trigger button — drop into a hypercert detail modal. */
export function FundEffortButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110 hover:shadow-md"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Fund efforts like this
    </button>
  )
}

export default function FundingCheckout({
  certs,
  initialRkey,
  morphFrom,
  onClose,
}: {
  certs: Hypercert[]
  initialRkey?: string
  morphFrom?: MorphFrom | null
  onClose: () => void
}) {
  const [mode, setMode] = useState<Mode>('individual')
  // Which collection *type* is expanded in the two-step Collections flow.
  const [openType, setOpenType] = useState<CollectionGroup | null>(null)
  const [step, setStep] = useState<Step>('select')
  // Cumulative cart: individually-added efforts + added collections. Both
  // persist across mode / filter / sort switches so nothing gets dropped when
  // the reader browses around.
  const [cartEfforts, setCartEfforts] = useState<Set<string>>(
    () => new Set(initialRkey ? [initialRkey] : []),
  )
  const [cartCollections, setCartCollections] = useState<ActiveCollection[]>([])

  // Individual-mode filter + sort + progressive reveal.
  const [filterArea, setFilterArea] = useState<AreaFilter>('all')
  const [filterIntervention, setFilterIntervention] = useState<InterventionFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('recent')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT)
  const [custom, setCustom] = useState(false)
  const [method, setMethod] = useState<PayMethod>('USDC')

  // Fly-down clone: measure the launching card's slot on mount, then animate a
  // fixed clone of the hero from its click-time rect into that slot.
  const launchRef = useRef<HTMLButtonElement | null>(null)
  const [clone, setClone] = useState<{ from: MorphFrom; to: MorphFrom } | null>(null)
  useLayoutEffect(() => {
    if (!morphFrom || !launchRef.current) return
    const r = launchRef.current.getBoundingClientRect()
    setClone({
      from: morphFrom,
      to: { top: r.top, left: r.left, width: r.width, height: r.height, image: morphFrom.image },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll + close on Escape.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Efforts pulled in by any added collection.
  const collectionEffortKeys = useMemo(() => {
    const s = new Set<string>()
    cartCollections.forEach((col) => col.rkeys.forEach((r) => s.add(r)))
    return s
  }, [cartCollections])

  // Individual line items = efforts added on their own and NOT already covered
  // by a collection in the cart (avoids showing the same effort twice).
  const selectedList = certs.filter(
    (c) => cartEfforts.has(c.rkey) && !collectionEffortKeys.has(c.rkey),
  )

  // Distinct efforts backed across everything in the cart.
  const distinctEffortCount = useMemo(() => {
    const s = new Set<string>(collectionEffortKeys)
    cartEfforts.forEach((r) => s.add(r))
    return s.size
  }, [collectionEffortKeys, cartEfforts])

  const cartIsEmpty = cartCollections.length === 0 && selectedList.length === 0
  const valid = amount > 0 && !cartIsEmpty

  // Per-focus-area collections. Economies & Governance is live (real claims);
  // the rest are "coming soon" mocks.
  const collections = useMemo(
    () =>
      FOCUS_AREAS.map((fa) => {
        const live = fa.key === LIVE_AREA
        return {
          key: fa.key,
          label: fa.label,
          rkeys: live ? certs.map((c) => c.rkey) : [],
          images: live ? certs.map((c) => c.image) : [],
          comingSoon: !live,
        }
      }),
    [certs],
  )

  // Intervention-type collections — the PL R&D toolkit from the methodology
  // section. In this prototype every intervention backs the live claims; the
  // copy frames the gift around the kind of work being funded.
  const interventionCollections = useMemo(
    () =>
      TOOLKIT_V2.map((t) => ({
        key: t.id,
        label: t.title,
        subtitle: t.subtitle,
        oneLiner: t.oneLiner,
        rkeys: certs.map((c) => c.rkey),
        images: certs.map((c) => c.image),
      })),
    [certs],
  )

  // Inflection-point collections — pulled from the inflection points tracked
  // further up the page. Backing one funds the work on that point's critical
  // path (prototype: the live claims).
  const inflectionCollections = useMemo(
    () =>
      INFLECTION_POINTS.map((p) => ({
        key: inflectionSlug(p),
        area: p.area,
        label: p.title,
        subtitle: labelFor(p.area),
        oneLiner: p.opportunitySpace,
        rkeys: certs.map((c) => c.rkey),
        images: certs.map((c) => c.image),
      })),
    [certs],
  )

  // Curated, hand-picked bundles.
  const curatedCollections = useMemo(
    () =>
      CURATED.map((c) => ({
        key: c.key,
        label: c.label,
        badge: c.badge,
        oneLiner: c.oneLiner,
        rkeys: certs.map((x) => x.rkey),
        images: certs.map((x) => x.image),
      })),
    [certs],
  )

  // How many collections live under each type (shown on the type tiles) and the
  // metadata for the currently drilled-into type.
  const typeCounts: Record<CollectionGroup, number> = {
    focus: collections.length,
    intervention: interventionCollections.length,
    inflection: inflectionCollections.length,
    curated: curatedCollections.length,
  }
  const openTypeMeta = COLLECTION_TYPES.find((t) => t.id === openType)

  // Unified, filterable grid: live claims + “coming soon” placeholders. Filter
  // by focus area / intervention type, then sort, then progressively reveal.
  const gridItems = useMemo(() => {
    type Item =
      | { kind: 'cert'; key: string; area: FocusAreaKey; interventions: ToolId[]; time: number; pop: number; cert: Hypercert }
      | { kind: 'mock'; key: string; area: FocusAreaKey; interventions: ToolId[]; time: number; pop: number; title: string }

    const items: Item[] = [
      ...certs.map((c) => ({
        kind: 'cert' as const,
        key: c.rkey,
        area: LIVE_AREA,
        interventions: certInterventions(c.rkey),
        time: certTime(c),
        pop: certPopularity(c),
        cert: c,
      })),
      ...MOCK_EFFORTS.map((m) => ({
        kind: 'mock' as const,
        key: m.id,
        area: m.area,
        interventions: m.interventions,
        time: 0,
        pop: -1,
        title: m.title,
      })),
    ]

    const filtered = items.filter(
      (it) =>
        (filterArea === 'all' || it.area === filterArea) &&
        (filterIntervention === 'all' || it.interventions.includes(filterIntervention)),
    )

    filtered.sort((a, b) => {
      // Live claims always rank above “coming soon” placeholders.
      if ((a.kind === 'cert') !== (b.kind === 'cert')) return a.kind === 'cert' ? -1 : 1
      if (sortBy === 'title') {
        const at = a.kind === 'cert' ? a.cert.title : a.title
        const bt = b.kind === 'cert' ? b.cert.title : b.title
        return at.localeCompare(bt)
      }
      if (sortBy === 'popular') return b.pop - a.pop
      return b.time - a.time // recent
    })

    return filtered
  }, [certs, filterArea, filterIntervention, sortBy])

  const visibleItems = gridItems.slice(0, visibleCount)
  const hasMore = visibleCount < gridItems.length

  // Reset the reveal window whenever the filter or sort changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filterArea, filterIntervention, sortBy])

  // Infinite scroll: reveal another page when the sentinel enters the list.
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (mode !== 'individual' || !hasMore) return
    const root = scrollRef.current
    const target = sentinelRef.current
    if (!root || !target) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((n) => Math.min(n + PAGE_SIZE, gridItems.length))
        }
      },
      { root, rootMargin: '200px' },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [mode, hasMore, gridItems.length])

  // Add/remove a single effort — accumulates, never wipes the rest.
  const toggleCert = (rkey: string) => {
    setCartEfforts((prev) => {
      const next = new Set(prev)
      if (next.has(rkey)) next.delete(rkey)
      else next.add(rkey)
      return next
    })
  }

  const collectionInCart = (col: ActiveCollection) =>
    cartCollections.some((c) => c.key === col.key && c.group === col.group)

  // Add/remove a whole collection as its own cart line item — accumulates
  // alongside individual efforts and other collections.
  const toggleCollection = (col: ActiveCollection, comingSoon: boolean) => {
    if (comingSoon) return
    setCartCollections((prev) => {
      const exists = prev.some((c) => c.key === col.key && c.group === col.group)
      return exists
        ? prev.filter((c) => !(c.key === col.key && c.group === col.group))
        : [...prev, col]
    })
  }

  const removeCollection = (key: string, group: CollectionGroup) =>
    setCartCollections((prev) => prev.filter((c) => !(c.key === key && c.group === group)))

  const clearCart = () => {
    setCartEfforts(new Set())
    setCartCollections([])
    setStep('select')
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/55 p-3 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Contained pop-out panel — plrd.org stays visible, dimmed, behind it. */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative my-2 flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ height: 'min(88vh, 900px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-black">Accelerate R&amp;D</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">
          {/* Left — individual cards or per-focus-area collections */}
          <div className="flex min-h-0 flex-col">
            {/* Fixed controls: mode toggle + filters / sort (always visible) */}
            <div className="shrink-0 border-b border-gray-100 bg-white px-6 pb-3 pt-6">
              <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
                {(
                  [
                    ['individual', 'Individual efforts'],
                    ['collections', 'Collections'],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all ${
                      mode === m ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'individual' ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <FilterSelect
                    label="Focus area"
                    value={filterArea}
                    onChange={(v) => setFilterArea(v as AreaFilter)}
                    options={[
                      { value: 'all', label: 'All focus areas' },
                      ...FOCUS_AREAS.map((f) => ({ value: f.key, label: f.label })),
                    ]}
                  />
                  <FilterSelect
                    label="Intervention"
                    value={filterIntervention}
                    onChange={(v) => setFilterIntervention(v as InterventionFilter)}
                    options={[
                      { value: 'all', label: 'All interventions' },
                      ...TOOLKIT_V2.map((t) => ({ value: t.id, label: t.title })),
                    ]}
                  />
                  <FilterSelect
                    label="Sort"
                    value={sortBy}
                    onChange={(v) => setSortBy(v as SortKey)}
                    options={SORT_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
                  />
                </div>
              ) : null}
            </div>

            {/* Scrollable list */}
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
              {mode === 'individual' ? (
                <>
                  {gridItems.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-500">
                      No efforts match these filters yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {visibleItems.map((it, i) =>
                        it.kind === 'cert' ? (
                          <EffortCard
                            key={it.key}
                            cert={it.cert}
                            index={i}
                            selected={cartEfforts.has(it.key) || collectionEffortKeys.has(it.key)}
                            onToggle={() => toggleCert(it.key)}
                            noEntrance={it.key === initialRkey && Boolean(morphFrom)}
                            hidden={it.key === initialRkey && Boolean(clone)}
                            innerRef={it.key === initialRkey ? (el) => (launchRef.current = el) : undefined}
                          />
                        ) : (
                          <MockCard key={it.key} area={it.area} title={it.title} index={i} />
                        ),
                      )}
                    </div>
                  )}

                  {/* Sentinel — reveals another page as it scrolls into view */}
                  {hasMore && (
                    <div ref={sentinelRef} className="flex justify-center py-6 text-[12px] text-gray-400">
                      Loading more efforts…
                    </div>
                  )}
                </>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  {openType === null ? (
                    // Step 1 — a grid of collection-*type* tiles (date-picker style).
                    <motion.div
                      key="type-grid"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-500">
                        Pick a collection type to browse the collections inside it. You can still
                        fine-tune the mix under{' '}
                        <button
                          type="button"
                          onClick={() => setMode('individual')}
                          className="font-medium text-blue hover:underline"
                        >
                          Individual efforts
                        </button>
                        .
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {COLLECTION_TYPES.map((type) => (
                          <CollectionTypeTile
                            key={type.id}
                            id={type.id}
                            label={type.label}
                            blurb={type.blurb}
                            count={typeCounts[type.id]}
                            onClick={() => setOpenType(type.id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    // Step 2 — the collections inside the chosen type, one per row.
                    <motion.div
                      key={openType}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenType(null)}
                        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        All collection types
                      </button>
                      <div className="mb-4">
                        <h3 className="text-[15.5px] font-semibold text-black">{openTypeMeta?.label}</h3>
                        <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{openTypeMeta?.blurb}</p>
                      </div>
                      <div className="flex flex-col gap-3.5">
                        {openType === 'focus' &&
                          collections.map((col) => (
                            <CollectionRow
                              key={col.key}
                              area={col.key}
                              label={col.label}
                              images={col.images}
                              count={col.rkeys.length}
                              comingSoon={col.comingSoon}
                              active={collectionInCart({ key: col.key, group: 'focus', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length })}
                              onPick={() =>
                                toggleCollection(
                                  { key: col.key, group: 'focus', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length },
                                  col.comingSoon,
                                )
                              }
                            />
                          ))}
                        {openType === 'intervention' &&
                          interventionCollections.map((col) => (
                            <InterventionRow
                              key={col.key}
                              label={col.label}
                              subtitle={col.subtitle}
                              oneLiner={col.oneLiner}
                              images={col.images}
                              count={col.rkeys.length}
                              active={collectionInCart({ key: col.key, group: 'intervention', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length })}
                              onPick={() =>
                                toggleCollection(
                                  { key: col.key, group: 'intervention', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length },
                                  false,
                                )
                              }
                            />
                          ))}
                        {openType === 'inflection' &&
                          inflectionCollections.map((col) => (
                            <BundleRow
                              key={col.key}
                              badge={<AreaIcon type={FA_ICON[col.area]} className="h-5 w-5 text-white" />}
                              label={col.label}
                              subtitle={col.subtitle}
                              oneLiner={col.oneLiner}
                              images={col.images}
                              count={col.rkeys.length}
                              active={collectionInCart({ key: col.key, group: 'inflection', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length })}
                              onPick={() =>
                                toggleCollection(
                                  { key: col.key, group: 'inflection', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length },
                                  false,
                                )
                              }
                            />
                          ))}
                        {openType === 'curated' &&
                          curatedCollections.map((col) => (
                            <BundleRow
                              key={col.key}
                              badge={<span className="text-[13px] font-bold leading-none text-white">{col.badge}</span>}
                              label={col.label}
                              oneLiner={col.oneLiner}
                              images={col.images}
                              count={col.rkeys.length}
                              active={collectionInCart({ key: col.key, group: 'curated', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length })}
                              onPick={() =>
                                toggleCollection(
                                  { key: col.key, group: 'curated', label: col.label, images: col.images, rkeys: col.rkeys, count: col.rkeys.length },
                                  false,
                                )
                              }
                            />
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Always-visible footer link (not a card) to the other view */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'individual' ? 'collections' : 'individual')}
                className="text-[13px] font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-blue hover:decoration-blue"
              >
                {mode === 'individual'
                  ? 'Fund a whole collection instead →'
                  : 'Fund individual efforts instead →'}
              </button>
            </div>
          </div>

          {/* Right — selection + amount + checkout */}
          <aside className="flex min-h-0 flex-col border-t border-gray-200 bg-gray-50 lg:border-l lg:border-t-0">
            <AmountPanel
              step={step}
              setStep={setStep}
              selectedList={selectedList}
              collections={cartCollections}
              distinctEffortCount={distinctEffortCount}
              onRemove={(r) => toggleCert(r)}
              onRemoveCollection={removeCollection}
              amount={amount}
              setAmount={setAmount}
              custom={custom}
              setCustom={setCustom}
              method={method}
              setMethod={setMethod}
              valid={valid}
              onClose={onClose}
              onReset={clearCart}
            />
          </aside>
        </div>
      </motion.div>

      {/* Flying clone — shrinks the hero card into its contact-sheet slot */}
      {clone && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img
          src={clone.from.image}
          alt=""
          className="pointer-events-none fixed object-cover shadow-2xl"
          style={{ zIndex: 90 }}
          initial={{
            top: clone.from.top,
            left: clone.from.left,
            width: clone.from.width,
            height: clone.from.height,
            borderRadius: 22,
          }}
          animate={{
            top: clone.to.top,
            left: clone.to.left,
            width: clone.to.width,
            height: clone.to.height,
            borderRadius: 12,
          }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          onAnimationComplete={() => setClone(null)}
        />
      )}
    </motion.div>,
    document.body,
  )
}

function EffortCard({
  cert,
  index,
  selected,
  onToggle,
  innerRef,
  noEntrance,
  hidden,
}: {
  cert: Hypercert
  index: number
  selected: boolean
  onToggle: () => void
  innerRef?: (el: HTMLButtonElement | null) => void
  noEntrance?: boolean
  hidden?: boolean
}) {
  return (
    <motion.button
      ref={innerRef}
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      initial={noEntrance ? false : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: hidden ? 0 : 1, y: 0, scale: 1 }}
      transition={{ delay: noEntrance ? 0 : Math.min(index * 0.03, 0.3), duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3 }}
      className={`group relative flex aspect-[4/5] flex-col overflow-hidden rounded-xl border text-left transition-shadow ${
        selected ? 'border-blue ring-2 ring-blue/40' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cert.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <span
        className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
          selected ? 'border-blue bg-blue text-white' : 'border-white/70 bg-black/20 text-transparent backdrop-blur-sm'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {cert.status === 'upcoming' && (
        <span className="absolute left-2 top-2 rounded-full bg-black/35 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          Upcoming
        </span>
      )}

      <span className="relative mt-auto p-3">
        <span className="block text-[9px] font-semibold uppercase tracking-wide text-white/70">{cert.location}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-snug text-white">{cert.title}</span>
      </span>
    </motion.button>
  )
}

// Blurred "coming soon" placeholder for a focus area without live claims.
function MockCard({ area, title, index }: { area: FocusAreaKey; title: string; index: number }) {
  const accent = accentFor(area)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.3 }}
      className="relative flex aspect-[4/5] flex-col overflow-hidden rounded-xl border border-dashed border-gray-300"
      aria-disabled
    >
      <span className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${accent}33, ${accent}0d 65%, transparent)` }} />
      {/* Blurred, faux content */}
      <span className="absolute inset-0 backdrop-blur-[3px]" />
      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-600 backdrop-blur-sm">
        <AreaIcon type={FA_ICON[area]} className="block h-2.5 w-2.5" />
        {labelFor(area)}
      </span>
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm">
          Coming soon
        </span>
      </span>
      <span className="relative mt-auto p-3">
        <span className="line-clamp-2 block text-[12px] font-semibold leading-snug text-gray-500 blur-[0.3px]">{title}</span>
      </span>
    </motion.div>
  )
}

// Compact labelled dropdown used in the sticky filter/sort bar.
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white pl-2.5 pr-1 py-1 text-[12px] transition-colors focus-within:border-blue hover:border-gray-300">
      <span className="font-medium text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent pr-1 text-[12px] font-semibold text-black outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// Intervention-type collection row (PL R&D toolkit). Styled like a focus-area
// row but tinted with the “our hand” intervention color and lettered badges.
function InterventionRow({
  label,
  subtitle,
  oneLiner,
  images,
  count,
  active,
  onPick,
}: {
  label: string
  subtitle: string
  oneLiner: string
  images: string[]
  count: number
  active: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPick}
      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
        active ? 'border-blue ring-2 ring-blue/30' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Lettered badge + stacked live thumbnails */}
      <div className="flex shrink-0 -space-x-3.5">
        <span
          className="z-10 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white text-lg font-bold text-white shadow-sm"
          style={{ background: HAND_COLOR }}
        >
          {label[0]}
        </span>
        {images.slice(0, 2).map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow-sm"
          />
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15.5px] font-semibold text-black">{label}</span>
          <span className="hidden text-[12px] font-medium text-gray-400 sm:inline">· {subtitle}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-500">
            {count}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">{oneLiner}</p>
      </div>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
          active ? 'border-blue bg-blue text-white' : 'border-gray-300 text-transparent'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </button>
  )
}

// Per-type glyph shown on the collection-type tiles.
function TypeGlyph({ id }: { id: CollectionGroup }) {
  const common = { className: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' } as const
  switch (id) {
    case 'focus':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z" />
        </svg>
      )
    case 'intervention':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 3.5a2.12 2.12 0 013 3L12 16l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    case 'inflection':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 18l5-6 4 3 7-8" />
          <circle cx={20} cy={7} r={1.6} fill="currentColor" stroke="none" />
        </svg>
      )
    case 'curated':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 16.9l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 4z" />
        </svg>
      )
  }
}

// A collection-*type* tile (date-picker style). Multiple sit per row; clicking
// one drills into the collections it contains.
function CollectionTypeTile({
  id,
  label,
  blurb,
  count,
  onClick,
}: {
  id: CollectionGroup
  label: string
  blurb: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 p-4 text-left transition-all hover:border-blue/40 hover:bg-blue/[0.02] hover:shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ background: HAND_COLOR }}
        >
          <TypeGlyph id={id} />
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-500">
          {count}
        </span>
      </div>
      <div className="text-[15px] font-semibold leading-snug text-black">{label}</div>
      <p className="mt-1 text-[12.5px] leading-snug text-gray-500">{blurb}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-gray-400 transition-colors group-hover:text-blue">
        Browse
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  )
}

// Generic collection row for inflection-point + curated bundles: a tinted badge
// (area icon / initials), stacked live thumbnails, label + one-liner + count.
function BundleRow({
  badge,
  label,
  subtitle,
  oneLiner,
  images,
  count,
  active,
  onPick,
}: {
  badge: ReactNode
  label: string
  subtitle?: string
  oneLiner: string
  images: string[]
  count: number
  active: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPick}
      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
        active ? 'border-blue ring-2 ring-blue/30' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex shrink-0 -space-x-3.5">
        <span
          className="z-10 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white shadow-sm"
          style={{ background: HAND_COLOR }}
        >
          {badge}
        </span>
        {images.slice(0, 2).map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow-sm"
          />
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15.5px] font-semibold leading-snug text-black">{label}</span>
          {subtitle && <span className="text-[12px] font-medium text-gray-400">· {subtitle}</span>}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-500">
            {count}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">{oneLiner}</p>
      </div>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
          active ? 'border-blue bg-blue text-white' : 'border-gray-300 text-transparent'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </button>
  )
}

function CollectionRow({
  area,
  label,
  images,
  count,
  comingSoon,
  active,
  onPick,
}: {
  area: FocusAreaKey
  label: string
  images: string[]
  count: number
  comingSoon: boolean
  active: boolean
  onPick: () => void
}) {
  const accent = accentFor(area)
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-disabled={comingSoon}
      onClick={onPick}
      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
        comingSoon
          ? 'cursor-default border-dashed border-gray-300 bg-gray-50/60'
          : active
            ? 'border-blue ring-2 ring-blue/30'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Stacked thumbnails (real photos live; tinted blur when coming soon) */}
      <div className="flex shrink-0 -space-x-3.5">
        {comingSoon
          ? [0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white shadow-sm backdrop-blur-[2px]"
                style={{ background: `linear-gradient(150deg, ${accent}40, ${accent}12)` }}
              >
                {i === 2 && <AreaIcon type={FA_ICON[area]} className="h-5 w-5 opacity-60" />}
              </span>
            ))
          : images.slice(0, 3).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow-sm"
              />
            ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <AreaIcon type={FA_ICON[area]} className="h-4 w-4 shrink-0" />
          <span className="text-[15.5px] font-semibold text-black">{label}</span>
          {comingSoon ? (
            <span className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Coming soon
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-500">
              {count}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">
          {comingSoon
            ? `Fund the ${label} field as claims come online.`
            : `Back every live ${label} claim in one gift.`}
        </p>
      </div>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
          active ? 'border-blue bg-blue text-white' : 'border-gray-300 text-transparent'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </button>
  )
}

// ── Payment method marks ────────────────────────────────────────────────
function PayGlyph({ method }: { method: PayMethod }) {
  switch (method) {
    case 'USDC':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="12" cy="12" r="11" fill="#2775CA" />
          <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">$</text>
        </svg>
      )
    case 'Card':
      return (
        <svg viewBox="0 0 24 16" className="h-4 w-6">
          <rect width="24" height="16" rx="2.5" fill="#334155" />
          <rect y="3.5" width="24" height="3" fill="#0f172a" />
          <rect x="3" y="10" width="8" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
      )
    case 'PayPal':
      return (
        <span className="text-[13px] font-bold italic leading-none">
          <span style={{ color: '#003087' }}>Pay</span>
          <span style={{ color: '#009cde' }}>Pal</span>
        </span>
      )
    case 'Apple Pay':
      return (
        <span className="flex items-center gap-0.5 text-[13px] font-semibold leading-none text-black">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M17.05 12.04c-.03-2.9 2.37-4.29 2.48-4.36-1.35-1.98-3.46-2.25-4.21-2.28-1.79-.18-3.5 1.05-4.41 1.05-.91 0-2.31-1.03-3.8-1-1.95.03-3.76 1.14-4.76 2.89-2.03 3.52-.52 8.73 1.46 11.59.97 1.4 2.12 2.97 3.63 2.91 1.46-.06 2.01-.94 3.77-.94 1.76 0 2.26.94 3.8.91 1.57-.03 2.56-1.42 3.52-2.83 1.11-1.62 1.57-3.19 1.6-3.27-.03-.02-3.07-1.18-3.1-4.67zM14.13 4.36c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.86-1.39 2.24-1.22 3.55 1.28.1 2.6-.65 3.41-1.63z" />
          </svg>
          Pay
        </span>
      )
    case 'Wire':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#334155" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-5 9 5M4 9v9m16-9v9M4 20h16M8 11v6M12 11v6M16 11v6" />
        </svg>
      )
  }
}

const PAY_METHODS: { id: PayMethod; wide?: boolean }[] = [
  { id: 'USDC' },
  { id: 'Card' },
  { id: 'PayPal' },
  { id: 'Apple Pay' },
  { id: 'Wire', wide: true },
]

function AmountPanel({
  step,
  setStep,
  selectedList,
  collections,
  distinctEffortCount,
  onRemove,
  onRemoveCollection,
  amount,
  setAmount,
  custom,
  setCustom,
  method,
  setMethod,
  valid,
  onClose,
  onReset,
}: {
  step: Step
  setStep: (s: Step) => void
  selectedList: Hypercert[]
  collections: ActiveCollection[]
  distinctEffortCount: number
  onRemove: (rkey: string) => void
  onRemoveCollection: (key: string, group: CollectionGroup) => void
  amount: number
  setAmount: (n: number) => void
  custom: boolean
  setCustom: (b: boolean) => void
  method: PayMethod
  setMethod: (m: PayMethod) => void
  valid: boolean
  onClose: () => void
  onReset: () => void
}) {
  const count = distinctEffortCount
  const isEmpty = collections.length === 0 && selectedList.length === 0

  if (step === 'done') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue/10 text-blue">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-black">Funding confirmed</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
          You pledged {usd(amount)} via {method} across {count} effort
          {count === 1 ? '' : 's'}. In production this would mint an on-chain funding record against each
          hypercert.
        </p>
        <button
          type="button"
          onClick={() => {
            const text = `I just backed ${count} PL R&D effort${
              count === 1 ? '' : 's'
            } accelerating open, verifiable science with a ${usd(amount)} gift. Fund the future of computing 👇`
            const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
              SHARE_URL,
            )}`
            window.open(url, '_blank', 'noopener,noreferrer')
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-125"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
          </svg>
          Share on X
        </button>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300"
          >
            Fund more
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {step === 'select' ? 'Funding' : 'Review'}
          </span>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-600">
            {count} effort{count === 1 ? '' : 's'}
          </span>
        </div>
        {!isEmpty && step === 'select' && (
          <button type="button" onClick={onReset} className="text-[12px] font-medium text-gray-400 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-gray-700">Nothing added yet</p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Add efforts and collections from any view — they stack up here as you browse.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {/* Collections first — each an accumulating line item */}
              {collections.map((col) => (
                <li
                  key={`${col.group}:${col.key}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5"
                >
                  <div className="flex shrink-0 -space-x-3">
                    {col.images.slice(0, 3).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="h-10 w-10 rounded-lg border-2 border-white object-cover shadow-sm"
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {col.group === 'focus'
                        ? 'Focus-area collection'
                        : col.group === 'intervention'
                          ? 'Intervention collection'
                          : col.group === 'inflection'
                            ? 'Inflection-point collection'
                            : 'Curated collection'}
                    </div>
                    <div className="truncate text-[13px] font-semibold text-black">{col.label}</div>
                    <div className="text-[11px] text-gray-500">
                      {col.count} effort{col.count === 1 ? '' : 's'}
                    </div>
                  </div>
                  {step === 'select' && (
                    <button
                      type="button"
                      onClick={() => onRemoveCollection(col.key, col.group)}
                      aria-label="Remove collection"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}

              {/* Individually-added efforts (not already covered by a collection) */}
              {selectedList.map((c) => (
                <li key={c.rkey} className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                  <span className="min-w-0 flex-1 line-clamp-2 text-[12.5px] font-semibold leading-snug text-black">
                    {c.title}
                  </span>
                  {step === 'select' && (
                    <button
                      type="button"
                      onClick={() => onRemove(c.rkey)}
                      aria-label="Remove"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {step === 'select' && (
              <div className="mt-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Choose an amount
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => {
                    const active = !custom && amount === p
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setAmount(p)
                          setCustom(false)
                        }}
                        className={`rounded-xl border px-2 py-2.5 text-[15px] font-semibold tabular-nums transition-all ${
                          active
                            ? 'border-blue bg-blue/5 text-blue ring-1 ring-blue/40'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        {usd(p)}
                      </button>
                    )
                  })}
                </div>
                <label
                  className={`mt-2 flex items-center gap-2 rounded-xl border px-3.5 py-3 transition-colors ${
                    custom ? 'border-blue ring-1 ring-blue/40 bg-white' : 'border-gray-200 bg-white focus-within:border-blue'
                  }`}
                >
                  <span className="text-lg font-semibold text-gray-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    inputMode="numeric"
                    placeholder="Enter any amount"
                    value={custom ? amount || '' : ''}
                    onFocus={() => setCustom(true)}
                    onChange={(e) => {
                      setCustom(true)
                      setAmount(Math.max(0, Math.round(Number(e.target.value))))
                    }}
                    className="w-full bg-transparent text-lg font-semibold tabular-nums text-black outline-none placeholder:text-[15px] placeholder:font-medium placeholder:text-gray-400"
                  />
                </label>
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                  Give any amount — there&apos;s no set price. Your gift is split across the{' '}
                  {count === 1 ? 'selected effort' : `${count} selected efforts`}.
                </p>
              </div>
            )}

            {step === 'pay' && (
              <div className="mt-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Pay with</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAY_METHODS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={method === p.id}
                      onClick={() => setMethod(p.id)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-3.5 text-left transition-all ${
                        p.wide ? 'col-span-2' : ''
                      } ${
                        method === p.id
                          ? 'border-blue bg-blue/5 ring-1 ring-blue/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md border border-gray-100 bg-white">
                        <PayGlyph method={p.id} />
                      </span>
                      <span className="text-[13px] font-semibold text-gray-800">{p.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white px-5 py-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-gray-500">Your gift</span>
          <span className="text-xl font-semibold tabular-nums text-black">{usd(amount)}</span>
        </div>

        {step === 'select' ? (
          <button
            type="button"
            disabled={!valid}
            onClick={() => setStep('pay')}
            className="w-full rounded-lg bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('select')}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep('done')}
              className="flex-1 rounded-lg bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Fund now
            </button>
          </div>
        )}

      </div>
    </>
  )
}
