import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import { ImpactExperience } from '@/components/hypercerts/ImpactExperience'
import { fetchResearchRetreatHypercerts } from '@/lib/hypercerts'

export const metadata: Metadata = {
  title: 'Hypercerts',
  description:
    'Research Retreat editions as verifiable hypercerts: org.hypercerts.claim.activity impact claims published on the ATProto network, with evidence timelines and community activity.',
}

// 5-minute ISR; the indexer fetch uses the same revalidation window.
export const revalidate = 300

export default async function HypercertsPage() {
  const certs = await fetchResearchRetreatHypercerts()

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Focus Areas', href: '/areas/' },
          { label: 'Economies & Governance', href: '/areas/economies-governance/' },
          { label: 'Impact', href: '/areas/economies-governance/impact/' },
          { label: 'Hypercerts' },
        ]}
      />

      <h1 className="mt-8 text-2xl lg:text-[36px] font-semibold mb-3">
        Hypercerts
      </h1>
      <p className="text-lg text-gray-600 mb-3 max-w-2xl">
        Each Research Retreat edition is captured as a{' '}
        <a
          href="https://hypercerts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          hypercert
        </a>
        , a verifiable impact claim published to the ATProto network as an{' '}
        <code className="text-[0.85em]">org.hypercerts.claim.activity</code>{' '}
        record and read live from the hypercerts indexer. Open a card to walk
        its evidence timeline.
      </p>
      <p className="text-sm text-gray-400 mb-12 max-w-2xl">
        In collaboration with{' '}
        <a
          href="https://www.researchretreat.org/impact/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          researchretreat.org
        </a>{' '}
        — community evidence and comments are aggregated from their authors&apos;
        own PDSs via the Constellation backlink index.
      </p>

      <ImpactExperience certs={certs} />
    </div>
  )
}
