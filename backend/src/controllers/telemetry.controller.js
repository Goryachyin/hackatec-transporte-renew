import { telemetryQueue } from '../queues/telemetry.queue.js'
import { telemetryBatchSchema } from '../schemas/telemetry.schema.js'

/**
 * POST /api/telemetry
 *
 * Recibe un batch de telemetría, lo valida con Zod y lo encola en BullMQ.
 * Responde 202 Accepted de inmediato — el procesamiento ocurre en el Worker.
 */
export async function postTelemetry(req, res) {
  // Validación de payload con Zod
  const result = telemetryBatchSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(422).json({
      error: 'Payload inválido',
      // Solo exponer path + message, nunca datos internos del servidor
      issues: result.error.issues.map((issue) => ({
        path:    issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const batch = result.data

  // Encolar el job en BullMQ.
  // jobId determinista por deviceId + timestamp evita duplicados si el cliente reenvía.
  await telemetryQueue.add('batch', batch, {
    jobId: `${batch.deviceId}_${batch.timestamp}`,
  })

  // 202 Accepted — el job está encolado, el procesamiento es asíncrono
  return res.status(202).json({ accepted: true })
}
