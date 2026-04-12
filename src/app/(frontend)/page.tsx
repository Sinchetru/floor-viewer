import { headers } from 'next/headers'
import payload from '@/lib/db'
import LoginForm from '@/components/LoginForm'
import PortalView from '@/components/PortalView'

export default async function HomePage() {
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <div className="min-h-screen bg-muted">
      {user ? (
        <PortalView user={user} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <LoginForm />
        </div>
      )}
    </div>
  )
}
