interface InfoCardRow {
  label: string
  value: number | string
}

interface InfoCardProps {
  rows: InfoCardRow[]
}

const numberFormatter = new Intl.NumberFormat('es-AR')

function formatValue(value: number | string): string {
  return typeof value === 'number' ? numberFormatter.format(value) : value
}

/** `.info-card` — white box with stat rows (interactions). Hides rows with no value. */
export function InfoCard({ rows }: InfoCardProps) {
  if (rows.length === 0) return null
  return (
    <div className="foro-info-card">
      {rows.map((row) => (
        <div className="foro-row" key={row.label}>
          <span>{row.label}</span>
          <b>{formatValue(row.value)}</b>
        </div>
      ))}
    </div>
  )
}
