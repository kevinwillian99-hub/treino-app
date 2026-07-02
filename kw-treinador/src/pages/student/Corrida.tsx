import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DiaCorrida {
  id: string
  dia_semana: string
  tipo: string
  distancia_km: number | null
  ritmo: string | null
  concluido: boolean
}

const tipoCor: Record<string, string> = {
  REG: 'text-blue-300 bg-blue-400/10',
  ROD: 'text-emerald-300 bg-emerald-400/10',
  RUN: 'text-gold bg-gold/10',
  LG: 'text-purple-300 bg-purple-400/10',
  INT: 'text-red-300 bg-red-400/10',
  FAR: 'text-orange-300 bg-orange-400/10',
  AQC: 'text-cyan-300 bg-cyan-400/10',
  OFF: 'text-white/30 bg-white/5',
}

const diasOrdem = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const hojeIndex = (new Date().getDay() + 6) % 7 // 0 = Monday

export function StudentCorrida() {
  const { user } = useAuth()
  const [nomePlano, setNomePlano] = useState('')
  const [dias, setDias] = useState<DiaCorrida[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!aluno) {
        setLoading(false)
        return
      }
      const { data: plano } = await supabase
        .from('planos_corrida')
        .select('id, nome')
        .eq('aluno_id', aluno.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (plano) {
        setNomePlano(plano.nome)
        const { data: diasData } = await supabase
          .from('corrida_dias')
          .select('*')
          .eq('plano_id', plano.id)
        const ordenado = (diasData ?? []).sort(
          (a, b) => diasOrdem.indexOf(a.dia_semana) - diasOrdem.indexOf(b.dia_semana)
        )
        setDias(ordenado as DiaCorrida[])
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function marcarConcluido(id: string, atual: boolean) {
    setDias(dias.map((d) => (d.id === id ? { ...d, concluido: !atual } : d)))
    await supabase.from('corrida_dias').update({ concluido: !atual }).eq('id', id)
  }

  if (loading) return <p className="text-sm text-white/40">Carregando plano...</p>

  if (!nomePlano) {
    return (
      <div className="space-y-2 text-center">
        <h1 className="text-lg font-bold">Nenhum plano de corrida</h1>
        <p className="text-sm text-white/40">Seu treinador ainda não cadastrou um plano para você.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold">Plano de Corrida</h1>
        <p className="text-sm text-white/40">{nomePlano}</p>
      </div>

      <div className="space-y-2">
        {dias.map((dia, i) => (
          <div
            key={dia.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-graphite-100 bg-graphite-400 px-4 py-3',
              i === hojeIndex && 'border-gold/40 bg-gold/5'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${tipoCor[dia.tipo]}`}>
                {dia.tipo}
              </span>
              <div>
                <p className="text-sm font-medium">{dia.dia_semana}</p>
                <p className="text-xs text-white/40">
                  {dia.distancia_km ? `${dia.distancia_km} km` : '—'}
                  {dia.ritmo ? ` · ${dia.ritmo}` : ''}
                </p>
              </div>
            </div>
            {dia.tipo !== 'OFF' && (
              <button onClick={() => marcarConcluido(dia.id, dia.concluido)}>
                {dia.concluido ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5 text-white/20" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <Button className="w-full">Iniciar Corrida</Button>
    </div>
  )
}
