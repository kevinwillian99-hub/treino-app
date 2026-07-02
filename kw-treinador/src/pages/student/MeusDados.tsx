import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { maskTelefone, unmask } from '@/lib/masks'

export function StudentMeusDados() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [nome, setNome] = useState(user?.name ?? '')
  const [telefone, setTelefone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('alunos')
        .select('id, telefone')
        .eq('profile_id', user.id)
        .single()
      if (data) {
        setAlunoId(data.id)
        setTelefone(data.telefone ? maskTelefone(data.telefone) : '')
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setEnviandoFoto(true)
    const extensao = file.name.split('.').pop()
    const caminho = `${user.id}/avatar.${extensao}`
    const { error } = await supabase.storage.from('avatars').upload(caminho, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(caminho)
      const urlComCache = `${data.publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: urlComCache }).eq('id', user.id)
      setAvatarUrl(urlComCache)
    }
    setEnviandoFoto(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSalvando(true)
    await supabase.from('profiles').update({ name: nome }).eq('id', user.id)
    if (alunoId) {
      await supabase.from('alunos').update({ nome, telefone: unmask(telefone) }).eq('id', alunoId)
    }
    setSalvando(false)
    setMensagem('Dados salvos!')
    setTimeout(() => setMensagem(null), 2000)
  }

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/aluno/perfil')} className="flex items-center gap-2 text-sm text-white/50">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <h1 className="text-lg font-bold">Meus Dados</h1>

      <Card>
        <div className="flex items-center gap-4">
          <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-graphite-300 text-base font-bold text-gold">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto" className="h-full w-full object-cover" />
            ) : (
              nome.slice(0, 2).toUpperCase()
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white opacity-0 group-hover:opacity-100">
              {enviandoFoto ? '...' : 'Trocar'}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </label>
          <p className="text-xs text-white/40">Toque na foto para trocar</p>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} />
        {mensagem && <p className="text-sm text-emerald-400">{mensagem}</p>}
        <Button type="submit" className="w-full" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </div>
  )
}
