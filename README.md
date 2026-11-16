# MyforScrum

Aplicação web de apoio à framework **forScrum**, pensada para a educação e formação de adultos, com especial atenção a adultos com baixos níveis de literacia.

Desenvolvida no âmbito da tese de doutoramento *Um contributo para a acessibilidade e a usabilidade em ambientes virtuais de aprendizagem para pessoas com baixos níveis de literacia* (Carlos Luís, Departamento de Engenharia Informática, Universidade de Coimbra, 2026), orientada pela Professora Doutora Maria José Marcelino.

- **Aplicação:** https://myforscrum.vercel.app
- **Ligação ao Moodle:** ver [`docs/MOODLE.md`](docs/MOODLE.md)

---

## 1. Como funciona o MyforScrum

O forScrum adapta o Scrum à formação: o curso é o produto, as competências a adquirir são o objetivo, e o trabalho organiza-se em **sprints** curtos com **user stories** que as equipas de formandos estimam, realizam e apresentam. O MyforScrum dá suporte digital a este ciclo.

### Perfis

| Perfil | Quem é | O que faz |
|---|---|---|
| **Formador** | Quem orienta o curso | Cria cursos, equipas, formandos, sprints e user stories; acompanha o progresso; envia alertas e mensagens |
| **Formando** | Quem participa no curso | Vê os sprints da sua equipa, move as suas tarefas no quadro, vota no Scrum Poker, recebe alertas e troca mensagens com o formador |

### O ciclo de trabalho

1. **Preparar o curso** (formador): criar o curso, os formandos e as equipas.
2. **Planear o sprint** (formador): criar o sprint, com nome, objetivo e datas, e associar-lhe user stories, cada uma com título, descrição e critérios de aceitação.
3. **Estimar em equipa** (formandos): no **Scrum Poker**, cada membro vota no tamanho de cada user story (**S, M, L ou XL**). Os votos ficam ocultos até serem revelados; a média passa a ser a estimativa da story (S = 3, M = 5, L = 8, XL = 13 pontos).
4. **Trabalhar** (formandos): no **quadro Kanban**, arrastar as user stories pelas colunas *Referencial → A Fazer → Em Curso → Concluído*.
5. **Acompanhar** (formador e formandos): os painéis mostram, por sprint, o **burndown** (trabalho que falta, dia a dia, comparado com o ideal) e a **velocidade** (pontos planeados e concluídos em cada sprint, e a média).
6. **Comunicar**: o formador envia **alertas** (gerais ou para um curso) e **mensagens** individuais; o formando lê os alertas e responde às mensagens. Os contadores de "novos" vêm da base de dados.

### Ecrãs principais

**Formador:** Início (painel com filtros por curso, equipa e sprint) · Cursos (criar, editar, apagar) · Detalhes do curso (separadores Formandos, Equipas, Sprints, User stories) · Quadro Kanban · Scrum Poker · Alertas (gerir) · Mensagens · Calendário · Perfil.

**Formando:** Início (a sua equipa, pontos, progresso e gráficos) · Sprints · Quadro Kanban · Scrum Poker · Mensagens · Alertas · Calendário · Perfil.

### Acessibilidade e usabilidade

- Navegação inferior com **texto em todos os ícones**; linguagem simples; botões grandes.
- **Modo escuro** e **escolha do tamanho de letra** no perfil.
- Pensada primeiro para telemóvel; no computador (e dentro do Moodle) o conteúdo alarga até 768 px, mantendo a mesma organização.
- Contraste e etiquetas revistos com o Lighthouse e o WAVE.

### Como se entra

- **Pelo Moodle (LTI 1.3):** quem abre a atividade no Moodle entra automaticamente — o professor como formador, o aluno como formando. Ver [`docs/MOODLE.md`](docs/MOODLE.md).
- **Pelo ecrã de entrada:** escrevendo `formador`, ou o nome de um formando registado. É uma entrada simplificada, própria de um protótipo, sem palavra-passe.

---

## 2. Como o código está organizado

```
myforscrum/
├── api/lti/                 Funções de servidor (Vercel) para a ligação ao Moodle
│   ├── login.js             Passo 1: o Moodle pede para iniciar sessão (OIDC)
│   ├── launch.js            Passo 2: valida o id_token do Moodle e abre a app
│   ├── jwks.js              Conjunto de chaves da ferramenta (Keyset URL)
│   └── _common.js           Validação de assinaturas, criação do curso e do formando
├── docs/
│   └── MOODLE.md            Como registar o MyforScrum no Moodle
├── src/
│   ├── main.tsx             Arranque: instala a camada de dados e mostra a App
│   ├── styles/              Estilos globais e tema (Tailwind)
│   └── app/
│       ├── App.tsx          Entrada (formulário e Moodle) e navegação entre ecrãs
│       ├── context/
│       │   └── AppContext.tsx   Estado global: perfil, tema, tamanho de letra, contadores
│       ├── data/
│       │   ├── database.ts      Camada de dados: pedidos /api/... → tabelas do Supabase
│       │   └── sprintMetrics.ts Cálculos de pontos, burndown e velocidade
│       ├── components/          Um ficheiro por ecrã (ver tabela abaixo)
│       │   ├── shared/          Peças comuns: Header, BottomNav, EditDialog, SprintCharts
│       │   └── ui/              Componentes de base (botões, diálogos, menus…)
│       └── utils/supabase/info.tsx  Endereço do projeto Supabase e chave pública
├── supabase/
│   ├── migrations/          Scripts SQL da base de dados (correr por ordem)
│   └── README.md            Modelo de dados e como ativar
├── vercel.json              Rotas e cabeçalhos da publicação
└── package.json
```

