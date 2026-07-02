export type UserRole = 'trainer' | 'student'

export interface AppUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
}

export type Modalidade = 'Online' | 'Presencial'
export type TipoOnline = 'Consultoria' | 'Corrida'
export type TipoAluno = 'Individual' | 'Dupla' | 'Família' | 'Parceria'
export type StatusAluno = 'Ativo' | 'Pausado' | 'Cancelado'
export type Plano = 'Mensal' | 'Quinzenal' | 'Trimestral' | 'Semestral' | 'Anual'
export type MetaCorrida = '5 km' | '10 km' | '15 km' | '21 km' | '42 km'

export interface Aluno {
  id: string
  nome: string
  fotoUrl?: string
  cpf?: string
  rg?: string
  sexo?: 'Masculino' | 'Feminino' | 'Outro'
  nascimento?: string
  telefone?: string
  email?: string
  endereco?: string
  objetivo?: string
  observacoes?: string
  modalidade: Modalidade
  tipoOnline?: TipoOnline
  tipo: TipoAluno
  plano?: Plano
  preco?: number
  status: StatusAluno
  meta?: MetaCorrida
  vencimento?: string
  isento?: boolean
}

export interface DashboardStats {
  totalAlunos: number
  online: number
  presencial: number
  consultoria: number
  corrida: number
  dupla: number
  familia: number
  parceria: number
  receitaMensal: number
  receitaAnual: number
  pagamentosPendentes: number
}
