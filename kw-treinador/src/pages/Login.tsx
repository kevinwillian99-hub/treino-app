import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [enviandoReset, setEnviandoReset] = useState(false)
  const [mensagemReset, setMensagemReset] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('E-mail ou senha incorretos.')
      return
    }
    navigate('/')
  }

  async function handleEsqueciSenha() {
    if (!email) {
      setError('Digite seu e-mail no campo acima primeiro.')
      return
    }
    setError(null)
    setEnviandoReset(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-senha`,
    })
    setEnviandoReset(false)
    if (error) {
      setError('Não foi possível enviar o e-mail de recuperação.')
      return
    }
    setMensagemReset('Enviamos um link de recuperação para o seu e-mail.')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-graphite-600 px-6 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-10 flex justify-center">
          <img
            src="/logo.png"
            alt="Kevin Willian Treinador"
            className="h-24 w-auto object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {mensagemReset && <p className="text-sm text-emerald-400">{mensagemReset}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleEsqueciSenha}
              disabled={enviandoReset}
              className="text-xs text-white/40 transition-colors hover:text-gold"
            >
              {enviandoReset ? 'Enviando...' : 'Esqueci minha senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
