# Conecta Campus — front-end para o Projeto de Extensão

Portal responsivo em HTML, CSS e JavaScript, sem dependências de build. Consome a API ASP.NET Core incluída no projeto original.

## O que foi lido no backend

O ZIP contém o projeto `backend` em .NET 10, controllers, DTOs, modelos, filtro de chave de API, configuração do EF Core, migração inicial e configuração de execução. A leitura confirmou dois recursos de domínio:

- **Universidade:** nome, cidade e estado ativo/inativo.
- **Serviço:** nome, descrição, local, contato, horários, estado ativo/inativo e vínculo obrigatório com uma universidade.

O modelo EF cria as tabelas `universidade` e `servico`. O nome da universidade é único; o nome do serviço é único dentro de cada universidade. A exclusão de universidade usa `Restrict`, então uma instituição com serviços relacionados não pode ser removida antes deles. Valores de nome, cidade e descrição têm limites definidos pelos DTOs/modelos.

### Contratos usados pela interface

| Uso | Método e rota | Acesso | Campos principais |
| --- | --- | --- | --- |
| Listar universidades ativas | `GET /api/universidades` | Público | `id`, `nome`, `cidade` |
| Listar serviços ativos da instituição | `GET /api/universidades/{id}/servicos` | Público | `id`, `nome`, `descricao`, `local`, `contato`, `horarios` |
| Listar todas as universidades | `GET /api/admin/universidades` | `X-Api-Key` | Inclui `ativa` |
| Criar/editar universidade | `POST` / `PUT /api/admin/universidades[/{id}]` | `X-Api-Key` | `nome`, `cidade` |
| Ativar/desativar universidade | `PATCH /api/admin/universidades/{id}/ativa` | `X-Api-Key` | `{ "ativa": true }` |
| Excluir universidade | `DELETE /api/admin/universidades/{id}` | `X-Api-Key` | — |
| Listar serviços | `GET /api/admin/servicos` | `X-Api-Key` | Inclui inativos e `universidadeId` |
| Criar/editar serviço | `POST /api/admin/servicos` / `PUT /api/admin/servicos/{id}` | `X-Api-Key` | nome, descrição, local, contato, horários; criação também recebe `universidadeId` |
| Ativar/desativar serviço | `PATCH /api/admin/servicos/{id}/ativo` | `X-Api-Key` | `{ "ativo": true }` |
| Excluir serviço | `DELETE /api/admin/servicos/{id}` | `X-Api-Key` | — |

O backend não implementa autenticação por usuário/senha, categorias, imagens, mapa, busca remota ou paginação. Por isso, o front-end filtra localmente a lista pública e não inclui telas para recursos inexistentes. A interface de administração corresponde às operações acima.

## Executar

1. Configure no backend uma connection string `ConnectionStrings:DefaultConnection` e a chave `AdminApiKey` usando User Secrets ou variáveis de ambiente. Não coloque esses valores em arquivos públicos.
2. Aplique a migração inicial ao banco PostgreSQL e inicie o backend em `http://localhost:5065` (ou ajuste a URL no rodapé do portal).
3. Para iniciar sem usar comandos, dê dois cliques em `INICIAR.bat`. Ele abre o servidor local nesta pasta. Se preferir o terminal, execute `node server.js` dentro da pasta. A página estará em `http://localhost:5173`, uma origem já liberada pela política CORS do backend.

4. Acesse `http://localhost:5173`.
5. Para editar cadastros, abra **Área do gestor** e informe a chave administrativa configurada no backend. A chave fica somente na memória da aba; ao sair, ela é descartada.

O backend fornecido não contém string de conexão nem `AdminApiKey` em `appsettings.json`; configure ambos antes de conectar. A migração incluída cria as duas tabelas, sem dados iniciais. Se a API não estiver disponível, a página oferece uma demonstração visual com registros fictícios, claramente marcada como demonstração e sem enviar esses registros ao backend.

## Segurança antes de publicar

O mecanismo administrativo do backend é uma chave compartilhada enviada diretamente pelo navegador em `X-Api-Key`. A interface não embute a chave em código nem a guarda em armazenamento persistente, mas qualquer pessoa autorizada a abrir o painel pode inspecioná-la durante a sessão. Para produção, implemente login/autorização no servidor (ou um proxy autenticado) e restrinja CORS à origem real do front-end. Não use uma chave administrativa compartilhada diretamente em um site público.

## Direção visual

O portal combina uma entrada acolhedora para a comunidade com tabelas mais densas na área de gestão. A estrutura responsiva e os componentes seguem princípios documentados em sistemas consolidados: adaptação por tamanho de tela e componentes consistentes do Material Design 3; clareza de aplicações de gestão do IBM Carbon; e campos rotulados, mensagens compreensíveis e estados visíveis alinhados às orientações W3C WCAG 2.2. É uma composição própria para o contexto do projeto, não uma cópia de uma tela existente.

- [Material Design 3](https://m3.material.io/)
- [IBM Carbon Design System](https://www.carbondesignsystem.com/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Arquivos

- `index.html` — entrada da aplicação.
- `styles.css` — estilos responsivos e componentes visuais.
- `src/main.js` — consumo da API, busca pública e operações administrativas.
