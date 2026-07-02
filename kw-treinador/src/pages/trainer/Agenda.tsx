import { useEffect, useState, type FormEvent } from 'react'
import { Plus, X, Calendar as CalendarIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Aluno } from '@/types'

interface Evento {
  id: string
  titulo: string
  tipo: string
  data_hora: string
  status: string
  aluno_id: string | null
  alunos?: { nome: string } | null
}

const statusCor: Record<string, string> = {
  Confirmado: 'text-emerald-300 bg-emerald-400/10',
  Pendente: 'text-amber-300 bg-amber-400/10',
  Cancelado: 'text-red-300 bg-red-400/10',
}

export function Agenda() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState('Treino')
  const [alunoId, setAlunoId] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')

  async function carregar() {
    const [e, a] = await Promise.all([
      supabase
        .from('agenda_eventos')
        .select('*, alunos(nome)')
        .order('data_hora', { ascending: true }),
      supabase.from('alunos').select('*').order('nome'),
    ])
    setEventos((e.data as unknown as Evento[]) ?? [])
    setAlunos((a.data as Aluno[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !titulo || !data || !hora) return
    setSalvando(true)
    await supabase.from('agenda_eventos').insert({
      trainer_id: user.id,
      aluno_id: alunoId || null,
      titulo,
      tipo,
      data_hora: `${data}T${hora}:00`,
    })
    setSalvando(false)
    setMostrarForm(false)
    setTitulo('')
    setAlunoId('')
    setData('')
    setHora('')
    carregar()
  }

  async function mudarStatus(id: string, status: string) {
    await supabase.from('agenda_eventos').update({ status }).eq('id', id)
    carregar()
  }

  const hoje = new Date().toISOString().slice(0, 10)
  const proximos = eventos.filter((e) => e.data_hora.slice(0, 10) >= hoje)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Agenda</h1>
          <p className="text-sm text-white/40">{proximos.length} próximos eventos</p>
        </div>
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Novo Evento</h2>
            <button onClick={() => setMostrarForm(false)} className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="Treino">Treino</option>
                <option value="Avaliação">Avaliação</option>
                <option value="Consulta">Consulta</option>
                <option value="Outro">Outro</option>
              </Select>
              <Select label="Aluno (opcional)" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
                <option value="">Sem aluno específico</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </Select>
              <div />
              <Input label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
              <Input label="Horário" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Evento'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : proximos.length === 0 ? (
        <p className="text-sm text-white/40">Nenhum evento agendado.</p>
      ) : (
        <div className="space-y-2">
          {proximos.map((ev) => {
            const dt = new Date(ev.data_hora)
            return (
              <Card key={ev.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10">
                    <CalendarIcon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ev.titulo}</p>
                    <p className="text-xs text-white/40">
                      {ev.tipo} {ev.alunos?.nome ? `· ${ev.alunos.nome}` : ''} ·{' '}
                      {dt.toLocaleDateString('pt-BR')} às{' '}
                      {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <select
                  value={ev.status}
                  onChange={(e) => mudarStatus(ev.id, e.target.value)}
                  className={`rounded-full border-none px-3 py-1 text-xs font-medium ${statusCor[ev.status]}`}
                >
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
