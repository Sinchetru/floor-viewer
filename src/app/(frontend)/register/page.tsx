'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

import { register } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await register({
        email: formData.get('email') as string,
        password_1: formData.get('password_1') as string,
        password_2: formData.get('password_2') as string,
      })
      router.replace('/') // ✅ go back to home → cookie exists → HelloUser shows
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <Card className="w-full max-w-sm p-8 shadow-sm">
        <CardContent>
          <h1 className="text-xl font-semibold mb-6">Registrierung</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">
                E-Mail
              </Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password_1" className="text-sm font-semibold">
                Passwort
              </Label>
              <Input
                id="password_1"
                name="password_1"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="password_2" className="text-sm font-semibold">
                Passwort bestätigen
              </Label>
              <Input
                id="password_2"
                name="password_2"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrieren
            </Button>
            {error && <p className="text-sm text-destructive mt-4">{error}</p>}
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Bereits ein Konto?{' '}
            <Link href="/" className="underline font-medium">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
