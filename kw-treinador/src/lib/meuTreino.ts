import { supabase } from '@/lib/supabase'
import type { AppUser } from '@/types'

/**
 * Garante que o treinador tenha um cadastro de aluno vinculado a ele mesmo,
 * para poder usar a área do aluno e registrar seus próprios treinos.
 * Cria o registro na primeira vez que ele acessar "Meus Treinos".
 */
export async function garantirMeuCadastro(user: AppUser) {
  const { data: existente } = await supabase
    .from('alunos')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (existente) return existente.id

  const { data: criado, error } = await supabase
    .from('alunos')
    .insert({
      trainer_id: user.id,
      profile_id: user.id,
      nome: user.name,
      email: user.email,
      modalidade: 'Online',
      tipo: 'Individual',
      status: 'Ativo',
    })
    .select('id')
    .single()

  if (error) throw error
  return criado.id
}
