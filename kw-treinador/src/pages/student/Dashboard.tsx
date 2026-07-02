import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Footprints, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function StudentDashboard() {
  const { user } = useAuth()
  const [nomeTreino, setNomeTreino] = useState<string | null>(null)
  const [treinoFeitos, setTreinoFeitos] = useState(0)
  const [treinoTotal, setTreinoTotal] = useState(0)
  const [corridaFeitas, setCorridaFeitas] = useState(0)
  const [corridaTotal, setCorridaTotal] = useState(0)
  const [proximaCorrida, setProximaCorrida] = useState<{ dia: string; distancia: number | null; ritmo: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!aluno) {
        setLoading(false)
        return
      }

      const { data: treino } = await supabase
        .from('treinos')
        .select('id, nome')
        .eq('aluno_id', aluno.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (treino) {
        setNomeTreino(treino.nome)
        const { data: itens } = await supabase
          .from('treino_exercicios')
          .select('concluido')
          .eq('treino_id', treino.id)
        setTreinoTotal(itens?.length ?? 0)
        setTreinoFeitos(itens?.filter((i) => i.concluido).length ?? 0)
      }

      const { data: plano } = await supabase
        .from('planos_corrida')
        .select('id')
        .eq('aluno_id', aluno.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (plano) {
        const { data: dias } = await supabase
          .from('corrida_dias')
          .select('dia_semana, tipo, distancia_km, ritmo, concluido')
          .eq('plano_id', plano.id)
        const ativos = (dias ?? []).filter((d) => d.tipo !== 'OFF')
        setCorridaTotal(ativos.length)
        setCorridaFeitas(ativos.filter((d) => d.concluido).length)
        const proxima = ativos.find((d) => !d.concluido)
        if (proxima) {
          setProximaCorrida({ dia: proxima.dia_semana, distancia: proxima.distancia_km, ritmo: proxima.ritmo })
        }
      }

      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Olá, {user?.name ?? 'atleta'}</h1>
        <p className="text-sm text-white/40">Vamos evoluir hoje</p>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40">Treino Atual</p>
                <p className="text-xl font-bold">
                  {treinoTotal > 0 ? `${treinoFeitos}/${treinoTotal}` : '—'}
                </p>
                <p className="text-xs text-white/30">Exercícios concluídos</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Corridas</p>
                <p className="text-xl font-bold">
                  {corridaTotal > 0 ? `${corridaFeitas}/${corridaTotal}` : '—'}
                </p>
                <p className="text-xs text-white/30">Concluídas na semana</p>
              </div>
            </div>
          </Card>

          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle>Treino Atual</CardTitle>
            </CardHeader>
            {nomeTreino ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
                    <Dumbbell className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium">{nomeTreino}</p>
                    <p className="text-xs text-white/40">{treinoFeitos}/{treinoTotal} concluídos</p>
                  </div>
                </div>
                <Link to="/aluno/treinos">
                  <Button size="sm">
                    Ver treino
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-white/40">Nenhum treino cadastrado ainda.</p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plano de Corrida</CardTitle>
            </CardHeader>
            {proximaCorrida ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
                    <Footprints className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {proximaCorrida.dia}
                      {proximaCorrida.distancia ? ` · ${proximaCorrida.distancia} km` : ''}
                    </p>
                    <p className="text-xs text-white/40">{proximaCorrida.ritmo ?? 'Próximo treino da semana'}</p>
                  </div>
                </div>
                <Link to="/aluno/corrida">
                  <Button size="sm" variant="secondary">
                    Ver semana
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-white/40">Nenhum plano de corrida cadastrado ainda.</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
