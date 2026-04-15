'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type ImportResult = {
  total?: number
  imported?: number
  skipped?: number
  errors?: { row: number; reason: string }[]
  error?: string
}

export default function CsvImportButton({ endpoint, label }: { endpoint: string; label: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(endpoint, { method: 'POST', body: formData })
    const json = await res.json()

    setResult(json)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Importiere...' : label}
      </Button>

      {result && (
        <div style={{ fontSize: '0.875rem' }}>
          {result.error && <span style={{ color: '#dc2626' }}>{result.error}</span>}
          {result.imported !== undefined && (
            <span style={{ color: '#15803d' }}>
              Importiert: {result.imported} | Übersprungen: {result.skipped}
            </span>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul style={{ margin: 0, color: '#dc2626', paddingLeft: '1rem' }}>
              {result.errors.map((err) => (
                <li key={err.row}>Zeile {err.row}: {err.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}