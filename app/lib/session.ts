import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(role: 'BUYER' | 'SELLER') {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`)
  }
  return user
}
