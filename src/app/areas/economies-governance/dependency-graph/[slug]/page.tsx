import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IPFigure } from '../DependencyGraph'
import { expandedConfigs } from '../data'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return [
    { slug: 'sovereign-dpi' },
    { slug: 'public-goods-funding' },
    { slug: 'governance-democracy' },
    { slug: 'climate-infrastructure' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const config = expandedConfigs[slug]
  if (!config) return { title: 'Not Found' }
  return {
    title: `${config.label} — Dependency Graph`,
    description: config.sub,
  }
}

export default async function DependencyGraphSlugPage({ params }: Props) {
  const { slug } = await params
  const config = expandedConfigs[slug]
  if (!config) notFound()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Compact header bar */}
      <header className="shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/areas/economies-governance/dependency-graph"
              className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              aria-label="Back to all graphs"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex items-baseline gap-2.5 min-w-0">
              <span
                className="text-2xl font-bold leading-none shrink-0"
                style={{ color: config.color, opacity: 0.25 }}
              >
                {config.num}
              </span>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold tracking-tight truncate" style={{ color: '#131316' }}>
                  {config.label}
                </h1>
                <p className="text-xs text-gray-400 truncate" style={{ fontWeight: 300 }}>
                  {config.sub}
                </p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest shrink-0 hidden sm:block">
            Dependency Graph
          </div>
        </div>
      </header>

      {/* Full-page canvas */}
      <div className="flex-1 relative">
        <IPFigure config={config} />
      </div>
    </div>
  )
}
