import { useAppStore } from '../../store/useAppStore'

function RouteSelector() {
  const routes = useAppStore((state) => state.routes)
  const activeRouteId = useAppStore((state) => state.activeRouteId)
  const setActiveRoute = useAppStore((state) => state.setActiveRoute)

  const activeRoute = routes.find((r) => r.id === activeRouteId)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Ruta activa
      </p>
      <div className="relative">
        <select
          value={activeRouteId ?? ''}
          onChange={(e) => setActiveRoute(e.target.value || null)}
          className="w-full h-9 pl-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
        >
          <option value="">— Sin seleccionar —</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs select-none">▾</span>
      </div>
      {activeRoute && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: activeRoute.color }}
          />
          <span className="text-xs text-slate-500 truncate">{activeRoute.name}</span>
        </div>
      )}
    </div>
  )
}

export default RouteSelector
