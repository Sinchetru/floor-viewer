import CsvImportButton from './CsvImportButton'

export default function RoomDataImport() {
  return <CsvImportButton endpoint="/api/import/room-data" label="Raumdaten CSV importieren" />
}
