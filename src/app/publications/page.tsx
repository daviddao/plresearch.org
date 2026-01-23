import Link from 'next/link'
import { publications, authors } from '@/lib/content'

function resolveAuthorName(slug: string): string {
  const author = authors.find((a) => a.slug === slug)
  if (author) return author.name
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const metadata = { title: 'Publications' }

export default function PublicationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-8">
      <h1 className="text-lg font-semibold mb-8">Publications</h1>
      <div className="divide-y divide-gray-200">
        {publications.map((pub) => (
          <div key={pub.slug} className="py-4">
            <Link href={`/publications/${pub.slug}`} className="text-black hover:text-blue font-medium">
              {pub.title}
            </Link>
            <div className="text-sm text-gray-500 mt-1">
              {pub.authors?.map(resolveAuthorName).join(', ')}
              {pub.venue && <> &middot; {pub.venue}</>}
              {pub.date && <> &middot; {new Date(pub.date).getFullYear()}</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
