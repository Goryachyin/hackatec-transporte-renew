import { useEffect } from 'react'
import MapView from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import { useUnitSimulation } from './hooks/useUnitSimulation'
import { useGeolocation } from './hooks/useGeolocation'
import { useRealtimeTelemetry } from './hooks/useRealtimeTelemetry'
import { useAppStore } from './store/useAppStore'

function App() {
  useUnitSimulation()
  useRealtimeTelemetry()

  // Fuente única de geolocalización: sincroniza con el store global
  const { position, accuracy } = useGeolocation()
  const setUserLocation = useAppStore((s) => s.setUserLocation)

  useEffect(() => {
    if (position) {
      setUserLocation({ position, accuracy })
    }
  }, [position, accuracy, setUserLocation])

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
