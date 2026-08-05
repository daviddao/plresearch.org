'use client'

// "Fund this effort" — a site-filling mockup of a funding flow for hypercerts.
// This is a PROTOTYPE, not a working checkout: no payment is taken and no data
// leaves the browser. The idea it explores:
//
//   1. Open a full-screen modal from the hypercerts section.
//   2. Left: every fundable effort fans out into a contact-sheet grid, with
//      focus-area + type filters up top. Click cards to select one or many.
//   3. Right: selected efforts collect in a "cart" with editable amounts.
//   4. A mock checkout flow (allocate → review → confirmation).
//
// Efforts are drawn from the real data: the published Research Retreat
// hypercerts (with photos) plus the intervention impact-claims from the
// inflection points. Nothing is invented; amounts are illustrative defaults.

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hypercert } from '@/data/hypercerts'
import {
  INFLECTION_POINTS,
  FOCUS_AREAS,
  type FocusAreaKey,
} from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

type EffortType = 'hypercert' | 'claim'

type Effort = {
  id: string
  title: string
  sub: string
  area: FocusAreaKey
  type: EffortType
  image?: string
  /** Illustrative default funding amount (USD) for the mockup. */
  suggested: number
}

function accentFor(area: FocusAreaKey): string {
  return FOCUS_AREAS.find((f) => f.key === area)?.accent ?? '#1982F4'
}

