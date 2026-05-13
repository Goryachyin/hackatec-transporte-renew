const R = 6371000 // Radio de la Tierra en metros

/**
 * Distancia entre dos puntos geográficos usando la fórmula de Haversine.
 * @param {[number, number]} a - [lat, lng]
 * @param {[number, number]} b - [lat, lng]
 * @returns {number} Distancia en metros
 */
export function haversineDistance([lat1, lng1], [lat2, lng2]) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Longitud total de una polilínea en metros.
 * @param {Array<[number, number]>} coords - Array de [lat, lng]
 * @returns {number} Distancia total en metros
 */
export function totalRouteLength(coords) {
  let total = 0
  for (let i = 0; i < coords.length - 1; i++) {
    total += haversineDistance(coords[i], coords[i + 1])
  }
  return total
}
