import { useAppStore } from '../../store/useAppStore'
import Slider from './Slider'
import { PlayIcon, PauseIcon, ResetIcon } from './Icons'

function SimulationControls() {
  const isSimulating = useAppStore((state) => state.isSimulating)
  const startSimulation = useAppStore((state) => state.startSimulation)
  const pauseSimulation = useAppStore((state) => state.pauseSimulation)
  const resetSimulation = useAppStore((state) => state.resetSimulation)
  const simSpeed = useAppStore((state) => state.simSpeed)
  const setSimSpeed = useAppStore((state) => state.setSimSpeed)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Simulación
      </p>

      {/* Controles play / reset */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={isSimulating ? pauseSimulation : startSimulation}
          className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            isSimulating
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {isSimulating
            ? <PauseIcon className="w-4 h-4" />
            : <PlayIcon className="w-4 h-4" />}
          {isSimulating ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={resetSimulation}
          title="Reiniciar simulación"
          className="h-9 w-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
        >
          <ResetIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Separador */}
      <div className="border-t border-slate-100 mb-4" />

      {/* Slider de velocidad */}
      <Slider
        value={simSpeed}
        onChange={setSimSpeed}
        min={0.5}
        max={3}
        step={0.5}
        label="Velocidad"
        formatValue={(v) => `${v}x`}
        minLabel="Lento"
        maxLabel="Rápido"
      />
    </div>
  )
}

export default SimulationControls
