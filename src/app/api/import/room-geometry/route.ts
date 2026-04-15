import { getPayload } from 'payload'
import config from '@payload-config'
import { GEOMETRY_HEADER_MAP, parseAndMapCsv } from '@/lib/csv-import'

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!['text/csv', 'text/plain'].includes(file.type)) {
    return Response.json({ error: 'Invalid file type. Upload a CSV file.' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large. Maximum 10 MB.' }, { status: 413 })
  }

  const csvText = await file.text()
  const rows = parseAndMapCsv(csvText, GEOMETRY_HEADER_MAP)

  let imported = 0
  let skipped = 0
  const errors: { row: number; reason: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // 1-indexed + header row

    if (!row.room_id) {
      errors.push({ row: rowNum, reason: 'Missing Raum-ID' })
      skipped++
      continue
    }

    const existing = await payload.find({
      collection: 'room-geometry',
      where: { room_id: { equals: row.room_id } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'room-geometry',
        id: existing.docs[0].id,
        data: {
          path_data: row.path_data,
          building: row.building,
          floor: row.floor,
        },
      })
    } else {
      await payload.create({
        collection: 'room-geometry',
        data: {
          room_id: row.room_id,
          path_data: row.path_data ?? '',
          building: row.building ?? '',
          floor: row.floor ?? '',
        },
      })
    }

    imported++
  }

  return Response.json({ total: rows.length, imported, skipped, errors })
}
