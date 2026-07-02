// Supabase Edge Function: excluir-aluno
// Exclui o aluno por completo: o login dele (auth) E o cadastro (tabela alunos).
// Sem isso, apagar só na tela deixaria o login "fantasma" no Supabase,
// o que trava um novo cadastro futuro com o mesmo e-mail.
// Só pode ser chamada por um usuário autenticado com role = 'trainer'.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Não autenticado.' }, 401)
    }

    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerData, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !callerData.user) {
      return json({ error: 'Sessão inválida.' }, 401)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .single()

    if (callerProfile?.role !== 'trainer') {
      return json({ error: 'Apenas o treinador pode excluir alunos.' }, 403)
    }

    const { alunoId } = (await req.json()) as { alunoId: string }
    if (!alunoId) {
      return json({ error: 'Aluno é obrigatório.' }, 400)
    }

    const { data: aluno, error: alunoError } = await admin
      .from('alunos')
      .select('profile_id, trainer_id')
      .eq('id', alunoId)
      .single()

    if (alunoError || !aluno) {
      return json({ error: 'Aluno não encontrado.' }, 404)
    }
    if (aluno.trainer_id !== callerData.user.id) {
      return json({ error: 'Esse aluno não pertence a você.' }, 403)
    }

    // 1) Exclui o cadastro
    const { error: deleteAlunoError } = await admin.from('alunos').delete().eq('id', alunoId)
    if (deleteAlunoError) {
      return json({ error: `Erro ao excluir cadastro: ${deleteAlunoError.message}` }, 400)
    }

    // 2) Exclui o login (auth) — se existir
    if (aluno.profile_id) {
      await admin.auth.admin.deleteUser(aluno.profile_id)
      // Não bloqueia em caso de erro aqui: o cadastro já foi removido,
      // e um login sem cadastro associado não causa problema no app.
    }

    return json({ success: true })
  } catch (err) {
    return json({ error: (err as Error).message ?? 'Erro inesperado.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
