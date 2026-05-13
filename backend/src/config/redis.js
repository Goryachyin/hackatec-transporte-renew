import { env } from './env.js'

// Objeto de conexión compatible con BullMQ (ioredis options).
// BullMQ crea su propio pool de conexiones internamente usando estos parámetros.
export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
  // Opciones de resiliencia para producción:
  maxRetriesPerRequest: null, // requerido por BullMQ para workers bloqueantes
  enableReadyCheck: false,
}
