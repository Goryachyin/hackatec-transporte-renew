import { Queue } from 'bullmq'
import { redisConnection } from '../config/redis.js'

// Cola BullMQ para procesar batches de telemetría de forma asíncrona.
// El endpoint HTTP solo encola el job y responde 202 de inmediato;
// el Worker (telemetry.worker.js) se encarga del procesamiento pesado.
export const telemetryQueue = new Queue('telemetry', {
  connection: redisConnection,
  defaultJobOptions: {
    // Limpiar automáticamente jobs completados/fallidos para no saturar Redis
    removeOnComplete: { count: 1000 },
    removeOnFail:     { count: 5000 },
    // Reintentos con back-off exponencial ante fallos transitorios (DB caída, etc.)
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s → 2s → 4s
    },
  },
})
