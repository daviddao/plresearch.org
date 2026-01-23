import Link from 'next/link'
import { authors } from '@/lib/content'

export const metadata = { title: 'Team' }

export default function AuthorsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
      {/* Hero */}
      <div className="relative pt-12 pb-10 mb-10 overflow-hidden">
        <PageGeo />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          Team
        </h1>
        <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl">
          A fully remote team distributed across the globe, working on the frontiers of computing and knowledge systems.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
        {authors.map((author) => (
          <Link key={author.slug} href={`/authors/${author.slug}`} className="text-center group">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <AuthorGeo />
              {author.avatarPath ? (
                <img
                  src={author.avatarPath}
                  alt={author.name}
                  className="absolute inset-3 w-[104px] h-[104px] rounded-full object-cover z-10"
                />
              ) : (
                <div className="absolute inset-3 w-[104px] h-[104px] rounded-full bg-gray-200 z-10" />
              )}
            </div>
            <div className="text-sm font-medium text-black group-hover:text-blue transition-colors">{author.name}</div>
            <div className="text-xs text-gray-500">{author.role}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AuthorGeo() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 rotate-0 group-hover:rotate-[20deg] transition-all duration-500 ease-out pointer-events-none select-none"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="56" stroke="#C3E1FF" strokeWidth="0.75" strokeDasharray="4 3" />
      <circle cx="60" cy="60" r="46" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="36" stroke="#C3E1FF" strokeWidth="0.5" strokeDasharray="2 4" />
      <circle cx="60" cy="4" r="2" fill="#C3E1FF" />
      <circle cx="60" cy="116" r="2" fill="#C3E1FF" />
      <circle cx="4" cy="60" r="2" fill="#C3E1FF" />
      <circle cx="116" cy="60" r="2" fill="#C3E1FF" />
      <circle cx="18" cy="18" r="1.5" fill="#C3E1FF" />
      <circle cx="102" cy="18" r="1.5" fill="#C3E1FF" />
      <circle cx="18" cy="102" r="1.5" fill="#C3E1FF" />
      <circle cx="102" cy="102" r="1.5" fill="#C3E1FF" />
      <line x1="60" y1="4" x2="60" y2="24" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="60" y1="96" x2="60" y2="116" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="4" y1="60" x2="24" y2="60" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="96" y1="60" x2="116" y2="60" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="18" y1="18" x2="30" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="102" y1="18" x2="90" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="18" y1="102" x2="30" y2="90" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="102" y1="102" x2="90" y2="90" stroke="#C3E1FF" strokeWidth="0.5" />
    </svg>
  )
}

function PageGeo() {
  // Scattered nodes with connections suggesting a distributed team
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="450" cy="120" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="580" cy="160" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="520" cy="260" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="400" cy="300" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="600" cy="330" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="470" cy="400" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="560" cy="430" r="8" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="450" y1="128" x2="520" y2="252" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="168" x2="520" y2="252" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="520" y1="268" x2="400" y2="292" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="520" y1="268" x2="600" y2="322" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="400" y1="308" x2="470" y2="392" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="600" y1="338" x2="560" y2="422" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="470" y1="408" x2="560" y2="430" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="450" y1="120" x2="580" y2="160" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="450" cy="120" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="160" r="3" fill="#C3E1FF" />
      <circle cx="520" cy="260" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="300" r="3" fill="#C3E1FF" />
      <circle cx="600" cy="330" r="3" fill="#C3E1FF" />
      <circle cx="470" cy="400" r="3" fill="#C3E1FF" />
      <circle cx="560" cy="430" r="3" fill="#C3E1FF" />
    </svg>
  )
}
