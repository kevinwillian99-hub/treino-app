-- Execute no SQL Editor do Supabase (na ordem, de cima para baixo)

-- 1) Perfis: define se o usuário é treinador ou aluno
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null check (role in ('trainer', 'student')),
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Usuário vê o próprio perfil"
  on profiles for select
  using (auth.uid() = id);

-- 2) Alunos: cadastro completo, espelhando o PRD
create table if not exists alunos (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete set null,
  trainer_id uuid references profiles(id) on delete cascade not null,

  nome text not null,
  foto_url text,
  cpf text,
  rg text,
  sexo text check (sexo in ('Masculino', 'Feminino', 'Outro')),
  nascimento date,
  telefone text,
  email text not null,
  endereco text,
  objetivo text,
  observacoes text,

  modalidade text not null check (modalidade in ('Online', 'Presencial', 'Consultoria', 'Corrida')),
  tipo text not null default 'Individual' check (tipo in ('Individual', 'Dupla', 'Família', 'Parceria')),

  plano text check (plano in ('Mensal', 'Trimestral', 'Semestral', 'Anual')),
  preco numeric(10,2) default 0,
  status text not null default 'Ativo' check (status in ('Ativo', 'Pausado', 'Cancelado')),
  meta text check (meta in ('5 km', '10 km', '15 km', '21 km', '42 km')),

  dias_semana text[],
  horario text,
  professor text,
  unidade text,

  grupo_id uuid,
  created_at timestamp with time zone default now()
);

alter table alunos enable row level security;

create policy "Treinador vê seus próprios alunos"
  on alunos for select
  using (auth.uid() = trainer_id);

create policy "Treinador cria seus próprios alunos"
  on alunos for insert
  with check (auth.uid() = trainer_id);

create policy "Treinador atualiza seus próprios alunos"
  on alunos for update
  using (auth.uid() = trainer_id);

create policy "Aluno vê seu próprio cadastro"
  on alunos for select
  using (auth.uid() = profile_id);

-- 3) Depois de criar SEU usuário em Authentication > Users,
-- rode isto trocando o UUID e o nome para te tornar treinador:
--
-- insert into profiles (id, name, role)
-- values ('UUID_DO_SEU_USUARIO', 'Kevin Willian', 'trainer');

-- 4) Biblioteca de Exercícios (vídeos), Treinos e a ligação entre eles
create table if not exists exercicios (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  nome text not null,
  categoria text not null,
  video_url text,
  observacoes text,
  created_at timestamp with time zone default now()
);

alter table exercicios enable row level security;

create policy "Treinador gerencia sua biblioteca"
  on exercicios for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "Aluno pode ver exercícios do seu treinador"
  on exercicios for select
  using (
    trainer_id in (
      select trainer_id from alunos where profile_id = auth.uid()
    )
  );

create table if not exists treinos (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  aluno_id uuid references alunos(id) on delete cascade not null,
  nome text not null,
  observacoes text,
  created_at timestamp with time zone default now()
);

alter table treinos enable row level security;

create policy "Treinador gerencia treinos que criou"
  on treinos for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "Aluno vê seus próprios treinos"
  on treinos for select
  using (
    aluno_id in (
      select id from alunos where profile_id = auth.uid()
    )
  );

create table if not exists treino_exercicios (
  id uuid default gen_random_uuid() primary key,
  treino_id uuid references treinos(id) on delete cascade not null,
  exercicio_id uuid references exercicios(id) on delete set null,
  ordem int not null default 0,
  series text,
  repeticoes text,
  carga text,
  descanso text,
  observacoes text
);

alter table treino_exercicios enable row level security;

create policy "Treinador gerencia exercícios dos treinos que criou"
  on treino_exercicios for all
  using (
    treino_id in (select id from treinos where trainer_id = auth.uid())
  )
  with check (
    treino_id in (select id from treinos where trainer_id = auth.uid())
  );

create policy "Aluno vê exercícios dos seus treinos"
  on treino_exercicios for select
  using (
    treino_id in (
      select t.id from treinos t
      join alunos a on a.id = t.aluno_id
      where a.profile_id = auth.uid()
    )
  );

