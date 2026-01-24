import { NextResponse } from 'next/server'
import { getFeedPosts } from '@/lib/atproto-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/feed - Get all posts from curated accounts
 */
export async function GET() {
  try {
    const posts = await getFeedPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch feed:', error)
    return NextResponse.json({ posts: [] })
  }
}
