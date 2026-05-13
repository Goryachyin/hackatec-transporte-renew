import { useAppStore } from '../../store/useAppStore'
import StatusBadge from '../UI/StatusBadge'
import InfoPanel from '../UI/InfoPanel'

const MAX_SEATS = 20

function getOccupancyColor(passengers) {
  if (passengers <= 5)  return '#22c55e'
  if (passengers <= 18) return '#f59e0b'
  return '#ef4444'
}

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
        {units.map((unit) => {
          const passengers = unit.passengers ?? 0
          const occColor = getOccupancyColor(passengers)

          return (
            <li key={unit.id}>
              <button
                onClick={() => setSelectedUnit(selectedUnitId === unit.id ? null : unit.id)}
                className={`w-full text-left px-3 py-3 rounded-lg border transition-all ${
                  selectedUnitId === unit.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                {/* Nombre + estado */}
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

                {/* Barra de progreso de ruta */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${unit.progress * 100}%`,
                      backgroundColor: getRouteColor(unit.routeId),
                    }}
                  />
                </div>

                {/* Ocupación de pasajeros */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(passengers / MAX_SEATS) * 100}%`,
                        backgroundColor: occColor,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums shrink-0"
                    style={{ color: occColor }}
                  >
                    {passengers}/{MAX_SEATS}
                  </span>
                </div>
              </button>

              {selectedUnitId === unit.id && <InfoPanel unit={unit} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default UnitList
