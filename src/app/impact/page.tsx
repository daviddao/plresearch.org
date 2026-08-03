import type { Metadata } from 'next'
import ImpactExperience from '@/components/ImpactExperience'

// The impact page reads field velocity: the interventions we run, the five
// instruments we read a field's rate of change with, and the inflection points
// we track, each with its live signal.
//
// NOTE: this is an unlisted draft. It is not in the nav and not in the sitemap,
// and it is marked noindex/nofollow so search engines skip it. The shareable
// entry point is the cryptic /impact-preview/<key>/ route; this canonical path
// is kept working but deliberately undiscoverable until the work is signed off.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Impact',
  description:
    'How we judge PL R&D: whether the fields we back are speeding up. We name the interventions we run, then read field velocity through five instruments and the inflection points we track.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default async function ImpactPage() {
  return <ImpactExperience />
}
