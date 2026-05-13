import { CircleMarker, Tooltip } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'

/**
 * Muestra un indicador visual en el mapa cuando una unidad está en parada.
 * Aparece como un círculo pulsante con un tooltip mostrando cuántos abordaron/bajaron.
 */
function StopIndicator() {
  const units = useAppStore((state) => state.units)

  return units
    .filter((u) => u.isAtStop && u.position && u.stopDelta)
    .map((u) => (
      <CircleMarker
        key={`stop-${u.id}`}
        center={u.position}
        radius={14}
        pathOptions={{
          color: '#7c3aed',
          fillColor: '#a78bfa',
          fillOpacity: 0.35,
          weight: 2,
          dashArray: '4 3',
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -16]}>
          <span style={{ fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', color: '#334155' }}>
            ↑{u.stopDelta.boarded} &nbsp; ↓{u.stopDelta.alighted}
          </span>
        </Tooltip>
      </CircleMarker>
    ))
}

export default StopIndicator
