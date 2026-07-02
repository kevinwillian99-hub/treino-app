import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function DefinirSenha() {
  const navigate = useNavigate()
  const [verificando, setVerificando] = useState(true)
  const [sessaoValida, setSessaoValida] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase.auth.getSession()
      setSessaoValida(!!data.session)
      setVerificando(false)
    }
    verificar()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSalvando(false)

    if (error) {
      setErro('Não foi possível salvar a senha. Tente abrir o link do e-mail novamente.')
      return
    }

    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-graphite-600 px-4">
      <div className="w-full max-w-sm pt-2">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="Kevin Willian Treinador" className="h-24 w-auto object-contain" />
        </div>

        {verificando ? (
          <p className="text-center text-sm text-white/40">Verificando seu link de acesso...</p>
        ) : !sessaoValida ? (
          <div className="space-y-3 text-center">
            <h1 className="text-lg font-bold">Link inválido ou expirado</h1>
            <p className="text-sm text-white/40">
              Peça ao seu treinador para reenviar o convite, ou volte para o login.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para o login
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-center text-lg font-bold">Criar sua senha</h1>
            <p className="mb-6 text-center text-sm text-white/40">
              Escolha uma senha para acessar o app
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="senha"
                type="password"
                label="Nova Senha"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <Input
                id="confirmarSenha"
                type="password"
                label="Confirmar Senha"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              {erro && <p className="text-sm text-red-400">{erro}</p>}
              <Button type="submit" className="w-full" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar senha e entrar'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
