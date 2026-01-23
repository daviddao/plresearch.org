import { sections } from '@/lib/content'

export const metadata = { title: 'Research' }

export default function ResearchPage() {
  const section = sections.research

  return (
    <div className="max-w-[1146px] mx-auto pt-8 px-4 md:px-10">
      <div className="md:w-2/3">
        <h1 className="text-lg font-semibold mb-4">{section?.title || 'Research'}</h1>
        {section?.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: section.html }} />}
      </div>
    </div>
  )
}
