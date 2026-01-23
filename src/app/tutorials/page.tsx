import Link from 'next/link'
import { tutorials } from '@/lib/content'

export const metadata = { title: 'Tutorials' }

export default function TutorialsPage() {
  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <h1 className="text-lg font-semibold mb-8">Tutorials</h1>
      <div className="divide-y divide-gray-200">
        {tutorials.map((t) => (
          <div key={t.slug} className="py-4">
            <Link href={`/tutorials/${t.slug}`} className="text-black hover:text-blue font-medium">
              {t.title || t.slug}
            </Link>
            {t.summary && <p className="text-sm text-gray-500 mt-1">{t.summary}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
