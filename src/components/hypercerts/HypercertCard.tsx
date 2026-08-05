"use client"

// Portrait 5:8 hypercert card ported from researchretreat.org: a
// full-bleed photo with a *progressive blur* text area (stacked
// backdrop-filter layers with gradient masks), rounded chips, a white
// pill CTA, and a subtle pointer-tracking 3D tilt + glare. The photo
// is a shared-layout element (layoutId) so it morphs into the detail
// hero. Restyled to the plrd.org design system (Aileron sans for UI
// text, Newsreader serif for titles, blue/teal accents).

import { useEffect, useRef } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion"
import type { Hypercert } from "@/data/hypercerts"

/**
 * Stacked gradient-masked backdrop-blur layers ≈ progressive blur.
 * Each layer covers a shorter band with a stronger blur; the masks
 * fade each band in gently so the frost ramps up with no visible seam.
 *
 * `variant` tunes the band to the media shape: "card" frosts the lower
 * two-thirds of the portrait card (text + CTA live there); "hero" only
 * kisses the bottom third of the wide 16:9 detail hero.
 */
type BlurLayer = { height: string; blur: number; fadeStop: string }

const BLUR_VARIANTS: Record<"card" | "hero", BlurLayer[]> = {
  card: [
    { height: "68%", blur: 3, fadeStop: "32%" },
    { height: "58%", blur: 8, fadeStop: "38%" },
    { height: "48%", blur: 16, fadeStop: "42%" },
    { height: "36%", blur: 26, fadeStop: "48%" },
  ],
  hero: [
    { height: "42%", blur: 2, fadeStop: "40%" },
    { height: "34%", blur: 5, fadeStop: "46%" },
    { height: "26%", blur: 10, fadeStop: "52%" },
    { height: "18%", blur: 16, fadeStop: "58%" },
  ],
}

export function ProgressiveBlur({
  tint,
  variant = "card",
}: {
  tint: string
  variant?: "card" | "hero"
}) {
  const layers = BLUR_VARIANTS[variant]
  return (
    <>
      {layers.map((l, i) => {
        const mask = `linear-gradient(to bottom, transparent 0%, black ${l.fadeStop}, black 100%)`
        return (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: l.height,
              backdropFilter: `blur(${l.blur}px)`,
              WebkitBackdropFilter: `blur(${l.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
      {/* Gentle tint so white text stays legible on bright photos — the
          blur is doing most of the work, so keep it light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: layers[0].height, background: tint }}
      />
    </>
  )
}

const SPRING = { stiffness: 160, damping: 18, mass: 0.6 }

export function HypercertCard({
  cert,
  onSelect,
  isActive = true,
  frozen = false,
  width,
}: {
  cert: Hypercert
  onSelect: () => void
  /** Side-preview cards in the coverflow are inert + untilted. */
  isActive?: boolean
  /**
   * True while the carousel is being dragged: hover zoom, tilt and
   * glare are suspended so the photo moves rigidly with the card
   * instead of animating on its own 700ms hover transition.
   */
  frozen?: boolean
  /** Explicit width from the carousel; falls back to responsive clamp. */
  width?: number
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const rotateXRaw = useMotionValue(0)
  const rotateYRaw = useMotionValue(0)
  const glareXRaw = useMotionValue(50)
  const glareYRaw = useMotionValue(35)
  const rotateX = useSpring(rotateXRaw, SPRING)
  const rotateY = useSpring(rotateYRaw, SPRING)
  const glareX = useSpring(glareXRaw, { stiffness: 120, damping: 20 })
  const glareY = useSpring(glareYRaw, { stiffness: 120, damping: 20 })
  const glare = useMotionTemplate`radial-gradient(360px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.20), rgba(255,255,255,0.05) 42%, transparent 70%)`

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el || !isActive || frozen) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    rotateYRaw.set(px * 14)
    rotateXRaw.set(-py * 12)
    glareXRaw.set((px + 0.5) * 100)
    glareYRaw.set((py + 0.5) * 100)
  }
  function reset() {
    rotateXRaw.set(0)
    rotateYRaw.set(0)
    glareXRaw.set(50)
    glareYRaw.set(35)
  }

  // Drag started mid-hover → flatten any in-flight tilt immediately.
  useEffect(() => {
    if (frozen) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozen])

  return (
    <div style={{ perspective: 1400 }}>
      <motion.button
        ref={ref}
        type="button"
        onClick={onSelect}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        whileHover={isActive && !frozen ? { scale: 1.02 } : undefined}
        whileTap={isActive && !frozen ? { scale: 0.99 } : undefined}
        transition={{ type: "spring", ...SPRING }}
        aria-label={`Open impact claim: ${cert.title}`}
        tabIndex={isActive ? 0 : -1}
        aria-hidden={!isActive}
        className="hypercert-on-photo group relative block aspect-[5/8] cursor-pointer rounded-[26px] text-left"
        style={{
          width: width ?? "min(72vw, 280px)",
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow:
            "0 40px 80px -30px rgba(19,19,22,0.45), 0 16px 32px -18px rgba(19,19,22,0.3)",
        }}
      >
        {/* Shared-layout photo → morphs into the detail hero */}
        <motion.div
          layoutId={`cert-media-${cert.rkey}`}
          className="absolute inset-0 overflow-hidden rounded-[26px]"
          style={{ borderRadius: 26 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cert.image}
            alt={cert.imageAlt}
            className={`absolute inset-0 h-full w-full object-cover ${
              frozen
                ? ""
                : "transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            }`}
          />
          <ProgressiveBlur tint="linear-gradient(to bottom, transparent 0%, rgba(19,19,22,0.10) 34%, rgba(19,19,22,0.34) 68%, rgba(19,19,22,0.52) 100%)" />
          <div
            aria-hidden
            className="absolute inset-0 rounded-[26px]"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          />
        </motion.div>

        {/* Pointer glare (not part of the shared element) */}
        <motion.div
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition-opacity duration-300 ${
            frozen ? "" : "group-hover:opacity-100"
          }`}
          style={{ background: glare }}
        />

        {/* Floating content */}
        <div
          className="absolute inset-0 flex flex-col justify-between p-5"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
              {cert.creator?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cert.creator.avatar}
                  alt={cert.creator.handle ?? "claim creator"}
                  title={`Claimed by @${cert.creator.handle ?? cert.creator.did}`}
                  className="h-3.5 w-3.5 rounded-full object-cover ring-1 ring-white/40"
                />
              ) : (
                <span
                  aria-hidden
                  className="hypercert-pulse-dot block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: cert.status === "upcoming" ? "#12bfdf" : "#1982F4",
                  }}
                />
              )}
              {cert.status === "upcoming" ? "Upcoming" : "Hypercert"}
            </span>
            <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/80 backdrop-blur-md">
              {cert.dateLabel}
            </span>
          </div>

          <div>
            <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
              {cert.location}
            </p>
            <h3 className="font-serif text-[22px] leading-[1.1] tracking-tight text-white">
              {cert.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-white/75">
              {cert.shortDescription}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {cert.stats.slice(0, 2).map((s) => (
                <span
                  key={s.label}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] tracking-wide text-white/90 backdrop-blur-md"
                >
                  <span className="font-semibold text-white">{s.value}</span>
                  <span className="text-white/60">&nbsp;{s.label}</span>
                </span>
              ))}
            </div>

            <div className="mt-4 block w-full rounded-full bg-white py-3 text-center text-[13px] font-semibold tracking-wide text-[#131316] transition group-hover:bg-white/90">
              {cert.status === "upcoming" ? "Preview claim" : "View impact claim"}
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  )
}
