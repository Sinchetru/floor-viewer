'use server'

import payload from '@/lib/db'
import { headers as getHeader, cookies } from 'next/headers'

export const register = async ({
  email,
  password_1,
  password_2,
}: {
  email: string
  password_1: string
  password_2: string
}) => {}

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
