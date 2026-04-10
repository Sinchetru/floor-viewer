'use server'

import payload from '@/lib/db'
import { headers as getHeader, cookies } from 'next/headers'

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
  if (password_1 !== password_2) {
    throw new Error('Die Passwörter stimmen nicht überein.')
  }

  await payload.create({
    collection: 'users',
    data: { email, password: password_1 },
    overrideAccess: false,
  })

  const loginResult = await payload.login({
    collection: 'users',
    data: { email, password: password_1 },
  })

  const cookieStore = await cookies()
  cookieStore.set('payload-token', loginResult.token as string, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  return loginResult.user
}

export const login = async ({ email, password }: { email: string; password: string }) => {
  const result = await payload.login({
    collection: 'users',
    data: { email, password },
  })

  const cookieStore = await cookies()

  cookieStore.set('payload-token', result.token as string, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  })

  return result.user
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
}
