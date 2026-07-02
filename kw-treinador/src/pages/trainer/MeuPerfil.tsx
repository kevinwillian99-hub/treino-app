import { Link } from 'react-router-dom'
import { Settings, Dumbbell, LogOut, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'

export function MeuPerfil() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-white/40">Suas informações como treinador</p>
      </div>

      <Card className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-graphite-300 text-lg font-bold text-gold">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-base font-semibold">{user?.name}</p>
          <p className="text-sm text-white/40">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
            Treinador
          </span>
        </div>
      </Card>

      <Card className="p-0">
        <Link
          to="/treinador/configuracoes"
          className="flex items-center justify-between border-b border-graphite-200/60 px-4 py-3 text-left hover:bg-graphite-300/40"
        >
          <span className="flex items-center gap-3 text-sm">
            <Settings className="h-4 w-4 text-white/50" />
            Configurações
          </span>
          <ChevronRight className="h-4 w-4 text-white/30" />
        </Link>
        <Link
          to="/aluno"
          className="flex items-center justify-between px-4 py-3 text-left hover:bg-graphite-300/40"
        >
          <span className="flex items-center gap-3 text-sm">
            <Dumbbell className="h-4 w-4 text-white/50" />
            Meus Treinos
          </span>
          <ChevronRight className="h-4 w-4 text-white/30" />
        </Link>
      </Card>

      <button
        onClick={signOut}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-graphite-300/40"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  )
}
