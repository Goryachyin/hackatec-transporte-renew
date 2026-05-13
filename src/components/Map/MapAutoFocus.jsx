import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'

const ROUTES_CENTER = [16.874, -99.904]
const ROUTES_ZOOM = 15

/**
 * Componente interno del MapContainer (requiere contexto de Leaflet).
 * Gestiona tres comportamientos de navegación automática:
 * 1. Auto-fly a la ubicación GPS del usuario al primer fix
 * 2. Fly to routes (botón externo)
 * 3. Fly to user location (botón externo)
 */
function MapAutoFocus() {
  const map = useMap()
  const userLocation = useAppStore((s) => s.userLocation)
  const flyToRoutesRequested = useAppStore((s) => s.flyToRoutesRequested)
  const flyToUserRequested = useAppStore((s) => s.flyToUserRequested)
  const clearFlyToRoutes = useAppStore((s) => s.clearFlyToRoutes)
  const clearFlyToUser = useAppStore((s) => s.clearFlyToUser)

  const hasAutoFlownRef = useRef(false)

  // Auto-fly a la ubicación del usuario al primer fix GPS
  useEffect(() => {
    if (userLocation?.position && !hasAutoFlownRef.current) {
      hasAutoFlownRef.current = true
      map.flyTo(userLocation.position, 16, { duration: 1.5 })
    }
  }, [userLocation, map])

  // Fly to zona de rutas (botón "Ver rutas")
  useEffect(() => {
    if (flyToRoutesRequested) {
      map.flyTo(ROUTES_CENTER, ROUTES_ZOOM, { duration: 1.5 })
      clearFlyToRoutes()
    }
  }, [flyToRoutesRequested, map, clearFlyToRoutes])

  // Fly to ubicación del usuario (botón "Mi ubicación")
  useEffect(() => {
    if (flyToUserRequested && userLocation?.position) {
      map.flyTo(userLocation.position, 16, { duration: 1.5 })
      clearFlyToUser()
    }
  }, [flyToUserRequested, userLocation, map, clearFlyToUser])

  return null
}

export default MapAutoFocus
