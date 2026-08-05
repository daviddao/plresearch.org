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

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hypercert } from '@/data/hypercerts'
import { FOCUS_AREAS, type FocusAreaKey } from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

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
const MOCK_EFFORTS: { id: string; area: FocusAreaKey; title: string }[] = [
  { id: 'dhr-1', area: 'digital-human-rights', title: 'Censorship-resistant comms retreat' },
  { id: 'dhr-2', area: 'digital-human-rights', title: 'Provenance & attestation sprint' },
  { id: 'air-1', area: 'ai-robotics', title: 'Open agent-infrastructure lab' },
  { id: 'air-2', area: 'ai-robotics', title: 'Robotics safety residency' },
  { id: 'neuro-1', area: 'neurotech', title: 'BCI open-data workshop' },
  { id: 'neuro-2', area: 'neurotech', title: 'NeuroAI methods retreat' },
]

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
type Step = 'select' | 'pay' | 'done'
type PayMethod = 'USDC' | 'Card' | 'PayPal' | 'Apple Pay' | 'Wire'

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
      Fund this effort
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
  const [step, setStep] = useState<Step>('select')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialRkey ? [initialRkey] : []),
  )
  const [activeCollection, setActiveCollection] = useState<string | null>(null)

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

  const selectedList = certs.filter((c) => selected.has(c.rkey))
  const count = selectedList.length
  const valid = amount > 0 && count > 0

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

  const toggleCert = (rkey: string) => {
    setActiveCollection(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(rkey)) next.delete(rkey)
      else next.add(rkey)
      return next
    })
  }

  const pickCollection = (key: string, rkeys: string[], comingSoon: boolean) => {
    if (comingSoon) return
    setActiveCollection(key)
    setSelected(new Set(rkeys))
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
            <h2 className="text-lg font-semibold tracking-tight text-black">Fund this effort</h2>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Mockup
            </span>
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
          <div className="min-h-0 overflow-y-auto px-6 py-6">
            <div className="mb-5 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
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
              <>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-500">
                  Pick one effort or select several. Live hypercerts carry a photo and an evidence
                  trail; other focus areas are <span className="font-medium text-gray-600">coming soon</span>.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {certs.map((c, i) => (
                    <EffortCard
                      key={c.rkey}
                      cert={c}
                      index={i}
                      selected={selected.has(c.rkey)}
                      onToggle={() => toggleCert(c.rkey)}
                      noEntrance={c.rkey === initialRkey && Boolean(morphFrom)}
                      hidden={c.rkey === initialRkey && Boolean(clone)}
                      innerRef={c.rkey === initialRkey ? (el) => (launchRef.current = el) : undefined}
                    />
                  ))}
                  {MOCK_EFFORTS.map((m, i) => (
                    <MockCard key={m.id} area={m.area} title={m.title} index={certs.length + i} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-500">
                  Fund a whole focus area in one move. You can still fine-tune the mix under{' '}
                  <button
                    type="button"
                    onClick={() => setMode('individual')}
                    className="font-medium text-blue hover:underline"
                  >
                    Individual efforts
                  </button>
                  .
                </p>
                <div className="flex flex-col gap-3.5">
                  {collections.map((col) => (
                    <CollectionRow
                      key={col.key}
                      area={col.key}
                      label={col.label}
                      images={col.images}
                      count={col.rkeys.length}
                      comingSoon={col.comingSoon}
                      active={activeCollection === col.key}
                      onPick={() => pickCollection(col.key, col.rkeys, col.comingSoon)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right — selection + amount + checkout */}
          <aside className="flex min-h-0 flex-col border-t border-gray-200 bg-gray-50 lg:border-l lg:border-t-0">
            <AmountPanel
              step={step}
              setStep={setStep}
              selectedList={selectedList}
              onRemove={(r) => toggleCert(r)}
              amount={amount}
              setAmount={setAmount}
              custom={custom}
              setCustom={setCustom}
              method={method}
              setMethod={setMethod}
              valid={valid}
              onClose={onClose}
              onReset={() => {
                setSelected(new Set())
                setActiveCollection(null)
                setStep('select')
              }}
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
  onRemove,
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
  onRemove: (rkey: string) => void
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
  const count = selectedList.length

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
          This is a mockup — no payment was taken. You pledged {usd(amount)} via {method} across {count} effort
          {count === 1 ? '' : 's'}. In production this would mint an on-chain funding record against each
          hypercert.
        </p>
        <div className="mt-6 flex gap-2">
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
        {count > 0 && step === 'select' && (
          <button type="button" onClick={onReset} className="text-[12px] font-medium text-gray-400 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {count === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-gray-700">Nothing selected yet</p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Pick efforts or a collection on the left to fund one or many at once.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
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
                      className="shrink-0 text-gray-300 transition-colors hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              Confirm funding
            </button>
          </div>
        )}
        <p className="mt-2 text-center text-[10px] leading-relaxed text-gray-400">
          Mockup only — no payment is processed.
        </p>
      </div>
    </>
  )
}
