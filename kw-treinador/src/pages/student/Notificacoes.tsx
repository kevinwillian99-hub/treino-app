import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'

interface Prefs {
  treino: boolean
  pagamento: boolean
  mensagem: boolean
}

export function StudentNotificacoes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Prefs>({ treino: true, pagamento: true, mensagem: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('alunos')
        .select('id, notificacoes')
        .eq('profile_id', user.id)
        .single()
      if (data) {
        setAlunoId(data.id)
        if (data.notificacoes) setPrefs(data.notificacoes as Prefs)
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function toggle(key: keyof Prefs) {
    const novo = { ...prefs, [key]: !prefs[key] }
    setPrefs(novo)
    if (alunoId) {
      await supabase.from('alunos').update({ notificacoes: novo }).eq('id', alunoId)
    }
  }

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>

  const itens: { key: keyof Prefs; label: string }[] = [
    { key: 'treino', label: 'Novo treino disponível' },
    { key: 'pagamento', label: 'Pagamentos' },
    { key: 'mensagem', label: 'Mensagens do treinador' },
  ]

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/aluno/perfil')} className="flex items-center gap-2 text-sm text-white/50">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <h1 className="text-lg font-bold">Notificações</h1>

      <Card className="p-0">
        {itens.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between border-b border-graphite-200/60 px-4 py-3 last:border-0"
          >
            <p className="text-sm text-white/70">{label}</p>
            <button
              onClick={() => toggle(key)}
              className={`h-6 w-11 rounded-full transition-colors ${prefs[key] ? 'bg-gold' : 'bg-graphite-200'}`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                  prefs[key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </Card>
    </div>
  )
}
