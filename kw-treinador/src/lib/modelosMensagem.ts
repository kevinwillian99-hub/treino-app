export interface ModeloMensagem {
  categoria: string
  conteudo: string
}

export const modelosMensagemPadrao: ModeloMensagem[] = [
  // Boas-vindas
  {
    categoria: 'Boas-vindas',
    conteudo: 'Seja muito bem-vindo(a)! Estou muito feliz em te acompanhar nessa jornada. Vamos construir resultados consistentes juntos, um treino por vez. 💪',
  },
  {
    categoria: 'Boas-vindas',
    conteudo: 'Oi! Que bom ter você por aqui. A partir de hoje, todo o seu acompanhamento fica disponível direto no app. Qualquer dúvida, me chama por aqui mesmo.',
  },

  // Incentivo / Motivacional
  {
    categoria: 'Incentivo',
    conteudo: 'Lembra por que você começou. Cada treino te aproxima mais do seu objetivo — hoje é um bom dia pra dar mais um passo.',
  },
  {
    categoria: 'Incentivo',
    conteudo: 'Disciplina é fazer mesmo nos dias em que a vontade não ajuda. Confio no seu processo — vamos com tudo hoje!',
  },
  {
    categoria: 'Incentivo',
    conteudo: 'Resultado não vem do treino perfeito, vem do treino feito. Você está no caminho certo, continue assim.',
  },
  {
    categoria: 'Incentivo',
    conteudo: 'Notei sua evolução nos últimos treinos — continue nesse ritmo, o progresso está vindo de forma sólida.',
  },

  // Parabenização
  {
    categoria: 'Parabenização',
    conteudo: 'Parabéns por completar mais uma semana de treinos! Sua consistência está fazendo toda a diferença nos resultados.',
  },
  {
    categoria: 'Parabenização',
    conteudo: 'Bateu sua meta esta semana! Isso mostra o quanto você está comprometido(a). Orgulho do seu progresso. 🎉',
  },
  {
    categoria: 'Parabenização',
    conteudo: 'Vi sua última avaliação física — excelente evolução! O trabalho está valendo a pena, continue assim.',
  },

  // Lembrete
  {
    categoria: 'Lembrete',
    conteudo: 'Passando para lembrar do seu treino de hoje. Reserve um tempinho — seu corpo agradece!',
  },
  {
    categoria: 'Lembrete',
    conteudo: 'Notei que você não treinou nos últimos dias. Tudo bem? Se precisar ajustar algo no seu plano, me avisa.',
  },
  {
    categoria: 'Lembrete',
    conteudo: 'Sua avaliação física está chegando perto da data. Vamos agendar um horário?',
  },

  // Cobrança gentil
  {
    categoria: 'Cobrança Gentil',
    conteudo: 'Oi! Identifiquei que sua mensalidade está pendente. Pode verificar quando puder? Qualquer dúvida sobre o pagamento, me chama.',
  },
  {
    categoria: 'Cobrança Gentil',
    conteudo: 'Só um lembrete amigável: o vencimento do seu plano está chegando. Bora manter tudo em dia pra focar 100% no treino?',
  },
]
