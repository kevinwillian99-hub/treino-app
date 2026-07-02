import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'

interface Evento {
  id: string
  titulo: string
  tipo: string
  data_hora: string
  status: string
}

const statusCor: Record<string, string> = {
  Confirmado: 'text-emerald-300 bg-emerald-400/10',
  Pendente: 'text-amber-300 bg-amber-400/10',
  Cancelado: 'text-red-300 bg-red-400/10',
}

export function StudentAgenda() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (aluno) {
        const hoje = new Date().toISOString().slice(0, 10)
        const { data } = await supabase
          .from('agenda_eventos')
          .select('id, titulo, tipo, data_hora, status')
          .eq('aluno_id', aluno.id)
          .gte('data_hora', hoje)
          .order('data_hora')
        setEventos((data as Evento[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">Agenda</h1>

      {eventos.length === 0 ? (
        <p className="text-sm text-white/40">Nenhum evento agendado.</p>
      ) : (
        <div className="space-y-2">
          {eventos.map((ev) => {
            const dt = new Date(ev.data_hora)
            return (
              <Card key={ev.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                    <CalendarIcon className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ev.titulo}</p>
                    <p className="text-xs text-white/40">
                      {ev.tipo} · {dt.toLocaleDateString('pt-BR')} às{' '}
                      {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusCor[ev.status]}`}>
                  {ev.status}
                </span>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
