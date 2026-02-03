export type AreaIconType = 'shield' | 'hexagon' | 'neural' | 'brain'

const DEFAULT_CLASS = 'w-12 h-12 shrink-0 text-blue/60 group-hover:text-blue transition-colors duration-300'

export function AreaIcon({ type, className }: { type: AreaIconType; className?: string }) {
  const cls = className || DEFAULT_CLASS

  switch (type) {
    case 'shield':
      return <ShieldIcon className={cls} />
    case 'hexagon':
      return <HexagonIcon className={cls} />
    case 'neural':
      return <NeuralIcon className={cls} />
    case 'brain':
      return <BrainIcon className={cls} />
  }
}

// Digital Human Rights - Shield with grid pattern
export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 4L6 10V18C6 26.8 12 34.4 20 36C28 34.4 34 26.8 34 18V10L20 4Z"
        className="stroke-current"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 100;100 0"
          dur="2s"
          fill="freeze"
        />
      </path>
      <line x1="14" y1="14" x2="26" y2="14" className="stroke-current" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
      </line>
      <line x1="14" y1="20" x2="26" y2="20" className="stroke-current" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </line>
      <line x1="14" y1="26" x2="26" y2="26" className="stroke-current" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" begin="1s" />
      </line>
      <line x1="20" y1="10" x2="20" y2="30" className="stroke-current" strokeWidth="1" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" begin="0.25s" />
      </line>
    </svg>
  )
}

// Economies & Governance - Hexagon network
export function HexagonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <polygon
        points="20,6 30,12 30,24 20,30 10,24 10,12"
        className="stroke-current"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 20 18;360 20 18"
          dur="30s"
          repeatCount="indefinite"
        />
      </polygon>
      <circle cx="20" cy="6" r="2" className="fill-current" opacity="0.6">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="12" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="30" cy="24" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="20" cy="30" r="2" className="fill-current" opacity="0.6">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" begin="0.9s" />
      </circle>
      <circle cx="10" cy="24" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="1.2s" />
      </circle>
      <circle cx="10" cy="12" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="20" cy="18" r="3" className="stroke-current" strokeWidth="1" fill="none" opacity="0.5">
        <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// AI & Robotics - Neural network / branching tree
export function NeuralIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="8" r="3" className="fill-current" opacity="0.7">
        <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <line x1="20" y1="11" x2="12" y2="20" className="stroke-current" strokeWidth="1.5" opacity="0.6" />
      <line x1="20" y1="11" x2="28" y2="20" className="stroke-current" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="20" r="2.5" className="fill-current" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="28" cy="20" r="2.5" className="fill-current" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <line x1="12" y1="22.5" x2="8" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="22.5" x2="16" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="22.5" x2="24" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="22.5" x2="32" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="0.9s" />
      </circle>
      <circle cx="16" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="1.2s" />
      </circle>
      <circle cx="24" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="32" cy="30" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin="1.8s" />
      </circle>
    </svg>
  )
}

// Neurotechnology - Brain waves / neural connections
export function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <ellipse cx="20" cy="18" rx="14" ry="12" className="stroke-current" strokeWidth="1.5" fill="none" opacity="0.6">
        <animate attributeName="ry" values="11;13;11" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <path
        d="M10 18 Q 15 14, 20 18 T 30 18"
        className="stroke-current"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      >
        <animate attributeName="d" values="M10 18 Q 15 14, 20 18 T 30 18;M10 18 Q 15 22, 20 18 T 30 18;M10 18 Q 15 14, 20 18 T 30 18" dur="3s" repeatCount="indefinite" />
      </path>
      <path
        d="M12 14 Q 17 10, 22 14 T 28 14"
        className="stroke-current"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      >
        <animate attributeName="d" values="M12 14 Q 17 10, 22 14 T 28 14;M12 14 Q 17 18, 22 14 T 28 14;M12 14 Q 17 10, 22 14 T 28 14" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </path>
      <path
        d="M12 22 Q 17 26, 22 22 T 28 22"
        className="stroke-current"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      >
        <animate attributeName="d" values="M12 22 Q 17 26, 22 22 T 28 22;M12 22 Q 17 18, 22 22 T 28 22;M12 22 Q 17 26, 22 22 T 28 22" dur="3s" repeatCount="indefinite" begin="1s" />
      </path>
      <circle cx="14" cy="18" r="1.5" className="fill-current" opacity="0.6">
        <animate attributeName="cx" values="14;26;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <line x1="20" y1="30" x2="20" y2="36" className="stroke-current" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="36" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
