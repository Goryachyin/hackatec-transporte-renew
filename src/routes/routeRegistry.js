import colosoGeojson from '../transport-routes/Ruta Coloso - Cine Rio.json'
import renaGeojson from '../transport-routes/Ruta Rena - Hospital.json'
import vacacionalGeojson from '../transport-routes/Ruta Vacacional.json'
import { sortAndChainFeatures } from '../utils/sortFeatures'

/**
 * Registro central de todas las rutas de transporte disponibles.
 * Los GeoJSON se pre-procesan con sortAndChainFeatures para garantizar
 * que los múltiples LineString queden encadenados en una ruta continua.
 * El resto de la app consume estos datos sin conocer el detalle.
 */
export const ROUTES = [
  {
    id: 'ruta-coloso',
    name: 'Coloso - Cine Río',
    color: '#3b82f6',
    geojson: sortAndChainFeatures(colosoGeojson),
  },
  {
    id: 'ruta-rena',
    name: 'Rena - Hospital',
    color: '#f59e0b',
    geojson: sortAndChainFeatures(renaGeojson),
  },
  {
    id: 'ruta-vacacional',
    name: 'Vacacional',
    color: '#10b981',
    geojson: sortAndChainFeatures(vacacionalGeojson),
  },
]
