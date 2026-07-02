import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  User as UserIcon,
  Bell,
  Target,
  ClipboardCheck,
  HelpCircle,
  LogOut,
  KeyRound,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'

const itens = [
  { label: 'Meus Dados', icon: UserIcon, to: '/aluno/perfil/dados' },
  { label: 'Alterar Senha', icon: KeyRound, to: '/aluno/perfil/senha' },
  { label: 'Notificações', icon: Bell, to: '/aluno/perfil/notificacoes' },
  { label: 'Metas', icon: Target, to: '/aluno/perfil/metas' },
  { label: 'Avaliações', icon: ClipboardCheck, to: '/aluno/perfil/avaliacoes' },
  { label: 'Ajuda e Suporte', icon: HelpCircle, to: '/aluno/perfil/ajuda' },
]

export function StudentPerfil() {
  const { user, signOut } = useAuth()
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-graphite-300 text-base font-bold text-gold">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-xs text-white/40">{user?.email}</p>
        </div>
      </Card>

      <Card className="p-0">
        {itens.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="flex w-full items-center justify-between border-b border-graphite-200/60 px-4 py-3 text-left last:border-0"
          >
            <span className="flex items-center gap-3 text-sm">
              <Icon className="h-4 w-4 text-white/50" />
              {label}
            </span>
            <ChevronRight className="h-4 w-4 text-white/30" />
          </Link>
        ))}
      </Card>

      {confirmando ? (
        <Card className="space-y-3">
          <p className="text-sm text-white/70">Tem certeza que deseja sair?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmando(false)}
              className="flex-1 rounded-xl border border-graphite-100 py-2 text-sm text-white/60"
            >
              Cancelar
            </button>
            <button
              onClick={signOut}
              className="flex-1 rounded-xl bg-red-500/10 py-2 text-sm font-medium text-red-400"
            >
              Sair
            </button>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setConfirmando(true)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      )}
    </div>
  )
}
