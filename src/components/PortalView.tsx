'use client'

import Link from 'next/link'
import { logout } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  user: { email: string }
}

export default function PortalView({ user }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top navigation bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-background border-b">
        <span className="text-sm font-semibold">Campus Platform</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Abmelden
            </Button>
          </form>
        </div>
      </header>

      {/* Tile grid */}
      <main className="flex-1 flex items-start justify-center p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
          <Link href="/flaechen">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Flächenmanagement</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Raumplan und Belegungsübersicht
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
