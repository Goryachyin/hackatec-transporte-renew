import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'

const ROUTES_CENTER = [16.874, -99.904]
const ROUTES_ZOOM = 15

/**
 * Componente interno del MapContainer (requiere contexto de Leaflet).
 * Gestiona cuatro comportamientos de navegación automática:
 * 1. Auto-fly a la ubicación GPS del usuario al primer fix
 * 2. Fly to routes (botón externo)
 * 3. Fly to user location (botón externo)
 * 4. Seguimiento continuo de la unidad seleccionada
 */
function MapAutoFocus() {
  const map = useMap()
  const userLocation = useAppStore((s) => s.userLocation)
  const flyToRoutesRequested = useAppStore((s) => s.flyToRoutesRequested)
  const flyToUserRequested = useAppStore((s) => s.flyToUserRequested)
  const clearFlyToRoutes = useAppStore((s) => s.clearFlyToRoutes)
  const clearFlyToUser = useAppStore((s) => s.clearFlyToUser)
  const selectedUnitId = useAppStore((s) => s.selectedUnitId)
  const units = useAppStore((s) => s.units)

  const hasAutoFlownRef = useRef(false)
  const isFollowingRef = useRef(false)
  const prevPositionRef = useRef(null)

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

  // Fly inicial cuando cambia la unidad seleccionada
  useEffect(() => {
    if (!selectedUnitId) {
      isFollowingRef.current = false
      prevPositionRef.current = null
      return
    }
    const unit = units.find((u) => u.id === selectedUnitId)
    if (unit?.position) {
      const zoom = Math.max(map.getZoom(), 16)
      map.flyTo(unit.position, zoom, { duration: 1 })
      isFollowingRef.current = true
      prevPositionRef.current = unit.position
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId])

  // Seguimiento continuo: panTo suave en cada actualización de posición
  useEffect(() => {
    if (!isFollowingRef.current || !selectedUnitId) return
    const unit = units.find((u) => u.id === selectedUnitId)
    if (!unit?.position) return

    const prev = prevPositionRef.current
    const moved =
      !prev ||
      prev[0] !== unit.position[0] ||
      prev[1] !== unit.position[1]

    if (moved) {
      map.panTo(unit.position, { animate: true, duration: 0.2 })
      prevPositionRef.current = unit.position
    }
  }, [units, selectedUnitId, map])

  return null
}

export default MapAutoFocus
