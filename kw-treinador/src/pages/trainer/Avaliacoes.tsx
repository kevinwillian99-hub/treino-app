import { useEffect, useState, type FormEvent } from 'react'
import { Plus, X, ClipboardCheck, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SecaoPostural, LadoPostural, CampoPostural } from '@/components/ui/PosturalUI'
import { opcoesPostural, avaliacaoPosturalVazia, type AvaliacaoPostural } from '@/lib/avaliacaoPostural'
import type { Aluno } from '@/types'

interface Avaliacao {
  id: string
  aluno_id: string
  data: string
  peso: number | null
  altura: number | null
  percentual_gordura: number | null
  cintura: number | null
  alunos?: { nome: string } | null
}

const fotoSlots = [
  { campo: 'foto_frontal_url', label: 'Foto Frontal' },
  { campo: 'foto_lateral_esq_url', label: 'Perfil Esquerdo' },
  { campo: 'foto_lateral_dir_url', label: 'Perfil Direito' },
  { campo: 'foto_perfil_esq_flexao_url', label: 'Perfil Esq. em Flexão' },
  { campo: 'foto_perfil_dir_flexao_url', label: 'Perfil Dir. em Flexão' },
  { campo: 'foto_posterior_url', label: 'Foto Dorsal' },
] as const

