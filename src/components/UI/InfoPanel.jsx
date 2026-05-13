function InfoPanel({ unit }) {
  const lat = unit.position?.[0]?.toFixed(5) ?? '—'
  const lng = unit.position?.[1]?.toFixed(5) ?? '—'

  return (
    <div className="mx-0.5 px-4 py-3 bg-slate-50 rounded-b-lg border border-t-0 border-slate-200 text-xs">
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
