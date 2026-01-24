import Link from 'next/link'
import { footerNav } from '@/lib/site-config'

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Nav */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {footerNav.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              className="text-gray-600 hover:text-black"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-400">
          <p>
            © Protocol Labs | Content licensed{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" className="hover:text-gray-600">CC-BY 4.0</a>
          </p>
          <div className="flex gap-6">
            <a href="/feed.xml" className="hover:text-gray-600">RSS</a>
            <a href="https://github.com/protocol/research" className="hover:text-gray-600">GitHub</a>
            <a href="https://twitter.com/ProtoResearch" className="hover:text-gray-600">Twitter</a>
            <a href="https://bsky.app/profile/protoresearch.bsky.social" className="hover:text-gray-600">Bluesky</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
