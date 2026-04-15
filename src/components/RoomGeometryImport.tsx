import CsvImportButton from './CsvImportButton'

export default function RoomGeometryImport() {
  return (
    <CsvImportButton endpoint="/api/import/room-geometry" label="Raumgeometrie CSV importieren" />
  )
}
