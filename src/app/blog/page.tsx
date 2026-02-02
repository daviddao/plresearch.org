'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/atproto'
import type { PostEntry } from '@/lib/lexicons'
import Breadcrumb from '@/components/Breadcrumb'

export default function BlogPage() {
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
        // Ignore
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Blog' }]} />
      {/* Hero */}
      <div className="relative pt-6 pb-10 mb-10 overflow-hidden">
        <PageGeo />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          Blog
        </h1>
        <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl">
          Updates, insights, and reflections from the Protocol Labs R&D team.
        </p>
        {isAuthenticated && (
          <Link href="/write" className="relative z-10 inline-block mt-4 text-sm text-blue hover:underline">
            New entry →
          </Link>
        )}
      </div>

      {/* Posts */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts yet.</p>
      ) : (
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
      )}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PageGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <path d="M 380 120 Q 480 100 580 130 Q 640 150 680 140" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 360 200 Q 460 180 560 210 Q 640 230 700 215" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 390 280 Q 490 260 590 290 Q 650 305 700 295" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 370 360 Q 470 340 570 370 Q 640 385 690 375" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 400 440 Q 500 420 580 445" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="380" cy="120" r="3" fill="#C3E1FF" />
      <circle cx="360" cy="200" r="3" fill="#C3E1FF" />
      <circle cx="390" cy="280" r="3" fill="#C3E1FF" />
      <circle cx="370" cy="360" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="440" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="130" r="2" fill="#C3E1FF" />
      <circle cx="560" cy="210" r="2" fill="#C3E1FF" />
      <circle cx="590" cy="290" r="2" fill="#C3E1FF" />
    </svg>
  )
}
