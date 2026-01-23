import Link from 'next/link'
import type { Metadata } from 'next'
import impactData from '@/data/fa2/impact.json'
import projectsData from '@/data/fa2/projects.json'

export const metadata: Metadata = {
  title: 'Impact Dashboard',
  description: 'Explore the impact of Protocol Labs FA2 ecosystem initiatives in 2025.',
}

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">
              Impact Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
              {impactData.meta.title}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              {impactData.meta.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {impactData.highlights.map((h) => (
              <div key={h.label} className="border-l border-gray-100 pl-6">
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
                  {h.value}
                </div>
                <div className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">
                  {h.label}
                </div>
                {h.source && (
                  <div className="text-[9px] text-gray-500 mt-2 italic font-light">
                    {h.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Initiatives */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-20">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em] mb-12">
            Key Initiatives
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {impactData.initiatives.map((init) => (
              <div
                key={init.id}
                className="bg-white border border-gray-100 rounded hover:border-gray-300 transition-all group flex flex-col"
              >
                <a
                  href={init.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col flex-grow"
                >
                  {/* Logo */}
                  <div className="h-32 relative flex items-center justify-center p-6 bg-gray-50/30">
                    {init.logo ? (
                      <img
                        src={init.logo}
                        alt={init.name}
                        className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:border-gray-300 transition-colors">
                        <span className="text-lg font-light text-gray-400 uppercase">
                          {init.name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-blue transition-colors">
                      {init.name}
                    </h3>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 font-light">
                      {init.category}
                    </p>
                    <p className="text-[11px] text-gray-700 leading-relaxed mb-6 line-clamp-3 font-light">
                      {init.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {init.metrics.map((m) => (
                        <div key={m.label}>
                          <div className="text-xl font-light text-gray-900 mb-1 tracking-tight">
                            {m.value}
                          </div>
                          <div className="text-[9px] text-gray-600 uppercase tracking-wider">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {init.events && (
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        <div className="flex flex-wrap gap-1">
                          {init.events.map((e) => (
                            <span
                              key={e.title}
                              className="text-[8px] px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-medium uppercase tracking-wider group-hover:bg-blue/5 group-hover:text-blue group-hover:border-blue/20 transition-colors"
                            >
                              {e.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-20">
          <div className="mb-12">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em] mb-4">
              Ecosystem Overview
            </h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-light text-gray-900 tracking-tight">
                {projectsData.count}
              </span>
              <span className="text-gray-500 text-sm font-light uppercase tracking-widest">
                Global Teams
              </span>
            </div>
          </div>

          {/* Logo Grid */}
          <div className="flex flex-wrap gap-3 mb-8">
            {projectsData.teams.slice(0, 60).map((team) => (
              <a
                key={team.uid}
                href={`https://directory.plnetwork.io/teams/${team.uid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-8 h-8 group block"
                title={team.name}
              >
                {team.logo ? (
                  <img
                    src={team.logo.url}
                    alt={team.name}
                    className="w-full h-full object-contain opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border border-gray-100 flex items-center justify-center bg-white opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-gray-400 font-light">
                      {team.name[0]}
                    </span>
                  </div>
                )}
              </a>
            ))}
          </div>

          <div>
            <Link
              href="/areas/fa2-upgrade-economies-governance-systems/projects/"
              className="text-[10px] text-gray-400 hover:text-gray-900 transition-colors font-medium uppercase tracking-widest border-b border-gray-100 pb-1"
            >
              Explore all projects →
            </Link>
          </div>
        </div>
      </section>

      {/* Back */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-12">
        <Link
          href="/areas/fa2-upgrade-economies-governance-systems/"
          className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-light"
        >
          ← Back to FA2
        </Link>
      </section>
    </div>
  )
}
