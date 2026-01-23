import Link from 'next/link'
import { authors } from '@/lib/content'

function slugToName(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function AuthorCard({ slug }: { slug: string }) {
  const author = authors.find((a) => a.slug === slug)
  const name = author?.name || slugToName(slug)
  const role = author?.role || ''
  const avatar = author?.avatarPath || null

  return (
    <Link href={`/authors/${slug}`} className="inline-flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-gray-200 hover:border-blue/40 transition-colors no-underline group">
      {avatar ? (
        <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover shrink-0" />
      ) : (
        <span className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
      )}
      <span className="flex flex-col leading-none gap-0.5">
        <span className="text-sm font-medium text-black group-hover:text-blue">{name}</span>
        {role && <span className="text-[11px] text-gray-500">{role}</span>}
      </span>
    </Link>
  )
}
