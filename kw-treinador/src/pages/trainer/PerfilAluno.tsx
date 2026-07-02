import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ClipboardCheck, Dumbbell, Plus, Trash2,
  Calendar, CreditCard, ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Aluno } from '@/types'

interface Avaliacao {
  id: string
  data: string
  peso: number | null
}

interface Treino {
  id: string
  nome: string
  data_inicio: string | null
  data_fim: string | null
  created_at: string
}

export function PerfilAluno() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [aluno, setAluno] = useState<Aluno | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [loading, setLoading] = useState(true)
  const [excluindoTreino, setExcluindoTreino] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: a }, { data: av }, { data: tr }] = await Promise.all([
        supabase.from('alunos').select('*').eq('id', id).single(),
        supabase.from('avaliacoes').select('id, data, peso').eq('aluno_id', id).order('data', { ascending: false }),
        supabase.from('treinos').select('id, nome, data_inicio, data_fim, created_at').eq('aluno_id', id).order('created_at', { ascending: false }),
      ])
      setAluno(a as Aluno)
      setAvaliacoes((av ?? []) as Avaliacao[])
      setTreinos((tr ?? []) as Treino[])
      setLoading(false)
    }
    load()
  }, [id])

  async function excluirTreino(treinoId: string) {
    await supabase.from('treino_exercicios').delete().eq('treino_id', treinoId)
    await supabase.from('treinos').delete().eq('id', treinoId)
    setTreinos((prev) => prev.filter((t) => t.id !== treinoId))
    setExcluindoTreino(null)
  }

  function formatarData(d: string | null) {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-BR')
  }

  if (loading) return <div className="p-8 text-white/40">Carregando...</div>
  if (!aluno) return <div className="p-8 text-white/40">Aluno não encontrado.</div>

  const iniciais = aluno.nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()

  return (
    <div className="space-y-6">
      {/* Modal confirmação excluir treino */}
      {excluindoTreino && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="w-full max-w-sm text-center">
            <p className="mb-2 font-semibold">Excluir este treino?</p>
            <p className="mb-6 text-sm text-white/50">Todos os exercícios serão removidos. Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setExcluindoTreino(null)}>Cancelar</Button>
              <Button variant="secondary" className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10" onClick={() => excluirTreino(excluindoTreino)}>Excluir</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Voltar */}
      <button
        onClick={() => navigate('/treinador/alunos')}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Alunos
      </button>

      {/* Card principal do aluno */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-xl font-bold text-gold">
            {iniciais}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold leading-tight">{aluno.nome}</h1>
            <p className="text-sm text-white/40">{aluno.email}</p>
            {aluno.objetivo && (
              <span className="mt-1 inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                {aluno.objetivo}
              </span>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
            <Link to={`/treinador/alunos/${id}/editar`}>
              <Button variant="secondary" size="sm">Editar</Button>
            </Link>
          </div>
        </div>
        {(aluno.telefone || aluno.modalidade) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-graphite-200 pt-4">
            {aluno.telefone && (
              <span className="rounded-full bg-graphite-300 px-3 py-1 text-xs text-white/60">{aluno.telefone}</span>
            )}
            {aluno.modalidade && (
              <span className="rounded-full bg-graphite-300 px-3 py-1 text-xs text-white/60">
                {aluno.modalidade}{aluno.plano ? ` · ${aluno.plano}` : ''}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Avaliação Postural */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/50">
            Avaliações Posturais
          </h2>
          <Link to={`/treinador/avaliacoes?aluno=${id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Nova Avaliação
            </Button>
          </Link>
        </div>
        {avaliacoes.length === 0 ? (
          <Card className="py-8 text-center">
            <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">Nenhuma avaliação registrada.</p>
            <p className="mt-1 text-xs text-white/25">Clique em Nova Avaliação para começar.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {avaliacoes.map((av) => (
              <Link
                key={av.id}
                to={`/treinador/avaliacoes/${av.id}`}
                className="flex items-center gap-3 rounded-xl border border-graphite-100 bg-graphite-400 px-4 py-3 hover:border-gold/30"
              >
                <ClipboardCheck className="h-5 w-5 flex-shrink-0 text-gold" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Avaliação de {formatarData(av.data)}</p>
                  {av.peso && <p className="text-xs text-white/40">Peso: {av.peso} kg</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-white/20" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Treinos / Mesociclos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/50">
            Planos de Treino
          </h2>
          <Link to={`/treinador/treinos/novo?aluno=${id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          </Link>
        </div>
        {treinos.length === 0 ? (
          <Card className="py-8 text-center">
            <Dumbbell className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">Nenhum plano criado ainda.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {treinos.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-graphite-100 bg-graphite-400 px-4 py-3"
              >
                <Dumbbell className="h-5 w-5 flex-shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.nome}</p>
                  {(t.data_inicio || t.data_fim) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                      <Calendar className="h-3 w-3" />
                      {formatarData(t.data_inicio)}
                      {t.data_fim ? ` → ${formatarData(t.data_fim)}` : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setExcluindoTreino(t.id)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/30 hover:text-red-400"
                  title="Excluir plano"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
