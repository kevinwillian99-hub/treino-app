import { supabase } from '@/lib/supabase'

export async function criarAluno(payload: Record<string, unknown>) {
  // Garante que a sessão está fresca antes de chamar a Edge Function
  await supabase.auth.refreshSession()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const { data, error } = await supabase.functions.invoke('criar-aluno', {
    body: { aluno: payload },
    headers: { Authorization: `Bearer ${token}` },
  })

  if (error) {
    const contexto = (error as { context?: Response }).context
    let mensagemReal: string | null = null
    if (contexto) {
      try {
        const corpo = await contexto.clone().json()
        mensagemReal = corpo?.error ?? null
      } catch {
        mensagemReal = null
      }
    }
    throw new Error(mensagemReal ?? error.message)
  }
  if (data?.error) {
    throw new Error(data.error)
  }
  return data
}
