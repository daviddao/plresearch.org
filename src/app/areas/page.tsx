import Link from 'next/link'
import { areas } from '@/lib/content'

export const metadata = { title: 'Focus Areas' }

export default function AreasPage() {
  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <h1 className="text-lg font-semibold mb-8">Focus Areas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map((area) => (
          <Link key={area.slug} href={`/areas/${area.slug}`} className="p-6 border border-gray-200 rounded hover:border-blue transition-colors">
            <h2 className="font-medium mb-2">{area.title}</h2>
            {area.summary && <p className="text-sm text-gray-600">{area.summary}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
