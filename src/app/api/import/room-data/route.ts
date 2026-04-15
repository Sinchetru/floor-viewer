import { getPayload } from 'payload'
import config from '@payload-config'
import { ROOMDATA_HEADER_MAP, parseAndMapCsv } from '@/lib/csv-import'

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

  const ACCEPTED_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/csv', 'application/octet-stream', '']
  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
    return Response.json({ error: 'Invalid file type. Upload a CSV file.' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large. Maximum 10 MB.' }, { status: 413 })
  }

  const csvText = await file.text()
  const rows = parseAndMapCsv(csvText, ROOMDATA_HEADER_MAP)

  let imported = 0
  let skipped = 0
  const errors: { row: number; reason: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    if (!row.room_id || !row.cost_center || !row.area_sqm) {
      const missing = [
        !row.room_id && 'Raum-ID',
        !row.cost_center && 'Kostenstelle',
        !row.area_sqm && 'Fläche',
      ]
        .filter(Boolean)
        .join(', ')
      errors.push({ row: rowNum, reason: `Missing ${missing}` })
      skipped++
      continue
    }

    const areaSqm = parseFloat(row.area_sqm)

    const data: Record<string, unknown> = {
      room_id: row.room_id,
      ...(row.room_number && { room_number: row.room_number }),
      ...(row.room_type && { room_type: row.room_type }),
      ...(row.room_type_code && { room_type_code: row.room_type_code }),
      ...(!isNaN(areaSqm) && { area_sqm: areaSqm }),
      ...(row.din277_code && { din277_code: row.din277_code }),
      ...(row.din277_name && { din277_name: row.din277_name }),
      ...(row.cost_center && { cost_center: row.cost_center }),
      ...(row.cost_center_name && { cost_center_name: row.cost_center_name }),
      ...(row.special_use && { special_use: row.special_use }),
      ...(row.owner && { owner: row.owner }),
      ...(row.location && { location: row.location }),
      ...(row.room_note && { room_note: row.room_note }),
      ...(row.usage_note && { usage_note: row.usage_note }),
      ...(row.usage_from && { usage_from: row.usage_from }),
      ...(row.usage_to && { usage_to: row.usage_to }),
    }

    const existing = await payload.find({
      collection: 'room-data',
      where: { room_id: { equals: row.room_id } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'room-data',
        id: existing.docs[0].id,
        data: data as any,
      })
    } else {
      await payload.create({
        collection: 'room-data',
        data: data as any,
      })
    }

    imported++
  }

  return Response.json({ total: rows.length, imported, skipped, errors })
}
