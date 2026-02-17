'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { authors } from '@/lib/content'

const LEADS = ['juan-benet', 'molly-mackinlay', 'will-scott', 'sean-escola', 'david-dao', 'james-tunningley']
const ADVISOR_ROLE_KEYWORD = 'advisor'

// FA label by advisor slug
const ADVISOR_FA: Record<string, string> = {
  'adam-marblestone': 'AI & Robotics',
  'dario-catalano':   'Digital Human Rights',
  'ioannis-caragiannis': 'Economies & Governance',
  'vivien-quema':     'Digital Human Rights',
}

const leadership = LEADS.map(slug => authors.find(a => a.slug === slug)).filter(Boolean) as typeof authors
const advisors   = authors.filter(a => a.role?.toLowerCase().includes(ADVISOR_ROLE_KEYWORD))
const alumni     = authors.filter(a =>
  !LEADS.includes(a.slug) &&
  !a.role?.toLowerCase().includes(ADVISOR_ROLE_KEYWORD)
)

const TABS = [
  { id: 'leadership', label: 'Leadership' },
  { id: 'advisors',   label: 'Advisors' },
  { id: 'alumni',     label: 'Alumni' },
]

export default function AuthorsPage() {
  const [activeTab, setActiveTab] = useState('leadership')

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-24">
      {/* Header */}
      <div className="pt-6 pb-12 border-b border-gray-200 mb-0">
        <h1 className="text-[36px] md:text-[52px] font-normal leading-[1.1] tracking-tight mb-4">
          Our team
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
          We&apos;ve come together from academia, startups, and the public sector, united by a belief that the hardest problems in computing and human flourishing deserve serious, long-horizon research.
        </p>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 mb-16">
        <nav className="flex gap-8" aria-label="Team sections">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-blue text-blue'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Leadership */}
      {activeTab === 'leadership' && (
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-12">
            R&amp;D Lead · Operations · Focus Area Leads
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {leadership.map(author => (
              <LeaderCard key={author.slug} author={author} />
            ))}
          </div>
        </div>
      )}

      {/* Advisors */}
      {activeTab === 'advisors' && (
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-12">
            External advisors supporting our focus areas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {advisors.map(author => (
              <LeaderCard key={author.slug} author={author} fa={ADVISOR_FA[author.slug]} />
            ))}
          </div>
        </div>
      )}

      {/* Alumni */}
      {activeTab === 'alumni' && (
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-12">
            Former members who shaped PL R&amp;D
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {alumni.map(author => (
              <AlumniCard key={author.slug} author={author} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Large card for Leadership / Advisors / Researchers ──────────────────────

function LeaderCard({ author, fa }: { author: typeof authors[number]; fa?: string }) {
  const [expanded, setExpanded] = useState(false)
  const bioText = (author.html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x26;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim()
  const shortBio = bioText.length > 220 ? bioText.slice(0, 220).trimEnd() + '…' : bioText

  return (
    <div className="flex flex-col">
      {/* Square photo */}
      <Link href={`/authors/${author.slug}`} className="block mb-4 group">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          {author.avatarPath ? (
            <img
              src={author.avatarPath}
              alt={author.name}
              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </Link>

      {/* Name + role */}
      <Link href={`/authors/${author.slug}`} className="group">
        <h3 className="text-base font-medium text-black group-hover:text-blue transition-colors leading-snug">
          {author.name}
        </h3>
      </Link>
      <p className="text-sm text-gray-500 mt-0.5">{author.role}</p>

      {/* FA tag for advisors */}
      {fa && (
        <span className="mt-2 inline-block text-xs px-2.5 py-1 rounded-full bg-blue/10 text-blue font-medium w-fit">
          {fa}
        </span>
      )}

      {/* Bio */}
      {bioText && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            {expanded ? bioText : shortBio}
          </p>
          {bioText.length > 220 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-1.5 text-xs text-gray-400 hover:text-blue transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Compact card for Alumni ──────────────────────────────────────────────────

function AlumniCard({ author }: { author: typeof authors[number] }) {
  return (
    <Link href={`/authors/${author.slug}`} className="group flex flex-col items-center text-center">
      <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
        {author.avatarPath ? (
          <img
            src={author.avatarPath}
            alt={author.name}
            className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="text-sm font-medium text-black group-hover:text-blue transition-colors leading-tight">
        {author.name}
      </div>
      {author.role && (
        <div className="text-xs text-gray-400 mt-0.5 leading-tight">{author.role}</div>
      )}
    </Link>
  )
}
