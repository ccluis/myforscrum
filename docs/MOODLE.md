# Ligar o MyforScrum ao Moodle (LTI 1.3)

## 1. Registar a ferramenta (administrador do Moodle)
**Administração do site → Plugins → Módulos de atividade → Ferramenta externa → Gerir ferramentas → configurar uma ferramenta manualmente**

| Campo | Valor |
|---|---|
| Nome da ferramenta | MyforScrum |
| URL da ferramenta | `https://myforscrum.vercel.app/api/lti/launch` |
| Versão LTI | LTI 1.3 |
| Tipo de chave pública | Keyset URL |
| Public keyset | `https://myforscrum.vercel.app/api/lti/jwks` |
| URL de início de sessão | `https://myforscrum.vercel.app/api/lti/login` |
| URI(s) de redirecionamento | `https://myforscrum.vercel.app/api/lti/launch` |
| Utilização da configuração | Mostrar no seletor de atividades e como ferramenta pré-configurada |
| Contentor de abertura padrão | Nova janela (recomendado) ou Incorporado |
| Privacidade → Partilhar o nome do utilizador | Sempre |
| Privacidade → Partilhar o email do utilizador | Sempre |

Guardar. Não é preciso copiar nenhum valor do Moodle para a aplicação: o endereço do Moodle, o *client ID* e as chaves são lidos automaticamente em cada entrada.

## 2. Usar num curso (professor)
**Ativar edição → Adicionar uma atividade ou recurso → MyforScrum** (ou *Ferramenta externa* e escolher MyforScrum).

## 3. O que acontece ao abrir
- O professor (papel *Professor/Instructor*) entra como **formador**; o aluno entra como **formando**.
- O curso do Moodle é criado na aplicação na primeira entrada; os alunos são inscritos nesse curso.
- Não é preciso escrever nenhum nome no ecrã de entrada.

## Opções (variáveis de ambiente no Vercel)
- `LTI_ALLOWED_ISSUERS`: endereços dos Moodles autorizados, separados por vírgulas (ex.: `https://moodle.uc.pt`). Sem esta variável, qualquer Moodle pode ligar-se.
- `LTI_SECRET`: segredo usado para assinar o pedido de entrada (recomendado definir).
