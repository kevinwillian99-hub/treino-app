import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { maskCPF, maskTelefone, maskRG, unmask } from '@/lib/masks'
import { criarAluno } from '@/lib/alunos'
import { supabase } from '@/lib/supabase'
import type { Modalidade, TipoOnline, TipoAluno, Plano, StatusAluno, MetaCorrida } from '@/types'

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export function NovoAluno() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dados pessoais
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [rg, setRg] = useState('')
  const [sexo, setSexo] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [endereco, setEndereco] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Modalidade e dependentes
  const [modalidade, setModalidade] = useState<Modalidade | ''>('')
  const [tipoOnline, setTipoOnline] = useState<TipoOnline | ''>('')
  const [plano, setPlano] = useState<Plano | ''>('')
  const [preco, setPreco] = useState('')
  const [status, setStatus] = useState<StatusAluno>('Ativo')
  const [meta, setMeta] = useState<MetaCorrida | ''>('')
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([])
  const [horario, setHorario] = useState('')
  const [professor, setProfessor] = useState('')
  const [unidade, setUnidade] = useState('')

  // Tipo de aluno
  const [tipo, setTipo] = useState<TipoAluno>('Individual')
  const [aluno2Nome, setAluno2Nome] = useState('')
  const [aluno2Email, setAluno2Email] = useState('')
  const [familiares, setFamiliares] = useState<string[]>([''])
  const [familiaPaga, setFamiliaPaga] = useState<'sim' | 'nao'>('sim')

  function toggleDia(dia: string) {
    setDiasSelecionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!modalidade) {
      setError('Selecione a modalidade.')
      return
    }

    setLoading(true)

    const cpfLimpo = unmask(cpf)
    const orFilters = [`email.eq.${email}`]
    if (cpfLimpo) orFilters.push(`cpf.eq.${cpfLimpo}`)

    const { data: existentes } = await supabase
      .from('alunos')
      .select('nome, email, cpf')
      .or(orFilters.join(','))

    if (existentes && existentes.length > 0) {
      const duplicado = existentes[0]
      const motivo = duplicado.email === email ? 'esse e-mail' : 'esse CPF'
      setError(`Já existe um aluno (${duplicado.nome}) cadastrado com ${motivo}.`)
      setLoading(false)
      return
    }

    const isento = tipo === 'Parceria' || (tipo === 'Família' && familiaPaga === 'nao')

    try {
      const resultado = await criarAluno({
        nome,
        cpf: cpf,
        rg,
        sexo: sexo || null,
        nascimento: nascimento || null,
        telefone: telefone,
        email,
        endereco,
        objetivo,
        observacoes,
        modalidade,
        tipo,
        plano: plano || null,
        preco: isento ? 0 : Number(preco || 0),
        status,
        isento,
        meta: tipoOnline === 'Corrida' ? meta || null : null,
        tipo_online: modalidade === 'Online' ? tipoOnline || null : null,
        dias_semana: modalidade === 'Presencial' ? diasSelecionados : null,
        horario: modalidade === 'Presencial' ? horario : null,
        professor: modalidade === 'Presencial' ? professor : null,
        unidade: modalidade === 'Presencial' ? unidade : null,
      })
      if (resultado?.avisoEmail) {
        alert(resultado.avisoEmail)
      }
      navigate('/treinador/alunos')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Novo Aluno</h1>
        <p className="text-sm text-white/40">
          Ao salvar, o acesso é criado automaticamente e o aluno recebe o e-mail de boas-vindas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="CPF"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
            />
            <Input label="RG" value={rg} onChange={(e) => setRg(maskRG(e.target.value))} placeholder="00.000.000-0" />
            <Select label="Sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </Select>
            <Input
              label="Nascimento"
              type="date"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
            />
            <Input
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(maskTelefone(e.target.value))}
              placeholder="(81) 99999-9999"
            />
            <Input
              label="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="sm:col-span-2"
            />
            <Select
              label="Objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="sm:col-span-2"
            >
              <option value="">Selecione o objetivo</option>
              <option value="Emagrecimento">Emagrecimento</option>
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Performance">Performance</option>
              <option value="Condicionamento físico">Condicionamento físico</option>
              <option value="Saúde e bem-estar">Saúde e bem-estar</option>
              <option value="Reabilitação">Reabilitação</option>
              <option value="Correção postural">Correção postural</option>
            </Select>
            <Input
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modalidade</CardTitle>
          </CardHeader>
          <Select
            value={modalidade}
            onChange={(e) => {
              setModalidade(e.target.value as Modalidade)
              setTipoOnline('')
              setPlano('')
            }}
            required
          >
            <option value="">Selecione a modalidade</option>
            <option value="Online">Online</option>
            <option value="Presencial">Presencial</option>
          </Select>

          {modalidade === 'Online' && (
            <div className="mt-4">
              <Select
                label="Tipo"
                value={tipoOnline}
                onChange={(e) => {
                  setTipoOnline(e.target.value as TipoOnline)
                  setPlano('')
                }}
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="Consultoria">Consultoria</option>
                <option value="Corrida">Corrida</option>
              </Select>
            </div>
          )}

          {modalidade === 'Online' && (tipoOnline === 'Consultoria' || tipoOnline === 'Corrida') && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Plano" value={plano} onChange={(e) => setPlano(e.target.value as Plano)}>
                <option value="">Selecione</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Anual">Anual</option>
              </Select>
              <Input
                label="Preço"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                disabled={tipo === 'Parceria' || (tipo === 'Família' && familiaPaga === 'nao')}
                placeholder="R$ 0,00"
              />
              {tipoOnline === 'Corrida' ? (
                <Select label="Meta" value={meta} onChange={(e) => setMeta(e.target.value as MetaCorrida)}>
                  <option value="">Selecione</option>
                  <option value="5 km">5 km</option>
                  <option value="10 km">10 km</option>
                  <option value="15 km">15 km</option>
                  <option value="21 km">21 km</option>
                  <option value="42 km">42 km</option>
                </Select>
              ) : (
                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as StatusAluno)}>
                  <option value="Ativo">Ativo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Cancelado">Cancelado</option>
                </Select>
              )}
            </div>
          )}

          {modalidade === 'Presencial' && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select label="Plano" value={plano} onChange={(e) => setPlano(e.target.value as Plano)}>
                  <option value="">Selecione</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Quinzenal">Quinzenal</option>
                </Select>
                <Input
                  label="Preço"
                  type="number"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  disabled={tipo === 'Parceria' || (tipo === 'Família' && familiaPaga === 'nao')}
                  placeholder="R$ 0,00"
                />
                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as StatusAluno)}>
                  <option value="Ativo">Ativo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Cancelado">Cancelado</option>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
                  Dias da Semana
                </p>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => (
                    <button
                      type="button"
                      key={dia}
                      onClick={() => toggleDia(dia)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        diasSelecionados.includes(dia)
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-graphite-100 text-white/50 hover:text-white'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Horário" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="18:00" />
                <Input label="Professor" value={professor} onChange={(e) => setProfessor(e.target.value)} />
                <Input label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)} />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Aluno</CardTitle>
          </CardHeader>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAluno)}>
            <option value="Individual">Individual</option>
            <option value="Dupla">Dupla</option>
            {modalidade === 'Online' && <option value="Família">Família</option>}
            <option value="Parceria">Parceria</option>
          </Select>

          {tipo === 'Dupla' && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nome do Aluno 2" value={aluno2Nome} onChange={(e) => setAluno2Nome(e.target.value)} />
              <Input
                label="E-mail do Aluno 2"
                type="email"
                value={aluno2Email}
                onChange={(e) => setAluno2Email(e.target.value)}
              />
              <p className="text-xs text-white/30 sm:col-span-2">
                O Aluno 2 recebe um cadastro completo próprio após você salvar este.
              </p>
            </div>
          )}

          {tipo === 'Família' && (
            <div className="mt-4 space-y-4">
              <Select
                label="Esse grupo familiar vai pagar?"
                value={familiaPaga}
                onChange={(e) => setFamiliaPaga(e.target.value as 'sim' | 'nao')}
              >
                <option value="sim">Sim</option>
                <option value="nao">Não (isento)</option>
              </Select>
              {familiaPaga === 'nao' && (
                <p className="flex items-center gap-2 text-sm text-gold/80">
                  <CheckCircle2 className="h-4 w-4" />
                  Cadastro marcado como isento. Não gera cobrança.
                </p>
              )}
              <div className="space-y-3">
                {familiares.map((nomeFamiliar, i) => (
                  <Input
                    key={i}
                    label={`Membro ${i + 1}`}
                    value={nomeFamiliar}
                    onChange={(e) => {
                      const copia = [...familiares]
                      copia[i] = e.target.value
                      setFamiliares(copia)
                    }}
                  />
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setFamiliares([...familiares, ''])}
                >
                  Adicionar membro
                </Button>
              </div>
            </div>
          )}

          {tipo === 'Parceria' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-gold/80">
              <CheckCircle2 className="h-4 w-4" />
              Valor automaticamente definido como R$ 0,00. Não gera cobrança.
            </p>
          )}
        </Card>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/treinador/alunos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar e enviar boas-vindas'}
          </Button>
        </div>
      </form>
    </div>
  )
}
