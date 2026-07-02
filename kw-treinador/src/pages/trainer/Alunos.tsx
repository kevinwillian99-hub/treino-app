import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Aluno } from '@/types'

const statusColor: Record<string, string> = {
  Ativo: 'text-emerald-400 bg-emerald-400/10',
  Pausado: 'text-amber-400 bg-amber-400/10',
  Cancelado: 'text-red-400 bg-red-400/10',
}

function calcularIdade(nascimento: string | null): string | null {
  if (!nascimento) return null
  const hoje = new Date()
  const nasc = new Date(nascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const mes = hoje.getMonth() - nasc.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--
  return `${idade} anos`
}

function formatarUltimoTreino(data: string | null): string | null {
  if (!data) return null
  return `Último treino: ${new Date(data).toLocaleDateString('pt-BR')}`
}

export function Alunos() {
  const navigate = useNavigate()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [ultimosTreinos, setUltimosTreinos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  async function carregar() {
    const { data: alunosData } = await supabase.from('alunos').select('*').order('nome', { ascending: true })
    setAlunos((alunosData as Aluno[]) ?? [])

    // Busca o treino mais recente de cada aluno
    const { data: treinos } = await supabase
      .from('treinos')
      .select('aluno_id, created_at')
      .order('created_at', { ascending: false })

    if (treinos) {
      const map: Record<string, string> = {}
      treinos.forEach((t: { aluno_id: string; created_at: string }) => {
        if (!map[t.aluno_id]) map[t.aluno_id] = t.created_at
      })
      setUltimosTreinos(map)
    }

    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id: string) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const { data, error } = await supabase.functions.invoke('excluir-aluno', {
      body: { alunoId: id },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (error || data?.error) {
      alert(data?.error ?? 'Erro ao excluir aluno.')
    }
    setExcluindoId(null)
    carregar()
  }

  const filtrados = alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alunos</h1>
          <p className="text-sm text-white/40">{alunos.length} alunos cadastrados</p>
        </div>
        <Link to="/treinador/alunos/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          placeholder="Buscar aluno..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-white/40">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <p className="p-6 text-sm text-white/40">Nenhum aluno encontrado.</p>
        ) : (
          <>
            {/* Celular: cards estilo FisicSoft */}
            <div className="space-y-3 p-4 sm:hidden">
              {filtrados.map((aluno) => (
                <div
                  key={aluno.id}
                  onClick={() => navigate(`/treinador/alunos/${aluno.id}`)}
                  className="cursor-pointer rounded-2xl border border-graphite-100 bg-graphite-400 p-4 transition-colors hover:border-gold/30"
                >
                  {/* Topo: avatar + nome + ações */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/60 to-gold/20 text-lg font-bold text-graphite-600">
                      {aluno.nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold leading-tight">{aluno.nome}</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[aluno.status]}`}>
                        {aluno.status}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/treinador/alunos/${aluno.id}/editar`)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-graphite-100 text-white/40 hover:text-gold"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setExcluindoId(aluno.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-graphite-100 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags das 4 informações */}
                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <span className="truncate rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold">
                      {aluno.email ?? ''}
                    </span>
                    <span className="rounded-full border border-graphite-100 px-2.5 py-1 text-center text-[10px] text-white/60">
                      {aluno.nascimento ? calcularIdade(aluno.nascimento) : ''}
                    </span>
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold">
                      {aluno.telefone ?? ''}
                    </span>
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold">
                      {ultimosTreinos[aluno.id] ? formatarUltimoTreino(ultimosTreinos[aluno.id]) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: grid de cards igual ao mobile */}
            <div className="hidden gap-4 p-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((aluno) => (
                <div
                  key={aluno.id}
                  onClick={() => navigate(`/treinador/alunos/${aluno.id}`)}
                  className="cursor-pointer rounded-2xl border border-graphite-100 bg-graphite-400 p-4 transition-colors hover:border-gold/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/60 to-gold/20 text-lg font-bold text-graphite-600">
                      {aluno.nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold leading-tight">{aluno.nome}</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[aluno.status]}`}>
                        {aluno.status}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/treinador/alunos/${aluno.id}/editar`)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-graphite-100 text-white/40 hover:text-gold">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setExcluindoId(aluno.id)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-graphite-100 text-white/40 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <span className="truncate rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold">{aluno.email ?? ''}</span>
                    <span className="rounded-full border border-graphite-100 px-2.5 py-1 text-center text-[10px] text-white/60">{aluno.nascimento ? calcularIdade(aluno.nascimento) : ''}</span>
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold">{aluno.telefone ?? ''}</span>
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold">{ultimosTreinos[aluno.id] ? formatarUltimoTreino(ultimosTreinos[aluno.id]) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {excluindoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <Card className="w-full max-w-sm">
            <p className="mb-4 text-sm text-white/80">
              Tem certeza que deseja excluir este aluno? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setExcluindoId(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => excluir(excluindoId)}>
                Excluir
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
