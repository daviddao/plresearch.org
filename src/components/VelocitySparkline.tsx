'use client'

// Shared inline-SVG sparkline + ghost chart for the field-velocity instruments.
// Pure SVG (no deps). Supports a log axis, a confidence band, a dashed tail for
// unreliable points, an optional secondary normalizer line, an optional
// labelled vertical axis (min/max of the series, so the reader can see what the
// curve indexes to), and — when `interactive` — a hover crosshair with a tooltip
// that reads the value and x-axis position under the cursor.

import { useState } from 'react'

export type SeriesPoint = { x: number | string; y: number; lo?: number; hi?: number; reliable?: boolean }

function fmt(v: number, unit: string): string {
  const n = Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : Number.isInteger(v) ? `${v}` : v.toFixed(1)
  return unit ? `${n}${unit}` : n
}

export function Sparkline({
  series,
  series2,
  scale = 'linear',
  width = 116,
  height = 34,
  band = false,
  axis = false,
  unit = '',
  interactive = false,
}: {
  series: SeriesPoint[]
  series2?: { x: number | string; y: number }[]
  scale?: 'linear' | 'log'
  width?: number
  height?: number
  band?: boolean
  axis?: boolean
  unit?: string
  /** Enable a hover crosshair + value/x tooltip (used in the detail modal). */
  interactive?: boolean
}) {
  const [hover, setHover] = useState<number | null>(null)
  if (!series.length) return null
  const tf = (v: number) => (scale === 'log' ? Math.log10(Math.max(v, 1e-6)) : v)
  const xOf = (p: { x: number | string }, i: number) => (typeof p.x === 'number' ? p.x : i)

  const padL = axis ? 30 : 2
  const padR = 2

  const xsAll = [
    ...series.map((p, i) => xOf(p, i)),
    ...(series2 ? series2.map((p, i) => xOf(p, i)) : []),
  ]
  const minX = Math.min(...xsAll)
  const maxX = Math.max(...xsAll)
  const spanX = maxX - minX || 1

  const rawYs: number[] = []
  series.forEach((p) => {
    rawYs.push(p.y)
    if (band && p.lo != null) rawYs.push(p.lo)
    if (band && p.hi != null) rawYs.push(p.hi)
  })
  if (series2) series2.forEach((p) => rawYs.push(p.y))
  const minRaw = Math.min(...rawYs)
  const maxRaw = Math.max(...rawYs)
  const minY = tf(minRaw)
  const maxY = tf(maxRaw)
  const spanY = maxY - minY || 1

  const px = (x: number) => padL + ((x - minX) / spanX) * (width - padL - padR)
  const py = (v: number) => height - 3 - ((tf(v) - minY) / spanY) * (height - 6)
  const pt = (p: SeriesPoint, i: number) => `${px(xOf(p, i)).toFixed(1)},${py(p.y).toFixed(1)}`

  const hasReliableFlags = series.some((p) => p.reliable === false)
  const reliablePts = hasReliableFlags ? series.filter((p) => p.reliable !== false) : series
  const lastReliableIdx = hasReliableFlags
    ? series.reduce((acc, p, i) => (p.reliable !== false ? i : acc), 0)
    : series.length - 1
  const tailPts = hasReliableFlags ? series.slice(lastReliableIdx) : []

  let bandPath = ''
  if (band && series.every((p) => p.lo != null && p.hi != null)) {
    const top = series.map((p, i) => `${px(xOf(p, i)).toFixed(1)},${py(p.hi as number).toFixed(1)}`)
    const bot = [...series].reverse().map((p, i) => {
      const idx = series.length - 1 - i
      return `${px(xOf(p, idx)).toFixed(1)},${py(p.lo as number).toFixed(1)}`
    })
    bandPath = `${top.join(' ')} ${bot.join(' ')}`
  }

  const last = series[series.length - 1]

  // Map the cursor to the nearest data point (by horizontal distance).
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * width
    let best = 0
    let bestD = Infinity
    series.forEach((p, i) => {
      const d = Math.abs(px(xOf(p, i)) - svgX)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    setHover(best)
  }

  const hp = hover != null ? series[hover] : null
  const hx = hp ? px(xOf(hp, hover as number)) : 0
  const hy = hp ? py(hp.y) : 0

  const svg = (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden={!interactive}
      className={`overflow-visible${interactive ? ' cursor-crosshair' : ''}`}
      {...(interactive ? { onMouseMove: onMove, onMouseLeave: () => setHover(null) } : {})}
    >
      {axis && (
        <g>
          <line x1={padL} y1={2} x2={padL} y2={height - 2} stroke="currentColor" className="text-gray-200" strokeWidth={1} />
          <text x={padL - 4} y={9} textAnchor="end" className="fill-gray-400" style={{ fontSize: 8 }}>{fmt(maxRaw, unit)}</text>
          <text x={padL - 4} y={height - 3} textAnchor="end" className="fill-gray-400" style={{ fontSize: 8 }}>{fmt(minRaw, unit)}</text>
        </g>
      )}
      {bandPath && <polygon points={bandPath} fill="var(--impact-field)" opacity={0.1} />}
      {series2 && (
        <polyline
          points={series2.map((p, i) => `${px(xOf(p, i)).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.25}
          strokeDasharray="3 3"
        />
      )}
      <polyline
        points={reliablePts.map((p) => pt(p, series.indexOf(p))).join(' ')}
        fill="none"
        stroke="var(--impact-field)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {tailPts.length > 1 && (
        <polyline
          points={tailPts.map((p) => pt(p, series.indexOf(p))).join(' ')}
          fill="none"
          stroke="var(--impact-field)"
          strokeWidth={1.75}
          strokeDasharray="2 2"
          opacity={0.45}
        />
      )}
      <circle cx={px(xOf(last, series.length - 1))} cy={py(last.y)} r={1.9} fill="var(--impact-field)" />
      {interactive && hp && (
        <g>
          <line x1={hx} y1={2} x2={hx} y2={height - 2} stroke="currentColor" className="text-gray-400" strokeWidth={1} strokeDasharray="2 2" />
          <circle cx={hx} cy={hy} r={2.8} fill="var(--impact-field)" stroke="#fff" strokeWidth={1.25} />
        </g>
      )}
    </svg>
  )

  if (!interactive) return svg

  return (
    <span className="relative inline-block leading-none">
      {svg}
      {hp && (
        <span
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-center shadow-lg"
          style={{ left: hx, top: hy - 6 }}
        >
          <span className="block text-[11px] font-semibold leading-tight tabular-nums text-white">
            {fmt(hp.y, unit)}
          </span>
          <span className="block text-[9px] leading-tight tabular-nums text-gray-300">{String(hp.x)}</span>
        </span>
      )}
    </span>
  )
}

export function GhostChart({ width = 116, height = 34 }: { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="text-gray-400"
      style={{ filter: 'blur(3.5px)', opacity: 0.28 }}
    >
      <ellipse cx={width * 0.42} cy={height * 0.55} rx={width * 0.34} ry={height * 0.26} fill="currentColor" />
      <ellipse cx={width * 0.66} cy={height * 0.42} rx={width * 0.22} ry={height * 0.2} fill="currentColor" />
    </svg>
  )
}
