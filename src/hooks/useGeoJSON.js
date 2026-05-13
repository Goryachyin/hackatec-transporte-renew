import { useState } from 'react'

/**
 * Hook para cargar y parsear un archivo GeoJSON desde /src/assets/geojson/.
 * Vite permite importar JSON estáticamente; este hook gestiona cargas dinámicas
 * por nombre de archivo en tiempo de ejecución.
 */
export function useGeoJSON() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadGeoJSON(url) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error al cargar GeoJSON: ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, error, loading, loadGeoJSON }
}
