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
    <div className="max-w-4xl mx-auto px-6">
      <div className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Hero image on the right */}
        <img
          src="/images/banners/lady-using-whiteboard@2x.jpg"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-auto max-w-[60%] object-contain object-right opacity-[0.15] pointer-events-none select-none hidden md:block"
        />
        {/* Geometric decoration */}
        <HeroGeometry />

        <h1 className="relative z-10 text-xl lg:text-[56px] font-semibold leading-[1.1] tracking-tight mb-6">
          Driving breakthroughs in computing to push humanity forward.
        </h1>
        <p className="relative z-10 text-gray-600 text-big lg:text-bigger leading-relaxed max-w-2xl mb-8">
          Protocol Labs Research explores the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity.
        </p>
        <div className="relative z-10 flex gap-6">
          <Link href="/about" className="text-blue hover:underline">About us</Link>
          <Link href="/areas" className="text-blue hover:underline">Focus areas</Link>
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          <AreaCard title="Digital Human Rights" href="/areas/digital-human-rights" description="Privacy, identity, and digital freedom through decentralized infrastructure." />
          <AreaCard title="Economies & Governance" href="/areas/upgrade-economies-governance" description="Decentralized coordination mechanisms for economic and governance systems." />
          <AreaCard title="AI & Robotics" href="/areas/ai-robotics" description="Responsible AI and robotics that augment human capabilities." />
          <AreaCard title="Neurotechnology" href="/areas/neurotech" description="Brain-computer interfaces for human flourishing and cognitive enhancement." />
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Recent</h2>
        <div className="divide-y divide-gray-200">
          {updates.map((item) => (
            <div key={item.permalink} className="py-4 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
              <div className="flex items-baseline gap-3 shrink-0">
                <span className="text-sm text-gray-400 w-[100px]">{formatDate(item.date)}</span>
                <span className="text-sm text-gray-400 w-[80px]">{item.type}</span>
              </div>
              <Link href={item.permalink} className="text-black hover:text-blue leading-snug">
                {item.title}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-6">
          <Link href="/publications" className="text-sm text-blue hover:underline">Publications</Link>
          <Link href="/talks" className="text-sm text-blue hover:underline">Talks</Link>
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Team</h2>
        <p className="text-gray-700 leading-relaxed max-w-xl mb-4">
          A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity.
        </p>
        <Link href="/authors" className="text-blue hover:underline">Meet the team</Link>
      </div>
    </div>
  )
}

function AreaCard({ title, href, description }: { title: string; href: string; description: string }) {
  return (
    <Link href={href} className="bg-white p-6 hover:bg-gray-50 transition-colors relative overflow-hidden group">
      <AreaCardGeo />
      <h3 className="relative z-10 font-medium mb-1">{title}</h3>
      <p className="relative z-10 text-sm text-gray-600">{description}</p>
    </Link>
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
