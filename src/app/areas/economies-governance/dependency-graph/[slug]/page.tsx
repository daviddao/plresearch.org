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
      <header className="shrink-0 border-b border-gray-100 bg-white z-10">
        <div className="flex items-center h-14 px-5 gap-4">
          {/* Back button */}
          <Link
            href="/areas/economies-governance/dependency-graph"
            className="text-gray-700 hover:text-gray-900 transition-colors shrink-0"
            aria-label="Back to all graphs"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* Title group — number and text on same baseline */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="text-lg font-semibold tabular-nums shrink-0"
              style={{ color: config.color, opacity: 0.4 }}
            >
              {config.num}
            </span>
            <div className="min-w-0">
              <h1 className="text-[15px] font-medium tracking-tight text-gray-900 truncate leading-tight">
                {config.label}
              </h1>
              <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                {config.sub}
              </p>
            </div>
          </div>

          {/* Right label */}
          <div className="ml-auto text-[10px] text-gray-500 uppercase tracking-[0.2em] shrink-0 hidden sm:block font-medium">
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
