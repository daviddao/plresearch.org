import { Agent } from '@atproto/api'
import { getGlobalOAuthClient } from './auth/client'
import { getSession } from './session'

/**
 * Get an authenticated ATProto agent for the current user.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedAgent(): Promise<Agent | null> {
  const session = await getSession()
  if (!session.did) {
    return null
  }

  try {
    const client = await getGlobalOAuthClient()
    const oauthSession = await client.restore(session.did)

    if (!oauthSession) {
      return null
    }

    return new Agent(oauthSession)
  } catch (err) {
    console.error('Failed to restore authenticated agent:', err)
    return null
  }
}
