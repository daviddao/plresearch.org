'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Team = {
  uid: string
  name: string
  logo: { url: string } | null
  website: string | null
  twitterHandler: string | null
  linkedinHandler: string | null
  shortDescription: string | null
  longDescription: string | null
  fa2_tags?: string[]
  createdAt: string
  updatedAt: string
}

type ProjectsData = {
  count: number
  teams: Team[]
}

export default function ProjectsExplorer({ projects }: { projects: ProjectsData }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    projects.teams.forEach((t) => t.fa2_tags?.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [projects.teams])

  const filtered = useMemo(() => {
    let result = projects.teams.filter((team) => {
      const matchesSearch =
        search === '' ||
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        (team.shortDescription || '').toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        category === 'all' ||
        (team.fa2_tags || []).some((t) => t.toLowerCase() === category.toLowerCase())

      return matchesSearch && matchesCategory
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return result
  }, [projects.teams, search, category, sortBy])

  function downloadCSV() {
    const headers = ['Name', 'Short Description', 'Website', 'Twitter', 'LinkedIn', 'Tags', 'Created At', 'Updated At']
    const rows = projects.teams.map((team) => [
      `"${(team.name || '').replace(/"/g, '""')}"`,
      `"${(team.shortDescription || '').replace(/"/g, '""')}"`,
      team.website || '',
      team.twitterHandler || '',
      team.linkedinHandler || '',
      `"${(team.fa2_tags || []).join(', ')}"`,
      team.createdAt || '',
      team.updatedAt || '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fa2_ecosystem_projects.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">
              FA2 Ecosystem
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
              Projects
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              <span className="text-gray-900 font-medium">{filtered.length}</span> teams
              building the future of decentralized coordination.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-gray-300 transition-all text-gray-700"
              />
            </div>
            <div className="md:w-48">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:border-gray-300 transition-all cursor-pointer text-gray-700"
              >
                <option value="all">All Categories</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:border-gray-300 transition-all cursor-pointer text-gray-700"
              >
                <option value="name">Sort by Name</option>
                <option value="created-desc">Newest First</option>
                <option value="updated-desc">Recently Updated</option>
              </select>
            </div>
            <div className="md:w-32">
              <button
                onClick={downloadCSV}
                className="w-full px-4 py-2 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[10px] font-medium hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all flex items-center justify-center gap-1.5"
              >
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filtered.map((team) => (
                <div
                  key={team.uid}
                  className="bg-white border border-gray-100 rounded hover:border-gray-300 transition-all group flex flex-col"
                >
                  {/* Logo */}
                  <div className="h-32 relative flex items-center justify-center p-6 bg-gray-50/30">
                    {team.logo ? (
                      <img
                        src={team.logo.url}
                        alt={team.name}
                        className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:border-gray-300 transition-colors">
                        <span className="text-lg font-light text-gray-400 uppercase">
                          {team.name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-grow flex-col">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-blue transition-colors truncate">
                      {team.name}
                    </h3>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-4 flex-grow line-clamp-2">
                      {(team.shortDescription || team.longDescription || '').slice(0, 80)}
                    </p>

                    {team.fa2_tags && team.fa2_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {team.fa2_tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[8px] px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-medium uppercase tracking-wider group-hover:bg-blue/5 group-hover:text-blue group-hover:border-blue/20 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                      <a
                        href={`https://directory.plnetwork.io/teams/${team.uid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-500 hover:text-blue transition-colors font-medium"
                      >
                        Directory
                      </a>
                      {team.website && (
                        <a
                          href={team.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-gray-500 hover:text-blue transition-colors font-medium"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <p className="text-gray-400 text-sm font-light italic">
                No results found for your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Back */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 border-t border-gray-50">
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
