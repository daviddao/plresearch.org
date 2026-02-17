// Deterministic animated geometric illustration used as a placeholder image.
// Seeded from a string so the same input always produces the same shapes.

// Area → gradient pair
const AREA_GRADIENTS: Record<string, [string, string]> = {
  'distributed-systems':  ['#1e40af', '#3b82f6'],
  'cryptography':         ['#1d4ed8', '#60a5fa'],
  'networking':           ['#1e3a8a', '#2563eb'],
  'consensus':            ['#1e40af', '#7c3aed'],
  'knowledge-systems':    ['#0f766e', '#0ea5e9'],
  'ai-robotics':          ['#7c3aed', '#a78bfa'],
  'neurotech':            ['#6d28d9', '#c084fc'],
  'economies-governance': ['#0369a1', '#38bdf8'],
  'digital-human-rights': ['#1e3a8a', '#6366f1'],
}

const FA_GRADIENTS: Record<string, [string, string]> = {
  'Digital Human Rights':    ['#1e3a8a', '#6366f1'],
  'Economies & Governance':  ['#0369a1', '#38bdf8'],
  'AI & Robotics':           ['#7c3aed', '#a78bfa'],
  'Neurotechnology':         ['#6d28d9', '#c084fc'],
}

function seededRand(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return (n: number) => {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0
    return (((h ^ (h >>> 16)) >>> 0) / 0xffffffff) * n
  }
}

function getGradient(areas: string[]): [string, string] {
  for (const a of areas) {
    const key = Object.keys(AREA_GRADIENTS).find(
      k => a.toLowerCase().includes(k.replace(/-/g, '')) || k.includes(a.toLowerCase().replace(/\s/g, '-'))
    )
    if (key) return AREA_GRADIENTS[key]
  }
  return ['#1e3a8a', '#3b82f6']
}

type Props = {
  /** Seed string — slug, name, or any stable identifier */
  seed: string
  /** Optional area slugs to pick gradient */
  areas?: string[]
  /** Optional focus area name to pick gradient */
  focusArea?: string
  /** viewBox width (default 320) */
  w?: number
  /** viewBox height (default 120) */
  h?: number
  className?: string
}

export function GeoIllustration({ seed, areas = [], focusArea, w = 320, h = 120, className = 'w-full' }: Props) {
  const rand = seededRand(seed)
  const [c1, c2] = focusArea && FA_GRADIENTS[focusArea]
    ? FA_GRADIENTS[focusArea]
    : getGradient(areas)
  const id = `geo-${seed.replace(/[^a-z0-9]/g, '').slice(0, 20)}`

  const shapes = [
    // Large polygon, half-cropped off right/bottom
    {
      type: 'polygon' as const,
      points: (() => {
        const cx = w * 0.75 + rand(w * 0.15)
        const cy = h * 0.2 + rand(h * 0.2)
        const r = Math.min(w, h) * 0.5 + rand(Math.min(w, h) * 0.2)
        const sides = Math.floor(3 + rand(4))
        return Array.from({ length: sides }, (_, i) => {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
          return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
        }).join(' ')
      })(),
      opacity: 0.55,
      dur: `${6 + rand(4)}s`,
      dy: h * 0.07 + rand(h * 0.05),
    },
    // Medium circle
    {
      type: 'circle' as const,
      cx: w * 0.25 + rand(w * 0.35),
      cy: h * 0.3 + rand(h * 0.35),
      r: Math.min(w, h) * 0.15 + rand(Math.min(w, h) * 0.15),
      opacity: 0.35,
      dur: `${5 + rand(5)}s`,
      dy: h * 0.05 + rand(h * 0.07),
    },
    // Small accent polygon
    {
      type: 'polygon' as const,
      points: (() => {
        const cx = w * 0.12 + rand(w * 0.6)
        const cy = h * 0.15 + rand(h * 0.45)
        const r = Math.min(w, h) * 0.08 + rand(Math.min(w, h) * 0.1)
        const sides = Math.floor(3 + rand(3))
        return Array.from({ length: sides }, (_, i) => {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 6
          return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
        }).join(' ')
      })(),
      opacity: 0.25,
      dur: `${4 + rand(4)}s`,
      dy: h * 0.08 + rand(h * 0.07),
    },
  ]

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect width={w} height={h} />
        </clipPath>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      <g clipPath={`url(#clip-${id})`} fill="white">
        {shapes.map((s, i) =>
          s.type === 'circle' ? (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fillOpacity={s.opacity}>
              <animateTransform
                attributeName="transform" type="translate"
                values={`0,0; 0,${-s.dy}; 0,0`} dur={s.dur}
                repeatCount="indefinite" calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              />
            </circle>
          ) : (
            <polygon key={i} points={s.points} fillOpacity={s.opacity}>
              <animateTransform
                attributeName="transform" type="translate"
                values={`0,0; 0,${-s.dy}; 0,0`} dur={s.dur}
                repeatCount="indefinite" calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              />
            </polygon>
          )
        )}
      </g>
    </svg>
  )
}
