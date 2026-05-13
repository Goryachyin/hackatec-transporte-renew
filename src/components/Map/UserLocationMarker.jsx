import { Marker, Tooltip, Circle } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useGeolocation } from '../../hooks/useGeolocation'

const userIcon = divIcon({
  className: '',
  html: `<div class="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-lg ring-4 ring-indigo-200 ring-opacity-50"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function UserLocationMarker() {
  const { position, accuracy } = useGeolocation()

  if (!position) return null

  return (
    <>
      {/* Círculo de precisión */}
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.1, weight: 1 }}
      />
      <Marker position={position} icon={userIcon}>
        <Tooltip permanent={false}>Mi ubicación</Tooltip>
      </Marker>
    </>
  )
}

export default UserLocationMarker
