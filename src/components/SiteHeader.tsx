'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNav } from '@/lib/site-config'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)
  const loadedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSearch()
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

  // Close search on navigation
  useEffect(() => {
    closeSearch()
  }, [pathname])

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

          {/* Inline search */}
          <div ref={containerRef} className="relative ml-2">
            {searchOpen ? (
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-48 text-sm bg-transparent border-b border-gray-300 focus:border-black outline-none py-1 pr-6 transition-colors"
                />
                <button
                  onClick={closeSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  aria-label="Close search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={openSearch}
                aria-label="Search"
                className="text-gray-400 hover:text-black transition-colors"
                title="Press / to search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            )}

            {/* Results dropdown */}
            {searchOpen && results.length > 0 && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
                {results.map((item) => (
                  <Link
                    key={item.relpermalink}
                    href={item.relpermalink}
                    onClick={closeSearch}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-black leading-snug mb-0.5">{item.title}</div>
                    <div className="text-[11px] text-gray-400">
                      {item.type}{item.date && ` · ${new Date(item.date).getFullYear()}`}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {searchOpen && query.length >= 2 && results.length === 0 && fuseRef.current && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-200 rounded shadow-lg px-4 py-3">
                <p className="text-sm text-gray-400">No results found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => searchOpen ? closeSearch() : openSearch()}
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

      {/* Mobile search bar */}
      {searchOpen && (
        <div ref={!containerRef.current ? containerRef : undefined} className="md:hidden border-t border-gray-100 px-6 py-3 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
            className="w-full text-sm bg-transparent border-b border-gray-300 focus:border-black outline-none py-1 transition-colors"
          />
          {results.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded shadow-lg overflow-hidden bg-white">
              {results.map((item) => (
                <Link
                  key={item.relpermalink}
                  href={item.relpermalink}
                  onClick={closeSearch}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm font-medium text-black leading-snug mb-0.5">{item.title}</div>
                  <div className="text-[11px] text-gray-400">
                    {item.type}{item.date && ` · ${new Date(item.date).getFullYear()}`}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && fuseRef.current && (
            <p className="text-sm text-gray-400 mt-2">No results found.</p>
          )}
        </div>
      )}
    </nav>
  )
}
