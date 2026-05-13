import { haversineDistance } from './geoUtils'

/**
 * Encuentra el punto más cercano de un array de coordenadas a un punto clickeado.
 * Hace snap automático sobre la ruta activa.
 *
 * @param {[number, number]} clickedLatLng - [lat, lng] del click en el mapa
 * @param {Array<[number, number]>} coords  - Array de [lat, lng] de la ruta
 * @returns {{ index: number, position: [number, number] } | null}
 */
export function snapToNearestPoint(clickedLatLng, coords) {
  if (!coords.length) return null

  let minDist = Infinity
  let snapIndex = 0

  coords.forEach(([lat, lng], i) => {
    const d = haversineDistance(clickedLatLng, [lat, lng])
    if (d < minDist) {
      minDist = d
      snapIndex = i
    }
  })

  return {
    index: snapIndex,
    position: coords[snapIndex],
  }
}

/**
 * Convierte un índice de coordenada en progreso normalizado [0, 1].
 */
export function progressAtIndex(index, totalCoords) {
  if (totalCoords <= 1) return 0
  return index / (totalCoords - 1)
}
