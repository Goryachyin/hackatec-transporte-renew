import { Marker, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { memo } from 'react'
import { useAppStore } from '../../store/useAppStore'

const MAX_SEATS = 20

function getOccupancyColor(passengers) {
  if (passengers <= 5)  return { bg: '#22c55e', border: '#16a34a', label: 'Disponible' }
  if (passengers <= 18) return { bg: '#f59e0b', border: '#d97706', label: 'Medio lleno' }
  return               { bg: '#ef4444', border: '#dc2626', label: 'Lleno' }
}

function createUnitIcon(passengers, isAtStop) {
  const { bg, border } = getOccupancyColor(passengers)
  const pulse = isAtStop
    ? `<span style="
        position:absolute;inset:-5px;border-radius:50%;
        border:2px solid ${bg};opacity:0.6;
        animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;
      "></span>`
    : ''

  return divIcon({
    className: '',
    html: `
      <div style="position:relative;width:36px;height:36px;">
        ${pulse}
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:${bg};border:3px solid ${border};
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          flex-direction:column;gap:0;position:relative;
        ">
          <span style="font-size:14px;line-height:1;user-select:none;">🚌</span>
          <span style="
            font-size:9px;font-weight:700;color:white;line-height:1;
            text-shadow:0 1px 2px rgba(0,0,0,0.6);
          ">${passengers}</span>
        </div>
      </div>
      <style>
        @keyframes ping {
          75%,100%{transform:scale(1.8);opacity:0}
        }
      </style>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function UnitMarker({ unit }) {
  const setSelectedUnit = useAppStore((state) => state.setSelectedUnit)

  if (!unit.position) return null

  const passengers = unit.passengers ?? 0
  const { label } = getOccupancyColor(passengers)

  return (
    <Marker
      position={unit.position}
      icon={createUnitIcon(passengers, unit.isAtStop)}
      eventHandlers={{ click: () => setSelectedUnit(unit.id) }}
    >
      <Tooltip>
        <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
          <strong>{unit.name}</strong><br />
          🧍 {passengers}/{MAX_SEATS} · {label}
        </div>
      </Tooltip>
    </Marker>
  )
}

export default memo(UnitMarker)
