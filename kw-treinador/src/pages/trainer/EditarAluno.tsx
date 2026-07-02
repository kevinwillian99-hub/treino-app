import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { maskCPF, maskTelefone, unmask } from '@/lib/masks'
import type { Aluno, Modalidade, TipoOnline, Plano, StatusAluno, MetaCorrida } from '@/types'

export function EditarAluno() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aluno, setAluno] = useState<Aluno | null>(null)
  const [emailOriginal, setEmailOriginal] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('alunos').select('*').eq('id', id).single()
      setAluno(data as Aluno)
      setEmailOriginal((data as Aluno)?.email ?? '')
      setLoading(false)
    }
    load()
  }, [id])

  function atualizarCampo<K extends keyof Aluno>(campo: K, valor: Aluno[K]) {
    if (!aluno) return
    setAluno({ ...aluno, [campo]: valor })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!aluno) return
    setErro(null)
    setSalvando(true)

    if (aluno.email !== emailOriginal) {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const { data, error: fnError } = await supabase.functions.invoke('atualizar-email-aluno', {
        body: { alunoId: aluno.id, novoEmail: aluno.email },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (fnError || data?.error) {
        setErro(data?.error ?? fnError?.message ?? 'Erro ao atualizar e-mail.')
        setSalvando(false)
        return
      }
    }

    const { error } = await supabase
      .from('alunos')
      .update({
        nome: aluno.nome,
        cpf: unmask(aluno.cpf ?? ''),
        telefone: unmask(aluno.telefone ?? ''),
        endereco: aluno.endereco,
        objetivo: aluno.objetivo,
        observacoes: aluno.observacoes,
        modalidade: aluno.modalidade,
        plano: aluno.plano,
        preco: aluno.preco,
        status: aluno.status,
        meta: aluno.meta,
      })
      .eq('id', aluno.id)

    setSalvando(false)
    if (error) {
      setErro(error.message)
      return
    }
    navigate('/treinador/alunos')
  }

  if (loading) return <p className="text-sm text-white/40">Carregando...</p>
  if (!aluno) return <p className="text-sm text-white/40">Aluno não encontrado.</p>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Editar Aluno</h1>
        <p className="text-sm text-white/40">Alterar o e-mail aqui também troca o login de acesso do aluno.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              value={aluno.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
              required
            />
            <Input
              label="E-mail (login)"
              type="email"
              value={aluno.email}
              onChange={(e) => atualizarCampo('email', e.target.value)}
              required
            />
            <Input
              label="CPF"
              value={aluno.cpf ?? ''}
              onChange={(e) => atualizarCampo('cpf', maskCPF(e.target.value))}
            />
            <Input
              label="Telefone"
              value={aluno.telefone ?? ''}
              onChange={(e) => atualizarCampo('telefone', maskTelefone(e.target.value))}
            />
            <Input
              label="Endereço"
              value={aluno.endereco ?? ''}
              onChange={(e) => atualizarCampo('endereco', e.target.value)}
              className="sm:col-span-2"
            />
            <Input
              label="Objetivo"
              value={aluno.objetivo ?? ''}
              onChange={(e) => atualizarCampo('objetivo', e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modalidade e Plano</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Modalidade"
              value={aluno.modalidade}
              onChange={(e) => atualizarCampo('modalidade', e.target.value as Modalidade)}
            >
              <option value="Online">Online</option>
              <option value="Presencial">Presencial</option>
            </Select>
            {aluno.modalidade === 'Online' && (
              <Select
                label="Tipo"
                value={aluno.tipoOnline ?? ''}
                onChange={(e) => atualizarCampo('tipoOnline', e.target.value as TipoOnline)}
              >
                <option value="">Selecione</option>
                <option value="Consultoria">Consultoria</option>
                <option value="Corrida">Corrida</option>
              </Select>
            )}
            <Select
              label="Status"
              value={aluno.status}
              onChange={(e) => atualizarCampo('status', e.target.value as StatusAluno)}
            >
              <option value="Ativo">Ativo</option>
              <option value="Pausado">Pausado</option>
              <option value="Cancelado">Cancelado</option>
            </Select>
            <Select
              label="Plano"
              value={aluno.plano ?? ''}
              onChange={(e) => atualizarCampo('plano', e.target.value as Plano)}
            >
              <option value="">Selecione</option>
              <option value="Mensal">Mensal</option>
              {aluno.modalidade === 'Presencial' && <option value="Quinzenal">Quinzenal</option>}
              {aluno.modalidade === 'Online' && (
                <>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                </>
              )}
            </Select>
            <Input
              label="Preço"
              type="number"
              step="0.01"
              value={aluno.preco ?? 0}
              onChange={(e) => atualizarCampo('preco', Number(e.target.value))}
            />
            {aluno.tipoOnline === 'Corrida' && (
              <Select
                label="Meta"
                value={aluno.meta ?? ''}
                onChange={(e) => atualizarCampo('meta', e.target.value as MetaCorrida)}
              >
                <option value="">Selecione</option>
                <option value="5 km">5 km</option>
                <option value="10 km">10 km</option>
                <option value="15 km">15 km</option>
                <option value="21 km">21 km</option>
                <option value="42 km">42 km</option>
              </Select>
            )}
          </div>
        </Card>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/treinador/alunos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
