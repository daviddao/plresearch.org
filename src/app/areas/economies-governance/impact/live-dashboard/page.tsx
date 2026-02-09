import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Live Dashboard',
  description: 'Real-time metrics tracking ecosystem activity.',
}

export default function LiveDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[
        { label: 'Focus Areas', href: '/areas/' },
        { label: 'Economies & Governance', href: '/areas/economies-governance/' },
        { label: 'Impact', href: '/areas/economies-governance/impact/' },
        { label: 'Live Dashboard' }
      ]} />

      {/* Header */}
      <div className="pt-8 pb-12 mb-12">
        <h1 className="text-2xl lg:text-[36px] font-semibold mb-3">Live Dashboard</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Real-time metrics and data visualizations tracking ecosystem activity.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="flex items-center justify-center py-20 bg-gray-50 rounded-xl border border-gray-100">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg text-gray-500 mb-2">Coming Soon</p>
          <p className="text-sm text-gray-400">Live metrics dashboard is under development.</p>
        </div>
      </div>
    </div>
  )
}
