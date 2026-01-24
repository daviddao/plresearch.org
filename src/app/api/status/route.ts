import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json(session)
  } catch (error) {
    console.error('Failed to get session:', error)
    return NextResponse.json({}, { status: 500 })
  }
}
