import { useEffect, useState } from 'react'
import { Users, Wallet, Dumbbell, Footprints } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

export function Relatorios() {
  const [loading, setLoading] = useState(true)
  const [porModalidade, setPorModalidade] = useState<Record<string, number>>({})
  const [porStatus, setPorStatus] = useState<Record<string, number>>({})
  const [totalAlunos, setTotalAlunos] = useState(0)
  const [receitaRecebida, setReceitaRecebida] = useState(0)
  const [receitaPendente, setReceitaPendente] = useState(0)
  const [treinosCriados, setTreinosCriados] = useState(0)
  const [planosCorrida, setPlanosCorrida] = useState(0)

  useEffect(() => {
    async function load() {
      const [alunosRes, pagamentosRes, treinosRes, corridaRes] = await Promise.all([
        supabase.from('alunos').select('modalidade, status'),
        supabase.from('pagamentos').select('status, valor'),
        supabase.from('treinos').select('id', { count: 'exact', head: true }),
        supabase.from('planos_corrida').select('id', { count: 'exact', head: true }),
      ])

      const alunos = alunosRes.data ?? []
      setTotalAlunos(alunos.length)

      const modCount: Record<string, number> = {}
      const statusCount: Record<string, number> = {}
      alunos.forEach((a) => {
        modCount[a.modalidade] = (modCount[a.modalidade] ?? 0) + 1
        statusCount[a.status] = (statusCount[a.status] ?? 0) + 1
      })
      setPorModalidade(modCount)
      setPorStatus(statusCount)

      const pagamentos = pagamentosRes.data ?? []
      setReceitaRecebida(pagamentos.filter((p) => p.status === 'Recebido').reduce((s, p) => s + p.valor, 0))
      setReceitaPendente(pagamentos.filter((p) => p.status === 'Pendente').reduce((s, p) => s + p.valor, 0))

      setTreinosCriados(treinosRes.count ?? 0)
      setPlanosCorrida(corridaRes.count ?? 0)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-sm text-white/40">Carregando relatório...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Relatórios</h1>
        <p className="text-sm text-white/40">Visão consolidada do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Alunos" value={String(totalAlunos)} icon={Users} />
        <StatCard label="Receita Recebida" value={`R$ ${receitaRecebida.toLocaleString('pt-BR')}`} icon={Wallet} />
        <StatCard label="Treinos Criados" value={String(treinosCriados)} icon={Dumbbell} />
        <StatCard label="Planos de Corrida" value={String(planosCorrida)} icon={Footprints} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alunos por Modalidade</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {Object.entries(porModalidade).map(([modalidade, count]) => (
              <div key={modalidade} className="flex items-center justify-between text-sm">
                <span className="text-white/60">{modalidade}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {Object.keys(porModalidade).length === 0 && (
              <p className="text-sm text-white/30">Nenhum aluno cadastrado ainda.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alunos por Status</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {Object.entries(porStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-white/60">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Recebido</span>
              <span className="font-semibold text-emerald-400">R$ {receitaRecebida.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Pendente</span>
              <span className="font-semibold text-amber-400">R$ {receitaPendente.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </Card>
      </div>

      <p className="text-xs text-white/30">
        Exportação em PDF disponível em breve. Me avisa se quiser que eu implemente.
      </p>
    </div>
  )
}
