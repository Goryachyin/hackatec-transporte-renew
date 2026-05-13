const STATUS_CONFIG = {
  'on-route': { label: 'En ruta', className: 'bg-blue-100 text-blue-700' },
  stopped:    { label: 'Detenido', className: 'bg-yellow-100 text-yellow-700' },
  arrived:    { label: 'Llegó', className: 'bg-green-100 text-green-700' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge
