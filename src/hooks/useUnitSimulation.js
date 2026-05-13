import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { interpolatePosition, extractCoordinates } from '../utils/interpolate'

const TICK_MS = 200   // intervalo de actualización en milisegundos

/**
 * Hook que inicia la simulación de movimiento para todas las unidades activas.
 * Avanza el progreso de cada unidad a lo largo de la ruta GeoJSON asignada.
 */
export function useUnitSimulation() {
  const units = useAppStore((state) => state.units)
  const routes = useAppStore((state) => state.routes)
  const updateUnitPosition = useAppStore((state) => state.updateUnitPosition)
  const isSimulating = useAppStore((state) => state.isSimulating)

  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isSimulating) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      units.forEach((unit) => {
        if (unit.status === 'arrived') return

        const route = routes.find((r) => r.id === unit.routeId)
        if (!route?.geojson) return

        const coords = extractCoordinates(route.geojson)
        if (!coords.length) return

        // Avance proporcional a la velocidad y al intervalo
        const step = (unit.speed * TICK_MS) / (coords.length * 800)
        const newProgress = Math.min(unit.progress + step, 1)
        const newPosition = interpolatePosition(coords, newProgress)
        const newStatus = newProgress >= 1 ? 'arrived' : 'on-route'

        updateUnitPosition(unit.id, newPosition, newProgress, newStatus)
      })
    }, TICK_MS)

    return () => clearInterval(intervalRef.current)
  }, [isSimulating, units, routes, updateUnitPosition])
}
