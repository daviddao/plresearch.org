import Link from 'next/link'
import { publications, talks } from '@/lib/content'

type UpdateItem = {
  title: string
  date: string
  type: string
  permalink: string
}

function getLatestUpdates(count: number): UpdateItem[] {
  const pubs = publications.map((p) => ({
    title: p.title || p.slug,
    date: p.date || '',
    type: 'Publication',
    permalink: `/publications/${p.slug}`,
  }))

  const talkItems = talks.map((t) => ({
    title: t.title || t.slug,
    date: t.date || '',
    type: 'Talk',
    permalink: `/talks/${t.slug}`,
  }))

  return [...pubs, ...talkItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HomePage() {
  const updates = getLatestUpdates(5)

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="relative pt-12 pb-14 md:pt-20 md:pb-16 lg:pt-32 lg:pb-24" style={{ clipPath: 'inset(0 -100vw 0 0)' }}>
        {/* Hero banner image - extends to screen edge */}
        <div 
          className="absolute top-1/2 -translate-y-[60%] h-[140%] pointer-events-none select-none"
          style={{
            right: 'calc(-50vw + 50%)',
            width: '70vw',
            backgroundImage: 'url(/images/hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.35,
            maskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <h1 className="relative z-10 text-[32px] md:text-[44px] lg:text-[56px] font-semibold leading-[1.1] tracking-tight mb-6">
          Driving breakthroughs in computing to push humanity forward.
        </h1>
        <p className="relative z-10 text-gray-600 text-lg md:text-xl lg:text-[22px] leading-relaxed max-w-2xl mb-8">
          Protocol Labs R&D explores the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity.
        </p>
        <div className="relative z-10 flex flex-wrap gap-4">
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
          >
            About us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link 
            href="/areas" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
          >
            Focus areas
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          <AreaCard 
            title="Digital Human Rights" 
            href="/areas/digital-human-rights" 
            description="Privacy, identity, and digital freedom through decentralized infrastructure."
            icon="shield"
          />
          <AreaCard 
            title="Economies & Governance" 
            href="/areas/upgrade-economies-governance" 
            description="Decentralized coordination mechanisms for economic and governance systems."
            icon="hexagon"
          />
          <AreaCard 
            title="AI & Robotics" 
            href="/areas/ai-robotics" 
            description="Responsible AI and robotics that augment human capabilities."
            icon="neural"
          />
          <AreaCard 
            title="Neurotechnology" 
            href="/areas/neurotech" 
            description="Brain-computer interfaces for human flourishing and cognitive enhancement."
            icon="brain"
          />
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">Recent</h2>
        <div className="divide-y divide-gray-200">
          {updates.map((item) => (
            <div key={item.permalink} className="py-5 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
              <div className="flex items-baseline gap-4 shrink-0">
                <span className="text-base text-gray-400 w-[110px]">{formatDate(item.date)}</span>
                <span className="text-base text-gray-400 w-[90px]">{item.type}</span>
              </div>
              <Link href={item.permalink} className="text-lg text-black hover:text-blue leading-snug">
                {item.title}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link 
            href="/publications" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
          >
            All publications
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link 
            href="/talks" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
          >
            All talks
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Team</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mb-6">
          A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity.
        </p>
        <Link 
          href="/authors" 
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
        >
          Meet the team
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

type AreaIconType = 'shield' | 'hexagon' | 'neural' | 'brain'

function AreaCard({ title, href, description, icon }: { title: string; href: string; description: string; icon: AreaIconType }) {
  return (
    <Link href={href} className="bg-white p-8 hover:bg-blue/[0.02] border border-transparent hover:border-blue/20 hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-start gap-5">
        <AreaIcon type={icon} />
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2 group-hover:text-blue transition-colors flex items-center gap-2">
            {title}
            <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </h3>
          <p className="text-base text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}

function AreaIcon({ type }: { type: AreaIconType }) {
  const baseClass = "w-12 h-12 shrink-0 text-blue/60 group-hover:text-blue transition-colors duration-300"
  
  switch (type) {
    case 'shield':
      return <ShieldIcon className={baseClass} />
    case 'hexagon':
      return <HexagonIcon className={baseClass} />
    case 'neural':
      return <NeuralIcon className={baseClass} />
    case 'brain':
      return <BrainIcon className={baseClass} />
  }
}

// Digital Human Rights - Shield with grid pattern
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Shield outline */}
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
      {/* Grid lines inside */}
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
function HexagonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Central hexagon */}
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
      {/* Connection dots */}
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
      {/* Center */}
      <circle cx="20" cy="18" r="3" className="stroke-current" strokeWidth="1" fill="none" opacity="0.5">
        <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// AI & Robotics - Neural network / branching tree
function NeuralIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Central node */}
      <circle cx="20" cy="8" r="3" className="fill-current" opacity="0.7">
        <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Branches */}
      <line x1="20" y1="11" x2="12" y2="20" className="stroke-current" strokeWidth="1.5" opacity="0.6" />
      <line x1="20" y1="11" x2="28" y2="20" className="stroke-current" strokeWidth="1.5" opacity="0.6" />
      {/* Second layer */}
      <circle cx="12" cy="20" r="2.5" className="fill-current" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="28" cy="20" r="2.5" className="fill-current" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      {/* Third layer branches */}
      <line x1="12" y1="22.5" x2="8" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="22.5" x2="16" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="22.5" x2="24" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="22.5" x2="32" y2="30" className="stroke-current" strokeWidth="1" opacity="0.5" />
      {/* Third layer nodes */}
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
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {/* Brain outline - simplified organic shape */}
      <ellipse cx="20" cy="18" rx="14" ry="12" className="stroke-current" strokeWidth="1.5" fill="none" opacity="0.6">
        <animate attributeName="ry" values="11;13;11" dur="4s" repeatCount="indefinite" />
      </ellipse>
      {/* Neural pathways */}
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
      {/* Signal pulses */}
      <circle cx="14" cy="18" r="1.5" className="fill-current" opacity="0.6">
        <animate attributeName="cx" values="14;26;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Connection to spine */}
      <line x1="20" y1="30" x2="20" y2="36" className="stroke-current" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="36" r="2" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function HeroGeometry() {
  return (
    <svg
      className="absolute top-4 right-0 w-[320px] h-[280px] lg:w-[420px] lg:h-[340px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      {/* Interconnected circles pattern inspired by the original PL Research site */}
      <circle cx="450" cy="120" r="80" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="550" cy="200" r="60" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="380" cy="250" r="100" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="600" cy="350" r="70" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="500" cy="400" r="50" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="350" cy="380" r="40" stroke="#C3E1FF" strokeWidth="1" />
      {/* Connecting lines */}
      <line x1="450" y1="120" x2="550" y2="200" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="550" y1="200" x2="600" y2="350" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="380" y1="250" x2="500" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="450" y1="120" x2="380" y2="250" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="600" y1="350" x2="500" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="350" y1="380" x2="380" y2="250" stroke="#C3E1FF" strokeWidth="0.5" />
      {/* Small accent dots at intersections */}
      <circle cx="450" cy="120" r="3" fill="#C3E1FF" />
      <circle cx="550" cy="200" r="3" fill="#C3E1FF" />
      <circle cx="380" cy="250" r="3" fill="#C3E1FF" />
      <circle cx="600" cy="350" r="3" fill="#C3E1FF" />
      <circle cx="500" cy="400" r="3" fill="#C3E1FF" />
      <circle cx="350" cy="380" r="3" fill="#C3E1FF" />
    </svg>
  )
}
