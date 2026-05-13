import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { interpolatePosition, extractCoordinates } from '../utils/interpolate'

const TICK_MS = 200
const MAX_SEATS = 20
const STOP_CLEAR_TICKS = 10 // ~2 s

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Hook que inicia la simulación de movimiento para todas las unidades activas.
 * Usa refs para units y routes para evitar que el interval se reinicie
 * en cada actualización de posición (problemática clásica con setInterval + estado).
 */
export function useUnitSimulation() {
  const units = useAppStore((state) => state.units)
  const routes = useAppStore((state) => state.routes)
  const updateUnitPosition = useAppStore((state) => state.updateUnitPosition)
  const updateUnitPassengers = useAppStore((state) => state.updateUnitPassengers)
  const clearUnitStop = useAppStore((state) => state.clearUnitStop)
  const isSimulating = useAppStore((state) => state.isSimulating)

  const intervalRef = useRef(null)
  const unitsRef = useRef(units)
  const routesRef = useRef(routes)
  // Contador de ticks desde la última parada de cada unidad (para limpiar badge)
  const stopClearCountersRef = useRef({})

  // Mantener refs actualizadas sin re-crear el interval
  useEffect(() => { unitsRef.current = units }, [units])
  useEffect(() => { routesRef.current = routes }, [routes])

  useEffect(() => {
    if (!isSimulating) {
      clearInterval(intervalRef.current)
      stopClearCountersRef.current = {}
      return
    }

    intervalRef.current = setInterval(() => {
      unitsRef.current.forEach((unit) => {
        if (unit.status === 'arrived') return

        const route = routesRef.current.find((r) => r.id === unit.routeId)
        if (!route?.geojson) return

        const coords = extractCoordinates(route.geojson)
        if (!coords.length) return

        // --- Movimiento ---
        const step = (unit.speed * TICK_MS) / (coords.length * 800)
        const newProgress = Math.min(unit.progress + step, 1)
        const newPosition = interpolatePosition(coords, newProgress)
        const newStatus = newProgress >= 1 ? 'arrived' : 'on-route'
        updateUnitPosition(unit.id, newPosition, newProgress, newStatus)

        // --- Limpiar badge de parada tras STOP_CLEAR_TICKS ---
        if (unit.isAtStop) {
          const prev = stopClearCountersRef.current[unit.id] ?? 0
          const next = prev + 1
          if (next >= STOP_CLEAR_TICKS) {
            stopClearCountersRef.current[unit.id] = 0
            clearUnitStop(unit.id)
          } else {
            stopClearCountersRef.current[unit.id] = next
          }
        }

        // --- Lógica de parada ---
        const stepsLeft = (unit.stepsUntilNextStop ?? 1) - 1
        if (stepsLeft <= 0 && newStatus !== 'arrived') {
          const alighted = randInt(0, Math.min(3, unit.passengers))
          const freeSeats = MAX_SEATS - (unit.passengers - alighted)
          const boarded = randInt(1, Math.min(4, Math.max(1, freeSeats)))
          const newPassengers = Math.min(MAX_SEATS, unit.passengers - alighted + boarded)

          stopClearCountersRef.current[unit.id] = 0
          updateUnitPassengers(
            unit.id,
            newPassengers,
            { boarded, alighted },
            randInt(8, 20)
          )
        } else if (stepsLeft > 0) {
          // Decrementar contador sin disparar una acción de pasajeros
          // Lo hacemos manualmente actualizando el campo dentro de updateUnitPosition
          // Para no añadir otro dispatch, usamos un ref local que replica el decremento
          // y solo aplicamos updateUnitPassengers cuando llega a 0 (ya manejado arriba).
          // Actualizamos stepsUntilNextStop via la acción de posición enriqueciéndola:
          useAppStore.setState((state) => ({
            units: state.units.map((u) =>
              u.id === unit.id ? { ...u, stepsUntilNextStop: stepsLeft } : u
            ),
          }))
        }
      })
    }, TICK_MS)

    return () => clearInterval(intervalRef.current)
  }, [isSimulating, updateUnitPosition, updateUnitPassengers, clearUnitStop])
}
