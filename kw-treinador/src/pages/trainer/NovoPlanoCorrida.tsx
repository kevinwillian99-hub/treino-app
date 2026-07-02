import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Aluno } from '@/types'

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const tipos = ['REG', 'ROD', 'RUN', 'LG', 'INT', 'FAR', 'AQC', 'OFF']

const tipoDescricao: Record<string, string> = {
  REG: 'Regenerativo',
  ROD: 'Rodagem',
  RUN: 'Ritmo de Prova',
  LG: 'Longo',
  INT: 'Intervalado',
  FAR: 'Fartlek',
  AQC: 'Aquecimento/Soltura',
  OFF: 'Descanso',
}

interface LinhaDia {
  dia: string
  tipo: string
  distancia: string
  ritmo: string
}

export function NovoPlanoCorrida() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [alunoId, setAlunoId] = useState('')
  const [nome, setNome] = useState('')
  const [fase, setFase] = useState('BASE')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [linhas, setLinhas] = useState<LinhaDia[]>(
    diasSemana.map((dia) => ({ dia, tipo: 'OFF', distancia: '', ritmo: '' }))
  )

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('alunos')
        .select('*')
        .eq('tipo_online', 'Corrida')
        .order('nome')
      setAlunos((data as Aluno[]) ?? [])
    }
    load()
  }, [])

  function atualizarDia(index: number, campo: keyof LinhaDia, valor: string) {
    const copia = [...linhas]
    copia[index] = { ...copia[index], [campo]: valor }
    setLinhas(copia)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!alunoId || !nome) {
      setErro('Selecione o aluno e dê um nome ao plano.')
      return
    }
    setErro(null)
    setSalvando(true)

    const { data: plano, error: planoError } = await supabase
      .from('planos_corrida')
      .insert({ trainer_id: user.id, aluno_id: alunoId, nome, fase })
      .select()
      .single()

    if (planoError || !plano) {
      setErro(planoError?.message ?? 'Erro ao criar plano.')
      setSalvando(false)
      return
    }

    const payload = linhas
      .filter((l) => l.tipo !== 'OFF' || l.distancia)
      .map((l) => ({
        plano_id: plano.id,
        dia_semana: l.dia,
        tipo: l.tipo,
        distancia_km: l.distancia ? Number(l.distancia) : null,
        ritmo: l.ritmo || null,
      }))

    const { error: diasError } = await supabase.from('corrida_dias').insert(payload)
    setSalvando(false)

    if (diasError) {
      setErro(diasError.message)
      return
    }

    navigate('/treinador/corridas')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Novo Plano de Corrida</h1>
        <p className="text-sm text-white/40">Nomenclatura Método BP: REG, ROD, RUN, LG, INT, FAR, AQC, OFF</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Aluno"
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="sm:col-span-1"
              required
            >
              <option value="">Selecione</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </Select>
            <Input
              label="Nome do Plano"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Semana 1 · Base"
              className="sm:col-span-1"
              required
            />
            <Select label="Fase" value={fase} onChange={(e) => setFase(e.target.value)} className="sm:col-span-1">
              <option value="BASE">Base</option>
              <option value="PROGRESSÃO">Progressão</option>
              <option value="PICO">Pico</option>
              <option value="REGENERAÇÃO">Regeneração</option>
            </Select>
          </div>
          {alunos.length === 0 && (
            <p className="mt-3 text-xs text-amber-400">
              Nenhum aluno com tipo "Corrida" cadastrado ainda.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semana</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {linhas.map((linha, i) => (
              <div
                key={linha.dia}
                className="grid grid-cols-1 gap-2 rounded-xl border border-graphite-100 p-3 sm:grid-cols-[100px_110px_1fr_1fr]"
              >
                <p className="flex items-center text-sm font-medium text-white/70">{linha.dia}</p>
                <Select value={linha.tipo} onChange={(e) => atualizarDia(i, 'tipo', e.target.value)}>
                  {tipos.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="Distância (km)"
                  type="number"
                  step="0.1"
                  value={linha.distancia}
                  onChange={(e) => atualizarDia(i, 'distancia', e.target.value)}
                  disabled={linha.tipo === 'OFF'}
                />
                <Input
                  placeholder="Ritmo (ex: 5:30/km)"
                  value={linha.ritmo}
                  onChange={(e) => atualizarDia(i, 'ritmo', e.target.value)}
                  disabled={linha.tipo === 'OFF'}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/30">
            {tipos.map((t) => `${t} = ${tipoDescricao[t]}`).join(' · ')}
          </p>
        </Card>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/treinador/corridas')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </form>
    </div>
  )
}
