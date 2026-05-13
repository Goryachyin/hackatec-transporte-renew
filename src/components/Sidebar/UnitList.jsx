import { useAppStore } from '../../store/useAppStore'
import StatusBadge from '../UI/StatusBadge'
import InfoPanel from '../UI/InfoPanel'

function UnitList() {
  const units = useAppStore((state) => state.units)
  const selectedUnitId = useAppStore((state) => state.selectedUnitId)
  const setSelectedUnit = useAppStore((state) => state.setSelectedUnit)

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
        Unidades ({units.length})
      </h2>

      <ul className="space-y-2">
        {units.map((unit) => (
          <li key={unit.id}>
            <button
              onClick={() => setSelectedUnit(selectedUnitId === unit.id ? null : unit.id)}
              className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{unit.name}</span>
                <StatusBadge status={unit.status} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Progreso: {Math.round(unit.progress * 100)}%
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
