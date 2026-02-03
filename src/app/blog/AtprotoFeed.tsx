'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/atproto'
import type { PostEntry } from '@/lib/lexicons'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AtprotoFeed() {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<PostEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/feed')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch {
        // ATProto feed unavailable — silent fallback
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Don't render anything if ATProto has no posts and isn't loading
  if (!isLoading && posts.length === 0 && !isAuthenticated) return null

  return (
    <div className="mt-10">
      {isAuthenticated && (
        <Link href="/write" className="inline-block mb-6 text-sm text-blue hover:underline">
          New entry →
        </Link>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading feed...</p>
      ) : posts.length > 0 ? (
        <>
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Community Feed</h2>
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.uri} className="py-4">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {post.record.postType}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(post.record.createdAt)}
                  </span>
                </div>
                <h3 className="text-black font-medium leading-snug mb-1">
                  {post.record.title}
                </h3>
                {post.record.summary && (
                  <p className="text-sm text-gray-600 mb-1">{post.record.summary}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {post.author.avatar && (
                    <img src={post.author.avatar} alt="" className="w-5 h-5 rounded-full" />
                  )}
                  <span className="text-xs text-gray-400">
                    {post.author.displayName || post.author.handle}
                  </span>
                  {post.record.venue && (
                    <span className="text-xs text-gray-400">· {post.record.venue}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
