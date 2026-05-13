/**
 * Librería de iconos SVG inline — Material Design 3 / stroke style.
 * Todos usan currentColor → controlados con clases text-* de Tailwind.
 * viewBox 0 0 24 24, strokeWidth 1.75, strokeLinecap/join round.
 */

function Svg({ children, className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function BusIcon({ className }) {
  return (
    <Svg className={className}>
      <rect x="3" y="5.5" width="18" height="11" rx="1.5" />
      <path d="M3 11h18" />
      <path d="M8 16.5v1.5" />
      <path d="M16 16.5v1.5" />
      <circle cx="8" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <rect x="5.5" y="7" width="4" height="3" rx="0.75" />
      <rect x="14.5" y="7" width="4" height="3" rx="0.75" />
    </Svg>
  )
}

export function PlayIcon({ className }) {
  return (
    <Svg className={className}>
      <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function PauseIcon({ className }) {
  return (
    <Svg className={className}>
      <rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function ResetIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </Svg>
  )
}

export function LocationIcon({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="2" x2="12" y2="5.5" />
      <line x1="12" y1="18.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5.5" y2="12" />
      <line x1="18.5" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function RouteMapIcon({ className }) {
  return (
    <Svg className={className}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </Svg>
  )
}

export function ChevronDownIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function TapIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M9 11V6a3 3 0 0 1 6 0v5" />
      <path d="M9 11H7.5a2.5 2.5 0 0 0 0 5H12c2.76 0 5-2.24 5-5h-3" />
    </Svg>
  )
}
