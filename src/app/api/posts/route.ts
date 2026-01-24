import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedAgent } from '@/lib/agent'
import { getSession } from '@/lib/session'
import { POST_COLLECTION } from '@/lib/lexicons'
import { generateTid } from '@/lib/tid'
import type { PostRecord } from '@/lib/lexicons'

export const dynamic = 'force-dynamic'

/**
 * POST /api/posts - Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.did) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agent = await getAuthenticatedAgent()
    if (!agent) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, summary, postType, venue, authors, doi } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const validTypes = ['blog', 'publication', 'talk', 'tutorial']
    if (!postType || !validTypes.includes(postType)) {
      return NextResponse.json({ error: 'Valid post type is required' }, { status: 400 })
    }

    const rkey = generateTid()
    const record: PostRecord = {
      $type: POST_COLLECTION,
      title: title.trim(),
      content: content.trim(),
      summary: summary?.trim() || undefined,
      postType,
      venue: venue?.trim() || undefined,
      authors: Array.isArray(authors) ? authors.filter((a: string) => a.trim()) : undefined,
      doi: doi?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    const result = await agent.com.atproto.repo.createRecord({
      repo: session.did,
      collection: POST_COLLECTION,
      rkey,
      record,
    })

    return NextResponse.json({
      uri: result.data.uri,
      cid: result.data.cid,
    })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
