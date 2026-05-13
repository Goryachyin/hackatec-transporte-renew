import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAppStore } from '../store/useAppStore'

// URL del servidor de telemetría.
// En desarrollo apunta a localhost; en producción a Render (variable de entorno Vite).
const WS_URL = import.meta.env.VITE_API_WS_URL ?? 'https://hackatec-telemetry-api.onrender.com'

/**
 * Hook que conecta con el servidor Socket.io del backend y actualiza
 * las posiciones de las unidades en tiempo real al recibir telemetría.
 *
 * Cuando llega un evento 'telemetry:batch' con { deviceId, data[] }:
 *   - Toma el último punto del batch (más reciente)
 *   - Llama a updateUnitFromTelemetry() en el store
 *   - La simulación ignorará esa unidad a partir de ese momento
 *
 * El deviceId del payload debe coincidir con el id de la unidad en el store
 * (ej: "unit-01", "unit-02", "unit-03").
 */
export function useRealtimeTelemetry() {
  const updateUnitFromTelemetry = useAppStore((s) => s.updateUnitFromTelemetry)

  useEffect(() => {
    const socket = io(WS_URL, {
      // Polling primero: más robusto en proxies y planes free de Render.
      // Socket.io hace upgrade a WebSocket automáticamente si está disponible.
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      console.log('[Telemetría] Conectado al servidor:', WS_URL)
    })

    // Evento broadcast: todos los batches de todos los dispositivos
    socket.on('telemetry:batch', ({ deviceId, data }) => {
      if (!Array.isArray(data) || data.length === 0) return
      // El último punto del batch es el más reciente
      const latest = data[data.length - 1]
      updateUnitFromTelemetry(deviceId, [latest.lat, latest.lng], latest.speed)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Telemetría] Desconectado:', reason)
    })

    socket.on('connect_error', (err) => {
      console.warn('[Telemetría] Error de conexión:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [updateUnitFromTelemetry])
}
