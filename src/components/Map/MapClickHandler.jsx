import { useMapEvents } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'
import { extractCoordinates } from '../../utils/interpolate'
import { snapToNearestPoint } from '../../utils/snapToRoute'
import { ROUTES } from '../../routes/routeRegistry'

/**
 * Captura clicks en el mapa cuando hay un modo de selección activo.
 * Hace snap al punto más cercano de la ruta activa y lo guarda en el store.
 * Si no hay selectionMode activo, los clicks se ignoran.
 */
function MapClickHandler() {
  const selectionMode = useAppStore((s) => s.selectionMode)
  const activeRouteId = useAppStore((s) => s.activeRouteId)
  const setDeparturePoint = useAppStore((s) => s.setDeparturePoint)
  const setDestinationPoint = useAppStore((s) => s.setDestinationPoint)

  useMapEvents({
    click(e) {
      if (!selectionMode || !activeRouteId) return

      const route = ROUTES.find((r) => r.id === activeRouteId)
      if (!route) return

      const coords = extractCoordinates(route.geojson)
      const snapped = snapToNearestPoint([e.latlng.lat, e.latlng.lng], coords)
      if (!snapped) return

      if (selectionMode === 'departure') {
        setDeparturePoint(snapped)
      } else if (selectionMode === 'destination') {
        setDestinationPoint(snapped)
      }
    },
  })

  return null
}

export default MapClickHandler
