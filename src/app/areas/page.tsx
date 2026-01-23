import Link from 'next/link'
import { areas } from '@/lib/content'

export const metadata = { title: 'Focus Areas' }

function stripFaPrefix(title: string): string {
  return title.replace(/^FA\d+:\s*/, '')
}

export default function AreasPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
      {/* Hero */}
      <div className="relative pt-12 pb-10 mb-10 overflow-hidden">
        <AreasGeo />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          Focus Areas
        </h1>
        <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl">
          Four research directions driving breakthroughs in computing, coordination, and human capability.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
        {areas.map((area) => (
          <Link
            key={area.slug}
            href={`/areas/${area.slug}`}
            className="bg-white p-6 hover:bg-gray-50 transition-colors relative overflow-hidden group"
          >
            <AreaCardGeo />
            <h2 className="relative z-10 font-medium mb-2">{stripFaPrefix(area.title)}</h2>
            {area.summary && <p className="relative z-10 text-sm text-gray-600 leading-relaxed">{area.summary}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}

function AreaCardGeo() {
  return (
    <svg
      className="absolute right-2 top-2 w-16 h-16 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 ease-out pointer-events-none select-none"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="24" stroke="#C3E1FF" strokeWidth="0.75" strokeDasharray="3 2" />
      <circle cx="30" cy="30" r="16" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="30" cy="6" r="2" fill="#C3E1FF" />
      <circle cx="30" cy="54" r="2" fill="#C3E1FF" />
      <circle cx="6" cy="30" r="2" fill="#C3E1FF" />
      <circle cx="54" cy="30" r="2" fill="#C3E1FF" />
      <line x1="30" y1="6" x2="30" y2="14" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="30" y1="46" x2="30" y2="54" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="6" y1="30" x2="14" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="46" y1="30" x2="54" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
    </svg>
  )
}

function AreasGeo() {
  // Four diamonds suggesting four focus directions
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <polygon points="480,80 540,150 480,220 420,150" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="580,180 630,240 580,300 530,240" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="400,280 460,350 400,420 340,350" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="540,330 590,390 540,450 490,390" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="480" y1="220" x2="530" y2="240" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="540" y1="150" x2="580" y2="180" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="420" y1="150" x2="400" y2="280" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="460" y1="350" x2="490" y2="390" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="300" x2="540" y2="330" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="480" cy="80" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="180" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="280" r="3" fill="#C3E1FF" />
      <circle cx="540" cy="330" r="3" fill="#C3E1FF" />
    </svg>
  )
}