### Ecrãs (`src/app/components/`)

| Ficheiro | Ecrã |
|---|---|
| `FormadorDashboard.tsx` / `FormandoDashboard.tsx` | Painel inicial de cada perfil |
| `CourseManagement.tsx` / `CourseDetails.tsx` | Lista de cursos / detalhes do curso |
| `CreateSprint.tsx`, `CreateTeam.tsx`, `CreateStudent.tsx`, `CreateUserStory.tsx` | Formulários de criação |
| `ManageSprintStories.tsx` | Associar user stories a um sprint |
| `SprintBoard.tsx` | Quadro Kanban |
| `ScrumPoker.tsx` | Votação das estimativas |
| `UserStoryDetails.tsx` | Detalhe e edição de uma user story |
| `FormandoSprints.tsx`, `TurmaDetails.tsx` | Sprints e equipa do formando |
| `Alerts.tsx` / `ManageAlerts.tsx` | Ver alertas / gerir alertas |
| `MessagesFormando.tsx` | Mensagens entre formador e formandos |
| `CalendarView.tsx`, `ProfileSettings.tsx` | Calendário e perfil |

### Como os dados circulam

```
Ecrã (componente)  ──fetch('/api/courses')──▶  database.ts  ──REST──▶  Supabase (PostgreSQL)
                    ◀──── { success, courses } ─────┘
```

Os ecrãs pedem os dados a `/api/...` (por exemplo `/api/courses`, `/api/stories?sprintId=…`, `/api/votes?storyId=…`). Esses pedidos nunca saem do browser: o ficheiro `src/app/data/database.ts` intercepta-os e transforma-os em operações sobre as tabelas do Supabase, devolvendo sempre o mesmo formato JSON (`{ success: true, ... }` ou `{ error }`). Assim, os ecrãs não precisam de saber como a base de dados está organizada.

As únicas rotas `/api` que existem de facto no servidor são as do Moodle (`/api/lti/...`), que são abertas pelo Moodle e não pela aplicação.

### Base de dados

PostgreSQL no Supabase, com chaves estrangeiras e eliminação em cascata:

```
courses ─┬─< teams ──< students ──< messages
         ├─< students
         ├─< sprints ──< user_stories ──< votes
         ├─< user_stories
         └─< alerts ──< alert_reads
```

- Apagar um curso apaga as suas equipas, formandos, sprints, user stories, votos e alertas.
- Apagar um sprint apaga as suas user stories; apagar uma equipa deixa os formandos "sem equipa".
- Os scripts estão em `supabase/migrations/` e correm-se pela ordem no **SQL Editor** do Supabase. Ver `supabase/README.md`.

### Tecnologias

React 18 com TypeScript · Vite · Tailwind CSS · Radix UI · Recharts (gráficos) · react-dnd (arrastar no quadro) · Supabase (PostgreSQL por REST) · Vercel (publicação e funções de servidor).

---

## 3. Ligar ao Moodle

O MyforScrum liga-se ao Moodle como **ferramenta externa LTI 1.3**. O administrador do Moodle regista a ferramenta uma vez com estes endereços:

| Campo | Valor |
|---|---|
| URL da ferramenta | `https://myforscrum.vercel.app/api/lti/launch` |
| Versão LTI | LTI 1.3 |
| Tipo de chave pública | Keyset URL → `https://myforscrum.vercel.app/api/lti/jwks` |
| URL de início de sessão | `https://myforscrum.vercel.app/api/lti/login` |
| URI de redirecionamento | `https://myforscrum.vercel.app/api/lti/launch` |
| Partilhar nome e email | Sempre |

Depois, em cada curso: **Adicionar atividade → MyforScrum**. O professor entra como formador; os alunos entram como formandos e ficam inscritos no curso, criado automaticamente na primeira entrada.

Passo a passo, opções de segurança e o que acontece em cada entrada: [`docs/MOODLE.md`](docs/MOODLE.md).

---

## 4. Executar e publicar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # versão de produção em dist/
```

Cada alteração no ramo `main` é publicada automaticamente pela Vercel em https://myforscrum.vercel.app.

## 5. Estado e próximos passos

Protótipo de alta fidelidade para avaliação de usabilidade (Design Science Research). **Todos os dados são fictícios.**

Próximos passos: autenticação real (Supabase Auth ou apenas via Moodle) e regras de acesso por perfil na base de dados; envio de avaliações para a pauta do Moodle; sincronização de participantes e grupos a partir do Moodle.

## Créditos

Componentes de interface baseados em [shadcn/ui](https://ui.shadcn.com/) (licença MIT).
