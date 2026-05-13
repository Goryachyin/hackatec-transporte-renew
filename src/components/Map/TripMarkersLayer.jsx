import { Marker, Polyline, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useAppStore } from '../../store/useAppStore'
import { extractCoordinates } from '../../utils/interpolate'
import { ROUTES } from '../../routes/routeRegistry'

// Los iconos usan estilos inline para evitar problemas con Tailwind dentro de divIcon
const departureIcon = divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#22c55e;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;line-height:1">S</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const destinationIcon = divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#ef4444;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;line-height:1">D</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function TripMarkersLayer() {
  const departurePoint = useAppStore((s) => s.departurePoint)
  const destinationPoint = useAppStore((s) => s.destinationPoint)
  const activeRouteId = useAppStore((s) => s.activeRouteId)

  const route = ROUTES.find((r) => r.id === activeRouteId)
  const coords = route ? extractCoordinates(route.geojson) : []

  // Segmento de la ruta entre salida y destino
  let segmentCoords = []
  if (departurePoint && destinationPoint && coords.length) {
    const [start, end] =
      departurePoint.index <= destinationPoint.index
        ? [departurePoint.index, destinationPoint.index]
        : [destinationPoint.index, departurePoint.index]
    segmentCoords = coords.slice(start, end + 1)
  }

  return (
    <>
      {departurePoint && (
        <Marker position={departurePoint.position} icon={departureIcon}>
          <Tooltip permanent>Salida</Tooltip>
        </Marker>
      )}
      {destinationPoint && (
        <Marker position={destinationPoint.position} icon={destinationIcon}>
          <Tooltip permanent>Destino</Tooltip>
        </Marker>
      )}
      {segmentCoords.length > 1 && (
        <Polyline
          positions={segmentCoords}
          pathOptions={{ color: '#8b5cf6', weight: 5, dashArray: '10 6', opacity: 0.9 }}
        />
      )}
    </>
  )
}

export default TripMarkersLayer
