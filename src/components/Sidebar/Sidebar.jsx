import { useState } from 'react'
import UnitList from './UnitList'
import RouteSelector from './RouteSelector'
import SimulationControls from '../UI/SimulationControls'
import TripPlanner from './TripPlanner'
import { BusIcon, ChevronDownIcon } from '../UI/Icons'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <aside
      className="sidebar-sheet fixed bottom-0 left-0 right-0 z-[2000] flex flex-col bg-slate-50 overflow-hidden rounded-t-2xl"
      style={{
        maxHeight: isOpen ? '85vh' : '80px',
        transition: 'max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.13)',
      }}
    >
      {/* Header — también actúa como toggle en móvil */}
      <div
        className="bg-blue-600 shrink-0 cursor-pointer select-none rounded-t-2xl"
        onClick={() => setIsOpen((o) => !o)}
        role="button"
        aria-expanded={isOpen}
        aria-label="Abrir / cerrar panel"
      >
        {/* Handle pill — solo móvil */}
        <div className="flex justify-center pt-2.5 pb-1 md:hidden">
          <div className="w-9 h-1 rounded-full bg-white/40" />
        </div>

        <div className="px-4 pb-3.5 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
            <BusIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white leading-none tracking-wide">SITMACA</h1>
            <p className="text-xs text-blue-200 mt-0.5">Monitoreo de transporte en tiempo real</p>
          </div>
          {/* Chevron — solo móvil */}
          <ChevronDownIcon
            className={`md:hidden w-5 h-5 text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
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
