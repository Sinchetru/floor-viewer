'use server'

import payload from '@/lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type AuthState = {
  error?: string
}

// Register, Login, Logout functions for the user authentication system
// using Payload CMS and Next.js server actions.
export const register = async ({
  email,
  password_1,
  password_2,
}: {
  email: string
  password_1: string
  password_2: string
}) => {
  const normalizedEmail = email.trim()

  if (!normalizedEmail || !password_1 || !password_2) {
    throw new Error('Bitte füllen Sie alle Felder aus.')
  }

  if (password_1 !== password_2) {
    throw new Error('Die Passwörter stimmen nicht überein.')
  }

  await payload.create({
    collection: 'users',
    data: { email: normalizedEmail, password: password_1, role: 'user' },
    overrideAccess: false,
    draft: false,
  })

  const loginResult = await payload.login({
    collection: 'users',
    data: { email: normalizedEmail, password: password_1 },
  })

  const cookieStore = await cookies()
  cookieStore.set('payload-token', loginResult.token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return loginResult.user
}

export const login = async ({ email, password }: { email: string; password: string }) => {
  const normalizedEmail = email.trim()

  if (!normalizedEmail || !password) {
    throw new Error('E-Mail und Passwort sind erforderlich.')
  }

  const result = await payload.login({
    collection: 'users',
    data: { email: normalizedEmail, password },
  })

  const cookieStore = await cookies()
  cookieStore.set('payload-token', result.token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return result.user
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/')
}
