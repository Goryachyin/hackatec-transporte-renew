import UnitList from './UnitList'
import RouteSelector from './RouteSelector'
import SimulationControls from '../UI/SimulationControls'

function Sidebar() {
  return (
    <aside className="w-72 h-full flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">Trackeo de Unidades</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <SimulationControls />
        <RouteSelector />
        <UnitList />
      </div>
    </aside>
  )
}

export default Sidebar
