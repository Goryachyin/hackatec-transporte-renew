import { create } from 'zustand'
import { ROUTES } from '../routes/routeRegistry'
import { extractCoordinates, interpolatePosition } from '../utils/interpolate'

function getInitialPosition(routeId, progress = 0) {
  const route = ROUTES.find((r) => r.id === routeId)
  if (!route) return null
  const coords = extractCoordinates(route.geojson)
  if (!coords.length) return null
  return progress > 0 ? interpolatePosition(coords, progress) : coords[0]
}


const MAX_SEATS = 20

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeInitialUnit(id, name, routeId, initialProgress = 0) {
  return {
    id,
    name,
    routeId,
    progress: initialProgress,
    position: getInitialPosition(routeId, initialProgress),
    speed: 1,
    status: 'on-route',
    passengers: randInt(0, 5),
    stepsUntilNextStop: randInt(8, 20),
    isAtStop: false,
    stopDelta: null, // { boarded, alighted } — se limpia tras ~2 s
    hasRealData: false, // true cuando la unidad recibe telemetría real del backend
  }
}

const INITIAL_UNITS = [
  makeInitialUnit('unit-01', 'Unidad 01', 'ruta-coloso'),
  makeInitialUnit('unit-02', 'Unidad 02', 'ruta-rena'),
  makeInitialUnit('unit-03', 'Unidad 03', 'ruta-vacacional'),
  makeInitialUnit('unit-04', 'Unidad 04', 'ruta-coloso', 0.5),
]

/**
 * Store global de la aplicación usando Zustand.
 * Se inicializa con las rutas reales del routeRegistry y 3 unidades demo.
 */
export const useAppStore = create((set) => ({
  // --- Geolocalización del usuario (fuente única: App.jsx) ---
  userLocation: null,
  setUserLocation: (data) => set({ userLocation: data }),

  // --- Comandos de navegación del mapa ---
  flyToRoutesRequested: false,
  flyToUserRequested: false,
  requestFlyToRoutes: () => set({ flyToRoutesRequested: true }),
  clearFlyToRoutes: () => set({ flyToRoutesRequested: false }),
  requestFlyToUser: () => set({ flyToUserRequested: true }),
  clearFlyToUser: () => set({ flyToUserRequested: false }),

  // --- Rutas GeoJSON ---
  routes: ROUTES,
  activeRouteId: null,

  // Al cambiar la ruta activa se limpian los puntos del planificador
  setActiveRoute: (routeId) =>
    set({
      activeRouteId: routeId,
      departurePoint: null,
      destinationPoint: null,
      selectionMode: null,
    }),

  // --- Unidades ---
  units: INITIAL_UNITS,
  selectedUnitId: null,

  addUnit: (unit) =>
    set((state) => ({ units: [...state.units, unit] })),

  updateUnitPosition: (id, position, progress, status) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === id ? { ...u, position, progress, status } : u
      ),
    })),

  updateUnitPassengers: (id, passengers, stopDelta, stepsUntilNextStop) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === id
          ? { ...u, passengers, isAtStop: true, stopDelta, stepsUntilNextStop }
          : u
      ),
    })),

  clearUnitStop: (id) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === id ? { ...u, isAtStop: false, stopDelta: null } : u
      ),
    })),

  setSelectedUnit: (id) =>
    set({ selectedUnitId: id }),

  setUnitSpeed: (id, speed) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === id ? { ...u, speed } : u
      ),
    })),

  // Actualiza una unidad con datos reales del backend (Socket.io).
  // Marca hasRealData=true para que la simulación no sobreescriba su posición.
  updateUnitFromTelemetry: (deviceId, position, speed) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === deviceId
          ? { ...u, position, speed, status: 'on-route', hasRealData: true }
          : u
      ),
    })),

  // --- Planificador de viaje ---
  selectionMode: null,      // 'departure' | 'destination' | null
  departurePoint: null,     // { index, position: [lat, lng] }
  destinationPoint: null,   // { index, position: [lat, lng] }

  setSelectionMode: (mode) => set({ selectionMode: mode }),
  setDeparturePoint: (point) => set({ departurePoint: point, selectionMode: null }),
  setDestinationPoint: (point) => set({ destinationPoint: point, selectionMode: null }),
  clearTripPoints: () =>
    set({ departurePoint: null, destinationPoint: null, selectionMode: null }),

  // --- Simulación ---
  isSimulating: false,
  simSpeed: 1,             // multiplicador global de velocidad (0.5 – 3)

  startSimulation: () => set({ isSimulating: true }),
  pauseSimulation: () => set({ isSimulating: false }),
  setSimSpeed: (simSpeed) => set({ simSpeed }),
  resetSimulation: () =>
    set((state) => ({
      isSimulating: false,
      units: state.units.map((u) => ({
        ...u,
        progress: 0,
        position: getInitialPosition(u.routeId),
        status: 'on-route',
        passengers: randInt(0, 5),
        stepsUntilNextStop: randInt(8, 20),
        isAtStop: false,
        stopDelta: null,
        hasRealData: false,
      })),
    })),
}))