export function Avaliacoes() {
  const { user } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState<string | null>(null)

  const [alunoId, setAlunoId] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [percentualGordura, setPercentualGordura] = useState('')
  const [peito, setPeito] = useState('')
  const [braco, setBraco] = useState('')
  const [cintura, setCintura] = useState('')
  const [quadril, setQuadril] = useState('')
  const [coxa, setCoxa] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [abaAtiva, setAbaAtiva] = useState<'postura' | 'perimetria'>('postura')

  // Avaliação Postural (estrutura clínica completa, bilateral)
  const [postura, setPostura] = useState<AvaliacaoPostural>(avaliacaoPosturalVazia)
  const [observacoesPostura, setObservacoesPostura] = useState('')
  const [fotos, setFotos] = useState<Record<string, string>>({})

  async function carregar() {
    const [av, al] = await Promise.all([
      supabase.from('avaliacoes').select('*, alunos(nome)').order('data', { ascending: false }),
      supabase.from('alunos').select('*').order('nome'),
    ])
    setAvaliacoes((av.data as unknown as Avaliacao[]) ?? [])
    setAlunos((al.data as Aluno[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const imc = peso && altura ? (Number(peso) / (Number(altura) * Number(altura))).toFixed(1) : null

  async function handleFotoUpload(campo: string, file: File) {
    if (!user) return
    setEnviandoFoto(campo)
    const caminho = `${user.id}/${Date.now()}-${campo}.jpg`
    const { error } = await supabase.storage.from('avaliacoes-fotos').upload(caminho, file)
    if (!error) {
      const { data } = supabase.storage.from('avaliacoes-fotos').getPublicUrl(caminho)
      setFotos((prev) => ({ ...prev, [campo]: data.publicUrl }))
    }
    setEnviandoFoto(null)
  }

  function limparForm() {
    setMostrarForm(false)
    setAlunoId('')
    setPeso('')
    setAltura('')
    setPercentualGordura('')
    setPeito('')
    setBraco('')
    setCintura('')
    setQuadril('')
    setCoxa('')
    setObservacoes('')
    setFotos({})
    setPostura(avaliacaoPosturalVazia)
    setObservacoesPostura('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !alunoId) return
    setSalvando(true)
    await supabase.from('avaliacoes').insert({
      trainer_id: user.id,
      aluno_id: alunoId,
      peso: peso ? Number(peso) : null,
      altura: altura ? Number(altura) : null,
      percentual_gordura: percentualGordura ? Number(percentualGordura) : null,
      peito: peito ? Number(peito) : null,
      braco: braco ? Number(braco) : null,
      cintura: cintura ? Number(cintura) : null,
      quadril: quadril ? Number(quadril) : null,
      coxa: coxa ? Number(coxa) : null,
      observacoes: observacoes || null,
      avaliacao_postural: postura,
      observacoes_postura: observacoesPostura || null,
      foto_frontal_url: fotos.foto_frontal_url ?? null,
      foto_posterior_url: fotos.foto_posterior_url ?? null,
      foto_lateral_dir_url: fotos.foto_lateral_dir_url ?? null,
      foto_lateral_esq_url: fotos.foto_lateral_esq_url ?? null,
      foto_perfil_esq_flexao_url: fotos.foto_perfil_esq_flexao_url ?? null,
      foto_perfil_dir_flexao_url: fotos.foto_perfil_dir_flexao_url ?? null,
    })
    setSalvando(false)
    limparForm()
    carregar()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Avaliações</h1>
          <p className="text-sm text-white/40">{avaliacoes.length} avaliações registradas</p>
        </div>
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nova Avaliação Física e Postural</h2>
            <button onClick={limparForm} className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select label="Aluno" value={alunoId} onChange={(e) => setAlunoId(e.target.value)} required>
              <option value="">Selecione</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </Select>

            <div className="flex gap-6 border-b border-graphite-200">
              <button
                type="button"
                onClick={() => setAbaAtiva('postura')}
                className={`relative pb-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  abaAtiva === 'postura' ? 'text-red-400' : 'text-white/40 hover:text-white/70'
                }`}
              >
                Postura
                {abaAtiva === 'postura' && (
                  <span className="absolute -bottom-px left-0 h-0.5 w-full bg-red-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('perimetria')}
                className={`relative pb-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  abaAtiva === 'perimetria' ? 'text-red-400' : 'text-white/40 hover:text-white/70'
                }`}
              >
                Perimetria
                {abaAtiva === 'perimetria' && (
                  <span className="absolute -bottom-px left-0 h-0.5 w-full bg-red-400" />
                )}
              </button>
            </div>

            {abaAtiva === 'perimetria' && (
              <>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Composição Corporal
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Input label="Peso (kg)" type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} />
                    <Input label="Altura (m)" type="number" step="0.01" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="1.75" />
                    <Input label="% Gordura" type="number" step="0.1" value={percentualGordura} onChange={(e) => setPercentualGordura(e.target.value)} />
                    <div className="flex flex-col justify-end">
                      <p className="text-xs font-medium uppercase tracking-wide text-white/50">IMC</p>
                      <p className="flex h-11 items-center text-lg font-bold text-gold">{imc ?? '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Medidas (cm)
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <Input label="Peito" type="number" step="0.1" value={peito} onChange={(e) => setPeito(e.target.value)} />
                    <Input label="Braço" type="number" step="0.1" value={braco} onChange={(e) => setBraco(e.target.value)} />
                    <Input label="Cintura" type="number" step="0.1" value={cintura} onChange={(e) => setCintura(e.target.value)} />
                    <Input label="Quadril" type="number" step="0.1" value={quadril} onChange={(e) => setQuadril(e.target.value)} />
                    <Input label="Coxa" type="number" step="0.1" value={coxa} onChange={(e) => setCoxa(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {abaAtiva === 'postura' && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                Avaliação Postural
              </p>

              <div className="space-y-2">
                <SecaoPostural titulo="Cabeça">
                  <CampoPostural
                    label="Protrusão"
                    value={postura.cabeca.protrusao}
                    options={opcoesPostural.cabecaProtrusao}
                    onChange={(v) => setPostura({ ...postura, cabeca: { ...postura.cabeca, protrusao: v } })}
                  />
                  <CampoPostural
                    label="Inclinação"
                    value={postura.cabeca.inclinacao}
                    options={opcoesPostural.cabecaInclinacao}
                    onChange={(v) => setPostura({ ...postura, cabeca: { ...postura.cabeca, inclinacao: v } })}
                  />
                  <CampoPostural
                    label="Rotação"
                    value={postura.cabeca.rotacao}
                    options={opcoesPostural.cabecaRotacao}
                    onChange={(v) => setPostura({ ...postura, cabeca: { ...postura.cabeca, rotacao: v } })}
                  />
                </SecaoPostural>

                <SecaoPostural titulo="Ombros">
                  <LadoPostural titulo="Ombro Esquerdo">
                    <CampoPostural
                      value={postura.ombros.esquerdo.posicao}
                      options={opcoesPostural.ombroPosicao}
                      onChange={(v) =>
                        setPostura({ ...postura, ombros: { ...postura.ombros, esquerdo: { ...postura.ombros.esquerdo, posicao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.ombros.esquerdo.rotacao}
                      options={opcoesPostural.ombroRotacao}
                      onChange={(v) =>
                        setPostura({ ...postura, ombros: { ...postura.ombros, esquerdo: { ...postura.ombros.esquerdo, rotacao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.ombros.esquerdo.protusao}
                      options={opcoesPostural.ombroProtusao}
                      onChange={(v) =>
                        setPostura({ ...postura, ombros: { ...postura.ombros, esquerdo: { ...postura.ombros.esquerdo, protusao: v } } })
                      }
                    />
                  </LadoPostural>
                  <LadoPostural titulo="Ombro Direito">
                    <CampoPostural
                      value={postura.ombros.direito.posicao}
                      options={opcoesPostural.ombroPosicao}
                      onChange={(v) =>
                        setPostura({ ...postura, ombros: { ...postura.ombros, direito: { ...postura.ombros.direito, posicao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.ombros.direito.rotacao}
                      options={opcoesPostural.ombroRotacao}
                      onChange={(v) =>
                        setPostura({ ...postura, ombros: { ...postura.ombros, direito: { ...postura.ombros.direito, rotacao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.ombros.direito.protusao}
                      options={opcoesPostural.ombroProtusao}
                      onChange={(v) =>
                        setPostura({ ...postura, ombros: { ...postura.ombros, direito: { ...postura.ombros.direito, protusao: v } } })
                      }
                    />
                  </LadoPostural>
                </SecaoPostural>

                <SecaoPostural titulo="Cintura Escapular">
                  <LadoPostural titulo="Escápula Esquerda">
                    <CampoPostural
                      value={postura.cinturaEscapular.esquerda.tilt}
                      options={opcoesPostural.cinturaTilt}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, esquerda: { ...postura.cinturaEscapular.esquerda, tilt: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.esquerda.alada}
                      options={opcoesPostural.cinturaAlada}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, esquerda: { ...postura.cinturaEscapular.esquerda, alada: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.esquerda.elevacao}
                      options={opcoesPostural.cinturaElevacao}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, esquerda: { ...postura.cinturaEscapular.esquerda, elevacao: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.esquerda.rotacao}
                      options={opcoesPostural.cinturaRotacao}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, esquerda: { ...postura.cinturaEscapular.esquerda, rotacao: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.esquerda.abducao}
                      options={opcoesPostural.cinturaAbducao}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, esquerda: { ...postura.cinturaEscapular.esquerda, abducao: v } },
                        })
                      }
                    />
                  </LadoPostural>
                  <LadoPostural titulo="Escápula Direita">
                    <CampoPostural
                      value={postura.cinturaEscapular.direita.tilt}
                      options={opcoesPostural.cinturaTilt}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, direita: { ...postura.cinturaEscapular.direita, tilt: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.direita.alada}
                      options={opcoesPostural.cinturaAlada}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, direita: { ...postura.cinturaEscapular.direita, alada: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.direita.elevacao}
                      options={opcoesPostural.cinturaElevacao}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, direita: { ...postura.cinturaEscapular.direita, elevacao: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.direita.rotacao}
                      options={opcoesPostural.cinturaRotacao}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, direita: { ...postura.cinturaEscapular.direita, rotacao: v } },
                        })
                      }
                    />
                    <CampoPostural
                      value={postura.cinturaEscapular.direita.abducao}
                      options={opcoesPostural.cinturaAbducao}
                      onChange={(v) =>
                        setPostura({
                          ...postura,
                          cinturaEscapular: { ...postura.cinturaEscapular, direita: { ...postura.cinturaEscapular.direita, abducao: v } },
                        })
                      }
                    />
                  </LadoPostural>
                </SecaoPostural>

                <SecaoPostural titulo="Coluna Vertebral">
                  <CampoPostural
                    label="Cervical"
                    value={postura.coluna.cervical}
                    options={opcoesPostural.colunaCervical}
                    onChange={(v) => setPostura({ ...postura, coluna: { ...postura.coluna, cervical: v } })}
                  />
                  <CampoPostural
                    label="Torácica"
                    value={postura.coluna.toracica}
                    options={opcoesPostural.colunaToracica}
                    onChange={(v) => setPostura({ ...postura, coluna: { ...postura.coluna, toracica: v } })}
                  />
                  <CampoPostural
                    label="Lombar"
                    value={postura.coluna.lombar}
                    options={opcoesPostural.colunaLombar}
                    onChange={(v) => setPostura({ ...postura, coluna: { ...postura.coluna, lombar: v } })}
                  />
                  <CampoPostural
                    label="Desvio Lateral"
                    value={postura.coluna.desvio}
                    options={opcoesPostural.colunaDesvio}
                    onChange={(v) => setPostura({ ...postura, coluna: { ...postura.coluna, desvio: v } })}
                  />
                </SecaoPostural>

                <SecaoPostural titulo="Pelve">
                  <LadoPostural titulo="Pelve Esquerda">
                    <CampoPostural
                      value={postura.pelve.esquerda.vertical}
                      options={opcoesPostural.pelveVertical}
                      onChange={(v) =>
                        setPostura({ ...postura, pelve: { ...postura.pelve, esquerda: { ...postura.pelve.esquerda, vertical: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.pelve.esquerda.anteroPosterior}
                      options={opcoesPostural.pelveAnteroPosterior}
                      onChange={(v) =>
                        setPostura({ ...postura, pelve: { ...postura.pelve, esquerda: { ...postura.pelve.esquerda, anteroPosterior: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.pelve.esquerda.rotacao}
                      options={opcoesPostural.pelveRotacao}
                      onChange={(v) =>
                        setPostura({ ...postura, pelve: { ...postura.pelve, esquerda: { ...postura.pelve.esquerda, rotacao: v } } })
                      }
                    />
                  </LadoPostural>
                  <LadoPostural titulo="Pelve Direita">
                    <CampoPostural
                      value={postura.pelve.direita.vertical}
                      options={opcoesPostural.pelveVertical}
                      onChange={(v) =>
                        setPostura({ ...postura, pelve: { ...postura.pelve, direita: { ...postura.pelve.direita, vertical: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.pelve.direita.anteroPosterior}
                      options={opcoesPostural.pelveAnteroPosterior}
                      onChange={(v) =>
                        setPostura({ ...postura, pelve: { ...postura.pelve, direita: { ...postura.pelve.direita, anteroPosterior: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.pelve.direita.rotacao}
                      options={opcoesPostural.pelveRotacao}
                      onChange={(v) =>
                        setPostura({ ...postura, pelve: { ...postura.pelve, direita: { ...postura.pelve.direita, rotacao: v } } })
                      }
                    />
                  </LadoPostural>
                </SecaoPostural>

                <SecaoPostural titulo="Quadril">
                  <LadoPostural titulo="Quadril Esquerdo">
                    <CampoPostural
                      value={postura.quadril.esquerdo.flexao}
                      options={opcoesPostural.quadrilFlexao}
                      onChange={(v) =>
                        setPostura({ ...postura, quadril: { ...postura.quadril, esquerdo: { ...postura.quadril.esquerdo, flexao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.quadril.esquerdo.rotacao}
                      options={opcoesPostural.quadrilRotacao}
                      onChange={(v) =>
                        setPostura({ ...postura, quadril: { ...postura.quadril, esquerdo: { ...postura.quadril.esquerdo, rotacao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.quadril.esquerdo.abducao}
                      options={opcoesPostural.quadrilAbducao}
                      onChange={(v) =>
                        setPostura({ ...postura, quadril: { ...postura.quadril, esquerdo: { ...postura.quadril.esquerdo, abducao: v } } })
                      }
                    />
                  </LadoPostural>
                  <LadoPostural titulo="Quadril Direito">
                    <CampoPostural
                      value={postura.quadril.direito.flexao}
                      options={opcoesPostural.quadrilFlexao}
                      onChange={(v) =>
                        setPostura({ ...postura, quadril: { ...postura.quadril, direito: { ...postura.quadril.direito, flexao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.quadril.direito.rotacao}
                      options={opcoesPostural.quadrilRotacao}
                      onChange={(v) =>
                        setPostura({ ...postura, quadril: { ...postura.quadril, direito: { ...postura.quadril.direito, rotacao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.quadril.direito.abducao}
                      options={opcoesPostural.quadrilAbducao}
                      onChange={(v) =>
                        setPostura({ ...postura, quadril: { ...postura.quadril, direito: { ...postura.quadril.direito, abducao: v } } })
                      }
                    />
                  </LadoPostural>
                </SecaoPostural>

                <SecaoPostural titulo="Joelhos">
                  <LadoPostural titulo="Joelho Esquerdo">
                    <CampoPostural
                      value={postura.joelhos.esquerdo.flexao}
                      options={opcoesPostural.joelhoFlexao}
                      onChange={(v) =>
                        setPostura({ ...postura, joelhos: { ...postura.joelhos, esquerdo: { ...postura.joelhos.esquerdo, flexao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.joelhos.esquerdo.alinhamento}
                      options={opcoesPostural.joelhoAlinhamento}
                      onChange={(v) =>
                        setPostura({ ...postura, joelhos: { ...postura.joelhos, esquerdo: { ...postura.joelhos.esquerdo, alinhamento: v } } })
                      }
                    />
                  </LadoPostural>
                  <LadoPostural titulo="Joelho Direito">
                    <CampoPostural
                      value={postura.joelhos.direito.flexao}
                      options={opcoesPostural.joelhoFlexao}
                      onChange={(v) =>
                        setPostura({ ...postura, joelhos: { ...postura.joelhos, direito: { ...postura.joelhos.direito, flexao: v } } })
                      }
                    />
                    <CampoPostural
                      value={postura.joelhos.direito.alinhamento}
                      options={opcoesPostural.joelhoAlinhamento}
                      onChange={(v) =>
                        setPostura({ ...postura, joelhos: { ...postura.joelhos, direito: { ...postura.joelhos.direito, alinhamento: v } } })
                      }
                    />
                  </LadoPostural>
                </SecaoPostural>

                <SecaoPostural titulo="Pés">
                  <LadoPostural titulo="Pé Esquerdo">
                    <CampoPostural
                      value={postura.pes.esquerdo}
                      options={opcoesPostural.peApoio}
                      onChange={(v) => setPostura({ ...postura, pes: { ...postura.pes, esquerdo: v } })}
                    />
                  </LadoPostural>
                  <LadoPostural titulo="Pé Direito">
                    <CampoPostural
                      value={postura.pes.direito}
                      options={opcoesPostural.peApoio}
                      onChange={(v) => setPostura({ ...postura, pes: { ...postura.pes, direito: v } })}
                    />
                  </LadoPostural>
                </SecaoPostural>
              </div>

              <div className="my-6 border-t border-graphite-200" />

              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                Fotos Posturais
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {fotoSlots.map(({ campo, label }) => (
                  <label
                    key={campo}
                    className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-graphite-100 bg-graphite-300 text-white/40 hover:border-gold/40"
                  >
                    {fotos[campo] ? (
                      <span className="text-xs text-emerald-300">✓ {label}</span>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        <span className="text-[11px]">{enviandoFoto === campo ? 'Enviando...' : label}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFotoUpload(campo, e.target.files[0])}
                    />
                  </label>
                ))}
              </div>

              <div className="my-6 border-t border-graphite-200" />

              <Input
                label="Observações posturais"
                value={observacoesPostura}
                onChange={(e) => setObservacoesPostura(e.target.value)}
              />
            </div>
            )}

            <Input label="Observações gerais" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={limparForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Avaliação'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-white/40">Carregando...</p>
      ) : avaliacoes.length === 0 ? (
        <p className="text-sm text-white/40">Nenhuma avaliação registrada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {avaliacoes.map((av) => (
            <Card key={av.id}>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
                  <ClipboardCheck className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{av.alunos?.nome ?? 'Aluno removido'}</p>
                  <p className="text-xs text-white/40">{new Date(av.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] uppercase text-white/30">Peso</p>
                  <p className="text-sm font-semibold">{av.peso ?? '—'} kg</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/30">% Gordura</p>
                  <p className="text-sm font-semibold">{av.percentual_gordura ?? '—'}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/30">Cintura</p>
                  <p className="text-sm font-semibold">{av.cintura ?? '—'} cm</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
