import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tutorials } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return tutorials.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tutorial = tutorials.find((t) => t.slug === slug)
  if (!tutorial) return { title: 'Not Found' }
  return { title: tutorial.title || slug }
}

export default async function TutorialPage({ params }: Props) {
  const { slug } = await params
  const tutorial = tutorials.find((t) => t.slug === slug)
  if (!tutorial) notFound()

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="md:w-2/3">
        <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold">{tutorial.title || slug}</h1>
        {tutorial.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: tutorial.html }} />}
      </div>
    </div>
  )
}
