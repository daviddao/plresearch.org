'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'

type SearchItem = {
  title: string
  summary: string
  date: string
  type: string
  relpermalink: string
  authors?: string[]
  tags?: string[]
  categories?: string[]
  content?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function OffCanvasSearch({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const loadedRef = useRef(false)

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
          { name: 'authors', weight: 0.4 },
          { name: 'content', weight: 0.2 },
          { name: 'tags', weight: 0.5 },
          { name: 'categories', weight: 0.5 },
        ],
      })
    } catch {
      // Search index not available yet
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadSearchIndex()
      inputRef.current?.focus()
    }
  }, [isOpen, loadSearchIndex])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSearch(term: string) {
    setQuery(term)
    if (term.length < 3 || !fuseRef.current) {
      setResults([])
      return
    }
    const hits = fuseRef.current.search(term).slice(0, 10)
    setResults(hits.map((h) => h.item))
  }

  return (
    <div
      id="off-canvas-search"
      className={`z-50 fixed top-0 left-0 right-0 bottom-0 bg-white py-4 md:py-8 overflow-y-auto max-h-screen ${isOpen ? 'open' : ''}`}
    >
      <div className="relative max-w-[1146px] mx-auto mb-12 px-4 md:px-10">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="flex items-center mr-auto">
            <img
              src="/images/pl_research_logo.svg"
              className="h-20 md:h-24"
              alt="Protocol Labs Research"
            />
          </Link>

          <button className="flex-shrink-0" onClick={onClose} aria-label="Close search">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M18.3 5.71a1 1 0 00-1.42 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.42L10.59 12l-4.89 4.88a1 1 0 101.41 1.42L12 13.41l4.88 4.89a1 1 0 001.42-1.42L13.41 12l4.89-4.88a1 1 0 000-1.41z" />
            </svg>
          </button>
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="outline-none leading-[3rem] appearance-none bg-transparent border-b-2 border-black w-full pr-12 h-12 mb-4"
          placeholder="Search"
        />

        <div className="md:w-2/3">
          {results.map((item) => (
            <div key={item.relpermalink} className="py-4">
              <p className="text-sm text-gray-700 mb-2">
                <span>{item.date}</span>
                <span className="text-blue-200 mx-1">/</span>
                <span>{item.type}</span>
              </p>
              <h2 className="text-blue text-bigger leading-tight hover:underline mb-2">
                <Link href={item.relpermalink} onClick={onClose}>
                  {item.title}
                </Link>
              </h2>
              <div className="line-clamp-3">{item.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
