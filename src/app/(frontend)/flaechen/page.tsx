// This is a placeholder page for the "Flächenmanagement" module, which will be implemented in a later phase of the project.
import Link from 'next/link'

export default function FlaechenPage() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-background rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold leading-tight mb-4">Flächenmanagement</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Dieses Modul wird in einer späteren Phase freigeschaltet.
        </p>
        <Link href="/portal" className="text-sm text-muted-foreground underline">
          Zurück zum Portal
        </Link>
      </div>
    </div>
  )
}
