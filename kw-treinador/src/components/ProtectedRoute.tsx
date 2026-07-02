import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

export function ProtectedRoute({
  children,
  allow,
}: {
  children: JSX.Element
  allow: UserRole
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-graphite-500">
        <p className="text-sm text-white/40">Carregando...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Treinador pode acessar a área do aluno (ex: "Meus Treinos" em Configurações).
  // Aluno nunca acessa a área do treinador.
  if (allow === 'trainer' && user.role !== 'trainer') {
    return <Navigate to="/aluno" replace />
  }

  return children
}
