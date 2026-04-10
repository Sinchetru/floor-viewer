'use client'

import { logout } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  user: { email: string }
}

export default function HelloUser({ user }: Props) {
  return (
    <Card className="w-full max-w-sm p-8 shadow-sm">
      <CardContent className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-muted-foreground text-sm">Angemeldet als</p>
          <p className="text-lg font-semibold">{user.email}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" className="w-full" type="submit">
            Abmelden
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
