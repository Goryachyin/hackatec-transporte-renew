import { useAppStore } from '../../store/useAppStore'

function SimulationControls() {
  const isSimulating = useAppStore((state) => state.isSimulating)
  const startSimulation = useAppStore((state) => state.startSimulation)
  const pauseSimulation = useAppStore((state) => state.pauseSimulation)
  const resetSimulation = useAppStore((state) => state.resetSimulation)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Simulación
      </p>
      <div className="flex gap-2">
        <button
          onClick={isSimulating ? pauseSimulation : startSimulation}
          className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            isSimulating
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          <span className="text-base leading-none">{isSimulating ? '⏸' : '▶'}</span>
          {isSimulating ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={resetSimulation}
          title="Reiniciar simulación"
          className="h-9 w-9 rounded-lg text-base font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
        >
          ↺
        </button>
      </div>
    </div>
  )
}

export default SimulationControls
