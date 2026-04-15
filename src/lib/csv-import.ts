import Papa from 'papaparse'

export const GEOMETRY_HEADER_MAP: Record<string, string> = {
  'Raum-ID': 'room_id',
  Pfaddaten: 'path_data',
  Gebäude: 'building',
  Ebene: 'floor',
}

export const ROOMDATA_HEADER_MAP: Record<string, string> = {
  'Raum-ID': 'room_id',
  Raumnummer: 'room_number',
  Raumtyp: 'room_type',
  'Raumtyp-Code': 'room_type_code',
  Fläche: 'area_sqm',
  'DIN277-Code': 'din277_code',
  'DIN277-Name': 'din277_name',
  Kostenstelle: 'cost_center',
  'Kostenstellen-Name': 'cost_center_name',
  Sondernutzung: 'special_use',
  Eigentümer: 'owner',
  Standort: 'location',
  Raumnotiz: 'room_note',
  Nutzungsnotiz: 'usage_note',
  'Nutzung-von': 'usage_from',
  'Nutzung-bis': 'usage_to',
}

export function sanitizeCsvValue(value: string): string {
  return value.replace(/^[=+\-@]/, '')
}

export function parseAndMapCsv(
  csvText: string,
  headerMap: Record<string, string>,
): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return result.data.map((row) => {
    const mapped: Record<string, string> = {}
    for (const [germanKey, dbKey] of Object.entries(headerMap)) {
      const value = row[germanKey]
      if (value !== undefined && value !== null) {
        mapped[dbKey] = sanitizeCsvValue(String(value).trim())
      }
    }
    return mapped
  })
}
