import express from 'express'
import telemetryRoutes from './routes/telemetry.routes.js'

export function createApp() {
  const app = express()

  // Parsear JSON — límite de 2mb por si llegan batches grandes
  app.use(express.json({ limit: '2mb' }))

  // Health check — no requiere autenticación; útil para load balancers
  app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }))

  // Rutas de la API
  app.use('/api', telemetryRoutes)

  // 404 — ruta no encontrada
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' })
  })

  // Manejador global de errores — no exponer stack traces al cliente
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[App] Error no manejado:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  })

  return app
}
