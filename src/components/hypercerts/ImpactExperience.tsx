"use client"

// Impact surface ported from researchretreat.org: a 3D coverflow
// carousel of hypercerts — the active card sits front and center while
// the neighbouring past & upcoming hypercerts stay visible, tilted
// back at the sides. Clicking the active card morphs its photo (shared
// layoutId) up into a full project-page detail with an evidence
// timeline and live community activity from the ATProto network.

import { useEffect, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import type { Hypercert } from "@/data/hypercerts"
import { HypercertCard } from "@/components/hypercerts/HypercertCard"
import { HypercertDetail } from "@/components/hypercerts/HypercertDetail"

type CardStyle = {
  translateX: string
  rotateY: number
  translateZ: number
  scale: number
  opacity: number
  zIndex: number
  hidden: boolean
}

function getCardStyle(offset: number): CardStyle {
  const abs = Math.abs(offset)
  if (abs === 0) {
    return { translateX: "0%", rotateY: 0, translateZ: 0, scale: 1, opacity: 1, zIndex: 5, hidden: false }
  }
  if (abs === 1) {
    return {
      translateX: offset < 0 ? "-62%" : "62%",
      rotateY: offset < 0 ? 25 : -25,
      translateZ: -160,
      scale: 0.85,
      opacity: 0.65,
      zIndex: 4,
      hidden: false,
    }
  }
  if (abs === 2) {
    return {
      translateX: offset < 0 ? "-112%" : "112%",
      rotateY: offset < 0 ? 35 : -35,
      translateZ: -260,
      scale: 0.7,
      opacity: 0.35,
      zIndex: 3,
      hidden: false,
    }
  }
  return { translateX: "0%", rotateY: 0, translateZ: 0, scale: 1, opacity: 0, zIndex: 0, hidden: true }
}

// Card sizing: measure the container and clamp the card width so the
// side previews never overflow small screens.
const MIN_CARD_W = 210
const MAX_CARD_W = 280
const CARD_ASPECT = 8 / 5 // matches HypercertCard's aspect-[5/8]
const SWIPE_THRESHOLD_PX = 32

export function ImpactExperience({ certs }: { certs: Hypercert[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState<number>(MAX_CARD_W)
  const swipeRef = useRef<{ startX: number; pointerId: number } | null>(null)

  const items = certs
  const activeCert = items.find((c) => c.rkey === selected) ?? null

  // Deep-link: …/hypercerts/#<rkey> opens that cert's detail.
  useEffect(() => {
    const rkey = window.location.hash.slice(1)
    if (!rkey) return
    const idx = items.findIndex((c) => c.rkey === rkey)
    if (idx >= 0) {
      setActiveIndex(idx)
      setSelected(rkey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      if (w <= 0) return
      // The side cards translate by ±62% / ±112%, so the visible stack
      // is about 2.2 card-widths wide. Fit that (plus arrow gutters on
      // sm+).
      const arrowReserve = window.innerWidth >= 640 ? 88 : 16
      const fit = Math.max(
        MIN_CARD_W,
        Math.min(MAX_CARD_W, Math.floor((w - arrowReserve) / 1.7)),
      )
      setCardWidth(fit)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const carouselHeight = Math.round(cardWidth * CARD_ASPECT) + 24
  const safeActive = Math.min(Math.max(activeIndex, 0), items.length - 1)

  const navigate = (next: number) => {
    setActiveIndex(Math.max(0, Math.min(items.length - 1, next)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") navigate(safeActive - 1)
    else if (e.key === "ArrowRight") navigate(safeActive + 1)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest("button, a, input")) return
    swipeRef.current = { startX: e.clientX, pointerId: e.pointerId }
  }
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current
    if (!swipe || swipe.pointerId !== e.pointerId) return
    const dx = e.clientX - swipe.startX
    swipeRef.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    navigate(safeActive + (dx > 0 ? -1 : 1))
  }

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 z-10 hidden sm:grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-gray-200 bg-white text-[15px] text-gray-600 transition hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-30"

  return (
    <div className="relative">
      {/* Coverflow carousel */}
      <div ref={containerRef}>
        <div
          className="relative w-full touch-pan-y overflow-hidden outline-none"
          style={{ perspective: "1300px", height: carouselHeight }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => (swipeRef.current = null)}
          aria-label="Hypercert carousel — swipe or use the arrows / dots to navigate"
        >
          <button
            type="button"
            onClick={() => navigate(safeActive - 1)}
            disabled={safeActive <= 0}
            aria-label="Previous hypercert"
            className={`${arrowClass} left-0 ml-1`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => navigate(safeActive + 1)}
            disabled={safeActive >= items.length - 1}
            aria-label="Next hypercert"
            className={`${arrowClass} right-0 mr-1`}
          >
            →
          </button>

          <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
            {items.map((cert, idx) => {
              const offset = idx - safeActive
              const style = getCardStyle(offset)
              return (
                <div
                  key={cert.rkey}
                  className="absolute left-1/2 top-1/2 transition-all duration-500 ease-out"
                  style={{
                    width: cardWidth,
                    transform: `translateX(-50%) translateY(-50%) translateX(${style.translateX}) rotateY(${style.rotateY}deg) translateZ(${style.translateZ}px) scale(${style.scale})`,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    pointerEvents: offset === 0 ? "auto" : "none",
                    display: style.hidden ? "none" : "block",
                  }}
                >
                  <HypercertCard
                    cert={cert}
                    isActive={offset === 0}
                    width={cardWidth}
                    onSelect={() => setSelected(cert.rkey)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="mt-8 flex items-center justify-center gap-2.5">
        {items.map((c, i) => (
          <button
            key={c.rkey}
            type="button"
            onClick={() => navigate(i)}
            aria-label={`Go to ${c.title}`}
            className={`relative h-1.5 cursor-pointer rounded-full transition-all ${
              i === safeActive ? "bg-blue" : "bg-gray-300"
            }`}
            style={{ width: i === safeActive ? 26 : 8 }}
          >
            <span aria-hidden className="absolute inset-0 -mx-1 -my-3" />
          </button>
        ))}
      </div>
      <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
        Swipe to browse past &amp; upcoming editions · click a card to open its impact claim
      </p>

      {/* Detail overlay with shared-layout morph */}
      <AnimatePresence>
        {activeCert && (
          <HypercertDetail
            key={activeCert.rkey}
            cert={activeCert}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
