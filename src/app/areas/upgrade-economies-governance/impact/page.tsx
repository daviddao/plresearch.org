import Link from 'next/link'
import type { Metadata } from 'next'
import impactData from '@/data/fa2/impact.json'
import projectsData from '@/data/fa2/projects.json'

export const metadata: Metadata = {
  title: 'Impact Dashboard',
  description: 'Explore the impact of Protocol Labs ecosystem initiatives in 2025.',
}

export default function ImpactPage() {
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
      <h1 className="text-lg font-semibold mb-2">{impactData.meta.title}</h1>
      <p className="text-gray-600 mb-10">{impactData.meta.subtitle}</p>

      {/* Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-gray-100">
        {impactData.highlights.map((h) => (
          <div key={h.label}>
            <div className="text-xl font-semibold text-black mb-1">{h.value}</div>
            <div className="text-xs text-gray-500">{h.label}</div>
            {h.source && <div className="text-[11px] text-gray-400 mt-0.5">{h.source}</div>}
          </div>
        ))}
      </div>

      {/* Initiatives */}
      <div className="mb-12 pb-12 border-b border-gray-100">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Key Initiatives</h2>
        <div className="divide-y divide-gray-100">
          {impactData.initiatives.map((init) => (
            <div key={init.id} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4 mb-3">
                {init.logo && (
                  <img src={init.logo} alt={init.name} className="w-8 h-8 object-contain shrink-0 rounded" />
                )}
                <div>
                  <a
                    href={init.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-black hover:text-blue transition-colors"
                  >
                    {init.name}
                  </a>
                  <span className="text-xs text-gray-400 ml-2">{init.category}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{init.description}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {init.metrics.map((m) => (
                  <div key={m.label} className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-black">{m.value}</span>
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </div>
                ))}
              </div>
              {init.events && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {init.events.map((e) => (
                    <span key={e.title} className="text-[11px] text-gray-500">{e.title}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ecosystem */}
      <div className="mb-12">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Ecosystem Overview</h2>
        <p className="text-sm text-gray-700 mb-6">
          <span className="font-semibold text-black">{projectsData.count}</span> global teams building the future of decentralized coordination.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {projectsData.teams.map((team) => (
            <a
              key={team.uid}
              href={`https://directory.plnetwork.io/teams/${team.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 opacity-50 hover:opacity-100 transition-opacity"
              title={team.name}
            >
              {team.logo ? (
                <img src={team.logo.url} alt={team.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-[9px] text-gray-500">{team.name[0]}</span>
                </div>
              )}
            </a>
          ))}
        </div>
        <Link href="/areas/upgrade-economies-governance/projects/" className="text-sm text-blue hover:underline">
          Explore all projects
        </Link>
      </div>

    </div>
  )
}
