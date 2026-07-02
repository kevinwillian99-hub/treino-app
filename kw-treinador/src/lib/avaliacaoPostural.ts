export const opcoesPostural = {
  cabecaProtrusao: ['NDN', 'Protusa'],
  cabecaInclinacao: ['NDN', 'Inclinada para Direita', 'Inclinada para Esquerda'],
  cabecaRotacao: ['NDN', 'Rot. para Direita', 'Rot. para Esquerda'],

  ombroPosicao: ['NDN', 'Slide'],
  ombroRotacao: ['NDN', 'Rot. Interna', 'Rot. Externa'],
  ombroProtusao: ['NDN', 'Protuso'],

  cinturaTilt: ['NDN', 'Tilt'],
  cinturaAlada: ['NDN', 'Alada'],
  cinturaElevacao: ['NDN', 'Elevada', 'Deprimida'],
  cinturaRotacao: ['NDN', 'Rot. Superior', 'Rot. Inferior'],
  cinturaAbducao: ['NDN', 'Abduzida', 'Aduzida'],

  colunaCervical: ['NDN', 'Hiperlordose Cervical', 'Retificação Cervical'],
  colunaToracica: [
    'NDN',
    'Hipercifose Torácica Superior',
    'Hipercifose Torácica Inferior',
    'Hipercifose Torácica Longa',
    'Hipercifose Torácica',
    'Retificação Torácica',
  ],
  colunaLombar: ['NDN', 'Hiperlordose Lombar', 'Hiperlordose Compensatória', 'Retificação Lombar'],
  colunaDesvio: ['NDN', 'Escoliose em C Leve', 'Escoliose em C Severa', 'Escoliose em S', 'Escoliose em S Severa'],

  pelveVertical: ['NDN', 'Incl. Para Baixo', 'Incl. Para Cima'],
  pelveAnteroPosterior: ['NDN', 'Incl. Anterior', 'Incl. Posterior'],
  pelveRotacao: ['NDN', 'Rot. Horária', 'Rot. Antehorária'],

  quadrilFlexao: ['NDN', 'Em Flexão', 'Em Extensão'],
  quadrilRotacao: ['NDN', 'Rot. Interna', 'Rot. Externa'],
  quadrilAbducao: ['NDN', 'Em Abdução', 'Em Adução'],

  joelhoFlexao: ['NDN', 'Flexão', 'Hiperextensão'],
  joelhoAlinhamento: ['NDN', 'Valgo', 'Varo'],

  peApoio: ['NDN', 'Supinado', 'Pronado'],
}

export interface AvaliacaoPostural {
  cabeca: { protrusao: string; inclinacao: string; rotacao: string }
  ombros: {
    esquerdo: { posicao: string; rotacao: string; protusao: string }
    direito: { posicao: string; rotacao: string; protusao: string }
  }
  cinturaEscapular: {
    esquerda: { tilt: string; alada: string; elevacao: string; rotacao: string; abducao: string }
    direita: { tilt: string; alada: string; elevacao: string; rotacao: string; abducao: string }
  }
  coluna: { cervical: string; toracica: string; lombar: string; desvio: string }
  pelve: {
    esquerda: { vertical: string; anteroPosterior: string; rotacao: string }
    direita: { vertical: string; anteroPosterior: string; rotacao: string }
  }
  quadril: {
    esquerdo: { flexao: string; rotacao: string; abducao: string }
    direito: { flexao: string; rotacao: string; abducao: string }
  }
  joelhos: {
    esquerdo: { flexao: string; alinhamento: string }
    direito: { flexao: string; alinhamento: string }
  }
  pes: { esquerdo: string; direito: string }
}

export const avaliacaoPosturalVazia: AvaliacaoPostural = {
  cabeca: { protrusao: 'NDN', inclinacao: 'NDN', rotacao: 'NDN' },
  ombros: {
    esquerdo: { posicao: 'NDN', rotacao: 'NDN', protusao: 'NDN' },
    direito: { posicao: 'NDN', rotacao: 'NDN', protusao: 'NDN' },
  },
  cinturaEscapular: {
    esquerda: { tilt: 'NDN', alada: 'NDN', elevacao: 'NDN', rotacao: 'NDN', abducao: 'NDN' },
    direita: { tilt: 'NDN', alada: 'NDN', elevacao: 'NDN', rotacao: 'NDN', abducao: 'NDN' },
  },
  coluna: { cervical: 'NDN', toracica: 'NDN', lombar: 'NDN', desvio: 'NDN' },
  pelve: {
    esquerda: { vertical: 'NDN', anteroPosterior: 'NDN', rotacao: 'NDN' },
    direita: { vertical: 'NDN', anteroPosterior: 'NDN', rotacao: 'NDN' },
  },
  quadril: {
    esquerdo: { flexao: 'NDN', rotacao: 'NDN', abducao: 'NDN' },
    direito: { flexao: 'NDN', rotacao: 'NDN', abducao: 'NDN' },
  },
  joelhos: {
    esquerdo: { flexao: 'NDN', alinhamento: 'NDN' },
    direito: { flexao: 'NDN', alinhamento: 'NDN' },
  },
  pes: { esquerdo: 'NDN', direito: 'NDN' },
}
