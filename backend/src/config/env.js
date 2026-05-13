import { z } from 'zod'

// Valida variables de entorno al arrancar el proceso.
// Si falta alguna variable crítica, el proceso termina con un error claro
// en lugar de fallar silenciosamente en tiempo de ejecución.
const envSchema = z.object({
  PORT: z
    .string()
    .default('3001')
    .transform(Number),

  API_KEY: z
    .string()
    .min(16, 'API_KEY debe tener al menos 16 caracteres'),

  // REDIS_URL tiene prioridad (lo inyecta Render automáticamente).
  // Si no está presente se usan REDIS_HOST / REDIS_PORT / REDIS_PASSWORD.
  REDIS_URL: z
    .string()
    .url()
    .optional(),

  REDIS_HOST: z
    .string()
    .default('127.0.0.1'),

  REDIS_PORT: z
    .string()
    .default('6379')
    .transform(Number),

  REDIS_PASSWORD: z
    .string()
    .optional(),

  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173'),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('[Config] Variables de entorno inválidas:')
  console.error(result.error.format())
  process.exit(1)
}

export const env = result.data
