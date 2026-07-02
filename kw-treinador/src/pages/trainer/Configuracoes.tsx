import { useState, useEffect } from 'react'
import { Save, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function Configuracoes() {
  const { user } = useAuth()
  const [nome, setNome] = useState(user?.name ?? '')
  const [email] = useState(user?.email ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [erroFoto, setErroFoto] = useState<string | null>(null)
  const [corPrimaria, setCorPrimaria] = useState('#FEBC03')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erroSenha, setErroSenha] = useState<string | null>(null)
  const [senhaSalva, setSenhaSalva] = useState(false)
  const [notifTreino, setNotifTreino] = useState(true)
  const [notifPagamento, setNotifPagamento] = useState(true)
  const [notifMensagem, setNotifMensagem] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    async function carregarNotificacoes() {
      if (!user) return
      const { data } = await supabase.from('profiles').select('notificacoes').eq('id', user.id).single()
      if (data?.notificacoes) {
        setNotifTreino(data.notificacoes.treino ?? true)
        setNotifPagamento(data.notificacoes.pagamento ?? true)
        setNotifMensagem(data.notificacoes.mensagem ?? true)
      }
    }
    carregarNotificacoes()
  }, [user])

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setErroFoto(null)
    setEnviandoFoto(true)

    const extensao = file.name.split('.').pop()
    const caminho = `${user.id}/avatar.${extensao}`

    const { error: erroUpload } = await supabase.storage
      .from('avatars')
      .upload(caminho, file, { upsert: true })

    if (erroUpload) {
      setErroFoto('Não foi possível enviar a foto. Tente novamente.')
      setEnviandoFoto(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(caminho)
    const urlComCache = `${data.publicUrl}?t=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: urlComCache }).eq('id', user.id)

    setAvatarUrl(urlComCache)
    setEnviandoFoto(false)
  }

  async function handleTrocarSenha() {
    setErroSenha(null)
    setSenhaSalva(false)
    if (novaSenha.length < 6) {
      setErroSenha('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) {
      setErroSenha('Não foi possível trocar a senha.')
      return
    }
    setSenhaSalva(true)
    setNovaSenha('')
    setConfirmarSenha('')
  }

  async function toggleNotif(campo: 'treino' | 'pagamento' | 'mensagem', valor: boolean) {
    if (!user) return
    const novo = { treino: notifTreino, pagamento: notifPagamento, mensagem: notifMensagem, [campo]: valor }
    if (campo === 'treino') setNotifTreino(valor)
    if (campo === 'pagamento') setNotifPagamento(valor)
    if (campo === 'mensagem') setNotifMensagem(valor)
    await supabase.from('profiles').update({ notificacoes: novo }).eq('id', user.id)
  }

  async function handleSalvarAlteracoes() {
    if (!user) return
    setSalvando(true)
    await supabase.from('profiles').update({ name: nome }).eq('id', user.id)
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-sm text-white/40">Personalize seu perfil e as preferências do app</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-5">
          <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-graphite-300 text-lg font-bold text-gold">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              nome.slice(0, 2).toUpperCase()
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {enviandoFoto ? 'Enviando...' : 'Alterar foto'}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
              disabled={enviandoFoto}
            />
          </label>
          <div>
            <p className="text-sm font-medium">Foto exibida no seu perfil e no topo do painel</p>
            <p className="text-xs text-white/40">PNG ou JPG, recomendado 400x400px. Toque na foto para trocar.</p>
            {erroFoto && <p className="mt-1 text-xs text-red-400">{erroFoto}</p>}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Conta</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input label="E-mail" type="email" value={email} disabled />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores da Marca</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={corPrimaria}
            onChange={(e) => setCorPrimaria(e.target.value)}
            className="h-11 w-16 cursor-pointer rounded-xl border border-graphite-100 bg-graphite-300 p-1"
          />
          <Input
            value={corPrimaria}
            onChange={(e) => setCorPrimaria(e.target.value)}
            className="max-w-[160px]"
          />
          <p className="text-xs text-white/40">Cor de destaque usada em todo o app (padrão: dourado #FEBC03)</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>
        {erroSenha && <p className="mt-2 text-xs text-red-400">{erroSenha}</p>}
        {senhaSalva && <p className="mt-2 text-xs text-emerald-400">Senha alterada com sucesso!</p>}
        <Button variant="secondary" size="sm" className="mt-3" onClick={handleTrocarSenha}>
          Trocar Senha
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <ToggleRow
            label="Avisos de novo treino disponível"
            checked={notifTreino}
            onChange={(v) => toggleNotif('treino', v)}
          />
          <ToggleRow
            label="Avisos de pagamento (pendente/recebido)"
            checked={notifPagamento}
            onChange={(v) => toggleNotif('pagamento', v)}
          />
          <ToggleRow
            label="Novas mensagens de alunos"
            checked={notifMensagem}
            onChange={(v) => toggleNotif('mensagem', v)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Exportar todos os dados de alunos, treinos e financeiro</p>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Exportar dados
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {salvo && <p className="text-sm text-emerald-400">Salvo!</p>}
        <Button onClick={handleSalvarAlteracoes} disabled={salvando}>
          <Save className="h-4 w-4" />
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-white/70">{label}</p>
      <button
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-gold' : 'bg-graphite-200'}`}
      >
        <span
          className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
