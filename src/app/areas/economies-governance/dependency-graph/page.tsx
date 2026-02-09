import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import DependencyGraph from './DependencyGraph'

export const metadata: Metadata = {
  title: 'Dependency Graph',
  description: 'Strategic dependency trees mapping inflection points through bottlenecks, decision gates, program strands, and interventions.',
}

export default function DependencyGraphPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Areas', href: '/areas' },
          { label: 'Economies & Governance', href: '/areas/economies-governance' },
          { label: 'Dependency Graph' },
        ]}
      />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl lg:text-[36px] font-semibold mb-3">Dependency Graph</h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
          Each inflection point mapped through its structural bottlenecks,
          Q4 decision gate, program strands, and cross-cutting interventions.
          Hover over any node for detail.
        </p>
      </div>

      {/* Scrollable graph container */}
      <div className="relative">
        {/* Scroll indicator — fixed to top-right of visible frame */}
        <div className="hidden md:block absolute top-2 right-0 z-10 pointer-events-none">
          <img
            src="/images/fa2/scroll.png"
            alt=""
            aria-hidden="true"
            className="scroll-hand-slide"
            width={28}
            height={28}
            style={{ opacity: 0.3 }}
          />
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <DependencyGraph />
        </div>
      </div>
    </div>
  )
}
