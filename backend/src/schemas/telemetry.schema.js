import { z } from 'zod'

// Esquema para un punto de telemetría individual dentro del batch.
const telemetryPointSchema = z.object({
  lat:   z.number().min(-90).max(90),
  lng:   z.number().min(-180).max(180),
  speed: z.number().min(0).max(300), // km/h — cota superior razonable
})

// Esquema principal del batch enviado por la unidad.
export const telemetryBatchSchema = z.object({
  deviceId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[\w\-]+$/, 'deviceId solo puede contener letras, números, guiones y guiones bajos'),

  timestamp: z
    .number()
    .int()
    .positive()
    // .max() evalúa en tiempo de módulo — usar refine() para evaluación en cada request
    .refine((ts) => ts <= Date.now() + 60_000, {
      message: 'timestamp no puede ser más de 1 minuto en el futuro',
    }),

  data: z
    .array(telemetryPointSchema)
    .min(1, 'El batch debe contener al menos un punto')
    .max(500, 'El batch no puede superar 500 puntos'),
})

/** @typedef {z.infer<typeof telemetryBatchSchema>} TelemetryBatch */
