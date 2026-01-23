import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { areas } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const area = areas.find((a) => a.slug === slug)
  if (!area) return { title: 'Not Found' }
  return { title: area.title }
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params
  const area = areas.find((a) => a.slug === slug)
  if (!area) notFound()

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="md:w-2/3">
        <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold">{area.title}</h1>
        {area.summary && <p className="text-gray-600 mb-6">{area.summary}</p>}
        {area.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: area.html }} />}
      </div>
    </div>
  )
}
