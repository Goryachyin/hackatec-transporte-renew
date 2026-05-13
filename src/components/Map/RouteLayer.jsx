import { GeoJSON } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'

function RouteLayer() {
  const routes = useAppStore((state) => state.routes)
  const activeRouteId = useAppStore((state) => state.activeRouteId)

  return routes.map((route) => {
    const isActive = route.id === activeRouteId
    return (
      <GeoJSON
        key={route.id}
        data={route.geojson}
        style={{
          color: isActive ? route.color : '#94a3b8',
          weight: isActive ? 5 : 2,
          opacity: isActive ? 0.9 : 0.4,
        }}
      />
    )
  })
}

export default RouteLayer
