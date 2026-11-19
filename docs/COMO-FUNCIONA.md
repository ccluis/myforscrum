# Como funciona o MyforScrum

Guia de utilização para formadores e formandos.

O MyforScrum apoia a framework **forScrum**, que adapta o Scrum à formação de adultos. O curso organiza-se em **sprints** (períodos curtos de trabalho, normalmente de alguns dias). Em cada sprint, as equipas de formandos trabalham numa lista de **user stories** (tarefas descritas do ponto de vista de quem aprende, por exemplo: *"Como formando, quero praticar a lavagem do cabelo para atender um cliente"*).

---

## 1. Entrar

| Forma | Como |
|---|---|
| **Pelo Moodle** | Abrir a atividade **MyforScrum** no curso do Moodle. Entra-se automaticamente: o professor como **formador**, o aluno como **formando**. |
| **Pelo endereço** | Abrir https://myforscrum.vercel.app e escrever `formador`, ou o nome de um formando registado, e carregar em **Entrar na Plataforma**. |

A barra de baixo tem sempre texto por baixo de cada ícone. Em **Perfil** (ícone de roda dentada no topo) pode escolher o **modo escuro** e o **tamanho da letra**.

---

## 2. Guia do formador

### 2.1 Preparar o curso
1. **Início → Gerir Cursos → Criar Novo Curso.** Indicar nome, descrição e datas.
2. Abrir o curso. Nos separadores:
   - **Formandos → Adicionar**: inscrever cada formando (nome e email).
   - **Equipas → Nova Equipa**: criar as equipas.
3. Para pôr um formando numa equipa: **Formandos → ⋮ → Editar → Equipa**.
4. Para corrigir, usar o botão **Editar** (cursos) ou o menu **⋮ → Editar** (formandos, equipas).

> Apagar um curso apaga também as suas equipas, formandos, sprints e user stories. A aplicação pede sempre confirmação.

### 2.2 Planear um sprint
1. No curso, separador **Sprints → Novo Sprint**: nome, objetivo, datas de início e fim e, se quiser, a equipa.
2. Separador **User stories → Nova Story**: nome, descrição, prioridade, **equipa**, **sprint** a que pertence e critérios de aceitação.
3. O lápis ✏️ junto a cada sprint permite alterar nome, objetivo e datas.

### 2.3 Acompanhar
O **Início** do formador mostra, com filtros por **curso**, **equipa** e **sprint**:
- **Burndown Chart**: pontos que faltam fazer, dia a dia, comparados com a linha ideal.
- **Velocidade por Sprint**: pontos planeados e concluídos em cada sprint, e a velocidade média.
- **Performance por Equipa**: velocidade e percentagem de conclusão de cada equipa.

### 2.4 Comunicar
- **Alertas → Gerir → Criar novo alerta**: escolher o tipo (**Aviso** ou **Urgente**), o título, o texto e o curso, ou "Todos os cursos". Os formandos veem o número de alertas novos no Início.
- **Mensagens → Nova Mensagem**: escolher o formando, escrever e enviar. Também se pode escrever a partir da lista de formandos do curso (**⋮ → Mensagem**). As respostas dos formandos aparecem destacadas como **Nova**.
- **Calendário**: sprints e sessões ao longo do tempo.

---

## 3. Guia do formando

### 3.1 O Início
Mostra a **minha equipa**, a **velocidade**, a **conclusão** do sprint atual, os **meus pontos** e os gráficos do sprint (pode escolher outro sprint na lista).

### 3.2 Estimar no Scrum Poker
1. Há duas formas de chegar ao Scrum Poker:
   - **diretamente na user story:** no quadro, tocar na story e escolher **S, M, L ou XL** no cartão da estimativa. O voto fica guardado logo e pode ser mudado. O link **Votar com a equipa no Scrum Poker** abre a votação de grupo já nessa story;
   - **a partir do quadro do sprint:** botão **Scrum Poker → Iniciar**. A votação abre na primeira story ainda por estimar.

   Dentro do Scrum Poker, os botões **Anterior** e **Seguinte** (ou a lista no topo) mudam de story, sem apagar os votos já dados. Só aparecem as stories do sprint.
2. Para cada user story, escolher um tamanho:

   | Cartão | Significado | Pontos |
   |---|---|---|
   | **S** | Pequena | 3 |
   | **M** | Média | 5 |
   | **L** | Grande | 8 |
   | **XL** | Muito grande | 13 |

3. Os votos ficam **ocultos** até alguém carregar em **Revelar Votos**. Nessa altura, a média passa a ser a estimativa da story.
4. Se a equipa não concordar, **Nova Votação** apaga os votos dessa story e vota-se outra vez.

### 3.3 Trabalhar no quadro Kanban
No sprint, **Ver Quadro Kanban**. Arrastar cada user story pelas colunas:

**Referencial → A Fazer → Em Curso → Concluído**

Cada cartão mostra a prioridade e os pontos. Quando uma story chega a **Concluído**, os gráficos atualizam-se.

### 3.4 Alertas e mensagens
- **Alertas**: lista dos avisos do formador. Tocar num alerta marca-o como lido; **Marcar Todos como Lidos** limpa o contador.
- **Mensagens**: conversa com o formador (mensagens recebidas e enviadas). **Nova Mensagem** para escrever ao formador.

---

## 4. Como são calculados os números

| Indicador | Cálculo |
|---|---|
| **Pontos de uma user story** | Os pontos definidos (por exemplo, guardados ao revelar o Scrum Poker); se não houver, a média dos votos (S = 3, M = 5, L = 8, XL = 13) |
| **Burndown – Real** | Total de pontos do sprint menos os pontos das stories concluídas até esse dia |
| **Burndown – Ideal** | Linha reta do total de pontos, no primeiro dia, até zero, no último dia do sprint |
| **Velocidade de um sprint** | Soma dos pontos das stories concluídas nesse sprint |
| **Velocidade média** | Média da velocidade dos sprints que têm trabalho planeado |
| **Meus pontos** | Soma dos tamanhos que o formando votou no sprint atual |
| **Conclusão** | Percentagem de stories do sprint atual em **Concluído** |

---

## 5. Dúvidas frequentes

**Entrei pelo Moodle e não estou em nenhuma equipa.** É normal na primeira entrada: o formador tem de o colocar numa equipa no separador **Equipas** do curso.

**Os gráficos estão vazios.** Os gráficos precisam de sprints com datas e de user stories com pontos. Os pontos aparecem depois da votação no Scrum Poker.

**Não vejo uma mensagem nova.** A lista atualiza-se sozinha a cada 30 segundos; também pode sair e voltar a entrar no ecrã.
