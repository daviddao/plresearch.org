'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNav } from '@/lib/site-config'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function OffCanvasNav({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  return (
    <div
      id="off-canvas-nav"
      className={`z-50 fixed top-0 left-0 right-0 bottom-0 bg-white py-4 md:py-8 overflow-y-auto max-h-screen ${isOpen ? 'open' : ''}`}
    >
      <div className="flex justify-between items-center mb-12 px-4 md:px-10">
        <Link href="/" className="flex items-center mr-auto">
          <img
            src="/images/pl_research_logo.svg"
            className="h-20 md:h-24"
            alt="Protocol Labs Research"
          />
        </Link>

        <button className="flex-shrink-0" onClick={onClose} aria-label="Close menu">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M18.3 5.71a1 1 0 00-1.42 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.42L10.59 12l-4.89 4.88a1 1 0 101.41 1.42L12 13.41l4.88 4.89a1 1 0 001.42-1.42L13.41 12l4.89-4.88a1 1 0 000-1.41z" />
          </svg>
        </button>
      </div>

      {mainNav.map((item) => (
        <div key={item.name} className="relative pt-4 mb-4">
          <Link
            href={item.url}
            className="font-light text-md relative inline-block align-middle mx-4 mb-4"
            onClick={onClose}
          >
            <span>{item.name}</span>
            {pathname === item.url && (
              <div className="absolute inset-x-0 bottom-0 border border-black" />
            )}
          </Link>

          {item.children && (
            <div className="flex flex-col items-start justify-start mb-4 pl-8 pt-4">
              {item.children.map((child) => (
                <Link
                  key={child.name}
                  href={child.url}
                  className="inline-block font-light relative mb-4 text-gray-700"
                  onClick={onClose}
                >
                  <span>{child.name}</span>
                  {pathname.startsWith(child.url) && (
                    <div className="absolute inset-x-0 bottom-0 border border-black" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
