import { MapContainer, TileLayer } from 'react-leaflet'
import RouteLayer from './RouteLayer'
import UnitMarker from './UnitMarker'
import UserLocationMarker from './UserLocationMarker'
import MapAutoFocus from './MapAutoFocus'
import MapClickHandler from './MapClickHandler'
import TripMarkersLayer from './TripMarkersLayer'
import { useAppStore } from '../../store/useAppStore'

const DEFAULT_CENTER = [16.874, -99.904]
const DEFAULT_ZOOM = 15

function MapView() {
  const units = useAppStore((state) => state.units)
  const selectionMode = useAppStore((state) => state.selectionMode)
  const requestFlyToRoutes = useAppStore((state) => state.requestFlyToRoutes)
  const requestFlyToUser = useAppStore((state) => state.requestFlyToUser)
  const userLocation = useAppStore((state) => state.userLocation)

  return (
    <div className={`h-full w-full relative${selectionMode ? ' map-selection-active' : ''}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFocus />
        <MapClickHandler />
        <RouteLayer />
        <TripMarkersLayer />
        <UserLocationMarker />

        {units.map((unit) => (
          <UnitMarker key={unit.id} unit={unit} />
        ))}
      </MapContainer>

      {/* Botones flotantes de navegación */}
      <div className="absolute bottom-8 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={requestFlyToUser}
          disabled={!userLocation?.position}
          title="Mi ubicación"
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 text-lg hover:bg-slate-50 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          ◎
        </button>
        <button
          onClick={requestFlyToRoutes}
          title="Ver todas las rutas"
          className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 hover:bg-slate-50 hover:shadow-xl flex items-center justify-center transition-all"
        >
          🗺
        </button>
      </div>
    </div>
  )
}

export default MapView
