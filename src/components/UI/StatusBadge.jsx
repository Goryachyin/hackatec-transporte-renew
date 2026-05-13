const STATUS_CONFIG = {
  'on-route': { label: 'En ruta',   dot: 'bg-blue-500',    className: 'bg-blue-50 text-blue-700 border-blue-100' },
  stopped:    { label: 'Detenido',  dot: 'bg-amber-400',   className: 'bg-amber-50 text-amber-700 border-amber-100' },
  arrived:    { label: 'Llegó',     dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status, dot: 'bg-slate-400', className: 'bg-slate-50 text-slate-600 border-slate-100',
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default StatusBadge
