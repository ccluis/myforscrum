# Arquitetura do código

Documento técnico para quem vai manter ou desenvolver o MyforScrum.

## 1. Visão geral

```
                ┌───────────────────────── Browser ─────────────────────────┐
  Moodle ──LTI──▶ /api/lti/* (Vercel)  ──▶  App React (Vite)                 │
                │                            │                              │
                │                            │ fetch('/api/…')              │
                │                            ▼                              │
                │                      data/database.ts ──REST──────────────┼──▶ Supabase (PostgreSQL)
                └──────────────────────────────────────────────────────────┘
```

| Camada | Onde | Função |
|---|---|---|
| Interface | `src/app/App.tsx`, `src/app/components/` | Ecrãs em React + TypeScript, estilos com Tailwind |
| Estado global | `src/app/context/AppContext.tsx` | Perfil, tipo de utilizador, formando com sessão, tema, tamanho de letra, contadores de não lidos |
| Dados | `src/app/data/database.ts` | Converte pedidos `/api/...` em operações sobre as tabelas do Supabase |
| Métricas | `src/app/data/sprintMetrics.ts` | Pontos, burndown e velocidade |
| Base de dados | Supabase, scripts em `supabase/migrations/` | Tabelas relacionais com chaves estrangeiras |
| Moodle | `api/lti/` (funções da Vercel) | Entrada por LTI 1.3 |

## 2. Arranque e navegação

1. `src/main.tsx` chama `installDatabase()` (camada de dados) e mostra `<App />`.
2. `App.tsx` mostra o **ecrã de entrada** ou, se a página abrir com `?lti=...` (vinda do Moodle), entra diretamente.
3. Depois de entrar, `AppContent` escolhe o ecrã pelo valor de `currentScreen` (por exemplo `dashboard`, `courseDetails`, `sprintBoard`, `scrumPoker`, `messagesFormando`, `alerts`). Para mudar de ecrã, os componentes chamam `onNavigate('nomeDoEcrã', parâmetros)`.
4. A barra inferior (`shared/BottomNav.tsx`) tem itens diferentes para formador e formando.

### Componentes partilhados (`src/app/components/shared/`)

| Componente | Uso |
|---|---|
| `Header.tsx` | Cabeçalho com título e botão de voltar |
| `BottomNav.tsx` | Barra de navegação inferior, com texto em todos os ícones |
| `EditDialog.tsx` | Janela genérica de edição (cursos e sprints) |
| `SprintCharts.tsx` | Escolha do sprint, burndown e velocidade (usado nos dois painéis) |

### Largura dos ecrãs

O conteúdo de cada ecrã usa `max-w-[390px]` ou `max-w-md` no telemóvel e `md:max-w-3xl` (768 px) a partir de 768 px de largura. Assim, a organização é a mesma no telemóvel, no computador e dentro do Moodle.

## 3. Camada de dados (`src/app/data/database.ts`)

`installDatabase()` substitui `window.fetch` por uma versão que:
- deixa passar todos os pedidos normais;
- trata os pedidos **para a própria origem** que começam por `/api` (`API_URL`), sem os enviar ao servidor;
- converte-os em pedidos REST ao Supabase (`https://<projeto>.supabase.co/rest/v1/<tabela>`) com a chave pública;
- devolve sempre `{ success: true, ... }` ou `{ error: '...' }`, com o código HTTP adequado.

Os nomes dos campos são convertidos automaticamente (`courseId` ↔ `course_id`, `startDate` ↔ `start_date`…). Campos que não têm coluna própria ficam na coluna `extra` (JSON).

### Rotas

| Rota | Métodos | Notas |
|---|---|---|
| `/api/courses`, `/api/courses/:id` | GET, POST, PUT, DELETE | GET devolve também o número de formandos, equipas e sprints |
| `/api/teams`, `/api/teams/:id` | GET (`?courseId=`), POST, PUT, DELETE | |
| `/api/students`, `/api/students/:id` | GET (`?courseId=`), POST, PUT, DELETE | `POST /api/students/:id/sync` cria ou atualiza |
| `/api/sprints`, `/api/sprints/:id` | GET (`?courseId=`), POST, PUT, DELETE | GET calcula o número de stories, os pontos e a % de conclusão |
| `/api/stories`, `/api/stories/:id` | GET (`?sprintId=`, `?courseId=`), POST, PUT, DELETE | Cada story traz os seus `votes` |
| `/api/sprint-stories/:sprintId` | GET, PUT `{ storyIds }` | Que stories pertencem a um sprint |
| `/api/votes` | GET/DELETE (`?storyId=`), POST | Um voto por pessoa e story (votar outra vez substitui) |
| `/api/alerts`, `/api/alerts/:id` | GET (`?courseId=`), POST, PUT, DELETE | `?courseId=` inclui os alertas gerais |
| `/api/alert-reads` | GET (`?readerId=`), POST `{ readerId, alertIds }` | Quem já leu cada alerta (`readerId` = id do formando ou `formador`) |
| `/api/messages`, `/api/messages/:id` | GET (`?formandoId=`, `?sentBy=`), POST, PUT, DELETE | Editar o título ou o texto regista `editedAt` |
| `/api/unread` | GET (`?userType=&studentId=&courseId=`) | Contadores de mensagens e alertas por ler |
| `/api/trainers`, `/api/trainers/:id` | GET (`?courseId=`, `?name=`), POST, PUT | Formadores; POST devolve o existente se o nome já estiver registado |
| `/api/course-trainers` | POST/DELETE `{ courseId, trainerId }` | Associar ou retirar um formador de um curso (fica sempre pelo menos um) |

