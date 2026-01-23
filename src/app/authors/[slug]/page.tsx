import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { authors, publications, talks } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = authors.find((a) => a.slug === slug)
  if (!author) return { title: 'Not Found' }
  return { title: author.name }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = authors.find((a) => a.slug === slug)
  if (!author) notFound()

  const authorPubs = publications.filter((p) => p.authors.includes(slug))
  const authorTalks = talks.filter((t) => t.authors.includes(slug))

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {author.avatarPath && (
          <img src={author.avatarPath} alt={author.name} className="w-32 h-32 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-lg font-semibold">{author.name}</h1>
          {author.role && <p className="text-gray-600">{author.role}</p>}
          {author.groups.length > 0 && <p className="text-sm text-gray-500 mt-1">{author.groups.join(', ')}</p>}
          {author.social.length > 0 && (
            <div className="flex gap-3 mt-3">
              {author.social.map((s, i) => s.link && (
                <a key={i} href={s.link} className="text-sm text-blue hover:underline">{s.icon}</a>
              ))}
            </div>
          )}
        </div>
      </div>
      {author.html && <div className="page-content mb-8" dangerouslySetInnerHTML={{ __html: author.html }} />}
      {authorPubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-4">Publications</h2>
          <ul className="space-y-2">
            {authorPubs.map((p) => (
              <li key={p.slug}><a href={`/publications/${p.slug}`} className="text-blue hover:underline">{p.title}</a></li>
            ))}
          </ul>
        </div>
      )}
      {authorTalks.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4">Talks</h2>
          <ul className="space-y-2">
            {authorTalks.map((t) => (
              <li key={t.slug}><a href={`/talks/${t.slug}`} className="text-blue hover:underline">{t.title}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
