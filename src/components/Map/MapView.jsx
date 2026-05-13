import { MapContainer, TileLayer } from 'react-leaflet'
import RouteLayer from './RouteLayer'
import UnitMarker from './UnitMarker'
import UserLocationMarker from './UserLocationMarker'
import { useAppStore } from '../../store/useAppStore'

// Centro real: zona de Guerrero, México (coordenadas de las rutas cargadas)
const DEFAULT_CENTER = [16.874, -99.904]
const DEFAULT_ZOOM = 15

function MapView() {
  const units = useAppStore((state) => state.units)

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Capa de rutas GeoJSON */}
      <RouteLayer />

      {/* Marcador de ubicación del usuario */}
      <UserLocationMarker />

      {/* Marcadores de unidades simuladas */}
      {units.map((unit) => (
        <UnitMarker key={unit.id} unit={unit} />
      ))}
    </MapContainer>
  )
}

export default MapView
