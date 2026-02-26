import type { Metadata } from 'next'
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
      <div className="flex-1 relative">
        <IPFigure config={config} />
      </div>
    </div>
  )
}
