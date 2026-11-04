# CaixaMEI

Sistema web de controle de caixa diário para Microempreendedores Individuais.

Protótipo desenvolvido como Trabalho de Conclusão de Curso do Curso Técnico em
Informática da Escola Técnica Estadual Monteiro Lobato, Taquara/RS, 2026.

**Autor:** Murilo dos Santos Müller
**Orientador:** Cândido Luciano de Farias

**Aplicação rodando:** https://murilo-0809.github.io/caixamei/
**Repositório público:** https://github.com/Murilo-0809/caixamei

---

## Sobre o projeto

A maior parte das ferramentas de controle financeiro pede que o empreendedor
registre cada venda e cada despesa separadamente, o que raramente acontece na
rotina de um MEI que atende sozinho.

No CaixaMEI a unidade de registro é o **dia**, e não a transação. Uma vez por
dia o usuário informa quanto entrou, quanto saiu, quanto retirou para uso
pessoal e quantos atendimentos fez. A partir daí o sistema monta sozinho o
resumo do mês, as análises, o acompanhamento do limite anual de faturamento e
o controle do DAS.

Cada fechamento guarda também o contexto do dia (a situação e o clima), o que
permite comparar dias parecidos entre si.

---

## Checklist dos critérios de avaliação

| # | Critério | Atende | Por quê |
|---|---|---|---|
| 1 | Deploy e funcionamento | Sim | A aplicação está publicada no GitHub Pages e abre direto pelo link, sem tela em branco, sem pasta exposta e sem erro de carregamento de CSS ou JavaScript. Todos os caminhos de arquivo são relativos. |
| 2 | Interatividade sem recarregamento | Sim | Os formulários são tratados com `addEventListener("submit", ...)` e `preventDefault()`. Cadastrar, editar e excluir um fechamento, carregar e remover os dados de demonstração, marcar o DAS como pago e usar os filtros do histórico acontecem sem recarregar a página: o JavaScript regrava o conteúdo com `innerHTML` e a tela se atualiza na hora. |
| 3 | Persistência de dados | Sim | Todos os dados ficam no `localStorage`, gravados pelas funções do arquivo `dados.js`. Ao apertar F5, a conta, as configurações e os fechamentos continuam na tela. |
| 4 | Estabilidade do console | Sim | Toda a navegação e todas as ações foram percorridas com o DevTools aberto, e o Console não apresenta nenhum erro em vermelho. |
| 5 | Adaptabilidade e responsividade | Sim | O layout usa CSS Grid, Flexbox e media queries. Em telas de celular o menu lateral passa a abrir por um botão e aparece uma barra de navegação inferior, sem rolagem horizontal. Todas as imagens têm `alt`, os botões que só têm ícone têm `aria-label`, a página declara `lang="pt-BR"` e a estrutura usa tags semânticas (`header`, `nav`, `main`, `section`), o que permite ao leitor de tela descrever a aplicação. |

---

## Testes com usuários

(a ser preenchido após os testes: Matriz de Feedback e a melhoria aplicada)

---

## Como executar

Não é preciso instalar nada nem rodar nenhum servidor. Baixe ou clone o
repositório e abra o arquivo `index.html` em qualquer navegador. Ele é a
primeira tela e leva para todas as outras.

---

## Tecnologias utilizadas

| Tecnologia | Para que serve no projeto |
|---|---|
| HTML5 | Estrutura de todas as telas |
| CSS3 | Aparência, cores, layout e versão para impressão |
| JavaScript | Cálculos, validações e atualização das telas |
| Web Storage API (`localStorage`) | Guardar os dados no próprio navegador |

Não foram utilizadas bibliotecas, frameworks ou banco de dados.

---

## Estrutura dos arquivos

Cada tela é um arquivo HTML próprio e a navegação entre elas é feita com links
comuns. Cada tela tem também o seu arquivo JavaScript.

```
caixamei/
├── index.html              Aviso de projeto acadêmico (primeira tela)
├── apresentacao.html       Apresentação do sistema
├── cadastro.html           Criar conta
├── login.html              Entrar
├── atendimentos.html       Pergunta inicial: como o usuário chama seus atendimentos
├── dias.html               Pergunta inicial: dias de funcionamento
├── inicio.html             Resumo do mês, avisos, limite anual e DAS
├── fechar.html             Formulário de fechamento do caixa
├── historico.html          Dias registrados, com filtros
├── analises.html           Comparações, clima, dia da semana e evolução
├── obrigacoes.html         Limite anual, DAS e declaração anual
├── relatorios.html         Relatório mensal e anual para impressão
├── configuracoes.html      Dados do negócio e dados de demonstração
├── css/style.css           Folha de estilo única
├── js/
│   ├── funcoes.js          Formatação de dinheiro, datas e máscaras
│   ├── dados.js            Leitura e gravação no localStorage
│   ├── calculos.js         Somas, médias, limite anual, DAS e análises
│   ├── componentes.js      Pedaços de HTML que se repetem em várias telas
│   ├── menu.js             Menu lateral e partes comuns às telas do sistema
│   ├── demonstracao.js     Geração dos dados fictícios de teste
│   └── (um arquivo por tela: inicio.js, fechar.js, historico.js, etc.)
└── assets/                 Logotipo, símbolo e favicon
```

O `dados.js` é o único arquivo que conversa com o `localStorage`. Como o acesso
aos dados está concentrado em um lugar só, trocar por um banco de dados no
futuro exige reescrever apenas esse arquivo.

---

## Limitações do protótipo

- O cadastro e o login são ilustrativos. Não existe servidor nem autenticação
  real, e as senhas não são protegidas.
- Os planos pagos apresentados na página inicial ainda não existem.
- Os depoimentos da página de apresentação são fictícios.
- O clima do dia é informado manualmente pelo usuário.
- Os dados ficam só no navegador do usuário: não são compartilhados entre
  aparelhos e se perdem se ele limpar os dados do navegador.
- O limite anual de faturamento (R$ 81.000,00) é fixo no código, no arquivo
  `dados.js`, porque é definido por lei.

---

## Continuidade do projeto

- Banco de dados e arquitetura cliente-servidor, com contas reais de usuário
- Separação das entradas por forma de recebimento (dinheiro, Pix e cartão)
- Preenchimento automático do clima por meio de uma API de previsão do tempo
- Funcionamento como aplicativo instalável, com cache offline
- Fechamento do caixa por comando de voz
