import { Construction } from 'lucide-react'

export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
        <Construction className="h-6 w-6 text-gold" />
      </div>
      <h1 className="text-lg font-bold">{titulo}</h1>
      <p className="mt-1 text-sm text-white/40">Este módulo será construído na próxima etapa.</p>
    </div>
  )
}
