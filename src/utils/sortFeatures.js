/**
 * Distancia euclidiana al cuadrado entre dos coordenadas GeoJSON [lng, lat].
 * Se usa cuadrado para evitar sqrt en comparaciones (más rápido).
 */
function dist2([lng1, lat1], [lng2, lat2]) {
  return (lng2 - lng1) ** 2 + (lat2 - lat1) ** 2
}

/**
 * Dado un GeoJSON FeatureCollection con múltiples LineString,
 * ordena y encadena los features para formar una ruta continua.
 *
 * Algoritmo greedy:
 * 1. Parte del feature cuyo primer punto es el más "extremo" (mayor distancia al centroide).
 * 2. En cada paso busca el feature no visitado cuyo inicio o fin esté más cercano
 *    al último punto del chain actual.
 * 3. Si el fin del candidato está más cerca que su inicio, lo invierte antes de agregar.
 *
 * Retorna un nuevo GeoJSON FeatureCollection con un único Feature LineString
 * que representa la ruta completa en orden correcto.
 */
export function sortAndChainFeatures(geojson) {
  if (geojson.type !== 'FeatureCollection') return geojson

  // Extraer solo las features con LineString
  const lineFeatures = geojson.features.filter(
    (f) => f.geometry?.type === 'LineString' && f.geometry.coordinates.length >= 2
  )

  if (lineFeatures.length === 0) return geojson
  if (lineFeatures.length === 1) {
    return buildSingleFeature(lineFeatures[0].geometry.coordinates)
  }

  // Copiar coords de cada feature para poder invertirlas sin mutar el original
  const segments = lineFeatures.map((f) => [...f.geometry.coordinates])

  // --- Elegir punto de partida ---
  // Calculamos el centroide de todos los puntos para encontrar el feature más "periférico"
  const allPoints = segments.flat()
  const centroid = allPoints.reduce(
    ([cx, cy], [x, y]) => [cx + x / allPoints.length, cy + y / allPoints.length],
    [0, 0]
  )

  let startSegIdx = 0
  let maxDist = -1
  segments.forEach((seg, i) => {
    const d = dist2(seg[0], centroid)
    if (d > maxDist) {
      maxDist = d
      startSegIdx = i
    }
  })

  // --- Encadenamiento greedy ---
  const ordered = [segments[startSegIdx]]
  const remaining = segments.filter((_, i) => i !== startSegIdx)

  while (remaining.length > 0) {
    const lastPoint = ordered[ordered.length - 1].at(-1)

    let bestIdx = 0
    let bestDist = Infinity
    let shouldReverse = false

    remaining.forEach((seg, i) => {
      const dStart = dist2(lastPoint, seg[0])
      const dEnd = dist2(lastPoint, seg.at(-1))

      if (dStart < bestDist) {
        bestDist = dStart
        bestIdx = i
        shouldReverse = false
      }
      if (dEnd < bestDist) {
        bestDist = dEnd
        bestIdx = i
        shouldReverse = true
      }
    })

    const chosen = remaining.splice(bestIdx, 1)[0]
    ordered.push(shouldReverse ? [...chosen].reverse() : chosen)
  }

  // Aplanar en un único array de coordenadas, evitando duplicar el punto de unión
  const chained = ordered.reduce((acc, seg, i) => {
    return acc.concat(i === 0 ? seg : seg.slice(1))
  }, [])

  return buildSingleFeature(chained)
}

function buildSingleFeature(coordinates) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates },
        properties: {},
      },
    ],
  }
}
