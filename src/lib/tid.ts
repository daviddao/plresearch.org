import { TID } from '@atproto/common-web'

/**
 * Generate a TID (Timestamp ID) for ATProto record keys.
 * TIDs are lexicographically sortable and unique.
 */
export function generateTid(): string {
  return TID.nextStr()
}
