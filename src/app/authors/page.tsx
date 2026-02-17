'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { authors } from '@/lib/content'
import { GeoIllustration } from '@/components/GeoIllustration'

const LEADS = ['juan-benet', 'molly-mackinlay', 'will-scott', 'sean-escola', 'david-dao', 'james-tunningley']
const ADVISOR_ROLE_KEYWORD = 'advisor'

// Placeholder advisors per focus area — replace with real data when available
const FOCUS_AREA_ADVISORS: { area: string; advisors: { name: string; role: string; affiliation: string }[] }[] = [
  {
    area: 'Digital Human Rights',
    advisors: [
      { name: 'Placeholder Advisor', role: 'Professor of Cryptography', affiliation: 'MIT' },
      { name: 'Placeholder Advisor', role: 'Security Researcher', affiliation: 'EFF' },
      { name: 'Placeholder Advisor', role: 'Distributed Systems Lead', affiliation: 'Stanford' },
    ],
  },
  {
    area: 'Economies & Governance',
    advisors: [
      { name: 'Placeholder Advisor', role: 'Mechanism Design Researcher', affiliation: 'Harvard' },
      { name: 'Placeholder Advisor', role: 'Cryptoeconomics Researcher', affiliation: 'Oxford' },
      { name: 'Placeholder Advisor', role: 'Public Goods Theorist', affiliation: 'UCL' },
    ],
  },
  {
    area: 'AI & Robotics',
    advisors: [
      { name: 'Placeholder Advisor', role: 'AGI Safety Researcher', affiliation: 'DeepMind' },
      { name: 'Placeholder Advisor', role: 'Robotics Lead', affiliation: 'CMU' },
      { name: 'Placeholder Advisor', role: 'ML Systems Researcher', affiliation: 'Berkeley' },
    ],
  },
  {
    area: 'Neurotechnology',
    advisors: [
      { name: 'Placeholder Advisor', role: 'BCI Researcher', affiliation: 'Columbia University' },
      { name: 'Placeholder Advisor', role: 'NeuroAI Lead', affiliation: 'Caltech' },
      { name: 'Placeholder Advisor', role: 'Computational Neuroscientist', affiliation: 'NYU' },
    ],
  },
]

const leadership = LEADS.map(slug => authors.find(a => a.slug === slug)).filter(Boolean) as typeof authors
const alumni = authors.filter(a =>
  !LEADS.includes(a.slug) &&
  !a.role?.toLowerCase().includes(ADVISOR_ROLE_KEYWORD)
)

const TABS = [
  { id: 'leadership', label: 'Leadership' },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
            {leadership.map(author => (
              <LeaderCard key={author.slug} author={author} />
            ))}
          </div>

          {/* Advisors by focus area */}
          <div className="border-t border-gray-200 pt-16">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Advisors</p>
            <p className="text-gray-600 text-base mb-12 max-w-xl">
              External advisors supporting each focus area — bringing deep domain expertise from academia and industry.
            </p>
            <div className="space-y-16">
              {FOCUS_AREA_ADVISORS.map(fa => (
                <AdvisorCarousel key={fa.area} area={fa.area} advisors={fa.advisors} />
              ))}
            </div>
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

// ── Advisor carousel per focus area ─────────────────────────────────────────

function AdvisorCarousel({ area, advisors }: { area: string; advisors: { name: string; role: string; affiliation: string }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-medium text-black">{area}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-blue hover:text-blue transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-blue hover:text-blue transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {advisors.map((advisor, i) => (
          <div
            key={i}
            className="flex-none w-[220px] flex flex-col"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Animated geo placeholder */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
              <GeoIllustration
                seed={`${area}-${advisor.name}-${i}`}
                focusArea={area}
                w={220}
                h={220}
                className="w-full h-full"
              />
            </div>
            <div className="text-sm font-medium text-black leading-snug">{advisor.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{advisor.role}</div>
            <div className="text-xs text-blue mt-0.5">{advisor.affiliation}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Large card for Leadership ────────────────────────────────────────────────

function LeaderCard({ author }: { author: typeof authors[number] }) {
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
      <Link href={`/authors/${author.slug}`} className="group">
        <h3 className="text-base font-medium text-black group-hover:text-blue transition-colors leading-snug">
          {author.name}
        </h3>
      </Link>
      <p className="text-sm text-gray-500 mt-0.5">{author.role}</p>
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
