import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAuthenticatedAgent } from "@/lib/agent"

export const dynamic = "force-dynamic"

// Community records around a hypercert that their author may retract
// from this site. Everything lives in the author's own PDS — this
// route just replays the delete through their restored OAuth session.
const ALLOWED_COLLECTIONS = new Set([
  "org.hypercerts.context.attachment",
  "org.simocracy.feed.post",
  "org.impactindexer.review.comment",
])

const AT_URI_RE = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/

/**
 * Delete one of the signed-in user's own community records (evidence
 * attachment or comment). The record's repo DID must match the
 * session DID — you can only delete what you wrote.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.did) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  let uri: unknown
  try {
    ;({ uri } = await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const m = typeof uri === "string" ? uri.match(AT_URI_RE) : null
  if (!m) {
    return NextResponse.json({ error: "Invalid at:// URI" }, { status: 400 })
  }
  const [, did, collection, rkey] = m

  if (did !== session.did) {
    return NextResponse.json(
      { error: "You can only delete your own records" },
      { status: 403 },
    )
  }
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    return NextResponse.json(
      { error: `Deleting ${collection} records is not supported here` },
      { status: 403 },
    )
  }

  const agent = await getAuthenticatedAgent()
  if (!agent) {
    return NextResponse.json(
      { error: "Could not restore your ATProto session — please sign in again" },
      { status: 401 },
    )
  }

  try {
    await agent.com.atproto.repo.deleteRecord({ repo: did, collection, rkey })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[hypercerts] deleteRecord failed:", err)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
