import { useAppStore } from '../../store/useAppStore'

function SimulationControls() {
  const isSimulating = useAppStore((state) => state.isSimulating)
  const startSimulation = useAppStore((state) => state.startSimulation)
  const pauseSimulation = useAppStore((state) => state.pauseSimulation)
  const resetSimulation = useAppStore((state) => state.resetSimulation)

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
        Simulación
      </h2>
      <div className="flex gap-2">
        <button
          onClick={isSimulating ? pauseSimulation : startSimulation}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isSimulating
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSimulating ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={resetSimulation}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default SimulationControls
