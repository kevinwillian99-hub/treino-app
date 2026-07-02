import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Footprints } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface PlanoComAluno {
  id: string
  nome: string
  fase: string | null
  alunos: { nome: string } | null
}

export function Corridas() {
  const [planos, setPlanos] = useState<PlanoComAluno[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('planos_corrida')
        .select('id, nome, fase, alunos(nome)')
        .order('created_at', { ascending: false })
      setPlanos((data as unknown as PlanoComAluno[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Corridas</h1>
          <p className="text-sm text-white/40">{planos.length} planos de corrida</p>
        </div>
        <Link to="/treinador/corridas/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : planos.length === 0 ? (
        <p className="text-sm text-white/40">Nenhum plano de corrida criado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planos.map((p) => (
            <Card key={p.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                <Footprints className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold">{p.nome}</p>
                <p className="text-xs text-white/40">
                  {p.alunos?.nome ?? 'Aluno removido'} {p.fase ? `· ${p.fase}` : ''}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
