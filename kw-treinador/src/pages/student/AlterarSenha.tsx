import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function StudentAlterarSenha() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)

    if (novaSenha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvando(false)

    if (error) {
      setErro('Não foi possível trocar a senha. Tente novamente.')
      return
    }
    setSucesso(true)
    setNovaSenha('')
    setConfirmar('')
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/aluno/perfil')} className="flex items-center gap-2 text-sm text-white/50">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <h1 className="text-lg font-bold">Alterar Senha</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Nova Senha"
            placeholder="••••••••"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Confirmar Senha"
            placeholder="••••••••"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          {sucesso && <p className="text-sm text-emerald-400">Senha alterada com sucesso!</p>}
          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
