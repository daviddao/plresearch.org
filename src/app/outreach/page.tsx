import Link from 'next/link'
import { outreach, sections } from '@/lib/content'

export const metadata = { title: 'Outreach' }

export default function OutreachPage() {
  const section = sections.outreach

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <h1 className="text-lg font-semibold mb-4">{section?.title || 'Outreach'}</h1>
      {section?.html && <div className="page-content mb-8" dangerouslySetInnerHTML={{ __html: section.html }} />}
      <div className="divide-y divide-gray-200">
        {outreach.map((item) => (
          <div key={item.slug} className="py-4">
            <Link href={`/outreach/${item.slug}`} className="text-black hover:text-blue font-medium">
              {item.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
