'use client'

// "Fund this effort" — a GoFundMe-style checkout mockup for a single
// hypercert. This is a PROTOTYPE, not a working checkout: no payment is
// taken and no data leaves the browser.
//
// Flow: opened from inside a hypercert's detail modal →
//   1. Amount step: pick a preset chip or type a custom amount. There is no
//      "price" on the effort; the funder chooses what to give.
//   2. Pay step: mock "Pay with" (USDC / Card / Wire) + read-back of the gift.
//   3. Confirmation.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hypercert } from '@/data/hypercerts'

// GoFundMe-style preset tiers. These are funding chips the giver can
// pre-select — NOT a price on the hypercert. A middle tier is highlighted
// by default as a gentle suggestion; anything can be typed instead.
const PRESETS = [100, 500, 1_000, 5_000, 10_000, 25_000]
const DEFAULT_AMOUNT = 1_000

function usd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

type Step = 'amount' | 'pay' | 'done'

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
  cert,
  onClose,
}: {
  cert: Hypercert
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT)
  // custom = the amount was typed, not chosen from a preset chip.
  const [custom, setCustom] = useState(false)
  const [method, setMethod] = useState<'USDC' | 'Card' | 'Wire'>('USDC')

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

  const valid = amount > 0

  // Portal to the body so the fixed overlay is anchored to the viewport and
  // not to the transformed (scaled) hypercert-detail panel it launches from.
  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-6 lg:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative my-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {/* Header — effort context + mockup badge */}
        <header className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cert.image}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue">
                Fund this effort
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                Mockup
              </span>
            </div>
            <h3 className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug text-black">
              {cert.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="px-5 py-5"
            >
              <p className="text-[13px] leading-relaxed text-gray-500">
                Choose how much to give. There&apos;s no set price — every bit of
                funding advances the work behind this claim.
              </p>

              {/* Preset chips */}
              <div className="mt-4 grid grid-cols-3 gap-2">
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
                      className={`rounded-xl border px-2 py-2.5 text-[14px] font-semibold tabular-nums transition-all ${
                        active
                          ? 'border-blue bg-blue/5 text-blue ring-1 ring-blue/40'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {usd(p)}
                    </button>
                  )
                })}
              </div>

              {/* Custom amount */}
              <label
                className={`mt-3 flex items-center gap-2 rounded-xl border px-3.5 py-3 transition-colors ${
                  custom ? 'border-blue ring-1 ring-blue/40' : 'border-gray-200 focus-within:border-blue'
                }`}
              >
                <span className="text-lg font-semibold text-gray-400">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  inputMode="numeric"
                  placeholder="Other amount"
                  value={custom ? (amount || '') : ''}
                  onFocus={() => setCustom(true)}
                  onChange={(e) => {
                    setCustom(true)
                    setAmount(Math.max(0, Math.round(Number(e.target.value))))
                  }}
                  className="w-full bg-transparent text-lg font-semibold tabular-nums text-black outline-none placeholder:text-[15px] placeholder:font-medium placeholder:text-gray-400"
                />
              </label>

              <button
                type="button"
                disabled={!valid}
                onClick={() => setStep('pay')}
                className="mt-5 w-full rounded-lg bg-blue px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue{valid ? ` · ${usd(amount)}` : ''}
              </button>
              <p className="mt-2.5 text-center text-[10px] leading-relaxed text-gray-400">
                Mockup only — no payment is processed.
              </p>
            </motion.div>
          )}

          {step === 'pay' && (
            <motion.div
              key="pay"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="px-5 py-5"
            >
              {/* Gift read-back */}
              <div className="flex items-baseline justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-[13px] text-gray-500">Your funding</span>
                <span className="text-xl font-semibold tabular-nums text-black">{usd(amount)}</span>
              </div>

              {/* Mock payment method */}
              <div className="mt-4">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Pay with
                </div>
                <div className="flex gap-1.5">
                  {(['USDC', 'Card', 'Wire'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={method === m}
                      onClick={() => setMethod(m)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-center text-[12px] font-medium transition-all ${
                        method === m
                          ? 'border-blue bg-blue/5 text-blue'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-gray-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('done')}
                  className="flex-1 rounded-lg bg-blue px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                >
                  Confirm funding
                </button>
              </div>
              <p className="mt-2.5 text-center text-[10px] leading-relaxed text-gray-400">
                Mockup only — no payment is processed.
              </p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center px-6 py-10 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue/10 text-blue">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-black">Funding confirmed</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
                This is a mockup — no payment was taken. You pledged {usd(amount)} to{' '}
                <span className="font-medium text-gray-700">{cert.title}</span>. In production this would
                mint an on-chain funding record against the hypercert.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-lg bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
