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
      <div className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
        <h1 className="relative text-xl lg:text-[56px] font-semibold leading-[1.1] tracking-tight mb-6">
          Driving breakthroughs in computing to push humanity forward.
        </h1>
        <p className="relative text-gray-600 text-big lg:text-bigger leading-relaxed max-w-2xl mb-8">
          Protocol Labs Research explores the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity.
        </p>
        <div className="relative flex gap-6">
          <Link href="/about" className="text-blue hover:underline">About us</Link>
          <Link href="/areas" className="text-blue hover:underline">Focus areas</Link>
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          <AreaCard title="Digital Human Rights" href="/areas/fa1-digital-human-rights" description="Privacy, identity, and digital freedom through decentralized infrastructure." />
          <AreaCard title="Economies & Governance" href="/areas/fa2-upgrade-economies-governance-systems" description="Decentralized coordination mechanisms for economic and governance systems." />
          <AreaCard title="AI & Robotics" href="/areas/fa3-ai-robotics" description="Responsible AI and robotics that augment human capabilities." />
          <AreaCard title="Neurotechnology" href="/areas/fa4-neurotech" description="Brain-computer interfaces for human flourishing and cognitive enhancement." />
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
    <Link href={href} className="bg-white p-6 hover:bg-gray-100 transition-colors">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}
