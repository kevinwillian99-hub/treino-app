import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Aluno } from '@/types'
import type { Exercicio } from '@/types/treino'
import { categoriasExercicio } from '@/lib/categorias'

interface LinhaExercicio {
  categoria: string
  exercicioId: string
  series: string
  repeticoes: string
  carga: string
  descanso: string
}

export function NovoTreino() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [biblioteca, setBiblioteca] = useState<Exercicio[]>([])
  const [alunoId, setAlunoId] = useState('')
  const [nomeTreino, setNomeTreino] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [linhas, setLinhas] = useState<LinhaExercicio[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [a, b] = await Promise.all([
        supabase.from('alunos').select('*').order('nome'),
        supabase.from('exercicios').select('*').order('nome'),
      ])
      setAlunos((a.data as Aluno[]) ?? [])
      setBiblioteca((b.data as Exercicio[]) ?? [])
    }
    load()
  }, [])

  function adicionarLinha() {
    if (biblioteca.length === 0) return
    const primeiraCategoria = biblioteca[0].categoria
    const primeiroExercicio = biblioteca.find((e) => e.categoria === primeiraCategoria) ?? biblioteca[0]
    setLinhas([
      ...linhas,
      {
        categoria: primeiraCategoria,
        exercicioId: primeiroExercicio.id,
        series: '',
        repeticoes: '',
        carga: '',
        descanso: '',
      },
    ])
  }

  function atualizarCategoria(index: number, categoria: string) {
    const primeiroDaCategoria = biblioteca.find((e) => e.categoria === categoria)
    const copia = [...linhas]
    copia[index] = {
      ...copia[index],
      categoria,
      exercicioId: primeiroDaCategoria?.id ?? '',
    }
    setLinhas(copia)
  }

  function atualizarLinha(index: number, campo: keyof LinhaExercicio, valor: string) {
    const copia = [...linhas]
    copia[index] = { ...copia[index], [campo]: valor }
    setLinhas(copia)
  }

  function removerLinha(index: number) {
    setLinhas(linhas.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!alunoId || !nomeTreino || linhas.length === 0) {
      setErro('Selecione o aluno, dê um nome ao treino e adicione ao menos um exercício.')
      return
    }
    setErro(null)
    setSalvando(true)

    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .insert({
        trainer_id: user.id,
        aluno_id: alunoId,
        nome: nomeTreino,
        data_inicio: dataInicio || null,
        data_fim: dataFim || null,
      })
      .select()
      .single()

    if (treinoError || !treino) {
      setErro(treinoError?.message ?? 'Erro ao criar treino.')
      setSalvando(false)
      return
    }

    const payload = linhas.map((l, i) => ({
      treino_id: treino.id,
      exercicio_id: l.exercicioId,
      ordem: i,
      series: l.series,
      repeticoes: l.repeticoes,
      carga: l.carga,
      descanso: l.descanso,
    }))

    const { error: exError } = await supabase.from('treino_exercicios').insert(payload)
    setSalvando(false)

    if (exError) {
      setErro(exError.message)
      return
    }

    navigate('/treinador/treinos')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Novo Treino</h1>
        <p className="text-sm text-white/40">
          Os exercícios vêm da sua Biblioteca, com vídeo já incluso para o aluno.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Treino</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Aluno" value={alunoId} onChange={(e) => setAlunoId(e.target.value)} required>
              <option value="">Selecione o aluno</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </Select>
            <Input
              label="Nome do Treino"
              value={nomeTreino}
              onChange={(e) => setNomeTreino(e.target.value)}
              placeholder="Treino A · Peito e Tríceps"
              required
            />
            <Input
              label="Data de Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <Input
              label="Data de Vencimento"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercícios</CardTitle>
          </CardHeader>

          {biblioteca.length === 0 ? (
            <p className="text-sm text-white/40">
              Sua biblioteca está vazia. Cadastre exercícios em Biblioteca de Exercícios antes de criar o treino.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden gap-3 px-1 text-[11px] uppercase tracking-wide text-white/30 sm:grid sm:grid-cols-[1fr_1.4fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]">
                <span>Categoria</span>
                <span>Exercício</span>
                <span>Séries</span>
                <span>Reps</span>
                <span>Carga</span>
                <span>Descanso</span>
                <span></span>
              </div>
              {linhas.map((linha, i) => {
                const opcoesFiltradas = biblioteca.filter((ex) => ex.categoria === linha.categoria)
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-graphite-100 p-3 sm:grid-cols-[1fr_1.4fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]"
                  >
                    <Select value={linha.categoria} onChange={(e) => atualizarCategoria(i, e.target.value)}>
                      {categoriasExercicio.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={linha.exercicioId}
                      onChange={(e) => atualizarLinha(i, 'exercicioId', e.target.value)}
                    >
                      {opcoesFiltradas.length === 0 ? (
                        <option value="">Nenhum exercício nessa categoria</option>
                      ) : (
                        opcoesFiltradas.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.nome}
                          </option>
                        ))
                      )}
                    </Select>
                    <Input
                      placeholder="Séries"
                      value={linha.series}
                      onChange={(e) => atualizarLinha(i, 'series', e.target.value)}
                    />
                    <Input
                      placeholder="Reps"
                      value={linha.repeticoes}
                      onChange={(e) => atualizarLinha(i, 'repeticoes', e.target.value)}
                    />
                    <Input
                      placeholder="Carga"
                      value={linha.carga}
                      onChange={(e) => atualizarLinha(i, 'carga', e.target.value)}
                    />
                    <Input
                      placeholder="01:00"
                      value={linha.descanso}
                      onChange={(e) => {
                        // auto-format as MM:SS
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
                        const formatted = raw.length > 2
                          ? `${raw.slice(0, 2)}:${raw.slice(2)}`
                          : raw
                        atualizarLinha(i, 'descanso', formatted)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removerLinha(i)}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center self-end rounded-xl border border-graphite-100 text-white/40 hover:border-red-400/40 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}

              <Button type="button" variant="secondary" size="sm" onClick={adicionarLinha}>
                <Plus className="h-4 w-4" />
                Adicionar Exercício
              </Button>

              {linhas.length === 0 && (
                <p className="flex items-center gap-2 text-xs text-white/30">
                  <Video className="h-3.5 w-3.5" />
                  Cada exercício adicionado já carrega o vídeo cadastrado na biblioteca.
                </p>
              )}
            </div>
          )}
        </Card>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/treinador/treinos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Treino'}
          </Button>
        </div>
      </form>
    </div>
  )
}
