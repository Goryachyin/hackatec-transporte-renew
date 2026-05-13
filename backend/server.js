import 'dotenv/config'
import { createServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'

import { createApp } from './src/app.js'
import { env } from './src/config/env.js'
import { startTelemetryWorker } from './src/queues/telemetry.worker.js'

// ─── Express + HTTP server ────────────────────────────────────────────────────
const app        = createApp()
const httpServer = createServer(app)

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin:  env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`[Socket.io] Conectado: ${socket.id}`)

  // El cliente puede suscribirse a un dispositivo específico para recibir
  // solo sus actualizaciones: socket.emit('subscribe:device', 'unit-01')
  socket.on('subscribe:device', (deviceId) => {
    if (typeof deviceId === 'string' && deviceId.length <= 64) {
      socket.join(`device:${deviceId}`)
      console.log(`[Socket.io] ${socket.id} suscrito a device:${deviceId}`)
    }
  })

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Desconectado: ${socket.id}`)
  })
})

// ─── BullMQ Worker ───────────────────────────────────────────────────────────
// En desarrollo: el worker corre en el mismo proceso que el servidor.
// En producción: ejecutar `node worker.js` como proceso separado y usar
// Redis pub/sub para comunicar el worker con el servidor Socket.io.
startTelemetryWorker(io)

// ─── Arranque ────────────────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`[Server] API corriendo en http://localhost:${env.PORT}`)
  console.log(`[Server] Health check: http://localhost:${env.PORT}/health`)
})
