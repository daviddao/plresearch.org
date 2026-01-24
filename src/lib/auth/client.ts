import { NodeOAuthClient } from '@atproto/oauth-client-node'
import { JoseKey } from '@atproto/jwk-jose'
import { env, PORT } from '../env'
import { getRawSession } from '../session'

const oauthClientKey = 'globalOAuthClient'
if (!(global as any)[oauthClientKey]) {
  (global as any)[oauthClientKey] = null
}

// ============================================================================
// In-Memory Store with Cookie Sync
// ============================================================================

const globalStoreKey = 'oauthSharedStore'
if (!(global as any)[globalStoreKey]) {
  (global as any)[globalStoreKey] = new Map()
}
const sharedStore: Map<string, any> = (global as any)[globalStoreKey]

// State store - in-memory only, used during short-lived OAuth flow
const stateStore = {
  async get(key: string) {
    return sharedStore.get(`state:${key}`)
  },
  async set(key: string, value: any) {
    sharedStore.set(`state:${key}`, value)
  },
  async del(key: string) {
    sharedStore.delete(`state:${key}`)
  }
}

// Session store - syncs with cookie for persistence
const sessionStore = {
  async get(key: string) {
    const memValue = sharedStore.get(`session:${key}`)
    if (memValue) {
      return memValue
    }
    
    try {
      const session = await getRawSession()
      if (session.oauthSession && session.did === key) {
        const parsed = JSON.parse(session.oauthSession)
        sharedStore.set(`session:${key}`, parsed)
        return parsed
      }
    } catch (err) {
      console.warn('Failed to restore OAuth session from cookie:', err)
    }
    
    return undefined
  },
  async set(key: string, value: any) {
    sharedStore.set(`session:${key}`, value)
    
    try {
      const session = await getRawSession()
      session.oauthSession = JSON.stringify(value)
      await session.save()
    } catch (err) {
      console.warn('Failed to save OAuth session to cookie:', err)
    }
  },
  async del(key: string) {
    sharedStore.delete(`session:${key}`)
    
    try {
      const session = await getRawSession()
      session.oauthSession = undefined
      await session.save()
    } catch (err) {
      console.warn('Failed to clear OAuth session from cookie:', err)
    }
  }
}

// ============================================================================
// JWK Keyset Management
// ============================================================================

let cachedKeyset: Awaited<ReturnType<typeof JoseKey.fromImportable>>[] | null = null

async function getKeyset() {
  if (cachedKeyset) {
    return cachedKeyset
  }

  const jwkPrivate = env.ATPROTO_JWK_PRIVATE
  if (!jwkPrivate) {
    return null // Public client mode
  }

  try {
    const jwk = JSON.parse(jwkPrivate)
    const key = await JoseKey.fromImportable(jwk, jwk.kid || 'key-1')
    cachedKeyset = [key]
    return cachedKeyset
  } catch (err) {
    console.error('Failed to parse ATPROTO_JWK_PRIVATE:', err)
    return null
  }
}

// ============================================================================
// OAuth Client Factory
// ============================================================================

export const createClient = async () => {
  const publicUrl = env.PUBLIC_URL
  // Must use 127.0.0.1 per RFC 8252 for ATProto OAuth localhost development
  const url = publicUrl || `http://127.0.0.1:${PORT}`
  const enc = encodeURIComponent

  let keyset = null
  try {
    keyset = await getKeyset()
  } catch (err) {
    console.error('Error getting keyset:', err)
  }
  
  const isConfidentialClient = keyset !== null && !!publicUrl

  // Build client metadata based on client type
  const clientMetadata: any = {
    client_name: 'Protocol Labs R&D',
    client_uri: url,
    dpop_bound_access_tokens: true,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: 'atproto transition:generic',
    application_type: 'web',
  }

  if (isConfidentialClient) {
    // Confidential client configuration (requires BOTH publicUrl AND keyset)
    clientMetadata.client_id = `${publicUrl}/api/oauth/client-metadata.json`
    clientMetadata.redirect_uris = [`${publicUrl}/api/oauth/callback`]
    clientMetadata.token_endpoint_auth_method = 'private_key_jwt'
    clientMetadata.token_endpoint_auth_signing_alg = 'ES256'
    clientMetadata.jwks_uri = `${publicUrl}/api/oauth/jwks.json`
  } else {
    // Public client configuration (localhost-style client_id)
    // This must match what client-metadata.json returns for consistency
    clientMetadata.client_id = `http://localhost?redirect_uri=${enc(`${url}/api/oauth/callback`)}&scope=${enc('atproto transition:generic')}`
    clientMetadata.redirect_uris = [`${url}/api/oauth/callback`]
    clientMetadata.token_endpoint_auth_method = 'none'
  }

  const clientConfig: any = {
    clientMetadata,
    stateStore,
    sessionStore,
  }

  if (keyset) {
    clientConfig.keyset = keyset
  }

  return new NodeOAuthClient(clientConfig)
}

export const getGlobalOAuthClient = async () => {
  const currentClient = (global as any)[oauthClientKey]
  if (!currentClient) {
    try {
      const newClient = await createClient()
      ;(global as any)[oauthClientKey] = newClient
      return newClient
    } catch (err) {
      console.error('Failed to create OAuth client:', err)
      throw err
    }
  }
  return currentClient
}

/**
 * Get the JWKS (public keys) for the confidential client.
 */
export async function getJwks(): Promise<{ keys: any[] } | null> {
  const client = await getGlobalOAuthClient()
  
  if ('jwks' in client && client.jwks) {
    return client.jwks as { keys: any[] }
  }
  
  return null
}
