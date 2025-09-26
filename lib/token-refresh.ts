import { getSession, signOut } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/"

export async function refreshTokenManually(): Promise<{ access: string; refresh: string } | null> {
  try {
    const session = await getSession()
    if (!session?.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_BASE_URL}auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: session.refreshToken
      })
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    return {
      access: data.access,
      refresh: data.refresh
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    // Sign out user on refresh failure
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/login' })
    }
    return null
  }
}