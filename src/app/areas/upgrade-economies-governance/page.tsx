import Link from 'next/link'
import type { Metadata } from 'next'
import AuthorCard from '@/components/AuthorCard'

export const metadata: Metadata = {
  title: 'Upgrade Economies & Governance Systems',
  description: 'Upgrading Economies and Governance Systems through crypto-native infrastructure.',
}

export default function FA2MainPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      {/* Hero */}
      <div className="relative pt-12 pb-10 mb-10 overflow-hidden">
        {/* Background image */}
        <img
          src="/images/banners/people-banner-desktop@2x.jpg"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-auto max-w-[55%] object-contain object-right opacity-[0.12] pointer-events-none select-none hidden md:block"
        />
        {/* Geometric decoration */}
        <svg
          className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
          viewBox="0 0 700 500"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="480" cy="130" r="70" stroke="#C3E1FF" strokeWidth="1" />
          <circle cx="560" cy="250" r="50" stroke="#C3E1FF" strokeWidth="0.75" />
          <circle cx="400" cy="260" r="90" stroke="#C3E1FF" strokeWidth="0.75" />
          <circle cx="520" cy="380" r="55" stroke="#C3E1FF" strokeWidth="1" />
          <line x1="480" y1="130" x2="560" y2="250" stroke="#C3E1FF" strokeWidth="0.5" />
          <line x1="560" y1="250" x2="520" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
          <line x1="400" y1="260" x2="480" y2="130" stroke="#C3E1FF" strokeWidth="0.5" />
          <line x1="400" y1="260" x2="520" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
          <circle cx="480" cy="130" r="3" fill="#C3E1FF" />
          <circle cx="560" cy="250" r="3" fill="#C3E1FF" />
          <circle cx="400" cy="260" r="3" fill="#C3E1FF" />
          <circle cx="520" cy="380" r="3" fill="#C3E1FF" />
        </svg>

        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          Upgrade Economies & Governance Systems
        </h1>
        <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl mb-6">
          Building crypto-native economic and governance infrastructure to create more efficient, equitable structures that coordinate at the scale of nation-states.
        </p>
        <div className="relative z-10 flex gap-5 mb-6">
          <Link href="/areas/upgrade-economies-governance/subareas/" className="text-sm text-blue hover:underline">Subareas</Link>
          <Link href="/areas/upgrade-economies-governance/opportunity-spaces/" className="text-sm text-blue hover:underline">Opportunity Spaces</Link>
          <Link href="/areas/upgrade-economies-governance/impact/" className="text-sm text-blue hover:underline">Impact</Link>
          <Link href="/areas/upgrade-economies-governance/projects/" className="text-sm text-blue hover:underline">Projects</Link>
        </div>
        <div className="relative z-10 flex flex-col items-start gap-2">
          <AuthorCard slug="david-dao" />
          <AuthorCard slug="james-tunningley" />
        </div>
      </div>

      {/* Content */}
      <div className="mb-10 pb-10 border-b border-gray-100">
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          This focus area rectifies the inadequacies of current macro systems, which often struggle to coordinate and solve monumental challenges like climate change. By leveraging cryptoeconomics and improved governance tools, we are rethinking how capital is formed and deployed.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          This movement harnesses mechanism design to align millions of people worldwide toward shared goals, creating structures that can allocate resources at the scale of nation-states for the benefit of all humanity.
        </p>
      </div>

      {/* Explore */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Explore</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <ExploreCard
          href="/areas/upgrade-economies-governance/subareas/"
          label="Domains"
          title="Subareas"
          description="9 interconnected subfields driving systemic change."
        />
        <ExploreCard
          href="/areas/upgrade-economies-governance/opportunity-spaces/"
          label="Strategy"
          title="Opportunity Spaces"
          description="4 convergence zones for systemic change."
        />
        <ExploreCard
          href="/areas/upgrade-economies-governance/impact/"
          label="Metrics"
          title="Impact Dashboard"
          description="Ecosystem impact across villages and funding."
        />
        <ExploreCard
          href="/areas/upgrade-economies-governance/projects/"
          label="Ecosystem"
          title="Project Explorer"
          description="242+ teams building public goods infrastructure."
        />
      </div>

      {/* How to Engage */}
      <div className="mt-16">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">How to Engage</h2>
        <p className="text-sm text-gray-600 mb-6">We are actively seeking:</p>
        <div className="grid md:grid-cols-2 gap-6">
          <EngageItem
            title="Feedback on this framing"
            description="Does this opportunity space resonate? What's missing? What's wrong?"
          />
          <EngageItem
            title="Case studies and examples"
            description="What sovereign DPI deployments, DeSci infrastructure, DePIN projects, or PGF mechanisms should we be learning from?"
          />
          <EngageItem
            title="Partner identification"
            description="Who else should be at the table? What institutions, teams, or individuals are essential to this work?"
          />
          <EngageItem
            title="Technical input"
            description="What reference architectures, standards, or specifications would be most valuable?"
          />
          <EngageItem
            title="Strategic counsel"
            description="What have we gotten wrong about the field, the opportunity, or the approach?"
          />
        </div>
        <a
          href="https://forms.gle/xfuuf8U6UPX3obnh8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 text-sm text-blue hover:text-black border border-blue/30 hover:border-black/30 px-4 py-2 rounded-full transition-colors"
        >
          Share feedback
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>
    </div>
  )
}

function EngageItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-gray-100 pl-5">
      <h3 className="text-sm font-medium text-black mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function ExploreCard({ href, label, title, description }: { href: string; label: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group block py-4 border-l-2 border-gray-200 pl-5 hover:border-blue transition-colors no-underline"
    >
      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <h3 className="text-sm font-medium text-black group-hover:text-blue transition-colors mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </Link>
  )
}
