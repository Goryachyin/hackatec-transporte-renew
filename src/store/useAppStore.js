import { create } from 'zustand'
import { ROUTES } from '../routes/routeRegistry'
import { extractCoordinates, interpolatePosition } from '../utils/interpolate'

function getInitialPosition(routeId) {
  const route = ROUTES.find((r) => r.id === routeId)
  if (!route) return null
  const coords = extractCoordinates(route.geojson)
  return coords.length ? coords[0] : null
}


const MAX_SEATS = 20

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeInitialUnit(id, name, routeId) {
  return {
    id,
    name,
    routeId,
    progress: 0,
    position: getInitialPosition(routeId),
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
  // Lógica:
  //   1. Si el deviceId ya tiene hasRealData=true → actualizar posición (dispositivo real conocido)
  //   2. Si el deviceId existe pero es unidad simulada (hasRealData=false) → ignorar, no interferir
  //   3. Si el deviceId es desconocido → crear nueva unidad dinámica con hasRealData=true
  updateUnitFromTelemetry: (deviceId, position, speed) =>
    set((state) => {
      const existing = state.units.find((u) => u.id === deviceId)

      // Caso 1: dispositivo real ya registrado → solo actualizar posición
      if (existing?.hasRealData) {
        return {
          units: state.units.map((u) =>
            u.id === deviceId
              ? { ...u, position, speed, status: 'on-route' }
              : u
          ),
        }
      }

      // Caso 2: coincide con unidad simulada → no interferir con la simulación
      if (existing && !existing.hasRealData) return state

      // Caso 3: deviceId desconocido → crear nueva unidad dinámica
      const realCount = state.units.filter((u) => u.hasRealData).length + 1
      return {
        units: [
          ...state.units,
          {
            id: deviceId,
            name: `Dispositivo ${String(realCount).padStart(2, '0')}`,
            routeId: null,   // sin ruta asignada — posición libre en el mapa
            progress: 0,
            position,
            speed,
            status: 'on-route',
            passengers: 0,
            stepsUntilNextStop: 0,
            isAtStop: false,
            stopDelta: null,
            hasRealData: true,
          },
        ],
      }
    }),

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
