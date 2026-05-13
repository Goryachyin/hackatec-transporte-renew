const MAX_SEATS = 20

function getOccupancyLabel(p) {
  if (p <= 5)  return { text: 'Muy disponible', color: '#22c55e' }
  if (p <= 18) return { text: 'Medio lleno',    color: '#f59e0b' }
  return              { text: 'Lleno',           color: '#ef4444' }
}

function InfoPanel({ unit }) {
  const lat = unit.position?.[0]?.toFixed(5) ?? '—'
  const lng = unit.position?.[1]?.toFixed(5) ?? '—'
  const passengers = unit.passengers ?? 0
  const { text: occText, color: occColor } = getOccupancyLabel(passengers)

  return (
    <div className="mx-0.5 px-4 py-3 bg-slate-50 rounded-b-lg border border-t-0 border-slate-200 text-xs">
      {/* Ocupación destacada */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
        <span className="text-slate-400">Pasajeros</span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(passengers / MAX_SEATS) * 100}%`, backgroundColor: occColor }}
            />
          </div>
          <span className="font-bold tabular-nums" style={{ color: occColor }}>
            {passengers}/{MAX_SEATS}
          </span>
        </div>
      </div>
      <div className="mb-2.5">
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${occColor}20`, color: occColor }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: occColor }}
          />
          {occText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <span className="block text-slate-400 mb-0.5">Latitud</span>
          <span className="font-mono text-slate-700">{lat}</span>
        </div>
        <div>
          <span className="block text-slate-400 mb-0.5">Longitud</span>
          <span className="font-mono text-slate-700">{lng}</span>
        </div>
        <div>
          <span className="block text-slate-400 mb-0.5">Velocidad</span>
          <span className="text-slate-700">{unit.speed}x</span>
        </div>
        <div>
          <span className="block text-slate-400 mb-0.5">Ruta</span>
          <span className="text-slate-700 truncate block">{unit.routeId ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
