import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FA2: Upgrade Economies & Governance Systems',
  description: 'Upgrading Economies and Governance Systems through crypto-native infrastructure.',
}

export default function FA2MainPage() {
  return (
    <div className="max-w-[1146px] mx-auto pt-4 px-4 md:px-10">
      <div className="page-top mb-8">
        <h1 className="text-lg md:text-xl font-semibold mb-4">
          FA2: Upgrade Economies & Governance Systems
        </h1>
      </div>

      <div className="page-content md:w-2/3">
        <p>
          FA2 focuses on building the field of crypto-native economic and governance
          infrastructure. This mission aims to rectify the inadequacies of current macro
          systems, which often struggle to coordinate and solve monumental challenges
          like climate change.
        </p>
        <p>
          By leveraging cryptoeconomics and improved governance tools, we are rethinking
          how capital is formed and deployed (e.g., Public Goods Funding). This movement
          harnesses mechanism design to align millions of people worldwide toward shared
          goals, creating more efficient and equitable structures that can allocate
          resources at the scale of nation-states for the benefit of all humanity.
        </p>
      </div>

      {/* Explore FA2 Grid */}
      <div className="grid md:grid-cols-3 gap-4 mt-8 border-t border-gray-100 pt-8">
        <Link
          href="/areas/fa2-upgrade-economies-governance-systems/opportunity-spaces/"
          className="group block p-6 bg-white border border-gray-100 rounded hover:border-gray-300 transition-all no-underline"
        >
          <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-2 font-medium">
            Strategy
          </div>
          <h3 className="text-lg font-light text-almost-black group-hover:text-blue transition-colors mb-2">
            Opportunity Spaces
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            Explore 4 convergence zones where FA2 can catalyze systemic change in
            economies and governance.
          </p>
        </Link>

        <Link
          href="/areas/fa2-upgrade-economies-governance-systems/impact/"
          className="group block p-6 bg-white border border-gray-100 rounded hover:border-gray-300 transition-all no-underline"
        >
          <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-2 font-medium">
            Data & Metrics
          </div>
          <h3 className="text-lg font-light text-almost-black group-hover:text-blue transition-colors mb-2">
            Impact Dashboard
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            Explore the impact of FA2 ecosystem initiatives across global villages,
            research, and funding.
          </p>
        </Link>

        <Link
          href="/areas/fa2-upgrade-economies-governance-systems/projects/"
          className="group block p-6 bg-white border border-gray-100 rounded hover:border-gray-300 transition-all no-underline"
        >
          <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-2 font-medium">
            Ecosystem Explorer
          </div>
          <h3 className="text-lg font-light text-almost-black group-hover:text-blue transition-colors mb-2">
            Project Explorer
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            Browse 242+ teams building sovereign DPI, DeSci, DePIN, and public goods
            funding infrastructure.
          </p>
        </Link>
      </div>
    </div>
  )
}
