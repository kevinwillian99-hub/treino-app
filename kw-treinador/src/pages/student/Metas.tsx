import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export function StudentMetas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [meta, setMeta] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('alunos')
        .select('id, meta')
        .eq('profile_id', user.id)
        .single()
      if (data) {
        setAlunoId(data.id)
        setMeta(data.meta ?? '')
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function salvar() {
    if (!alunoId) return
    setSalvando(true)
    await supabase.from('alunos').update({ meta: meta || null }).eq('id', alunoId)
    setSalvando(false)
    setMensagem('Meta atualizada!')
    setTimeout(() => setMensagem(null), 2000)
  }

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/aluno/perfil')} className="flex items-center gap-2 text-sm text-white/50">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <h1 className="text-lg font-bold">Minha Meta</h1>

      <Card className="space-y-4">
        <Select label="Distância objetivo" value={meta} onChange={(e) => setMeta(e.target.value)}>
          <option value="">Sem meta definida</option>
          <option value="5 km">5 km</option>
          <option value="10 km">10 km</option>
          <option value="15 km">15 km</option>
          <option value="21 km">21 km</option>
          <option value="42 km">42 km</option>
        </Select>
        {mensagem && <p className="text-sm text-emerald-400">{mensagem}</p>}
        <Button onClick={salvar} className="w-full" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Meta'}
        </Button>
      </Card>
    </div>
  )
}
