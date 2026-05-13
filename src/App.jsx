import MapView from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import { useUnitSimulation } from './hooks/useUnitSimulation'

function App() {
  // Inicia el motor de simulación globalmente
  useUnitSimulation()

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1 relative">
        <MapView />
      </main>
    </div>
  )
}

export default App
