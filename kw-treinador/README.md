# Kevin Willian Treinador

## ⚠️ MUITO IMPORTANTE — Resolver isso primeiro

O e-mail do aluno voltou a ser **100% Supabase** (sem precisar de conta externa, como você pediu). O Supabase manda o convite automaticamente — você só personaliza o texto uma vez.

### Depois do deploy, 2 ajustes manuais (uma vez só):

**A)** Abra `supabase/functions/criar-aluno/index.ts`, ache:
```
const SITE_URL = 'https://SEU-DOMINIO-AQUI.vercel.app'
```
Troque pela URL real do seu app. Publique a função de novo.

**B)** Authentication → Email Templates → Invite user → cole o conteúdo de `docs/email-convite-modelo.html` (trocando a URL da logo lá dentro também)

**C)** Authentication → URL Configuration → Redirect URLs → adicione:
```
https://SEU-DOMINIO-AQUI.vercel.app/definir-senha
```

---

## Funcionalidades desta etapa

- Login centralizado + "Esqueci minha senha" funcional
- Cadastro de aluno → e-mail de boas-vindas automático do Supabase
- **Alterar Senha** funcional (treinador em Configurações, aluno em Perfil)
- **Avaliações**: peso, altura (IMC automático), % gordura, medidas — aluno vê gráfico de evolução
- **Agenda**: criar eventos (treino/avaliação/consulta), status confirmado/pendente/cancelado — aluno vê os seus
- **Mensagens**: chat treinador ↔ aluno, com biblioteca de **modelos de mensagem** (boas-vindas, incentivo, parabenização, lembrete, cobrança gentil) — um clique e envia
- **Relatórios**: visão consolidada (alunos por modalidade/status, financeiro, treinos e planos criados)
- **Alunos**: cadastrar (RG/CPF/Endereço opcionais), editar (incluindo e-mail), excluir
- **Família**: pergunta se vai pagar — se não, isento. **Parceria**: sempre isento
- **Biblioteca de Exercícios**: ~100 exercícios padrão por categoria, edição, vídeo
- **Treinos** e **Corridas**: filtro por categoria, vídeo direto da Biblioteca
- **Configurações do Aluno**: foto real, Meus Dados, Alterar Senha, Notificações, Metas, Ajuda
- **Financeiro**, **Meus Treinos**, Dashboards com números reais
- PWA com ícone proporcional

---

## PASSO A PASSO — SUPABASE

### 1. Criar o projeto
supabase.com → New Project

### 2. Criar as tabelas
SQL Editor → New query → cole `supabase_setup.sql` (completo) → Run

### 3. Criar seu acesso de treinador
Authentication → Users → Add user → copie o UID → SQL Editor:
```sql
insert into profiles (id, name, role)
values ('SEU_UID_AQUI', 'Kevin Willian', 'trainer');
```

### 4. Configurar o e-mail de convite
Authentication → Email Templates → Invite user → cole `docs/email-convite-modelo.html`

### 5. Configurar Redirect URLs
Authentication → URL Configuration → adicione `https://SEU-DOMINIO.vercel.app/definir-senha`

### 6. Publicar as Edge Functions
- `criar-aluno` (troque o SITE_URL antes)
- `atualizar-email-aluno`

### 7. Pegar as chaves
Project Settings → API → Project URL e anon public key

---

## PASSO A PASSO — VERCEL

1. Suba o projeto no GitHub
2. Vercel → Add New Project → selecione o repositório
3. Environment Variables: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Deploy
5. Copie a URL e volte nos passos A/B/C acima

## Próxima etapa sugerida

Exportação de Relatórios em PDF, ou fotos de evolução nas Avaliações.
