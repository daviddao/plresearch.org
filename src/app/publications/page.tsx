import Link from 'next/link'
import { publications } from '@/lib/content'

export const metadata = { title: 'Publications' }

export default function PublicationsPage() {
  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <h1 className="text-lg font-semibold mb-8">Publications</h1>
      <div className="divide-y divide-gray-200">
        {publications.map((pub) => (
          <div key={pub.slug} className="py-4">
            <Link href={`/publications/${pub.slug}`} className="text-black hover:text-blue font-medium">
              {pub.title}
            </Link>
            <div className="text-sm text-gray-500 mt-1">
              {pub.authors?.join(', ')}
              {pub.venue && <> &middot; {pub.venue}</>}
              {pub.date && <> &middot; {new Date(pub.date).getFullYear()}</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
