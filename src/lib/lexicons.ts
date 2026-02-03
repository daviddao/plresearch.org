/**
 * ATProto Lexicon Collection NSIDs for Protocol Labs R&D
 */

// Post collection - markdown articles (blog posts, publications, talks, tutorials)
export const POST_COLLECTION = 'org.plresearch.post'

// Curated list collection - admin-managed list of users whose posts to display
export const CURATEDLIST_COLLECTION = 'org.plresearch.curatedlist'

// Admin DID - the only user who can manage the curated list
// Uses NEXT_PUBLIC_ prefix so it's available in both server and client code
export const ADMIN_DID = process.env.NEXT_PUBLIC_ADMIN_DID || 'did:plc:qc42fmqqlsmdq7jiypiiigww'

// Post types
export type PostType = 'blog' | 'publication' | 'talk' | 'tutorial'

// Post record stored on ATProto
export type PostRecord = {
  $type: string
  title: string
  content: string
  summary?: string
  postType: PostType
  venue?: string
  authors?: string[]
  doi?: string
  createdAt: string
}

// Curated list entry
export type CuratedListEntry = {
  did: string
  handle: string
  addedAt: string
}

// Curated list record stored on ATProto
export type CuratedListRecord = {
  $type: string
  users: CuratedListEntry[]
  createdAt: string
  updatedAt: string
}

// Post with metadata for display
export type PostEntry = {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
  record: PostRecord
}