Exemplo, num componente:

```ts
import { API_URL } from '../data/database';

const res = await fetch(`${API_URL}/sprints?courseId=${courseId}`);
const { success, sprints } = await res.json();
```

### Quem vê o quê
- **Formador:** `setTrainerScope()` (chamado em `App.tsx` ao entrar) faz com que cursos, equipas, formandos, sprints, stories e alertas fiquem limitados aos cursos do formador (`course_trainers`), e as mensagens às suas conversas.
- **Formando:** `setVoteScope()` limita os votos visíveis aos da sua equipa.

### Acrescentar uma tabela nova
1. Criar um script `supabase/migrations/003_....sql` (tabela, chaves estrangeiras, RLS e `grant`, como nos scripts anteriores) e corrê-lo no SQL Editor.
2. Em `database.ts`, acrescentar o mapeamento dos campos em `FIELDS` e um novo `case` na função `route`.

## 4. Métricas (`src/app/data/sprintMetrics.ts`)

| Função | Devolve |
|---|---|
| `voteToPoints(voto)` | S = 3, M = 5, L = 8, XL = 13 (também aceita números) |
| `storyPoints(story)` | Pontos definidos ou, se não houver, a média dos votos |
| `velocityBySprint(sprints, stories)` | Por sprint: pontos planeados e concluídos |
| `averageVelocity(dados)` | Média dos concluídos nos sprints com trabalho |
| `burndownForSprint(sprint, stories)` | Dia a dia: linha ideal e linha real (até hoje). Uma story conta como concluída na data da sua última atualização |
| `currentSprint(sprints)` | O sprint que inclui hoje; senão o próximo; senão o último |

## 5. Ligação ao Moodle (`api/lti/`)

Funções de servidor da Vercel (Node), publicadas com o resto da aplicação.

```
Moodle                       MyforScrum (/api/lti)                   App
  │── POST /login (iss, login_hint, client_id) ──▶│
  │◀── redireciona para iss/mod/lti/auth.php ─────│  (state assinado + nonce)
  │── POST /launch (id_token, state) ────────────▶│
  │                               valida assinatura com iss/mod/lti/certs.php,
  │                               nonce, state, client_id e validade
  │                               cria curso/formando no Supabase (se faltar)
  │                               └─▶ redireciona para /?lti=<dados> ─────▶ entra
```

- `_common.js`: validação do `id_token` (RS256), `state` assinado (HMAC, sem cookies), papéis (*Instructor/Administrator* → formador; restantes → formando) e criação do curso (`moodle_<hash>`) e do formando.
- Os endereços do Moodle são deduzidos de `iss`, por isso não é preciso configurar nada do lado da app.
- Variáveis opcionais na Vercel: `LTI_ALLOWED_ISSUERS` (Moodles autorizados) e `LTI_SECRET` (segredo do `state`).
- `vercel.json` encaminha para a app todas as rotas exceto `/api/*` e permite que a app seja mostrada dentro de outra página (`frame-ancestors *`), como o Moodle.

Registo no Moodle: ver [`MOODLE.md`](MOODLE.md).

## 6. Desenvolvimento e publicação

```bash
npm install
npm run dev      # http://localhost:5173 (as funções /api/lti só correm na Vercel)
npm run build
```

- Cada `push` para `main` publica automaticamente em https://myforscrum.vercel.app.
- Configuração do Supabase (endereço e chave pública): `src/app/utils/supabase/info.tsx` e `api/lti/_common.js`.

## 7. Limitações conhecidas (protótipo)

- A entrada pelo formulário não tem palavra-passe, e o parâmetro `?lti=` não é assinado. A segurança real está na validação do Moodle, no servidor.
- As regras de acesso (RLS) permitem ler e escrever com a chave pública. Para uso real, devem exigir utilizadores autenticados.
- A data de conclusão de uma story é aproximada pela sua última atualização.
