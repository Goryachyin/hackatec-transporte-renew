/**
 * Slider reutilizable — Material Design 3 / cobalt blue.
 *
 * Props:
 *   value        number   — valor actual
 *   onChange     fn       — callback (number) => void
 *   min          number   — mínimo (default 0)
 *   max          number   — máximo (default 100)
 *   step         number   — paso (default 1)
 *   label        string   — etiqueta izquierda
 *   formatValue  fn       — formatea el valor para mostrar (default: v => v)
 *   minLabel     string   — etiqueta bajo el extremo izquierdo
 *   maxLabel     string   — etiqueta bajo el extremo derecho
 */
function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue,
  minLabel,
  maxLabel,
}) {
  const pct = `${((value - min) / (max - min)) * 100}%`
  const display = formatValue ? formatValue(value) : String(value)

  return (
    <div>
      {/* Cabecera: etiqueta + valor actual */}
      {(label || display) && (
        <div className="flex items-center justify-between mb-3">
          {label && (
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
              {label}
            </span>
          )}
          <span className="text-sm font-bold text-blue-600 tabular-nums">
            {display}
          </span>
        </div>
      )}

      {/* Track */}
      <div className="relative flex items-center" style={{ paddingBlock: '6px' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="tk-slider"
          style={{ '--slider-pct': pct }}
        />
      </div>

      {/* Etiquetas extremos */}
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-1.5 px-0.5">
          <span className="text-xs text-slate-400 select-none">{minLabel ?? ''}</span>
          <span className="text-xs text-slate-400 select-none">{maxLabel ?? ''}</span>
        </div>
      )}
    </div>
  )
}

export default Slider
