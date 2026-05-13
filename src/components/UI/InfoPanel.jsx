function InfoPanel({ unit }) {
  const lat = unit.position?.[0]?.toFixed(5) ?? '—'
  const lng = unit.position?.[1]?.toFixed(5) ?? '—'

  return (
    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 space-y-1">
      <div className="flex justify-between">
        <span className="text-gray-400">Lat</span>
        <span className="font-mono">{lat}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Lng</span>
        <span className="font-mono">{lng}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Velocidad</span>
        <span>{unit.speed}x</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Ruta</span>
        <span>{unit.routeId ?? '—'}</span>
      </div>
    </div>
  )
}

export default InfoPanel
