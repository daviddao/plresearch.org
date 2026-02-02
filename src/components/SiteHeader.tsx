'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNav, NavItem } from '@/lib/site-config'
import { useAuth } from '@/lib/atproto'
import Fuse from 'fuse.js'

type SearchItem = {
  title: string
  summary: string
  date: string
  type: string
  relpermalink: string
}

type Props = {
  onMenuClick: () => void
}

export default function SiteHeader({ onMenuClick }: Props) {
  const pathname = usePathname()
  const { isAuthenticated, session } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)
  const loadedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadSearchIndex = useCallback(async () => {
    if (loadedRef.current) return
    loadedRef.current = true
    try {
      const res = await fetch('/search-index.json')
      const data: SearchItem[] = await res.json()
      fuseRef.current = new Fuse(data, {
        shouldSort: true,
        ignoreLocation: true,
        threshold: 0.7,
        minMatchCharLength: 3,
        findAllMatches: true,
        keys: [
          { name: 'title', weight: 1 },
          { name: 'summary', weight: 0.6 },
        ],
      })
    } catch {
      // Search index not available
    }
  }, [])

  function openSearch() {
    setSearchOpen(true)
    loadSearchIndex()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
    setResults([])
  }

  function handleSearch(term: string) {
    setQuery(term)
    if (term.length < 2 || !fuseRef.current) {
      setResults([])
      return
    }
    const hits = fuseRef.current.search(term).slice(0, 6)
    setResults(hits.map((h) => h.item))
  }

  function handleDropdownEnter(name: string) {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(name)
  }

  function handleDropdownLeave() {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeSearch()
        setActiveDropdown(null)
      }
      if (e.key === '/' && !searchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchOpen])

  // Close dropdowns and search on navigation
  useEffect(() => {
    closeSearch()
    setActiveDropdown(null)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/images/pl_logo_mark.svg" className="h-8 transition-transform group-hover:scale-105" alt="" />
            <span className="font-semibold text-black">
              Protocol Labs <span className="font-normal text-gray-500">R&D</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNav.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                pathname={pathname}
                isActive={activeDropdown === item.name}
                onMouseEnter={() => item.children ? handleDropdownEnter(item.name) : setActiveDropdown(null)}
                onMouseLeave={handleDropdownLeave}
              />
            ))}
          </div>

          {/* Right side: Search + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <div ref={containerRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-56 text-sm bg-gray-50 rounded-full px-4 py-2 pr-8 outline-none focus:ring-2 focus:ring-violet/20 transition-all"
                  />
                  <button
                    onClick={closeSearch}
                    className="absolute right-3 text-gray-400 hover:text-black"
                    aria-label="Close search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openSearch}
                  aria-label="Search"
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                  title="Press / to search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              )}

              {/* Search Results Dropdown */}
              {searchOpen && results.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                  {results.map((item) => (
                    <Link
                      key={item.relpermalink}
                      href={item.relpermalink}
                      onClick={closeSearch}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-black leading-snug">{item.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.type}{item.date && ` · ${new Date(item.date).getFullYear()}`}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchOpen && query.length >= 2 && results.length === 0 && fuseRef.current && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3">
                  <p className="text-sm text-gray-400">No results found.</p>
                </div>
              )}
            </div>

            {/* Auth Profile or CTA */}
            {isAuthenticated && session ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                {session.avatar ? (
                  <img
                    src={session.avatar}
                    alt={session.handle}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center text-xs font-medium">
                    {(session.displayName || session.handle).charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/outreach/collaboration/"
                className="bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Collaborate
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => searchOpen ? closeSearch() : openSearch()}
              aria-label="Search"
              className="p-2 text-gray-500 hover:text-black rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button
              onClick={onMenuClick}
              aria-label="Menu"
              className="p-2 text-gray-500 hover:text-black rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
            className="w-full text-sm bg-gray-50 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-violet/20"
          />
          {results.length > 0 && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
              {results.map((item) => (
                <Link
                  key={item.relpermalink}
                  href={item.relpermalink}
                  onClick={closeSearch}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium text-black leading-snug">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item.type}{item.date && ` · ${new Date(item.date).getFullYear()}`}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && fuseRef.current && (
            <p className="text-sm text-gray-400 mt-2 px-2">No results found.</p>
          )}
        </div>
      )}
    </header>
  )
}

type NavItemProps = {
  item: NavItem
  pathname: string
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function NavItemComponent({ item, pathname, isActive, onMouseEnter, onMouseLeave }: NavItemProps) {
  const isCurrentPath = pathname.startsWith(item.url)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={item.url}
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isCurrentPath
            ? 'text-black bg-gray-100'
            : 'text-gray-600 hover:text-black hover:bg-gray-50'
        }`}
      >
        {item.name}
        {hasChildren && (
          <svg
            className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Link>

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
