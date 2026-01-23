import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subareas',
  description: 'Nine interconnected subfields for upgrading economies and governance systems.',
}

const subareas = [
  {
    title: '(Sovereign) DPI',
    tagline: 'Digital Public Infrastructure',
    description: 'Nation-states run open, verifiable, privacy-preserving rails (identity, payments, registries, RWA, data + compute corridors).',
    keyAreas: ['Decentralized identity systems', 'Privacy-preserving payment rails', 'Public registries and credentials', 'Real-world asset tokenization', 'Sovereign data corridors'],
  },
  {
    title: 'DeSci',
    tagline: 'Decentralized Science',
    description: 'Shifting from experiments to a full scientific stack (open data, reproducible research, verifiable pipelines, new funding instruments).',
    keyAreas: ['Open data infrastructure', 'Reproducible research pipelines', 'Verifiable compute for science', 'Novel funding mechanisms', 'Decentralized peer review'],
  },
  {
    title: 'DePIN',
    tagline: 'Decentralized Physical Infrastructure Networks',
    description: 'DePIN becomes a mainstream infra category (sovereign compute, energy, sensing, mapping, telecom, and resilience networks).',
    keyAreas: ['Sovereign compute networks', 'Decentralized energy grids', 'Distributed sensing infrastructure', 'Community mapping systems', 'Resilient telecom networks'],
  },
  {
    title: 'Public Goods Funding',
    tagline: 'Sustainable Public Goods Markets',
    description: 'PGF evolves into public markets for public goods (sustainable co-funding, repeatable granting, clear measurement, institutional legitimacy).',
    keyAreas: ['Quadratic funding mechanisms', 'Retroactive public goods funding', 'Impact certificates and hypercerts', 'Co-funding vehicles', 'Civic infrastructure financing'],
  },
  {
    title: 'DeFi',
    tagline: 'Decentralized Finance',
    description: 'DeFi achieves global democratized access to payments and savings in valuable asset categories (major currencies, stocks, bonds).',
    keyAreas: ['Decentralized exchanges', 'Lending and borrowing protocols', 'Stablecoins and synthetic assets', 'Yield optimization', 'Cross-chain liquidity'],
  },
  {
    title: 'DeGov',
    tagline: 'Decentralized Governance',
    description: 'Technology enables resilience towards misinformation and lifts the governance abilities of states and institutions.',
    keyAreas: ['Verifiable voting systems', 'Reputation and credibility networks', 'Anti-misinformation infrastructure', 'Transparent decision-making', 'Institutional coordination tools'],
  },
  {
    title: 'Network States',
    tagline: 'Digital-First Societies',
    description: 'Network states develop permanent hubs and provide radical new ideas of how society can flourish.',
    keyAreas: ['Digital community governance', 'Permanent physical hubs', 'New social contracts', 'Pop-up cities and villages', 'Alternative citizenship models'],
  },
  {
    title: 'Improving Nations',
    tagline: 'Computing-Enabled National Development',
    description: 'Computing leapfrogs national economies and creates wealth and security for developing nations.',
    keyAreas: ['Leapfrog technology adoption', 'Digital economic zones', 'Wealth creation infrastructure', 'Economic security systems', 'Sovereign tech stacks'],
  },
  {
    title: 'Climate / ReFi',
    tagline: 'Regenerative Finance',
    description: 'New mechanisms enable sustainable climate finance. DePIN and MRV technology tackle the climate and biodiversity crisis.',
    keyAreas: ['Measurement, Reporting, Verification (MRV)', 'Carbon credit markets', 'Biodiversity tracking', 'Regenerative economic models', 'Climate infrastructure DePIN'],
  },
]

export default function SubareasPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
      {/* Breadcrumb */}
      <Link
        href="/areas/upgrade-economies-governance/"
        className="text-xs text-gray-400 hover:text-black transition-colors mb-8 inline-block"
      >
        ← Economies & Governance
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-lg font-semibold mb-2">Subareas</h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
          Nine interconnected subfields, each representing a critical domain for upgrading economies and governance systems.
        </p>
      </div>

      {/* Subareas grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {subareas.map((sub) => (
          <div key={sub.title} className="border-l-2 border-gray-100 pl-5">
            <h3 className="text-sm font-medium text-black">{sub.title}</h3>
            <span className="text-[11px] text-gray-400">{sub.tagline}</span>
            <p className="text-xs text-gray-500 leading-relaxed mt-2">{sub.description}</p>
          </div>
        ))}
        <div className="border-l-2 border-gray-100 pl-5 flex items-center">
          <p className="text-xs text-gray-400 leading-relaxed italic">
            More subareas may emerge as the field grows. These subfields overlap and create new opportunity spaces at their convergence points.
          </p>
        </div>
      </div>
    </div>
  )
}
