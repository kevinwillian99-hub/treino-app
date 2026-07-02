import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Video, X, Pencil, Trash2, Sparkles, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { categoriasExercicio } from '@/lib/categorias'
import { exerciciosPadrao } from '@/lib/exerciciosPadrao'
import type { Exercicio } from '@/types/treino'

export function Biblioteca() {
  const { user } = useAuth()
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Exercicio | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [carregandoPadrao, setCarregandoPadrao] = useState(false)

  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState(categoriasExercicio[0])
  const [videoUrl, setVideoUrl] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    const { data } = await supabase.from('exercicios').select('*').order('categoria').order('nome')
    setExercicios((data as Exercicio[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  function abrirNovo() {
    setEditando(null)
    setNome('')
    setCategoria(categoriasExercicio[0])
    setVideoUrl('')
    setObservacoes('')
    setMostrarForm(true)
  }

  function abrirEdicao(ex: Exercicio) {
    setEditando(ex)
    setNome(ex.nome)
    setCategoria(ex.categoria)
    setVideoUrl(ex.video_url ?? '')
    setObservacoes(ex.observacoes ?? '')
    setMostrarForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSalvando(true)

    if (editando) {
      await supabase
        .from('exercicios')
        .update({ nome, categoria, video_url: videoUrl || null, observacoes: observacoes || null })
        .eq('id', editando.id)
    } else {
      await supabase.from('exercicios').insert({
        trainer_id: user.id,
        nome,
        categoria,
        video_url: videoUrl || null,
        observacoes: observacoes || null,
      })
    }

    setSalvando(false)
    setMostrarForm(false)
    carregar()
  }

  async function excluir(id: string) {
    await supabase.from('exercicios').delete().eq('id', id)
    carregar()
  }

  async function carregarListaPadrao() {
    if (!user) return
    setCarregandoPadrao(true)
    const existentesNomes = new Set(exercicios.map((e) => e.nome.toLowerCase()))
    const novos = exerciciosPadrao
      .filter((e) => !existentesNomes.has(e.nome.toLowerCase()))
      .map((e) => ({ trainer_id: user.id, nome: e.nome, categoria: e.categoria, video_url: null }))

    if (novos.length > 0) {
      await supabase.from('exercicios').insert(novos)
    }
    setCarregandoPadrao(false)
    carregar()
  }

  const filtrados =
    filtroCategoria === 'Todas' ? exercicios : exercicios.filter((e) => e.categoria === filtroCategoria)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Biblioteca de Exercícios</h1>
          <p className="text-sm text-white/40">
            Cadastre os vídeos aqui. Eles ficam disponíveis para usar em qualquer treino.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={carregarListaPadrao} disabled={carregandoPadrao} className="flex-1 sm:flex-none">
            <Sparkles className="h-3.5 w-3.5" />
            {carregandoPadrao ? 'Carregando...' : 'Carregar lista padrão'}
          </Button>
          <Button onClick={abrirNovo} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4" />
            Novo Exercício
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['Todas', ...categoriasExercicio].map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`flex-shrink-0 rounded-2xl border px-4 py-2 text-xs font-semibold transition-colors ${
              filtroCategoria === cat
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-graphite-100 text-white/50 hover:border-white/30 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {mostrarForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editando ? 'Editar Exercício' : 'Novo Exercício'}</h2>
            <button onClick={() => setMostrarForm(false)} className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nome do exercício" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {categoriasExercicio.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input
                label="Link do vídeo"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="sm:col-span-2"
              />
              <Input
                label="Observações de execução"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setMostrarForm(false)} className="sm:order-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando} className="sm:order-2">
                {salvando ? 'Salvando...' : 'Salvar Exercício'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-white/40">Nenhum exercício cadastrado ainda.</p>
      ) : (
        <>
          {/* Celular: lista compacta */}
          <Card className="p-0 sm:hidden">
            {filtrados.map((ex, i) => (
              <div
                key={ex.id}
                className={`flex items-center justify-between px-4 py-3 ${i < filtrados.length - 1 ? 'border-b border-graphite-200/60' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{ex.nome}</p>
                  <p className="text-xs text-white/40">{ex.categoria}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {ex.video_url && (
                    <a
                      href={ex.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-gold"
                    >
                      <Play className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => abrirEdicao(ex)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-gold"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluir(ex.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </Card>

          {/* Desktop: grid de cards */}
          <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((ex) => (
            <Card key={ex.id}>
              <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-graphite-300">
                <Video className="h-6 w-6 text-white/20" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{ex.nome}</p>
                  <p className="text-xs text-white/40">{ex.categoria}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => abrirEdicao(ex)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-graphite-300 hover:text-gold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => excluir(ex.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-graphite-300 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <span
                className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  ex.video_url ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'
                }`}
              >
                {ex.video_url ? 'Vídeo OK' : 'Falta vídeo'}
              </span>
            </Card>
          ))}
          </div>
        </>
      )}
    </div>
  )
}
