import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Play, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { TreinoExercicio } from '@/types/treino'

interface TreinoAtual {
  id: string
  nome: string
  observacoes: string | null
}

export function StudentTreinos() {
  const { user } = useAuth()
  const [treino, setTreino] = useState<TreinoAtual | null>(null)
  const [exercicios, setExercicios] = useState<TreinoExercicio[]>([])
  const [loading, setLoading] = useState(true)
  const [videoAberto, setVideoAberto] = useState<string | null>(null)

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

      const { data: treinoData } = await supabase
        .from('treinos')
        .select('id, nome, observacoes')
        .eq('aluno_id', aluno.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (treinoData) {
        setTreino(treinoData)
        const { data: itens } = await supabase
          .from('treino_exercicios')
          .select('*, exercicio:exercicios(*)')
          .eq('treino_id', treinoData.id)
          .order('ordem')
        setExercicios((itens as unknown as TreinoExercicio[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function alternarConcluido(id: string, atual: boolean) {
    setExercicios((prev) =>
      prev.map((e) => ((e as any).id === id ? ({ ...e, concluido: !atual } as any) : e))
    )
    await supabase.from('treino_exercicios').update({ concluido: !atual }).eq('id', id)
  }

  if (loading) return <p className="text-sm text-white/40">Carregando treino...</p>

  if (!treino) {
    return (
      <div className="space-y-2 text-center">
        <h1 className="text-lg font-bold">Nenhum treino disponível</h1>
        <p className="text-sm text-white/40">Seu treinador ainda não cadastrou um treino para você.</p>
      </div>
    )
  }

  const concluidos = exercicios.filter((e: any) => e.concluido).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold">{treino.nome}</h1>
        <p className="text-sm text-white/40">
          {concluidos}/{exercicios.length} exercícios concluídos
        </p>
      </div>

      <Card className="p-0">
        {exercicios.map((item: any, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-graphite-200/60 px-4 py-3 last:border-0"
          >
            <button
              onClick={() => alternarConcluido(item.id, item.concluido)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              {item.concluido ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              ) : (
                <Circle className="h-5 w-5 flex-shrink-0 text-white/20" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${item.concluido ? 'text-white/40 line-through' : ''}`}
                >
                  {i + 1}. {item.exercicio?.nome}
                </p>
                <p className="text-xs text-white/40">
                  {item.series}x {item.repeticoes} · {item.carga}
                </p>
              </div>
            </button>
            {item.exercicio?.video_url && (
              <button
                onClick={() => setVideoAberto(item.exercicio!.video_url!)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </Card>

      {treino.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <p className="text-sm text-white/60">{treino.observacoes}</p>
        </Card>
      )}

      {videoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setVideoAberto(null)}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVideoAberto(null)} className="absolute -top-10 right-0 text-white/70">
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe src={videoAberto} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
