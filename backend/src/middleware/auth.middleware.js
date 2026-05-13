import { env } from '../config/env.js'

/**
 * Middleware de autenticación.
 *
 * Acepta cualquiera de los dos esquemas:
 *   1. Header:  X-API-Key: <token>
 *   2. Header:  Authorization: Bearer <token>
 *
 * El token se compara contra la variable de entorno API_KEY.
 * Se usa comparación de longitud constante para mitigar timing attacks.
 */

// Implementación de comparación en tiempo constante sin dependencias externas.
// Equivalente a crypto.timingSafeEqual pero sobre strings.
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) {
    // Forzar el mismo número de operaciones para no revelar la longitud
    let _diff = 0
    for (let i = 0; i < b.length; i++) _diff |= b.charCodeAt(i) ^ b.charCodeAt(i)
    return false
  }
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function extractToken(req) {
  // Opción 1: X-API-Key
  const apiKey = req.headers['x-api-key']
  if (apiKey) return String(apiKey)

  // Opción 2: Authorization: Bearer <token>
  const authHeader = req.headers['authorization']
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }

  return null
}

export function authMiddleware(req, res, next) {
  const token = extractToken(req)

  if (!token || !timingSafeEqual(token, env.API_KEY)) {
    // No revelar si el token existe o cuál fue el error específico
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}
