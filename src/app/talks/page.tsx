import Link from 'next/link'
import { talks } from '@/lib/content'

export const metadata = { title: 'Talks' }

export default function TalksPage() {
  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <h1 className="text-lg font-semibold mb-8">Talks</h1>
      <div className="divide-y divide-gray-200">
        {talks.map((talk) => (
          <div key={talk.slug} className="py-4">
            <Link href={`/talks/${talk.slug}`} className="text-black hover:text-blue font-medium">
              {talk.title}
            </Link>
            <div className="text-sm text-gray-500 mt-1">
              {talk.venue}
              {talk.date && <> &middot; {new Date(talk.date).getFullYear()}</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
