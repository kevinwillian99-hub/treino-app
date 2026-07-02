import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function SecaoPostural({
  titulo,
  children,
}: {
  titulo: string
  children: ReactNode
}) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-graphite-100 bg-graphite-400">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-white/80"
      >
        {titulo}
        <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && <div className="space-y-3 border-t border-graphite-200 px-4 py-4">{children}</div>}
    </div>
  )
}

export function LadoPostural({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-red-400">{titulo}</p>
      {children}
    </div>
  )
}

export function CampoPostural({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      {label && <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/40">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-graphite-100 bg-graphite-300 px-4 pr-9 text-sm text-white focus:border-gold focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
      </div>
    </div>
  )
}
