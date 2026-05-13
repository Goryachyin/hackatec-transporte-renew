import { Worker } from 'bullmq'
import { redisConnection } from '../config/redis.js'

/**
 * Inicia el Worker de BullMQ para la cola "telemetry".
 *
 * Recibe la instancia de Socket.io (io) para emitir datos en tiempo real
 * directamente a los clientes conectados al finalizar cada job.
 *
 * En producción, si el worker corre en un proceso separado (sin acceso a `io`),
 * reemplaza la emisión directa por una publicación en un canal Redis:
 *   redisClient.publish('telemetry:realtime', JSON.stringify(payload))
 * y suscribe el servidor Express a ese canal para hacer el io.emit().
 *
 * @param {import('socket.io').Server} io
 * @returns {Worker}
 */
export function startTelemetryWorker(io) {
  const worker = new Worker(
    'telemetry',
    async (job) => {
      const { deviceId, timestamp, data } = job.data

      // ─────────────────────────────────────────────────────────────
      // 1. PERSISTENCIA EN BASE DE DATOS
      // ─────────────────────────────────────────────────────────────
      // Aquí iría la inserción en TimescaleDB (extensión de PostgreSQL
      // optimizada para series temporales). Ejemplo con `pg`:
      //
      //   import { pool } from '../config/db.js'
      //
      //   await pool.query(
      //     `INSERT INTO telemetry (device_id, recorded_at, lat, lng, speed)
      //      SELECT $1,
      //             to_timestamp($2 / 1000.0) AT TIME ZONE 'UTC',
      //             d.lat, d.lng, d.speed
      //      FROM jsonb_to_recordset($3::jsonb)
      //           AS d(lat double precision, lng double precision, speed double precision)`,
      //     [deviceId, timestamp, JSON.stringify(data)]
      //   )
      //
      // Con TimescaleDB la tabla "telemetry" sería una hypertable particionada
      // automáticamente por tiempo:
      //   SELECT create_hypertable('telemetry', 'recorded_at');
      // ─────────────────────────────────────────────────────────────

      // Simular latencia de escritura a BD (eliminar en producción)
      await new Promise((resolve) => setTimeout(resolve, 10))

      // ─────────────────────────────────────────────────────────────
      // 2. EMISIÓN EN TIEMPO REAL VÍA SOCKET.IO
      // ─────────────────────────────────────────────────────────────
      const payload = { deviceId, timestamp, data }

      // Emitir solo a clientes suscritos a este dispositivo específico
      // (el cliente hace: socket.emit('subscribe:device', deviceId))
      io.to(`device:${deviceId}`).emit('telemetry:update', payload)

      // También broadcast global para dashboards que muestran todas las unidades
      io.emit('telemetry:batch', payload)
    },
    {
      connection: redisConnection,
      concurrency: 10, // procesar hasta 10 jobs en paralelo
    }
  )

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completado — deviceId: ${job.data.deviceId}`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} falló (intento ${job?.attemptsMade}):`, err.message)
  })

  worker.on('error', (err) => {
    console.error('[Worker] Error de conexión:', err.message)
  })

  console.log('[Worker] Telemetry worker iniciado — concurrency: 10')
  return worker
}
