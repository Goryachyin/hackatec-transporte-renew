import { useAppStore } from '../../store/useAppStore'
import { ROUTES } from '../../routes/routeRegistry'
import { extractCoordinates } from '../../utils/interpolate'
import { distanceAlongRoute } from '../../utils/geoUtils'
import { progressAtIndex, snapToNearestPoint } from '../../utils/snapToRoute'
import { RouteMapIcon, TapIcon, LocationIcon } from '../UI/Icons'

// Debe coincidir con TICK_MS de useUnitSimulation para el cálculo de ETA
const TICK_MS = 200

function TripPlanner() {
  const activeRouteId = useAppStore((s) => s.activeRouteId)
  const selectionMode = useAppStore((s) => s.selectionMode)
  const departurePoint = useAppStore((s) => s.departurePoint)
  const destinationPoint = useAppStore((s) => s.destinationPoint)
  const setSelectionMode = useAppStore((s) => s.setSelectionMode)
  const clearTripPoints = useAppStore((s) => s.clearTripPoints)
  const setDeparturePoint = useAppStore((s) => s.setDeparturePoint)
  const userLocation = useAppStore((s) => s.userLocation)
  const units = useAppStore((s) => s.units)
  const isSimulating = useAppStore((s) => s.isSimulating)

  const route = ROUTES.find((r) => r.id === activeRouteId)
  const coords = route ? extractCoordinates(route.geojson) : []

  // --- Distancia del segmento salida → destino ---
  let distanceM = null
  if (departurePoint && destinationPoint && coords.length) {
    distanceM = distanceAlongRoute(coords, departurePoint.index, destinationPoint.index)
  }

  // --- ETA: primera unidad en llegar al punto de salida ---
  // Tiempo total de la ruta a speed=1: coords.length * TICK_MS * 4 ms
  // (step = speed * TICK_MS / (coords.length * 800), ticks para completar = 1/step)
  let etaSeconds = null
  if (departurePoint && coords.length) {
    const depProgress = progressAtIndex(departurePoint.index, coords.length)
    const pending = units.filter(
      (u) =>
        u.routeId === activeRouteId &&
        u.progress < depProgress &&
        u.status !== 'arrived'
    )
    if (pending.length > 0) {
      const totalRouteMs = coords.length * 800
      const etas = pending.map((u) => {
        const remaining = depProgress - u.progress
        return (remaining * totalRouteMs) / (u.speed * 1000)
      })
      etaSeconds = Math.min(...etas)
    }
  }

  const formatDistance = (m) =>
    m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`

  const formatEta = (s) => {
    if (s < 60) return `${Math.round(s)}s`
    const m = Math.floor(s / 60)
    const rem = Math.round(s % 60)
    return rem > 0 ? `${m}m ${rem}s` : `${m}m`
  }

  function handleSnapToUserLocation() {
    if (!userLocation?.position || !coords.length) return
    const snapped = snapToNearestPoint(userLocation.position, coords)
    if (snapped) setDeparturePoint(snapped)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Planificador
      </p>

      {!activeRouteId ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <RouteMapIcon className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecciona una ruta para planificar tu viaje
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Aviso de modo selección */}
          {selectionMode && (
            <div className="flex items-center gap-2 py-1.5 px-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <TapIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-700 font-medium">
                Toca la ruta en el mapa
              </span>
            </div>
          )}

          {/* Punto de salida */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectionMode(selectionMode === 'departure' ? null : 'departure')}
              className={`flex-1 h-9 px-3 rounded-lg border transition-all text-left flex items-center gap-2 ${
                selectionMode === 'departure'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : departurePoint
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                selectionMode === 'departure'
                  ? 'bg-white/25 text-white'
                  : departurePoint
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                S
              </span>
              <span className="text-xs font-medium">
                {selectionMode === 'departure'
                  ? 'Seleccionando salida…'
                  : departurePoint
                  ? 'Salida seleccionada'
                  : 'Fijar punto de salida'}
              </span>
            </button>

            {/* Botón snap a ubicación GPS */}
            <button
              onClick={handleSnapToUserLocation}
              disabled={!userLocation?.position || !coords.length}
              title={userLocation?.position ? 'Usar mi ubicación como salida' : 'GPS no disponible'}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                userLocation?.position && coords.length
                  ? 'bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-100 hover:border-blue-300'
                  : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
            >
              <LocationIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Punto de destino */}
          <button
            onClick={() => setSelectionMode(selectionMode === 'destination' ? null : 'destination')}
            className={`w-full h-9 px-3 rounded-lg border transition-all text-left flex items-center gap-2 ${
              selectionMode === 'destination'
                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                : destinationPoint
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
              selectionMode === 'destination'
                ? 'bg-white/25 text-white'
                : destinationPoint
                ? 'bg-red-500 text-white'
                : 'bg-slate-200 text-slate-400'
            }`}>
              D
            </span>
            <span className="text-xs font-medium">
              {selectionMode === 'destination'
                ? 'Seleccionando destino…'
                : destinationPoint
                ? 'Destino seleccionado'
                : 'Fijar punto de destino'}
            </span>
          </button>

          {/* Limpiar */}
          {(departurePoint || destinationPoint) && (
            <button
              onClick={clearTripPoints}
              className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors text-center py-0.5"
            >
              Limpiar puntos
            </button>
          )}

          {/* Métricas */}
          {(departurePoint || destinationPoint) && (
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 mt-2">
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400 mb-0.5">Distancia</p>
                <p className="text-sm font-bold text-slate-700">
                  {distanceM !== null ? formatDistance(distanceM) : '—'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-400 mb-0.5">ETA unidad</p>
                <p className="text-sm font-bold text-slate-700">
                  {etaSeconds !== null
                    ? formatEta(etaSeconds)
                    : isSimulating
                    ? <span className="text-xs font-normal text-slate-400">Sin unidades</span>
                    : <span className="text-xs font-normal text-slate-400">pausado</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TripPlanner
