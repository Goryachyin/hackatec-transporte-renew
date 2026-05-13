import { create } from 'zustand'
import { ROUTES } from '../routes/routeRegistry'
import { extractCoordinates, interpolatePosition } from '../utils/interpolate'

// Posición inicial de cada unidad: primer punto de su ruta
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
  // --- Rutas GeoJSON ---
  routes: ROUTES,
  activeRouteId: null,

  setActiveRoute: (routeId) =>
    set({ activeRouteId: routeId }),

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
