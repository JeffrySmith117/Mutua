# Redesign do Mútua Tec HUB

## Auditoria inicial

O frontend usa React, TypeScript e Vite, com React Router para rotas, Zustand para sessão e tema, TanStack Query para estado remoto e Axios para a API. Os estilos estavam distribuídos entre `index.css`, `components.css`, `sigra.css` e os módulos de acesso, reservas e administração. O ícone genérico usado no lugar da marca e o verde dominante eram as principais diferenças em relação à referência institucional.

O login envia e-mail e senha à API e o cadastro tem duas etapas. A sessão usa JWT e dados do usuário no armazenamento local. A guarda de rotas exige sessão e restringe `/admin` ao perfil administrador. O tema segue o sistema até que o usuário escolha uma preferência. O cabeçalho tem um controle de tema, busca global e menu de conta. A navegação lateral recolhe no desktop e abre em um diálogo no celular. Os catálogos usam campos nativos de data e horário e consultam disponibilidade por data. Os modais já usavam o elemento nativo `dialog`.

| Rota | Conteúdo e estados |
| --- | --- |
| `/entrar` | Credenciais, visibilidade da senha, validação, autenticação em andamento e erro da API |
| `/cadastro` | Identificação e senha em duas etapas, validação, envio e erro da API |
| `/` | Saudação, atalhos, reservas e recursos com carregamento, erro com nova tentativa e estado vazio |
| `/ambientes` | Catálogo, filtros, disponibilidade e reserva, com carregamento, erro e ausência de resultados |
| `/equipamentos` | Catálogo, filtros, disponibilidade e empréstimo, com carregamento, erro e ausência de resultados |
| `/minhas-reservas` | Filtros, cartelas de reserva, comprovante, cancelamento e check-in, com carregamento, erro e ausência de registros |
| `/admin` | Métricas, pendências, balcão, inventário, histórico e auditoria, com estados de consulta e feedback das ações |

## Entregas por etapa

| Etapa | Arquivos e mudanças | Verificação |
| --- | --- | --- |
| 1. Auditoria e plano | Este relatório registra rotas, estados, arquitetura, identidade e prioridades de execução. | Leitura das rotas, stores, serviços, componentes e estilos. |
| 2. Identidade e tokens | `frontend/index.html`, `public/mutua-oficial.png`, `public/mutua-favicon.png`, `src/index.css` e `src/components/Marca.tsx`. Marca oficial em PNG, paleta, tipografia do sistema, controles e temas. | Fonte oficial verificada e logotipo conferido no acesso e no painel. |
| 3. Acesso | `src/pages/auth/{AcessoLayout,LoginPage}.tsx`, `src/pages/auth/Auth.css` e `src/components/Icone.tsx`. Login de duas regiões no desktop e cabeçalho compacto no celular. Cadastro alinhado ao sistema visual. | Login válido e inválido, alternância da senha e cadastro em duas etapas com API simulada. |
| 4. Layout e navegação | `src/components/layout/PainelLayout.{tsx,css}`. Navegação institucional, atalho de teclado para o conteúdo, busca, perfil e tema. | Menu móvel e busca com Escape, tema persistido, saída e redirecionamento do perfil profissional ao tentar acessar a administração. |
| 5. Páginas internas | `src/pages/dashboard/DashboardPage.tsx`, `src/sigra.css`, `src/pages/reservas/MinhasReservas.css` e `src/pages/admin/Admin.{tsx,css}`. Atalhos por perfil, resumo de consultas, filtros, cartões, avisos e tabelas com rolagem localizada. | Catálogos, solicitações, reservas e abas de gestão com dados de teste. |
| 6. Mobile-first | `src/sigra.css`, `src/components/layout/PainelLayout.css` e estilos dos módulos. Controles de toque, formulários em coluna, limites dos diálogos e ajustes para áreas seguras. | Matriz de larguras e inspeção visual de capturas do login e do painel. |
| 7. Testes e correções | Ajustes de foco, contraste e encaixe de conteúdo na fila administrativa durante a validação. | Build, lint, testes unitários e verificações de navegador detalhadas abaixo. |

Os estilos institucionais da página inicial publicam `#184286` e `#44AB3E`. O marinho da aplicação e suas superfícies auxiliares foram definidos para uso nos dois temas. Os arquivos de marca foram baixados diretamente do portal, sem edição, e são servidos localmente. [Site institucional](https://www.mutua.com.br/) · [CSS da página inicial](https://www.mutua.com.br/wp-content/uploads/elementor/css/post-3717.css) · [Logotipo publicado](https://www.mutua.com.br/wp-content/uploads/2024/01/logo_rodape.png) · [Ícone publicado](https://www.mutua.com.br/wp-content/uploads/2024/01/cropped-favicon-32x32.png)

## Verificação

- Build de produção, lint e cinco testes automatizados de busca e datas executados no frontend.
- Chromium com Playwright e dados simulados nas larguras de 320, 375, 390, 768, 1024 e 1440 px, nos temas claro e escuro. A matriz cobriu as sete rotas, a consulta de disponibilidade, os dois diálogos de recursos e as quatro abas da administração. O teste verificou a largura do documento e os limites dos diálogos.
- Inspeção visual de capturas do login a 320 e 1440 px e do painel a 1440 px. Foram conferidos a proporção da marca, a hierarquia dos títulos, o alinhamento de campos e a leitura dos atalhos.
- Verificações de interação com API simulada: autenticação válida e inválida, cadastro, sessão após recarregar, permissões de rota, logout, menu móvel, busca, persistência do tema, consulta de disponibilidade, reserva de ambiente e solicitação de equipamento.
- Fluxos de gestão com API simulada: comprovante, check-in, cancelamento, aprovação, recusa, retirada, devolução, abertura da ficha de auditoria e criação, edição, desativação e reativação de recurso no inventário. Os diálogos também foram verificados no viewport de 320 × 568 px.
- Verificação automatizada de acessibilidade com axe-core a 390 px nos dois temas, incluindo as sete rotas e o diálogo de reserva. O teste por teclado incluiu Escape no menu móvel e na busca.
- O build ficou em aproximadamente 135,3 kB de JavaScript e 14,1 kB de CSS após gzip, frente a 134,9 kB e 13,2 kB antes da mudança. O carregamento de fontes remotas foi removido e os dois arquivos de marca são pequenos e locais.

A validação de interface usou Chromium e respostas simuladas. Ainda estão pendentes a integração ponta a ponta com backend e banco reais, a impressão física ou exportação do PDF, os testes em dispositivos iOS e Android e a avaliação completa com leitor de tela.
