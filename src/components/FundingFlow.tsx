'use client'

// "Fund this effort" — a GoFundMe-style funding mockup for the hypercerts.
// This is a PROTOTYPE, not a working checkout: no payment is taken and no
// data leaves the browser.
//
// Opened from inside a hypercert's detail modal (the opened effort is
// pre-selected). The funder can:
//   • select individual hypercerts, OR pick a pre-curated collection, on the
//     left where every card is presented;
//   • choose a consumer-scale amount from chips, or enter an open-ended amount;
//   • run a mock pay → confirmation.
// There is no price on any effort — the funder chooses what to give.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hypercert } from '@/data/hypercerts'

/** Viewport rect of the detail hero at click time, so the checkout can fly a
 *  clone of that card down into its contact-sheet slot. */
export type MorphFrom = { top: number; left: number; width: number; height: number; image: string }

// Consumer-scale preset tiers (GoFundMe-style). Not a price — a suggestion.
const PRESETS = [25, 50, 100, 250]
const DEFAULT_AMOUNT = 50

function usd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

type Collection = { id: string; label: string; desc: string; rkeys: string[] }

// Pre-curated bundles, derived from the real hypercert data.
function buildCollections(certs: Hypercert[]): Collection[] {
  const past = certs.filter((c) => c.status !== 'upcoming')
  const upcoming = certs.filter((c) => c.status === 'upcoming')
  const out: Collection[] = []
  if (past.length > 1)
    out.push({
      id: 'published',
      label: 'Published editions',
      desc: `Back every completed edition — ${past.length} claims with a full evidence trail.`,
      rkeys: past.map((c) => c.rkey),
    })
  if (upcoming.length > 0)
    out.push({
      id: 'next',
      label: "Back what's next",
      desc: `Fund the upcoming edition${upcoming.length > 1 ? 's' : ''} before it runs.`,
      rkeys: upcoming.map((c) => c.rkey),
    })
  out.push({
    id: 'all',
    label: 'The full series',
    desc: 'Every edition, past and upcoming — the whole Research Retreat line.',
    rkeys: certs.map((c) => c.rkey),
  })
  return out
}

type Mode = 'individual' | 'collections'
type Step = 'select' | 'pay' | 'done'

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
  /** The hypercert the checkout was opened from — pre-selected. */
  initialRkey?: string
  /** Hero rect to fly a clone down from into the launching card's slot. */
  morphFrom?: MorphFrom | null
  onClose: () => void
}) {
  const collections = useMemo(() => buildCollections(certs), [certs])
  const [mode, setMode] = useState<Mode>('individual')
  const [step, setStep] = useState<Step>('select')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialRkey ? [initialRkey] : []),
  )
  const [activeCollection, setActiveCollection] = useState<string | null>(null)

  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT)
  const [custom, setCustom] = useState(false)
  const [method, setMethod] = useState<'USDC' | 'Card' | 'Wire'>('USDC')

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

  // Lock body scroll + close on Escape while the checkout is open.
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

  const toggleCert = (rkey: string) => {
    setActiveCollection(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(rkey)) next.delete(rkey)
      else next.add(rkey)
      return next
    })
  }

  const pickCollection = (c: Collection) => {
    setActiveCollection(c.id)
    setSelected(new Set(c.rkeys))
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 lg:px-10">
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

      {/* Body: choose efforts (left) + amount / checkout (right) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_400px]">
        {/* Left — individual cards or pre-curated collections */}
        <div className="min-h-0 overflow-y-auto px-6 py-6 lg:px-10">
          {/* Mode toggle */}
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
                Pick one effort or select several. Every card is a published hypercert with its own
                evidence trail.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {certs.map((c, i) => {
                  const isLaunch = c.rkey === initialRkey
                  return (
                    <EffortCard
                      key={c.rkey}
                      cert={c}
                      index={i}
                      selected={selected.has(c.rkey)}
                      onToggle={() => toggleCert(c.rkey)}
                      // The launching card is the morph target: skip its
                      // fan-out so its slot is measurable immediately, and hide
                      // it until the flying clone lands.
                      noEntrance={isLaunch && Boolean(morphFrom)}
                      hidden={isLaunch && Boolean(clone)}
                      innerRef={isLaunch ? (el) => (launchRef.current = el) : undefined}
                    />
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-500">
                Fund a pre-curated collection in one move. You can still fine-tune the selection under{' '}
                <button
                  type="button"
                  onClick={() => setMode('individual')}
                  className="font-medium text-blue hover:underline"
                >
                  Individual efforts
                </button>
                .
              </p>
              <div className="flex flex-col gap-3">
                {collections.map((col) => {
                  const active = activeCollection === col.id
                  const previews = col.rkeys
                    .map((r) => certs.find((c) => c.rkey === r))
                    .filter((c): c is Hypercert => Boolean(c))
                  return (
                    <button
                      key={col.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => pickCollection(col)}
                      className={`flex items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                        active ? 'border-blue ring-2 ring-blue/30' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Stacked thumbnails */}
                      <div className="flex shrink-0 -space-x-3">
                        {previews.slice(0, 3).map((c) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={c.rkey}
                            src={c.image}
                            alt=""
                            className="h-12 w-12 rounded-lg border-2 border-white object-cover shadow-sm"
                          />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-black">{col.label}</span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-gray-500">
                            {col.rkeys.length}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-gray-500">{col.desc}</p>
                      </div>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                          active ? 'border-blue bg-blue text-white' : 'border-gray-300 text-transparent'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </button>
                  )
                })}
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
  /** Skip the fan-out entrance (used for the morph-target card). */
  noEntrance?: boolean
  /** Keep the slot but hide the card while the flying clone lands on it. */
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
  method: 'USDC' | 'Card' | 'Wire'
  setMethod: (m: 'USDC' | 'Card' | 'Wire') => void
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
          This is a mockup — no payment was taken. You pledged {usd(amount)} across {count} effort
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
      {/* Selection summary */}
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
                <li
                  key={c.rkey}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2"
                >
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
                {/* Consumer-scale chips */}
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
                {/* Open-ended amount */}
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
              <div className="mt-5">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Pay with</div>
                <div className="flex gap-1.5">
                  {(['USDC', 'Card', 'Wire'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={method === m}
                      onClick={() => setMethod(m)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-center text-[12px] font-medium transition-all ${
                        method === m ? 'border-blue bg-blue/5 text-blue' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer — total + CTA */}
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
