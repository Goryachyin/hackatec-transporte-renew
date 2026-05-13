import { env } from './env.js'

/**
 * Parsea una Redis URL (redis:// o rediss://) a un objeto de opciones ioredis.
 * Render inyecta la variable REDIS_URL con este formato.
 */
function parseRedisUrl(url) {
  const u = new URL(url)
  const isTLS = u.protocol === 'rediss:'
  return {
    host: u.hostname,
    port: parseInt(u.port, 10) || 6379,
    ...(u.password ? { password: decodeURIComponent(u.password) } : {}),
    ...(u.username && u.username !== 'default' ? { username: u.username } : {}),
    // TLS obligatorio cuando el protocolo es rediss://
    ...(isTLS ? { tls: {} } : {}),
  }
}

const baseConnection = env.REDIS_URL
  ? parseRedisUrl(env.REDIS_URL)
  : {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    }

// Objeto de conexión compatible con BullMQ (ioredis options).
export const redisConnection = {
  ...baseConnection,
  maxRetriesPerRequest: null, // requerido por BullMQ para workers bloqueantes
  enableReadyCheck: false,
}
