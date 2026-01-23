import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { outreach } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return outreach.map((o) => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = outreach.find((o) => o.slug === slug)
  if (!item) return { title: 'Not Found' }
  return { title: item.title }
}

export default async function OutreachItemPage({ params }: Props) {
  const { slug } = await params
  const item = outreach.find((o) => o.slug === slug)
  if (!item) notFound()

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="md:w-2/3">
        <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold">{item.title}</h1>
        {item.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: item.html }} />}
        {item.linkUrl && (
          <a href={item.linkUrl} className="text-blue hover:underline mt-4 inline-block">{item.linkText || 'Learn more'}</a>
        )}
      </div>
    </div>
  )
}
