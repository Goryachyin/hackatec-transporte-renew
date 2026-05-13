import { useAppStore } from '../../store/useAppStore'
import StatusBadge from '../UI/StatusBadge'
import InfoPanel from '../UI/InfoPanel'

function UnitList() {
  const units = useAppStore((state) => state.units)
  const selectedUnitId = useAppStore((state) => state.selectedUnitId)
  const setSelectedUnit = useAppStore((state) => state.setSelectedUnit)
  const routes = useAppStore((state) => state.routes)

  const getRouteColor = (routeId) =>
    routes.find((r) => r.id === routeId)?.color ?? '#94a3b8'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Unidades · {units.length}
      </p>

      <ul className="space-y-2">
        {units.map((unit) => (
          <li key={unit.id}>
            <button
              onClick={() => setSelectedUnit(selectedUnitId === unit.id ? null : unit.id)}
              className={`w-full text-left px-3 py-3 rounded-lg border transition-all ${
                selectedUnitId === unit.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getRouteColor(unit.routeId) }}
                  />
                  <span className="text-sm font-medium text-slate-700">{unit.name}</span>
                </div>
                <StatusBadge status={unit.status} />
              </div>
              {/* Barra de progreso */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${unit.progress * 100}%`,
                    backgroundColor: getRouteColor(unit.routeId),
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right">
                {Math.round(unit.progress * 100)}%
              </p>
            </button>

            {selectedUnitId === unit.id && <InfoPanel unit={unit} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UnitList
