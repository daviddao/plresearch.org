'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Fuse from 'fuse.js'

type SearchItem = {
  title: string
  summary: string
  date: string
  type: string
  relpermalink: string
}

function useSearch() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [searchError, setSearchError] = useState(false)
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
      setSearchError(true)
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

  return { searchOpen, query, results, searchError, fuseRef, inputRef, containerRef, openSearch, closeSearch, handleSearch }
}

function SearchResults({ results, searchError, query, fuseLoaded, onSelect }: {
  results: SearchItem[]
  searchError: boolean
  query: string
  fuseLoaded: boolean
  onSelect: () => void
}) {
  if (results.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
        {results.map((item) => (
          <Link
            key={item.relpermalink}
            href={item.relpermalink}
            onClick={onSelect}
            className="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-black leading-snug">{item.title}</div>
            <div className="text-xs text-gray-400 mt-1">
              {item.type}{item.date && ` · ${new Date(item.date).getFullYear()}`}
            </div>
          </Link>
        ))}
      </div>
    )
  }

  if (query.length >= 2 && searchError) {
    return <p className="text-sm text-gray-400 mt-2 px-2">Search unavailable.</p>
  }

  if (query.length >= 2 && results.length === 0 && fuseLoaded) {
    return <p className="text-sm text-gray-400 mt-2 px-2">No results found.</p>
  }

  return null
}

export default function SearchBar({ variant }: { variant: 'desktop' | 'mobile' }) {
  const pathname = usePathname()
  const { searchOpen, query, results, searchError, fuseRef, inputRef, containerRef, openSearch, closeSearch, handleSearch } = useSearch()

  // Close on navigation
  useEffect(() => { closeSearch() }, [pathname])

  // Keyboard shortcuts
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

  // Click outside to close (desktop)
  useEffect(() => {
    if (!searchOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  if (variant === 'mobile') {
    return (
      <>
        <button
          onClick={() => searchOpen ? closeSearch() : openSearch()}
          aria-label="Search"
          className="p-2 text-gray-500 hover:text-black rounded-full"
        >
          <SearchIcon />
        </button>
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 px-6 py-3 lg:hidden">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm bg-gray-50 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-violet/20"
            />
            <div className="mt-2">
              <SearchResults results={results} searchError={searchError} query={query} fuseLoaded={!!fuseRef.current} onSelect={closeSearch} />
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop
  return (
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
          <SearchIcon />
        </button>
      )}

      {searchOpen && (
        <div className="absolute right-0 top-full mt-2 w-80">
          <SearchResults results={results} searchError={searchError} query={query} fuseLoaded={!!fuseRef.current} onSelect={closeSearch} />
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}