function usd(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function buildEfforts(certs: Hypercert[]): Effort[] {
  const efforts: Effort[] = []

  // Published hypercerts (real, with photos).
  certs
    .filter((c) => c.status !== 'upcoming')
    .forEach((c) =>
      efforts.push({
        id: `hc-${c.rkey}`,
        title: c.title,
        sub: c.location,
        area: 'economies-governance',
        type: 'hypercert',
        image: c.image,
        suggested: c.funding?.costUsd ?? 50_000,
      }),
    )

  // Intervention impact-claims from the inflection points (deduped).
  const seen = new Set<string>()
  for (const p of INFLECTION_POINTS) {
    for (const it of p.interventions ?? []) {
      if (it.href && it.href.startsWith('/insights')) continue
      const key = it.href ? it.href.toLowerCase() : it.label.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      efforts.push({
        id: `cl-${key}`,
        title: it.label,
        sub: p.opportunitySpace,
        area: p.area,
        type: 'claim',
        suggested: 25_000,
      })
    }
  }
  return efforts
}

type FilterArea = FocusAreaKey | 'all'
type FilterType = EffortType | 'all'
type Step = 'select' | 'review' | 'done'

export default function FundingFlow({ certs }: { certs: Hypercert[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 hover:shadow-md"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Fund this effort
      </button>
      <AnimatePresence>{open && <FundingModal certs={certs} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  )
}

function FundingModal({ certs, onClose }: { certs: Hypercert[]; onClose: () => void }) {
  const efforts = useMemo(() => buildEfforts(certs), [certs])
  const [area, setArea] = useState<FilterArea>('all')
  const [type, setType] = useState<FilterType>('all')
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [step, setStep] = useState<Step>('select')

  const visible = useMemo(
    () =>
      efforts.filter(
        (e) => (area === 'all' || e.area === area) && (type === 'all' || e.type === type),
      ),
    [efforts, area, type],
  )

  const selectedList = useMemo(
    () => efforts.filter((e) => e.id in selected),
    [efforts, selected],
  )
  const total = selectedList.reduce((sum, e) => sum + (selected[e.id] || 0), 0)

  const toggle = (e: Effort) =>
    setSelected((prev) => {
      const next = { ...prev }
      if (e.id in next) delete next[e.id]
      else next[e.id] = e.suggested
      return next
    })

  const setAmount = (id: string, v: number) =>
    setSelected((prev) => ({ ...prev, [id]: Math.max(0, Math.round(v)) }))

  const presentAreas = FOCUS_AREAS.filter((fa) => efforts.some((e) => e.area === fa.key))

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header bar */}
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

      {/* Body: contact sheet (left) + cart/checkout (right) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_400px]">
        {/* Left — contact sheet */}
        <div className="min-h-0 overflow-y-auto px-6 py-6 lg:px-10">
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-500">
            Pick one effort or assemble a collection. Everything below is a fundable impact claim —
            published hypercerts carry a photo; the rest are interventions behind our inflection bets.
          </p>

          {/* Filters */}
          <div className="mb-5 flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              <FilterPill label="All fields" active={area === 'all'} onClick={() => setArea('all')} />
              {presentAreas.map((fa) => (
                <FilterPill
                  key={fa.key}
                  label={fa.label}
                  icon={FA_ICON[fa.key]}
                  active={area === fa.key}
                  onClick={() => setArea(fa.key)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill label="All types" active={type === 'all'} onClick={() => setType('all')} small />
              <FilterPill label="Hypercerts" active={type === 'hypercert'} onClick={() => setType('hypercert')} small />
              <FilterPill label="Impact claims" active={type === 'claim'} onClick={() => setType('claim')} small />
            </div>
          </div>

          {/* Fan-out grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((e, i) => (
              <EffortCard
                key={e.id}
                effort={e}
                index={i}
                selected={e.id in selected}
                onToggle={() => toggle(e)}
              />
            ))}
          </div>
          {visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500">
              No efforts match these filters.
            </div>
          )}
        </div>

        {/* Right — cart / checkout */}
        <aside className="flex min-h-0 flex-col border-t border-gray-200 bg-gray-50 lg:border-l lg:border-t-0">
          <CartPanel
            step={step}
            setStep={setStep}
            selectedList={selectedList}
            amounts={selected}
            total={total}
            setAmount={setAmount}
            onRemove={(id) => setSelected((p) => { const n = { ...p }; delete n[id]; return n })}
            onReset={() => { setSelected({}); setStep('select') }}
            onClose={onClose}
          />
        </aside>
      </div>
    </motion.div>
  )
}

function FilterPill({
  label,
  active,
  icon,
  onClick,
  small,
}: {
  label: string
  active: boolean
  icon?: AreaIconType
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${
        small ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-sm'
      } ${
        active
          ? 'border-gray-300 bg-white text-black shadow-sm'
          : 'border-gray-200 bg-transparent text-gray-500 hover:bg-white/70 hover:text-black'
      }`}
    >
      {icon && (
        <span className="flex h-3.5 w-3.5 items-center justify-center" style={{ color: active ? 'var(--impact-hand)' : '#9ca3af' }}>
          <AreaIcon type={icon} className="block h-3 w-3" />
        </span>
      )}
      {label}
    </button>
  )
}

function EffortCard({
  effort,
  index,
  selected,
  onToggle,
}: {
  effort: Effort
  index: number
  selected: boolean
  onToggle: () => void
}) {
  const accent = accentFor(effort.area)
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      // Fan out from a slight stack into the grid on open.
      initial={{ opacity: 0, y: 18, rotate: index % 2 ? 3 : -3, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.025, 0.5), duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3 }}
      className={`group relative flex aspect-[4/5] flex-col overflow-hidden rounded-xl border text-left transition-shadow ${
        selected ? 'border-blue ring-2 ring-blue/40' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Media / tinted background */}
      {effort.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={effort.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span
          className="absolute inset-0"
          style={{ background: `linear-gradient(150deg, ${accent}22, ${accent}0a 60%, transparent)` }}
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      {/* Selection check */}
      <span
        className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
          selected ? 'border-blue bg-blue text-white' : 'border-white/70 bg-black/20 text-transparent backdrop-blur-sm'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>

      {/* Type + focus-area chip */}
      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
        <AreaIcon type={FA_ICON[effort.area]} className="block h-2.5 w-2.5" />
        {effort.type === 'hypercert' ? 'Hypercert' : 'Claim'}
      </span>

      {/* Caption */}
      <span className="relative mt-auto p-3">
        <span className="block text-[9px] font-semibold uppercase tracking-wide text-white/70">{effort.sub}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-snug text-white">{effort.title}</span>
      </span>
    </motion.button>
  )
}

function CartPanel({
  step,
  setStep,
  selectedList,
  amounts,
  total,
  setAmount,
  onRemove,
  onReset,
  onClose,
}: {
  step: Step
  setStep: (s: Step) => void
  selectedList: Effort[]
  amounts: Record<string, number>
  total: number
  setAmount: (id: string, v: number) => void
  onRemove: (id: string) => void
  onReset: () => void
  onClose: () => void
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
          This is a mockup — no payment was taken. You pledged {usd(total)} across {count} effort
          {count === 1 ? '' : 's'}. In production this would mint an on-chain funding record against each
          hypercert.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onReset} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300">
            Fund more
          </button>
          <button type="button" onClick={onClose} className="rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
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
            {step === 'select' ? 'Your funding' : 'Review'}
          </span>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-600">{count}</span>
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
            <p className="text-sm font-medium text-gray-700">Your cart is empty</p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Select efforts on the left to fund one or a collection at once.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {selectedList.map((e) => (
              <li key={e.id} className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      <AreaIcon type={FA_ICON[e.area]} className="block h-3 w-3" />
                      {e.type === 'hypercert' ? 'Hypercert' : 'Claim'}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-black">{e.title}</div>
                  </div>
                  {step === 'select' && (
                    <button
                      type="button"
                      onClick={() => onRemove(e.id)}
                      aria-label="Remove"
                      className="shrink-0 text-gray-300 transition-colors hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  {step === 'select' ? (
                    <label className="flex flex-1 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 focus-within:border-blue">
                      <span className="text-sm text-gray-400">$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={amounts[e.id] ?? 0}
                        onChange={(ev) => setAmount(e.id, Number(ev.target.value))}
                        className="w-full bg-transparent text-sm font-semibold tabular-nums text-black outline-none"
                      />
                    </label>
                  ) : (
                    <span className="text-sm font-semibold tabular-nums text-black">{usd(amounts[e.id] ?? 0)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer — totals + step CTA */}
      <div className="border-t border-gray-200 bg-white px-5 py-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-xl font-semibold tabular-nums text-black">{usd(total)}</span>
        </div>

        {step === 'review' && (
          <div className="mb-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Pay with</div>
            <div className="flex gap-1.5">
              {['USDC', 'Card', 'Wire'].map((m, i) => (
                <span
                  key={m}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-center text-[12px] font-medium ${
                    i === 0 ? 'border-blue bg-blue/5 text-blue' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 'select' ? (
          <button
            type="button"
            disabled={count === 0}
            onClick={() => setStep('review')}
            className="w-full rounded-lg bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Review funding
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
