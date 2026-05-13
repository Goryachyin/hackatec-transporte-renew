import { create } from 'zustand'
import { ROUTES } from '../routes/routeRegistry'
import { extractCoordinates, interpolatePosition } from '../utils/interpolate'

function getInitialPosition(routeId) {
  const route = ROUTES.find((r) => r.id === routeId)
  if (!route) return null
  const coords = extractCoordinates(route.geojson)
  return coords.length ? coords[0] : null
}


const INITIAL_UNITS = [
  {
    id: 'unit-01',
    name: 'Unidad 01',
    routeId: 'ruta-coloso',
    progress: 0,
    position: getInitialPosition('ruta-coloso'),
    speed: 1,
    status: 'on-route',
  },
  {
    id: 'unit-02',
    name: 'Unidad 02',
    routeId: 'ruta-rena',
    progress: 0,
    position: getInitialPosition('ruta-rena'),
    speed: 1,
    status: 'on-route',
  },
  {
    id: 'unit-03',
    name: 'Unidad 03',
    routeId: 'ruta-vacacional',
    progress: 0,
    position: getInitialPosition('ruta-vacacional'),
    speed: 1,
    status: 'on-route',
  },
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

  setSelectedUnit: (id) =>
    set({ selectedUnitId: id }),

  setUnitSpeed: (id, speed) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === id ? { ...u, speed } : u
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

  startSimulation: () => set({ isSimulating: true }),
  pauseSimulation: () => set({ isSimulating: false }),
  resetSimulation: () =>
    set((state) => ({
      isSimulating: false,
      units: state.units.map((u) => ({
        ...u,
        progress: 0,
        position: getInitialPosition(u.routeId),
        status: 'on-route',
      })),
    })),
}))
