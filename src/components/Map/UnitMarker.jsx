import { Marker, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { memo } from 'react'
import { useAppStore } from '../../store/useAppStore'

// Icono personalizado usando div (evita el problema del marcador por defecto de Leaflet)
function createUnitIcon(status) {
  const colorMap = {
    'on-route': 'bg-blue-500',
    stopped: 'bg-yellow-400',
    arrived: 'bg-green-500',
  }
  const color = colorMap[status] ?? 'bg-gray-400'

  return divIcon({
    className: '',
    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function UnitMarker({ unit }) {
  const setSelectedUnit = useAppStore((state) => state.setSelectedUnit)

  if (!unit.position) return null

  return (
    <Marker
      position={unit.position}
      icon={createUnitIcon(unit.status)}
      eventHandlers={{ click: () => setSelectedUnit(unit.id) }}
    >
      <Tooltip>{unit.name}</Tooltip>
    </Marker>
  )
}

export default memo(UnitMarker)
