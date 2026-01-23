import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publications } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pub = publications.find((p) => p.slug === slug)
  if (!pub) return { title: 'Not Found' }
  return { title: pub.title, description: (pub.abstract || '').slice(0, 160) }
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params
  const pub = publications.find((p) => p.slug === slug)
  if (!pub) notFound()

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="md:w-2/3">
        <div className="mb-2 text-sm text-gray-500">
          {pub.date && <span>{new Date(pub.date).getFullYear()}</span>}
          {pub.venue && <> &middot; {pub.venue}</>}
        </div>
        <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold">{pub.title}</h1>
        {pub.authors.length > 0 && (
          <p className="text-sm text-gray-600 mb-6">{pub.authors.join(', ')}</p>
        )}
        {pub.abstract && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Abstract</h2>
            <p className="text-gray-700 leading-relaxed">{pub.abstract}</p>
          </div>
        )}
        {pub.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: pub.html }} />}
        <div className="mt-6 flex gap-4">
          {pub.url_pdf && <a href={pub.url_pdf} className="text-blue hover:underline text-sm">PDF</a>}
          {pub.url_source && <a href={pub.url_source} className="text-blue hover:underline text-sm">Source</a>}
          {pub.doi && <a href={`https://doi.org/${pub.doi}`} className="text-blue hover:underline text-sm">DOI</a>}
        </div>
      </div>
    </div>
  )
}
