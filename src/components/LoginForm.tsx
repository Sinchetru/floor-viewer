'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

import { login } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      })
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm p-8 shadow-sm">
      <CardContent>
        <h1 className="text-xl font-semibold mb-6">Anmeldung</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="text-sm font-semibold">
              E-Mail
            </Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-semibold">
              Passwort
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Anmelden
          </Button>
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </form>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Noch kein Konto?{' '}
          <Link href="/register" className="underline font-medium">
            Registrieren
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
