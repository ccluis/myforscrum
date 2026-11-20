-- =====================================================================
-- MyforScrum: vários formadores
-- Executar UMA vez no projeto mynzkijoyrgcsedhuqhz:
-- Dashboard > SQL Editor > New query > colar > Run
-- Não apaga nada. Pode ser executado mais de uma vez.
-- =====================================================================

-- Formadores
create table if not exists public.trainers (
  id          text primary key,
  name        text not null,
  email       text not null default '',
  extra       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);
create index if not exists trainers_name_lower_idx on public.trainers (lower(name));

-- Que formadores dão cada curso (um curso pode ter vários)
create table if not exists public.course_trainers (
  course_id   text not null references public.courses(id) on delete cascade,
  trainer_id  text not null references public.trainers(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (course_id, trainer_id)
);
create index if not exists course_trainers_trainer_idx on public.course_trainers(trainer_id);

-- Mensagens: com que formador é a conversa
alter table public.messages add column if not exists trainer_id text references public.trainers(id) on delete set null;
create index if not exists messages_trainer_idx on public.messages(trainer_id);

-- Alertas: que formador os criou
alter table public.alerts add column if not exists trainer_id text references public.trainers(id) on delete set null;

drop trigger if exists trg_trainers_updated on public.trainers;
create trigger trg_trainers_updated before update on public.trainers
  for each row execute function public.set_updated_at();

do $$
declare t text;
begin
  foreach t in array array['trainers','course_trainers'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists prototipo_acesso_total on public.%I', t);
    execute format('create policy prototipo_acesso_total on public.%I
                    for all to anon, authenticated using (true) with check (true)', t);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- Formador inicial, ligado a todos os cursos que ainda não têm formador
insert into public.trainers (id, name, email)
values ('trainer_carlos', 'Carlos Luís', 'ccluis@gmail.com')
on conflict (id) do nothing;

insert into public.course_trainers (course_id, trainer_id)
select c.id, 'trainer_carlos' from public.courses c
where not exists (select 1 from public.course_trainers ct where ct.course_id = c.id)
on conflict do nothing;

-- Mensagens e alertas já existentes ficam com o formador inicial
update public.messages set trainer_id = 'trainer_carlos' where trainer_id is null;
update public.alerts   set trainer_id = 'trainer_carlos' where trainer_id is null;

notify pgrst, 'reload schema';

select 'trainers' tabela, count(*) from public.trainers
union all select 'course_trainers', count(*) from public.course_trainers;
