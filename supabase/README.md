# Base de dados do MyforScrum

PostgreSQL no Supabase (projeto `mynzkijoyrgcsedhuqhz`), acedido pela aplicação através da API REST do Supabase.

## Tabelas

| Tabela | Conteúdo | Ligações |
|---|---|---|
| `courses` | Cursos | — |
| `teams` | Equipas | `course_id` → courses |
| `students` | Formandos | `course_id` → courses; `team_id` → teams |
| `sprints` | Sprints (nome, objetivo, datas) | `course_id` → courses; `team_id` → teams |
| `user_stories` | User stories (título, critérios, estado, pontos) | `course_id` → courses; `sprint_id` → sprints |
| `votes` | Votos do Scrum Poker (um por pessoa e story) | `story_id` → user_stories |
| `alerts` | Alertas (gerais ou de um curso) | `course_id` → courses |
| `alert_reads` | Quem já leu cada alerta | `alert_id` → alerts |
| `messages` | Mensagens entre formador e formando | `student_id` → students; `trainer_id` → trainers |
| `trainers` | Formadores | — |
| `course_trainers` | Que formadores dão cada curso | `course_id` → courses; `trainer_id` → trainers |

Regras de eliminação (`ON DELETE`):
- apagar um **curso** apaga as suas equipas, formandos, sprints, user stories, votos, alertas e mensagens;
- apagar um **sprint** apaga as suas user stories e os respetivos votos;
- apagar uma **equipa** deixa os formandos e sprints "sem equipa" (`SET NULL`);
- apagar um **formando** apaga as suas mensagens.

Cada tabela tem `created_at` e, quando aplicável, `updated_at` (atualizado automaticamente) e uma coluna `extra` (JSON) para campos adicionais.

## Criar a base de dados

No Supabase: **SQL Editor → New query**, colar e carregar em **Run**, por esta ordem:

1. `migrations/001_relacional.sql` — tabelas principais. Se existir uma tabela antiga do tipo chave-valor (`kv_store_…`), os seus dados são copiados; não é apagado nada.
2. `migrations/002_mensagens_alertas.sql` — mensagens e registo de alertas lidos.
3. `migrations/003_formadores.sql` — vários formadores: cada um vê só os seus cursos; o formador inicial fica ligado aos cursos existentes.

Os scripts podem ser executados mais de uma vez sem duplicar dados.

## Como a aplicação usa a base de dados

Os ecrãs fazem pedidos a `/api/...`. O ficheiro `src/app/data/database.ts` trata esses pedidos no próprio browser e converte-os em operações REST sobre estas tabelas.

## Segurança

É um protótipo: a chave pública (anon) pode ler e escrever nas tabelas. Antes de uso real, as políticas de segurança (RLS) devem passar a exigir utilizadores autenticados (Supabase Auth ou entrada pelo Moodle).
