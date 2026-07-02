import { Outlet, NavLink, Link } from 'react-router-dom'
import { Home, Dumbbell, Footprints, TrendingUp, User, Bell, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const tabs = [
  { label: 'Início', to: '/aluno', icon: Home, end: true },
  { label: 'Treinos', to: '/aluno/treinos', icon: Dumbbell, end: false },
  { label: 'Corrida', to: '/aluno/corrida', icon: Footprints, end: false },
  { label: 'Evolução', to: '/aluno/evolucao', icon: TrendingUp, end: false },
  { label: 'Perfil', to: '/aluno/perfil', icon: User, end: false },
]

export function StudentLayout() {
  const { user } = useAuth()
  const isTrainerPreview = user?.role === 'trainer'

  return (
    <div className="flex min-h-screen justify-center bg-graphite-700 sm:py-6">
      <div className="relative flex w-full max-w-md flex-col bg-graphite-500 sm:min-h-[760px] sm:rounded-3xl sm:border sm:border-graphite-200 sm:shadow-soft">
        <header className="flex items-center justify-between border-b border-graphite-200 px-5 py-4">
          {isTrainerPreview ? (
            <Link
              to="/treinador"
              className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Painel
            </Link>
          ) : (
            <img src="/logo-mark.png" alt="KW" className="h-7 w-7 object-contain" />
          )}
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-graphite-300 text-white/60">
            <Bell className="h-4 w-4" />
          </button>
        </header>

        {isTrainerPreview && (
          <div className="border-b border-graphite-200 bg-gold/5 px-5 py-2 text-center text-[11px] font-medium text-gold">
            Meus Treinos · {user?.name}
          </div>
        )}

        <main className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 pb-24">
          <Outlet />
        </main>

        <nav className="absolute bottom-0 left-0 right-0 flex justify-between border-t border-graphite-200 bg-graphite-600 px-2 py-2 sm:rounded-b-3xl">
          {tabs.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium text-white/40 transition-colors',
                  isActive && 'text-gold'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
