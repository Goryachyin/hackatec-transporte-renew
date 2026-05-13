import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { postTelemetry } from '../controllers/telemetry.controller.js'

const router = Router()

// POST /api/telemetry — autenticado, recibe batch de datos GPS
router.post('/telemetry', authMiddleware, postTelemetry)

export default router
