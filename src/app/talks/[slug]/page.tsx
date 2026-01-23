import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { talks } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return talks.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const talk = talks.find((t) => t.slug === slug)
  if (!talk) return { title: 'Not Found' }
  return { title: talk.title }
}

export default async function TalkPage({ params }: Props) {
  const { slug } = await params
  const talk = talks.find((t) => t.slug === slug)
  if (!talk) notFound()

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="md:w-2/3">
        <div className="mb-2 text-sm text-gray-500">
          {talk.venue}
          {talk.venue_location && <> &middot; {talk.venue_location}</>}
          {talk.date && <> &middot; {new Date(talk.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</>}
        </div>
        <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold">{talk.title}</h1>
        {talk.authors.length > 0 && (
          <p className="text-sm text-gray-600 mb-6">{talk.authors.join(', ')}</p>
        )}
        {talk.abstract && <p className="text-gray-700 leading-relaxed mb-6">{talk.abstract}</p>}
        {talk.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: talk.html }} />}
        {talk.venue_url && (
          <a href={talk.venue_url} className="text-blue hover:underline text-sm mt-4 inline-block">Venue website</a>
        )}
      </div>
    </div>
  )
}
