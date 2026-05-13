import UnitList from './UnitList'
import RouteSelector from './RouteSelector'
import SimulationControls from '../UI/SimulationControls'
import TripPlanner from './TripPlanner'

function Sidebar() {
  return (
    <aside className="w-72 h-full flex flex-col bg-slate-50 border-r border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-4 py-3.5 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg select-none">
          🚌
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-none tracking-wide">TransTrack</h1>
          <p className="text-xs text-blue-200 mt-0.5">Monitoreo en tiempo real</p>
        </div>
      </div>

      {/* Secciones */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <SimulationControls />
        <RouteSelector />
        <TripPlanner />
        <UnitList />
      </div>
    </aside>
  )
}

export default Sidebar
