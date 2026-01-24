import { NextRequest, NextResponse } from 'next/server'
import { resolveHandle, getPublicProfile } from '@/lib/atproto-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/users/[handle] - Look up a user profile by handle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params

    // Resolve handle to DID
    let did = handle
    if (!handle.startsWith('did:')) {
      const normalizedHandle = handle.includes('.') ? handle : `${handle}.bsky.social`
      const resolvedDid = await resolveHandle(normalizedHandle)
      if (!resolvedDid) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      did = resolvedDid
    }

    // Get profile
    const profile = await getPublicProfile(did)
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        did,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
      },
    })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