-- 5) Corridas: planos semanais de corrida, seguindo a nomenclatura do Método BP
-- Tipos de treino: REG, ROD, RUN, LG, INT, FAR, AQC, OFF
create table if not exists planos_corrida (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  aluno_id uuid references alunos(id) on delete cascade not null,
  nome text not null,
  fase text check (fase in ('BASE', 'PROGRESSÃO', 'PICO', 'REGENERAÇÃO')),
  created_at timestamp with time zone default now()
);

alter table planos_corrida enable row level security;

create policy "Treinador gerencia planos de corrida que criou"
  on planos_corrida for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "Aluno vê seus próprios planos de corrida"
  on planos_corrida for select
  using (
    aluno_id in (select id from alunos where profile_id = auth.uid())
  );

create table if not exists corrida_dias (
  id uuid default gen_random_uuid() primary key,
  plano_id uuid references planos_corrida(id) on delete cascade not null,
  dia_semana text not null check (
    dia_semana in ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')
  ),
  tipo text not null check (tipo in ('REG', 'ROD', 'RUN', 'LG', 'INT', 'FAR', 'AQC', 'OFF')),
  distancia_km numeric(5,2),
  ritmo text,
  observacoes text,
  concluido boolean default false
);

alter table corrida_dias enable row level security;

create policy "Treinador gerencia dias dos planos que criou"
  on corrida_dias for all
  using (plano_id in (select id from planos_corrida where trainer_id = auth.uid()))
  with check (plano_id in (select id from planos_corrida where trainer_id = auth.uid()));

create policy "Aluno vê e marca seus próprios dias de corrida"
  on corrida_dias for select
  using (
    plano_id in (
      select p.id from planos_corrida p
      join alunos a on a.id = p.aluno_id
      where a.profile_id = auth.uid()
    )
  );

create policy "Aluno marca treino de corrida como concluído"
  on corrida_dias for update
  using (
    plano_id in (
      select p.id from planos_corrida p
      join alunos a on a.id = p.aluno_id
      where a.profile_id = auth.uid()
    )
  );

-- 6) Permitir o treinador excluir um aluno (cadastro completo)
create policy "Treinador exclui seus próprios alunos"
  on alunos for delete
  using (auth.uid() = trainer_id);

-- 7) Melhorias: conclusão de treino, financeiro e foto de perfil

-- Marcar exercício de treino como concluído (igual já existe em corrida_dias)
alter table treino_exercicios add column if not exists concluido boolean default false;

-- Pagamentos (financeiro)
create table if not exists pagamentos (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  aluno_id uuid references alunos(id) on delete cascade not null,
  valor numeric(10,2) not null default 0,
  forma text check (forma in ('Pix', 'Cartão', 'Dinheiro', 'Boleto')),
  status text not null default 'Pendente' check (status in ('Pendente', 'Recebido')),
  referencia text,
  data_pagamento date,
  created_at timestamp with time zone default now()
);

alter table pagamentos enable row level security;

create policy "Treinador gerencia seus próprios pagamentos"
  on pagamentos for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

-- Foto de perfil: bucket de armazenamento (Storage)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Qualquer um vê as fotos de perfil"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Usuário autenticado envia sua própria foto"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuário autenticado atualiza sua própria foto"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- 8) Isenção para Família/Parceria que não paga
alter table alunos add column if not exists isento boolean default false;

-- 9) Preferências de notificação do aluno
alter table alunos add column if not exists notificacoes jsonb default '{"treino": true, "pagamento": true, "mensagem": true}'::jsonb;

-- 10) Preferências de notificação do treinador
alter table profiles add column if not exists notificacoes jsonb default '{"treino": true, "pagamento": true, "mensagem": true}'::jsonb;

-- 11) Avaliações Físicas
create table if not exists avaliacoes (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  aluno_id uuid references alunos(id) on delete cascade not null,
  data date not null default current_date,
  peso numeric(5,2),
  altura numeric(4,2),
  percentual_gordura numeric(4,1),
  peito numeric(5,1),
  braco numeric(5,1),
  cintura numeric(5,1),
  quadril numeric(5,1),
  coxa numeric(5,1),
  observacoes text,
  created_at timestamp with time zone default now()
);

alter table avaliacoes enable row level security;

create policy "Treinador gerencia avaliações que criou"
  on avaliacoes for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "Aluno vê suas próprias avaliações"
  on avaliacoes for select
  using (aluno_id in (select id from alunos where profile_id = auth.uid()));

