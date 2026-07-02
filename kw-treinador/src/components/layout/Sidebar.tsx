import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Footprints,
  Calendar,
  Wallet,
  MessageSquare,
  FileBarChart,
  BookOpen,
  Settings,
  User,
  LogOut,
  UserCircle2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { garantirMeuCadastro } from '@/lib/meuTreino'

const trainerItems = [
  { label: 'Dashboard', to: '/treinador', icon: LayoutDashboard },
  { label: 'Alunos', to: '/treinador/alunos', icon: Users },
  { label: 'Treinos', to: '/treinador/treinos', icon: Dumbbell },
  { label: 'Biblioteca de Exercícios', to: '/treinador/biblioteca', icon: BookOpen },
  { label: 'Corridas', to: '/treinador/corridas', icon: Footprints },
  { label: 'Agenda', to: '/treinador/agenda', icon: Calendar },
  { label: 'Financeiro', to: '/treinador/financeiro', icon: Wallet },
  { label: 'Mensagens', to: '/treinador/mensagens', icon: MessageSquare },
  { label: 'Relatórios', to: '/treinador/relatorios', icon: FileBarChart },
  { label: 'Configurações', to: '/treinador/configuracoes', icon: Settings },
  { label: 'Meu Perfil', to: '/treinador/perfil', icon: User },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [indo, setIndo] = useState(false)

  async function abrirMeusTreinos() {
    if (!user) return
    setIndo(true)
    try {
      await garantirMeuCadastro(user)
      navigate('/aluno')
      onClose?.()
    } finally {
      setIndo(false)
    }
  }

  return (
    <>
      {/* Fundo escurecido por trás do menu, só no celular */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-shrink-0 flex-col border-r border-graphite-200 bg-graphite-600 transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'sm:static sm:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-mark.png" alt="KW" className="h-7 w-7 object-contain" />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-wide">KEVIN WILLIAN</p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-gold">Treinador</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 sm:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-1 border-b border-graphite-200" />

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3">
          <button
            onClick={abrirMeusTreinos}
            disabled={indo}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-graphite-300 hover:text-white"
          >
            <UserCircle2 className="h-[18px] w-[18px] flex-shrink-0 text-gold" />
            <span className="truncate">{indo ? 'Abrindo...' : 'Meus Treinos'}</span>
          </button>
          <div className="my-2 border-t border-graphite-200/60" />

          {trainerItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/treinador'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors',
                  'hover:bg-graphite-300 hover:text-white',
                  isActive && 'bg-graphite-300 text-gold'
                )
              }
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-graphite-200 px-3 py-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-graphite-300 text-xs font-semibold text-gold">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-white/40">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-graphite-300 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
