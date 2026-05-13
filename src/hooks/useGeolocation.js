import { useState, useEffect } from 'react'

/**
 * Hook que expone la posición actual del usuario mediante la Geolocation API.
 * Solo funciona en HTTPS o localhost.
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null)   // [lat, lng]
  const [accuracy, setAccuracy] = useState(0)       // metros
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La Geolocation API no está disponible en este navegador.')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude])
        setAccuracy(pos.coords.accuracy)
        setError(null)
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { position, accuracy, error }
}
