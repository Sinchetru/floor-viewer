//Homepage with login logout
import { headers } from 'next/headers'
import payload from '@/lib/db'
import LoginForm from '@/components/LoginForm'
import HelloUser from '@/components/HelloUser'

export default async function HomePage() {
  // ✅ Payload reads the payload-token cookie from the request headers automatically
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      {/* The frame — always visible, content swaps inside */}
      {user ? <HelloUser user={user} /> : <LoginForm />}
    </div>
  )
}
