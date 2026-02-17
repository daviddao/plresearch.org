'use client'

import Link from 'next/link'
import type { NavItem as NavItemType } from '@/lib/site-config'

type Props = {
  item: NavItemType
  pathname: string
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function NavItem({ item, pathname, isActive, onMouseEnter, onMouseLeave }: Props) {
  const isCurrentPath = item.url !== '#' && pathname.startsWith(item.url)
  const hasChildren = item.children && item.children.length > 0
  const isDropdownOnly = item.url === '#'

  const triggerClass = `flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
    isCurrentPath
      ? 'text-black bg-gray-100'
      : 'text-gray-600 hover:text-black hover:bg-gray-50'
  }`

  const chevron = hasChildren && (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isDropdownOnly ? (
        <button className={triggerClass}>
          {item.name}
          {chevron}
        </button>
      ) : (
        <Link href={item.url} className={triggerClass}>
          {item.name}
          {chevron}
        </Link>
      )}

      {/* Dropdown Menu */}
      {hasChildren && isActive && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
            {item.children!.map((child) => (
              <Link
                key={child.url}
                href={child.url}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  pathname.startsWith(child.url)
                    ? 'text-violet bg-violet/5 font-medium'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
