export interface Exercicio {
  id: string
  nome: string
  categoria: string
  video_url?: string | null
  observacoes?: string | null
}

export interface Treino {
  id: string
  aluno_id: string
  nome: string
  observacoes?: string | null
  created_at: string
}

export interface TreinoExercicio {
  id: string
  treino_id: string
  exercicio_id: string | null
  ordem: number
  series?: string | null
  repeticoes?: string | null
  carga?: string | null
  descanso?: string | null
  observacoes?: string | null
  concluido?: boolean
  exercicio?: Exercicio
}
