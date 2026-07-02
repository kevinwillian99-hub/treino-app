import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Dumbbell, Trash2, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface TreinoComAluno {
  id: string
  nome: string
  created_at: string
  data_inicio: string | null
  data_fim: string | null
  alunos: { nome: string } | null
}

export function Treinos() {
  const [treinos, setTreinos] = useState<TreinoComAluno[]>([])
  const [loading, setLoading] = useState(true)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  async function carregar() {
    const { data } = await supabase
      .from('treinos')
      .select('id, nome, created_at, data_inicio, data_fim, alunos(nome)')
      .order('created_at', { ascending: false })
    setTreinos((data as unknown as TreinoComAluno[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id: string) {
    await supabase.from('treino_exercicios').delete().eq('treino_id', id)
    await supabase.from('treinos').delete().eq('id', id)
    setExcluindoId(null)
    carregar()
  }

  function formatarData(d: string | null) {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {excluindoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="w-full max-w-sm text-center">
            <p className="mb-2 font-semibold">Excluir treino?</p>
            <p className="mb-6 text-sm text-white/50">Todos os exercícios desse treino serão removidos.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setExcluindoId(null)}>Cancelar</Button>
              <Button variant="secondary" className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10" onClick={() => excluir(excluindoId)}>Excluir</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Treinos</h1>
          <p className="text-sm text-white/40">{treinos.length} treinos criados</p>
        </div>
        <Link to="/treinador/treinos/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Treino
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : treinos.length === 0 ? (
        <p className="text-sm text-white/40">Nenhum treino criado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {treinos.map((t) => (
            <Card key={t.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                <Dumbbell className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.nome}</p>
                <p className="truncate text-xs text-white/40">{t.alunos?.nome ?? 'Aluno removido'}</p>
                {(t.data_inicio || t.data_fim) && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/30">
                    <Calendar className="h-3 w-3" />
                    {formatarData(t.data_inicio)} {t.data_fim ? `→ ${formatarData(t.data_fim)}` : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setExcluindoId(t.id)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/30 hover:bg-graphite-300 hover:text-red-400"
                title="Excluir treino"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
