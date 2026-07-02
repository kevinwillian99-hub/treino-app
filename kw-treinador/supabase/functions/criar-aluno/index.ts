// Supabase Edge Function: criar-aluno
// Cria o convite (auth + e-mail de boas-vindas automático do próprio Supabase)
// e o registro do aluno. 100% Supabase, sem serviço externo de e-mail,
// sem precisar de domínio pago.
// Só pode ser chamada por um usuário autenticado com role = 'trainer'.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = 'https://appkevinwillian.vercel.app'

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
      return json({ error: 'Apenas o treinador pode cadastrar alunos.' }, 403)
    }

    const body = await req.json()
    const { aluno } = body as { aluno: Record<string, unknown> }

    if (!aluno?.email || !aluno?.nome) {
      return json({ error: 'Nome e e-mail são obrigatórios.' }, 400)
    }

    // Cria o usuário e dispara o e-mail de convite nativo do Supabase
    // (texto e visual do e-mail são editados em Authentication > Email Templates > Invite user)
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      aluno.email as string,
      { data: { name: aluno.nome }, redirectTo: `${SITE_URL}/definir-senha` }
    )

    if (inviteError) {
      return json({ error: `Erro ao convidar aluno: ${inviteError.message}` }, 400)
    }

    const newUserId = invited.user.id

    const { error: profileError } = await admin.from('profiles').upsert({
      id: newUserId,
      name: aluno.nome,
      role: 'student',
    })

    if (profileError) {
      return json({ error: `Erro ao criar perfil: ${profileError.message}` }, 400)
    }

    const { error: alunoError } = await admin.from('alunos').insert({
      ...aluno,
      profile_id: newUserId,
      trainer_id: callerData.user.id,
    })

    if (alunoError) {
      return json({ error: `Erro ao salvar dados do aluno: ${alunoError.message}` }, 400)
    }

    return json({ success: true, userId: newUserId })
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
