import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Mensagem {
  id: string
  remetente: 'trainer' | 'student'
  conteudo: string
  created_at: string
}

export function StudentMensagens() {
  const { user } = useAuth()
  const [alunoId, setAlunoId] = useState<string | null>(null)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id, trainer_id')
        .eq('profile_id', user.id)
        .single()
      if (aluno) {
        setAlunoId(aluno.id)
        setTrainerId(aluno.trainer_id)
        const { data: msgs } = await supabase
          .from('mensagens')
          .select('*')
          .eq('aluno_id', aluno.id)
          .order('created_at')
        setMensagens((msgs as Mensagem[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviar() {
    if (!alunoId || !trainerId || !texto.trim()) return
    const { data } = await supabase
      .from('mensagens')
      .insert({ trainer_id: trainerId, aluno_id: alunoId, remetente: 'student', conteudo: texto.trim() })
      .select()
      .single()
    if (data) setMensagens((prev) => [...prev, data as Mensagem])
    setTexto('')
  }

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-3 text-lg font-bold">Mensagens</h1>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto">
        {mensagens.length === 0 ? (
          <p className="text-center text-sm text-white/30">Nenhuma mensagem ainda.</p>
        ) : (
          mensagens.map((m) => (
            <div key={m.id} className={`flex ${m.remetente === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.remetente === 'student' ? 'bg-gold text-graphite-700' : 'bg-graphite-300 text-white'
                }`}
              >
                {m.conteudo}
              </div>
            </div>
          ))
        )}
        <div ref={fimRef} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escreva uma mensagem..."
          className="h-10 flex-1 rounded-xl border border-graphite-100 bg-graphite-300 px-4 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
        />
        <button
          onClick={enviar}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold text-graphite-700"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
