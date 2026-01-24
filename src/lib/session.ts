import { env } from './env'
import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

/**
 * Session data stored in the encrypted cookie.
 */
export interface Session {
  did?: string
  handle?: string
  displayName?: string
  avatar?: string
  // OAuth session data (serialized) - stored to persist across serverless invocations
  oauthSession?: string
}

const isProduction = process.env.NODE_ENV === 'production'

const sessionOptions: SessionOptions = {
  cookieName: 'plrd_session',
  password: env.COOKIE_SECRET,
  cookieOptions: {
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

/**
 * Get the current user's session from their encrypted cookie.
 */
export async function getSession(): Promise<Session> {
  const session = await getIronSession<Session>(await cookies(), sessionOptions)
  return session
}

/**
 * Get the raw iron-session object for direct manipulation.
 */
export async function getRawSession() {
  return await getIronSession<Session>(await cookies(), sessionOptions)
}

/**
 * Set the current user's session in their encrypted cookie.
 */
export async function setSession(data: Partial<Session>): Promise<void> {
  const session = await getIronSession<Session>(await cookies(), sessionOptions)

  if (data.did !== undefined) session.did = data.did
  if (data.handle !== undefined) session.handle = data.handle
  if (data.displayName !== undefined) session.displayName = data.displayName
  if (data.avatar !== undefined) session.avatar = data.avatar
  if (data.oauthSession !== undefined) session.oauthSession = data.oauthSession
  
  await session.save()
}

/**
 * Clear the current user's session.
 */
export async function clearSession(): Promise<void> {
  const session = await getIronSession<Session>(await cookies(), sessionOptions)
  session.destroy()
}
