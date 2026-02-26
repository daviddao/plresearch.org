import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
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
    title: config.label,
    description: config.sub,
  }
}

export default async function DependencyGraphSlugPage({ params }: Props) {
  const { slug } = await params
  const config = expandedConfigs[slug]
  if (!config) notFound()

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Areas', href: '/areas' },
          { label: 'Economies & Governance', href: '/areas/economies-governance' },
          { label: 'Dependency Graph', href: '/areas/economies-governance/dependency-graph' },
          { label: config.label },
        ]}
      />

      {/* Back link */}
      <div className="mt-4 mb-8">
        <Link
          href="/areas/economies-governance/dependency-graph"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150 inline-flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to all graphs
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className="text-5xl font-bold leading-none"
            style={{ color: config.color, opacity: 0.15, letterSpacing: -2 }}
          >
            {config.num}
          </span>
          <h1 className="text-2xl lg:text-[32px] font-semibold tracking-tight leading-tight">
            {config.label}
          </h1>
        </div>
        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl" style={{ fontWeight: 300 }}>
          {config.sub}
        </p>
      </div>

      {/* Graph — full-width scrollable */}
      <div className="overflow-x-auto">
        <IPFigure config={config} />
      </div>
    </div>
  )
}
