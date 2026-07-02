import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

interface Avaliacao {
  id: string
  data: string
  peso: number | null
  percentual_gordura: number | null
  cintura: number | null
  postura_cabeca: string | null
  postura_ombros: string | null
  postura_coluna: string | null
  postura_pelve: string | null
  postura_joelhos: string | null
  postura_pes: string | null
  observacoes_postura: string | null
}

export function StudentAvaliacoes() {
  const { user } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (aluno) {
        const { data } = await supabase
          .from('avaliacoes')
          .select(
            'id, data, peso, percentual_gordura, cintura, postura_cabeca, postura_ombros, postura_coluna, postura_pelve, postura_joelhos, postura_pes, observacoes_postura'
          )
          .eq('aluno_id', aluno.id)
          .order('data')
        setAvaliacoes((data as Avaliacao[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>

  if (avaliacoes.length === 0) {
    return (
      <div className="space-y-2 text-center">
        <h1 className="text-lg font-bold">Nenhuma avaliação ainda</h1>
        <p className="text-sm text-white/40">Seu treinador ainda não registrou uma avaliação física.</p>
      </div>
    )
  }

  const ultima = avaliacoes[avaliacoes.length - 1]
  const grafico = avaliacoes.map((a) => ({
    data: new Date(a.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: a.peso,
  }))

  const postura = [
    ['Cabeça', ultima.postura_cabeca],
    ['Ombros', ultima.postura_ombros],
    ['Coluna', ultima.postura_coluna],
    ['Pelve', ultima.postura_pelve],
    ['Joelhos', ultima.postura_joelhos],
    ['Pés', ultima.postura_pes],
  ].filter(([, valor]) => valor && valor !== 'Normal' && valor !== 'Normais' && valor !== 'Neutra' && valor !== 'Nivelados')

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">Minhas Avaliações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Última Avaliação</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] uppercase text-white/30">Peso</p>
            <p className="text-base font-bold">{ultima.peso ?? '—'} kg</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/30">% Gordura</p>
            <p className="text-base font-bold">{ultima.percentual_gordura ?? '—'}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/30">Cintura</p>
            <p className="text-base font-bold">{ultima.cintura ?? '—'} cm</p>
          </div>
        </div>
      </Card>

      {(postura.length > 0 || ultima.observacoes_postura) && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliação Postural</CardTitle>
          </CardHeader>
          {postura.length > 0 ? (
            <div className="space-y-1.5">
              {postura.map(([regiao, valor]) => (
                <div key={regiao} className="flex justify-between text-sm">
                  <span className="text-white/50">{regiao}</span>
                  <span className="font-medium text-gold">{valor}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-400">Postura dentro do esperado, sem desvios relevantes.</p>
          )}
          {ultima.observacoes_postura && (
            <p className="mt-3 text-xs text-white/40">{ultima.observacoes_postura}</p>
          )}
        </Card>
      )}

      {avaliacoes.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Peso</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={grafico}>
              <XAxis dataKey="data" stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A1A20', border: '1px solid #26262E', borderRadius: 12, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="peso" stroke="#FEBC03" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
