import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, X, Search, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { modelosMensagemPadrao } from '@/lib/modelosMensagem'
import { cn } from '@/lib/utils'
import type { Aluno } from '@/types'

interface Mensagem {
  id: string
  aluno_id: string
  remetente: 'trainer' | 'student'
  conteudo: string
  created_at: string
}

export function Mensagens() {
  const { user } = useAuth()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [busca, setBusca] = useState('')
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [mostrarModelos, setMostrarModelos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('alunos').select('*').order('nome')
      setAlunos((data as Aluno[]) ?? [])
    }
    load()
  }, [])

  useEffect(() => {
    async function loadMensagens() {
      if (!alunoSelecionado) return
      const { data } = await supabase
        .from('mensagens')
        .select('*')
        .eq('aluno_id', alunoSelecionado.id)
        .order('created_at')
      setMensagens((data as Mensagem[]) ?? [])
    }
    loadMensagens()
  }, [alunoSelecionado])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviarMensagem(conteudo: string) {
    if (!user || !alunoSelecionado || !conteudo.trim()) return
    setEnviando(true)
    const { data } = await supabase
      .from('mensagens')
      .insert({
        trainer_id: user.id,
        aluno_id: alunoSelecionado.id,
        remetente: 'trainer',
        conteudo: conteudo.trim(),
      })
      .select()
      .single()
    if (data) setMensagens((prev) => [...prev, data as Mensagem])
    setTexto('')
    setMostrarModelos(false)
    setEnviando(false)
  }

  const filtrados = alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 sm:h-[calc(100vh-4rem)]">
      {/* Lista de alunos — some no celular quando um aluno está selecionado */}
      <Card
        className={cn(
          'flex w-full flex-shrink-0 flex-col p-0 sm:w-72',
          alunoSelecionado ? 'hidden sm:flex' : 'flex'
        )}
      >
        <div className="border-b border-graphite-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Buscar aluno..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {filtrados.map((aluno) => (
            <button
              key={aluno.id}
              onClick={() => setAlunoSelecionado(aluno)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-graphite-300 ${
                alunoSelecionado?.id === aluno.id ? 'bg-graphite-300' : ''
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-graphite-200 text-xs font-semibold text-gold">
                {aluno.nome.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{aluno.nome}</p>
                <p className="truncate text-xs text-white/40">{aluno.modalidade}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat — some no celular até escolher um aluno */}
      <Card
        className={cn(
          'flex-1 flex-col p-0',
          alunoSelecionado ? 'flex' : 'hidden sm:flex'
        )}
      >
        {!alunoSelecionado ? (
          <div className="flex flex-1 items-center justify-center text-sm text-white/30">
            Selecione um aluno para ver a conversa
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-graphite-200 px-3 py-3 sm:px-5">
              <button
                onClick={() => setAlunoSelecionado(null)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-white/50 sm:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold">{alunoSelecionado.nome}</p>
            </div>

            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {mensagens.length === 0 ? (
                <p className="text-center text-sm text-white/30">
                  Nenhuma mensagem ainda. Que tal mandar as boas-vindas?
                </p>
              ) : (
                mensagens.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.remetente === 'trainer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-md ${
                        m.remetente === 'trainer'
                          ? 'bg-gold text-graphite-700'
                          : 'bg-graphite-300 text-white'
                      }`}
                    >
                      {m.conteudo}
                    </div>
                  </div>
                ))
              )}
              <div ref={fimRef} />
            </div>

            {mostrarModelos && (
              <div className="scrollbar-thin max-h-56 overflow-y-auto border-t border-graphite-200 bg-graphite-600 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    Modelos de Mensagem
                  </p>
                  <button onClick={() => setMostrarModelos(false)} className="text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {modelosMensagemPadrao.map((modelo, i) => (
                    <button
                      key={i}
                      onClick={() => enviarMensagem(modelo.conteudo)}
                      className="block w-full rounded-xl border border-graphite-100 p-3 text-left text-xs hover:border-gold/40 hover:bg-gold/5"
                    >
                      <span className="mb-1 block font-semibold text-gold">{modelo.categoria}</span>
                      <span className="text-white/60">{modelo.conteudo}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-graphite-200 p-3 sm:p-4">
              <button
                onClick={() => setMostrarModelos(!mostrarModelos)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-graphite-100 text-gold hover:bg-graphite-300"
                title="Modelos de mensagem"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarMensagem(texto)}
                placeholder="Escreva uma mensagem..."
                className="h-10 flex-1 rounded-xl border border-graphite-100 bg-graphite-300 px-4 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
              />
              <Button size="icon" onClick={() => enviarMensagem(texto)} disabled={enviando}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
