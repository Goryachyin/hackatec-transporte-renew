import colosoGeojson from '../transport-routes/Ruta Coloso - Cine Rio.json'
import renaGeojson from '../transport-routes/Ruta Rena - Hospital.json'
import vacacionalGeojson from '../transport-routes/Ruta Vacacional.json'

/**
 * Registro central de todas las rutas de transporte disponibles.
 * Cada entrada incluye el GeoJSON ya importado (Vite resuelve JSON estático nativamente).
 */
export const ROUTES = [
  {
    id: 'ruta-coloso',
    name: 'Coloso - Cine Río',
    color: '#3b82f6',       // azul
    geojson: colosoGeojson,
  },
  {
    id: 'ruta-rena',
    name: 'Rena - Hospital',
    color: '#f59e0b',       // amarillo-naranja
    geojson: renaGeojson,
  },
  {
    id: 'ruta-vacacional',
    name: 'Vacacional',
    color: '#10b981',       // verde
    geojson: vacacionalGeojson,
  },
]
