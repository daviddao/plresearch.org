import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ImpactExperience from '@/components/ImpactExperience'

// ── Hidden preview of the Impact experience ───────────────────────────────────
// Shared only by link. The path segment IS the secret: `dynamicParams = false`
// plus a single `generateStaticParams` entry means every URL except the exact
// key 404s. The page is marked noindex/nofollow, is not in the nav, and is not
// in the sitemap. Rotate the key below to invalidate an old link.
const PREVIEW_KEY = '024dbf9194f85c80c584f572d22d5aa7'

export const revalidate = 60
export const dynamicParams = false

export function generateStaticParams() {
  return [{ key: PREVIEW_KEY }]
}

export const metadata: Metadata = {
  title: 'Impact (preview)',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default async function ImpactPreviewPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  if (key !== PREVIEW_KEY) notFound()
  return <ImpactExperience preview />
}
