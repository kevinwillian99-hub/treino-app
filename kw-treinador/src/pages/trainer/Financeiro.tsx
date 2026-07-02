import { useEffect, useState, type FormEvent } from 'react'
import { Plus, X, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Aluno } from '@/types'

interface Pagamento {
  id: string
  aluno_id: string
  valor: number
  forma: string
  status: string
  referencia: string | null
  created_at: string
  alunos?: { nome: string }
}

export function Financeiro() {
  const { user } = useAuth()
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [alunoId, setAlunoId] = useState('')
  const [valor, setValor] = useState('')
  const [forma, setForma] = useState('Pix')
  const [status, setStatus] = useState('Pendente')
  const [referencia, setReferencia] = useState('')

  async function carregar() {
    const [p, a] = await Promise.all([
      supabase
        .from('pagamentos')
        .select('*, alunos(nome)')
        .order('created_at', { ascending: false }),
      supabase.from('alunos').select('*').order('nome'),
    ])
    setPagamentos((p.data as unknown as Pagamento[]) ?? [])
    setAlunos((a.data as Aluno[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !alunoId || !valor) return
    setSalvando(true)
    await supabase.from('pagamentos').insert({
      trainer_id: user.id,
      aluno_id: alunoId,
      valor: Number(valor),
      forma,
      status,
      referencia: referencia || null,
      data_pagamento: status === 'Recebido' ? new Date().toISOString().slice(0, 10) : null,
    })
    setSalvando(false)
    setMostrarForm(false)
    setAlunoId('')
    setValor('')
    setReferencia('')
    carregar()
  }

  async function marcarRecebido(id: string) {
    await supabase
      .from('pagamentos')
      .update({ status: 'Recebido', data_pagamento: new Date().toISOString().slice(0, 10) })
      .eq('id', id)
    carregar()
  }

  const recebidos = pagamentos.filter((p) => p.status === 'Recebido')
  const pendentes = pagamentos.filter((p) => p.status === 'Pendente')
  const totalRecebido = recebidos.reduce((s, p) => s + p.valor, 0)
  const totalPendente = pendentes.reduce((s, p) => s + p.valor, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Financeiro</h1>
          <p className="text-sm text-white/40">{pagamentos.length} lançamentos</p>
        </div>
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Recebido" value={`R$ ${totalRecebido.toLocaleString('pt-BR')}`} icon={CheckCircle2} />
        <StatCard label="Pendente" value={`R$ ${totalPendente.toLocaleString('pt-BR')}`} icon={AlertCircle} />
        <StatCard label="Total de Lançamentos" value={String(pagamentos.length)} icon={Wallet} />
      </div>

      {mostrarForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Novo Pagamento</h2>
            <button onClick={() => setMostrarForm(false)} className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Aluno" value={alunoId} onChange={(e) => setAlunoId(e.target.value)} required>
                <option value="">Selecione</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </Select>
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
              <Select label="Forma de Pagamento" value={forma} onChange={(e) => setForma(e.target.value)}>
                <option value="Pix">Pix</option>
                <option value="Cartão">Cartão</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
              </Select>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Pendente">Pendente</option>
                <option value="Recebido">Recebido</option>
              </Select>
              <Input
                label="Referência (ex: Mensalidade Julho)"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
        </CardHeader>
        {loading ? (
          <p className="text-sm text-white/40">Carregando...</p>
        ) : pagamentos.length === 0 ? (
          <p className="text-sm text-white/40">Nenhum pagamento registrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {pagamentos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-graphite-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{p.alunos?.nome ?? 'Aluno removido'}</p>
                  <p className="text-xs text-white/40">
                    {p.referencia ?? p.forma} · {p.forma}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">R$ {p.valor.toLocaleString('pt-BR')}</p>
                  {p.status === 'Pendente' ? (
                    <button
                      onClick={() => marcarRecebido(p.id)}
                      className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-400/20"
                    >
                      Pendente
                    </button>
                  ) : (
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Recebido
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
