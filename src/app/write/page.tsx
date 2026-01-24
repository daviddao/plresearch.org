'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/atproto'
import MarkdownEditor from '@/components/MarkdownEditor'
import type { PostType } from '@/lib/lexicons'

export default function WritePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<PostType>('blog')
  const [venue, setVenue] = useState('')
  const [authors, setAuthors] = useState('')
  const [doi, setDoi] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || undefined,
          postType,
          venue: venue.trim() || undefined,
          authors: authors.trim() ? authors.split(',').map(a => a.trim()) : undefined,
          doi: doi.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      router.push('/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <div className="pt-12 pb-10">
          <h1 className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight">
            Write
          </h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <div className="pt-12 pb-10">
          <h1 className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4">
            Write
          </h1>
          <p className="text-gray-600">
            Please <a href="/admin" className="text-blue hover:underline">sign in</a> to create posts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
      <div className="pt-12 pb-10">
        <h1 className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4">
          New Entry
        </h1>
        <p className="text-gray-600">
          Create a new blog post, publication, talk, or tutorial.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Post Type */}
        <div>
          <label className="block text-sm text-gray-500 uppercase tracking-wide mb-3">Type</label>
          <div className="flex gap-4">
            {(['blog', 'publication', 'talk', 'tutorial'] as PostType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPostType(type)}
                className={`text-sm py-1 px-3 border transition-colors ${
                  postType === type
                    ? 'border-blue text-blue'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-500 uppercase tracking-wide mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-lg bg-transparent transition-colors"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm text-gray-500 uppercase tracking-wide mb-2">Summary</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description (optional)"
            className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
          />
        </div>

        {/* Venue (for publications/talks) */}
        {(postType === 'publication' || postType === 'talk') && (
          <div>
            <label className="block text-sm text-gray-500 uppercase tracking-wide mb-2">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Conference or journal name"
              className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
            />
          </div>
        )}

        {/* Authors (for publications/talks) */}
        {(postType === 'publication' || postType === 'talk') && (
          <div>
            <label className="block text-sm text-gray-500 uppercase tracking-wide mb-2">Authors</label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Comma-separated names"
              className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
            />
          </div>
        )}

        {/* DOI (for publications) */}
        {postType === 'publication' && (
          <div>
            <label className="block text-sm text-gray-500 uppercase tracking-wide mb-2">DOI</label>
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              placeholder="10.xxxx/xxxxx (optional)"
              className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
            />
          </div>
        )}

        {/* Content */}
        <div>
          <label className="block text-sm text-gray-500 uppercase tracking-wide mb-2">Content</label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your content in Markdown..."
            minRows={15}
            disabled={isSubmitting}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-pink">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="text-sm text-blue hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : 'Publish →'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-black transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
