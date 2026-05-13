import { useAppStore } from '../../store/useAppStore'

function RouteSelector() {
  const routes = useAppStore((state) => state.routes)
  const activeRouteId = useAppStore((state) => state.activeRouteId)
  const setActiveRoute = useAppStore((state) => state.setActiveRoute)

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
        Ruta activa
      </h2>
      <select
        value={activeRouteId ?? ''}
        onChange={(e) => setActiveRoute(e.target.value || null)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">— Sin ruta seleccionada —</option>
        {routes.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default RouteSelector
