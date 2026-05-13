/**
 * Extrae un array plano de coordenadas [lat, lng] desde un GeoJSON.
 * Soporta: LineString y MultiLineString (con conversión lng/lat → lat/lng).
 *
 * GeoJSON usa [longitude, latitude] pero Leaflet espera [latitude, longitude].
 */
export function extractCoordinates(geojson) {
  const coords = []

  function processGeometry(geometry) {
    if (!geometry) return

    if (geometry.type === 'LineString') {
      geometry.coordinates.forEach(([lng, lat]) => coords.push([lat, lng]))
    } else if (geometry.type === 'MultiLineString') {
      geometry.coordinates.forEach((line) =>
        line.forEach(([lng, lat]) => coords.push([lat, lng]))
      )
    }
  }

  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((f) => processGeometry(f.geometry))
  } else if (geojson.type === 'Feature') {
    processGeometry(geojson.geometry)
  } else {
    processGeometry(geojson)
  }

  return coords
}

/**
 * Interpola una posición [lat, lng] a lo largo de un array de coordenadas.
 * @param {Array} coords  - Array de [lat, lng]
 * @param {number} t      - Progreso de 0 (inicio) a 1 (fin)
 * @returns {[number, number]} - Posición interpolada [lat, lng]
 */
export function interpolatePosition(coords, t) {
  if (!coords.length) return null
  if (t <= 0) return coords[0]
  if (t >= 1) return coords[coords.length - 1]

  const index = t * (coords.length - 1)
  const i = Math.floor(index)
  const fraction = index - i

  const [lat1, lng1] = coords[i]
  const [lat2, lng2] = coords[Math.min(i + 1, coords.length - 1)]

  return [
    lat1 + (lat2 - lat1) * fraction,
    lng1 + (lng2 - lng1) * fraction,
  ]
}
