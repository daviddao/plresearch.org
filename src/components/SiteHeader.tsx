'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNav } from '@/lib/site-config'

type Props = {
  onMenuClick: () => void
  onSearchClick: () => void
}

export default function SiteHeader({ onMenuClick, onSearchClick }: Props) {
  const pathname = usePathname()

  return (
    <nav className="w-full top-0 z-30 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
        <Link href="/" className="mr-auto flex items-center gap-2.5">
          <img src="/images/pl_logo_mark.svg" className="h-8" alt="" />
          <span className="text-sm tracking-tight">
            Protocol Labs <span className="text-gray-400">R&D</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {mainNav.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              className={
                pathname.startsWith(item.url)
                  ? 'text-black'
                  : 'text-gray-500 hover:text-black'
              }
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={onSearchClick}
            aria-label="Search"
            className="text-gray-400 hover:text-black ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={onSearchClick}
            aria-label="Search"
            className="text-gray-400 hover:text-black"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          <button
            onClick={onMenuClick}
            aria-label="Menu"
            className="text-gray-400 hover:text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