-- 12) Agenda
create table if not exists agenda_eventos (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  aluno_id uuid references alunos(id) on delete cascade,
  titulo text not null,
  tipo text not null default 'Treino' check (tipo in ('Treino', 'Avaliação', 'Consulta', 'Outro')),
  data_hora timestamp with time zone not null,
  status text not null default 'Confirmado' check (status in ('Confirmado', 'Pendente', 'Cancelado')),
  observacoes text,
  created_at timestamp with time zone default now()
);

alter table agenda_eventos enable row level security;

create policy "Treinador gerencia sua agenda"
  on agenda_eventos for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "Aluno vê seus próprios eventos"
  on agenda_eventos for select
  using (aluno_id in (select id from alunos where profile_id = auth.uid()));

-- 13) Mensagens (chat treinador <-> aluno)
create table if not exists mensagens (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  aluno_id uuid references alunos(id) on delete cascade not null,
  remetente text not null check (remetente in ('trainer', 'student')),
  conteudo text not null,
  lida boolean default false,
  created_at timestamp with time zone default now()
);

alter table mensagens enable row level security;

create policy "Treinador vê e envia mensagens dos seus alunos"
  on mensagens for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "Aluno vê e envia mensagens com seu treinador"
  on mensagens for select
  using (aluno_id in (select id from alunos where profile_id = auth.uid()));

create policy "Aluno envia mensagem"
  on mensagens for insert
  with check (
    remetente = 'student'
    and aluno_id in (select id from alunos where profile_id = auth.uid())
  );

-- 14) Modelos de mensagem personalizados (além dos modelos padrão já no código)
create table if not exists modelos_mensagem (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references profiles(id) on delete cascade not null,
  categoria text not null default 'Personalizado',
  conteudo text not null,
  created_at timestamp with time zone default now()
);

alter table modelos_mensagem enable row level security;

create policy "Treinador gerencia seus modelos de mensagem"
  on modelos_mensagem for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

-- 15) Avaliação Postural (dentro de Avaliações), inspirada em protocolos como SAPO/FisicSoft
alter table avaliacoes add column if not exists postura_cabeca text;
alter table avaliacoes add column if not exists postura_ombros text;
alter table avaliacoes add column if not exists postura_coluna text;
alter table avaliacoes add column if not exists postura_pelve text;
alter table avaliacoes add column if not exists postura_joelhos text;
alter table avaliacoes add column if not exists postura_pes text;
alter table avaliacoes add column if not exists observacoes_postura text;
alter table avaliacoes add column if not exists foto_frontal_url text;
alter table avaliacoes add column if not exists foto_posterior_url text;
alter table avaliacoes add column if not exists foto_lateral_dir_url text;
alter table avaliacoes add column if not exists foto_lateral_esq_url text;

-- Espaço de armazenamento para as fotos da avaliação postural (público, igual ao das fotos de perfil)
insert into storage.buckets (id, name, public)
values ('avaliacoes-fotos', 'avaliacoes-fotos', true)
on conflict (id) do nothing;

create policy "Qualquer um vê as fotos de avaliação"
  on storage.objects for select
  using (bucket_id = 'avaliacoes-fotos');

create policy "Treinador envia fotos de avaliação"
  on storage.objects for insert
  with check (bucket_id = 'avaliacoes-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

-- 16) Reestruturação de Modalidade: Online/Presencial no topo, Consultoria/Corrida como tipo dentro de Online
alter table alunos drop constraint if exists alunos_modalidade_check;
alter table alunos add constraint alunos_modalidade_check check (modalidade in ('Online', 'Presencial'));

alter table alunos add column if not exists tipo_online text check (tipo_online in ('Consultoria', 'Corrida'));

alter table alunos drop constraint if exists alunos_plano_check;
alter table alunos add constraint alunos_plano_check check (plano in ('Mensal', 'Quinzenal', 'Trimestral', 'Semestral', 'Anual'));

-- 17) Avaliação Postural completa e estruturada (JSON), no padrão clínico bilateral
alter table avaliacoes add column if not exists avaliacao_postural jsonb;

-- 19) Avaliação Postural: 6 fotos (frontal, dorsal, perfil esq/dir, perfil esq/dir em flexão)
alter table avaliacoes add column if not exists foto_perfil_esq_flexao_url text;
alter table avaliacoes add column if not exists foto_perfil_dir_flexao_url text;
