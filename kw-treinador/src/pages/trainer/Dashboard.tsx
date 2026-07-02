import { useEffect, useState } from 'react'
import { Users, Wallet, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Aluno } from '@/types'

interface PagamentoResumo {
  status: string
  valor: number
}

export function TrainerDashboard() {
  const { user } = useAuth()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [pagamentos, setPagamentos] = useState<PagamentoResumo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [a, p] = await Promise.all([
        supabase.from('alunos').select('*'),
        supabase.from('pagamentos').select('status, valor'),
      ])
      setAlunos((a.data as Aluno[]) ?? [])
      setPagamentos((p.data as PagamentoResumo[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalAlunos = alunos.length
  const ativos = alunos.filter((a) => a.status === 'Ativo')
  const receitaMensal = ativos.reduce((soma, a) => soma + (a.preco ?? 0), 0)
  const receitaAnual = receitaMensal * 12
  const pendentes = pagamentos.filter((p) => p.status === 'Pendente')
  const valorPendente = pendentes.reduce((soma, p) => soma + p.valor, 0)

  const proximosVencimentos = ativos.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Olá, {user?.name ?? 'treinador'}</h1>
        <p className="text-sm text-white/40">Resumo do seu negócio hoje</p>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total de Alunos" value={String(totalAlunos)} icon={Users} />
            <StatCard
              label="Receita Mensal"
              value={`R$ ${receitaMensal.toLocaleString('pt-BR')}`}
              icon={Wallet}
              trend="Alunos com status Ativo"
            />
            <StatCard
              label="Pagamentos Pendentes"
              value={`R$ ${valorPendente.toLocaleString('pt-BR')}`}
              icon={AlertCircle}
              trend={`${pendentes.length} pagamento(s)`}
            />
            <StatCard
              label="Receita Anual (estimada)"
              value={`R$ ${receitaAnual.toLocaleString('pt-BR')}`}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Alunos por Modalidade</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-white/40">Presencial</p>
                  <p className="text-xl font-bold">
                    {alunos.filter((a) => a.modalidade === 'Presencial').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Online · Consultoria</p>
                  <p className="text-xl font-bold">
                    {alunos.filter((a) => a.modalidade === 'Online' && a.tipoOnline === 'Consultoria').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Online · Corrida</p>
                  <p className="text-xl font-bold">
                    {alunos.filter((a) => a.modalidade === 'Online' && a.tipoOnline === 'Corrida').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Total Online</p>
                  <p className="text-xl font-bold">{alunos.filter((a) => a.modalidade === 'Online').length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alunos Ativos</CardTitle>
              </CardHeader>
              {proximosVencimentos.length === 0 ? (
                <p className="text-sm text-white/40">Nenhum aluno ativo ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {proximosVencimentos.map((a) => (
                    <li key={a.id} className="flex items-center justify-between text-sm">
                      <p className="font-medium text-white">{a.nome}</p>
                      <span className="text-xs text-white/50">{a.plano ?? a.modalidade}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
