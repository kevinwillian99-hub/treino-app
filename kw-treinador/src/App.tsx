import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { DefinirSenha } from '@/pages/DefinirSenha'
import { TrainerLayout } from '@/components/layout/TrainerLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { TrainerDashboard } from '@/pages/trainer/Dashboard'
import { Alunos } from '@/pages/trainer/Alunos'
import { NovoAluno } from '@/pages/trainer/NovoAluno'
import { EditarAluno } from '@/pages/trainer/EditarAluno'
import { PerfilAluno } from '@/pages/trainer/PerfilAluno'
import { Treinos } from '@/pages/trainer/Treinos'
import { NovoTreino } from '@/pages/trainer/NovoTreino'
import { Biblioteca } from '@/pages/trainer/Biblioteca'
import { Corridas } from '@/pages/trainer/Corridas'
import { NovoPlanoCorrida } from '@/pages/trainer/NovoPlanoCorrida'
import { Financeiro } from '@/pages/trainer/Financeiro'
import { Configuracoes } from '@/pages/trainer/Configuracoes'
import { Avaliacoes } from '@/pages/trainer/Avaliacoes'
import { Agenda } from '@/pages/trainer/Agenda'
import { Mensagens } from '@/pages/trainer/Mensagens'
import { Relatorios } from '@/pages/trainer/Relatorios'
import { MeuPerfil } from '@/pages/trainer/MeuPerfil'
import { StudentDashboard } from '@/pages/student/Dashboard'
import { StudentTreinos } from '@/pages/student/Treinos'
import { StudentCorrida } from '@/pages/student/Corrida'
import { StudentEvolucao } from '@/pages/student/Evolucao'
import { StudentPerfil } from '@/pages/student/Perfil'
import { StudentMeusDados } from '@/pages/student/MeusDados'
import { StudentNotificacoes } from '@/pages/student/Notificacoes'
import { StudentMetas } from '@/pages/student/Metas'
import { StudentAjuda } from '@/pages/student/Ajuda'
import { StudentAlterarSenha } from '@/pages/student/AlterarSenha'
import { StudentAvaliacoes } from '@/pages/student/Avaliacoes'
import { StudentMensagens } from '@/pages/student/Mensagens'
import { StudentAgenda } from '@/pages/student/Agenda'
import { EmConstrucao } from '@/pages/EmConstrucao'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'trainer' ? '/treinador' : '/aluno'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/definir-senha" element={<DefinirSenha />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/treinador"
        element={
          <ProtectedRoute allow="trainer">
            <TrainerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TrainerDashboard />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="alunos/novo" element={<NovoAluno />} />
        <Route path="alunos/:id" element={<PerfilAluno />} />
        <Route path="alunos/:id/editar" element={<EditarAluno />} />
        <Route path="treinos" element={<Treinos />} />
        <Route path="treinos/novo" element={<NovoTreino />} />
        <Route path="corridas" element={<Corridas />} />
        <Route path="corridas/novo" element={<NovoPlanoCorrida />} />
        <Route path="avaliacoes" element={<Avaliacoes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="mensagens" element={<Mensagens />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="perfil" element={<MeuPerfil />} />
      </Route>

      <Route
        path="/aluno"
        element={
          <ProtectedRoute allow="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="treinos" element={<StudentTreinos />} />
        <Route path="corrida" element={<StudentCorrida />} />
        <Route path="evolucao" element={<StudentEvolucao />} />
        <Route path="agenda" element={<StudentAgenda />} />
        <Route path="mensagens" element={<StudentMensagens />} />
        <Route path="perfil" element={<StudentPerfil />} />
        <Route path="perfil/dados" element={<StudentMeusDados />} />
        <Route path="perfil/notificacoes" element={<StudentNotificacoes />} />
        <Route path="perfil/metas" element={<StudentMetas />} />
        <Route path="perfil/avaliacoes" element={<StudentAvaliacoes />} />
        <Route path="perfil/ajuda" element={<StudentAjuda />} />
        <Route path="perfil/senha" element={<StudentAlterarSenha />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
