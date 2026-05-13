import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { interpolatePosition, extractCoordinates } from '../utils/interpolate'

const TICK_MS = 200

/**
 * Hook que inicia la simulación de movimiento para todas las unidades activas.
 * Usa refs para units y routes para evitar que el interval se reinicie
 * en cada actualización de posición (problemática clásica con setInterval + estado).
 */
export function useUnitSimulation() {
  const units = useAppStore((state) => state.units)
  const routes = useAppStore((state) => state.routes)
  const updateUnitPosition = useAppStore((state) => state.updateUnitPosition)
  const isSimulating = useAppStore((state) => state.isSimulating)

  const intervalRef = useRef(null)
  const unitsRef = useRef(units)
  const routesRef = useRef(routes)

  // Mantener refs actualizadas sin re-crear el interval
  useEffect(() => { unitsRef.current = units }, [units])
  useEffect(() => { routesRef.current = routes }, [routes])

  useEffect(() => {
    if (!isSimulating) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      unitsRef.current.forEach((unit) => {
        if (unit.status === 'arrived') return

        const route = routesRef.current.find((r) => r.id === unit.routeId)
        if (!route?.geojson) return

        const coords = extractCoordinates(route.geojson)
        if (!coords.length) return

        const step = (unit.speed * TICK_MS) / (coords.length * 800)
        const newProgress = Math.min(unit.progress + step, 1)
        const newPosition = interpolatePosition(coords, newProgress)
        const newStatus = newProgress >= 1 ? 'arrived' : 'on-route'

        updateUnitPosition(unit.id, newPosition, newProgress, newStatus)
      })
    }, TICK_MS)

    return () => clearInterval(intervalRef.current)
  }, [isSimulating, updateUnitPosition])
}
