import Link from 'next/link'
import { authors } from '@/lib/content'

export const metadata = { title: 'Team' }

export default function AuthorsPage() {
  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <h1 className="text-lg font-semibold mb-8">Team</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {authors.map((author) => (
          <Link key={author.slug} href={`/authors/${author.slug}`} className="text-center group">
            {author.avatarPath ? (
              <img src={author.avatarPath} alt={author.name} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-gray-200" />
            )}
            <div className="text-sm font-medium group-hover:text-blue">{author.name}</div>
            <div className="text-xs text-gray-500">{author.role}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
