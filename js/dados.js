// dados.js
// É o único arquivo que mexe no localStorage. Todo o resto do sistema chama
// as funções daqui. Se um dia eu trocar por um banco de dados, só este
// arquivo precisa mudar.

var CHAVE_CONTA = "caixamei_conta";
var CHAVE_SESSAO = "caixamei_sessao";
var CHAVE_CONFIG = "caixamei_config";
var CHAVE_FECHAMENTOS = "caixamei_fechamentos";
var CHAVE_DAS = "caixamei_das";
var CHAVE_RECADO = "caixamei_recado_";

// Limite anual de faturamento do MEI definido em lei.
var LIMITE_ANUAL = 81000;

// Como o usuário pode chamar seus atendimentos.
var TERMOS = {
  vendas:   { plural: "vendas",   singular: "venda" },
  clientes: { plural: "clientes", singular: "cliente" },
  servicos: { plural: "serviços", singular: "serviço" },
  pedidos:  { plural: "pedidos",  singular: "pedido" }
};

var SITUACOES = {
  normal:  "Aberto normal",
  meio:    "Meio período",
  feriado: "Feriado",
  fechado: "Não abri"
};

var CLIMAS = {
  sol:     "Sol",
  nublado: "Nublado",
  chuva:   "Chuva",
  calor:   "Calor",
  frio:    "Frio"
};

var ORDEM_CLIMAS = ["sol", "nublado", "chuva", "calor", "frio"];


// ---------- Leitura e gravação ----------

function lerDados(chave, valorPadrao) {
  var texto = localStorage.getItem(chave);

  if (texto === null) {
    return valorPadrao;
  }

  return JSON.parse(texto);
}


function gravarDados(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}


function apagarDados(chave) {
  localStorage.removeItem(chave);
}


// ---------- Recados entre as páginas ----------
// Como cada tela é um arquivo HTML diferente, uso o localStorage para avisar
// a próxima página de alguma coisa. Exemplo: qual dia ela deve abrir.

function guardarRecado(nome, valor) {
  localStorage.setItem(CHAVE_RECADO + nome, valor);
}


// Lê o recado e já apaga, para não valer de novo na próxima visita.
function pegarRecado(nome) {
  var valor = localStorage.getItem(CHAVE_RECADO + nome);

  localStorage.removeItem(CHAVE_RECADO + nome);

  return valor;
}


// ---------- Conta do usuário ----------
// Neste protótipo a conta fica salva no próprio navegador, só para mostrar
// como ficaria o cadastro. Em um sistema real isso ficaria em um servidor.

function getConta() {
  return lerDados(CHAVE_CONTA, null);
}


function salvarConta(conta) {
  gravarDados(CHAVE_CONTA, conta);
}


function existeConta() {
  return getConta() !== null;
}


// ---------- Sessão ----------

function getSessao() {
  return lerDados(CHAVE_SESSAO, { logado: false, lembrar: false });
}


function salvarSessao(logado, lembrar) {
  gravarDados(CHAVE_SESSAO, { logado: logado, lembrar: lembrar });
}


// Só continua logado quem marcou "lembrar de mim".
function estaLogado() {
  var sessao = getSessao();

  return sessao.logado === true && sessao.lembrar === true;
}


function encerrarSessao() {
  salvarSessao(false, false);
}


// ---------- Configuração do negócio ----------

function getConfig() {
  return lerDados(CHAVE_CONFIG, null);
}


function salvarConfig(config) {
  gravarDados(CHAVE_CONFIG, config);
}


function configuracaoCompleta() {
  var config = getConfig();

  if (config === null) {
    return false;
  }

  return config.configurado === true;
}


// Devolve como o usuário chama seus atendimentos.
function getTermos() {
  var config = getConfig();

  if (config === null || TERMOS[config.termo] === undefined) {
    return TERMOS.vendas;
  }

  return TERMOS[config.termo];
}


function getDiasFuncionamento() {
  var config = getConfig();

  if (config === null || config.dias === undefined) {
    return [1, 2, 3, 4, 5];
  }

  return config.dias;
}


// ---------- Fechamentos ----------
// Cada fechamento é um objeto assim:
// { id, data, entradas, saidas, retiradas, atendimentos,
//   situacao, clima, observacao, demo }

// Devolve todos os fechamentos, do mais novo para o mais antigo.
function listarFechamentos() {
  var lista = lerDados(CHAVE_FECHAMENTOS, []);

  lista.sort(function (a, b) {
    if (a.data < b.data) {
      return 1;
    }
    if (a.data > b.data) {
      return -1;
    }
    return 0;
  });

  return lista;
}


function gravarFechamentos(lista) {
  gravarDados(CHAVE_FECHAMENTOS, lista);
}


function buscarFechamentoPorData(data) {
  var lista = listarFechamentos();

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].data === data) {
      return lista[i];
    }
  }

  return null;
}


// Salva o fechamento. Cada dia só pode ter um registro, então se já existir
// um naquela data ele é substituído.
function salvarFechamento(fechamento) {
  var lista = listarFechamentos();
  var posicao = -1;

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].data === fechamento.data) {
      posicao = i;
    }
  }

  if (posicao === -1) {
    lista.push(fechamento);
  } else {
    fechamento.id = lista[posicao].id;
    lista[posicao] = fechamento;
  }

  gravarFechamentos(lista);
}


function excluirFechamento(id) {
  var lista = listarFechamentos();

  var nova = lista.filter(function (fechamento) {
    return fechamento.id !== id;
  });

  gravarFechamentos(nova);
}


// ---------- Dados de demonstração ----------

function existemDadosDemo() {
  var lista = listarFechamentos();

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].demo === true) {
      return true;
    }
  }

  return false;
}


function contarDadosDemo() {
  var lista = listarFechamentos();
  var total = 0;

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].demo === true) {
      total = total + 1;
    }
  }

  return total;
}


// Remove só os de demonstração e mantém os que o usuário criou.
function removerDadosDemo() {
  var lista = listarFechamentos();

  var nova = lista.filter(function (fechamento) {
    return fechamento.demo !== true;
  });

  gravarFechamentos(nova);
}


// ---------- DAS ----------
// Guardo um objeto com os meses marcados como pagos:
// { "2026-10": true, "2026-11": false }

function getDasPagos() {
  return lerDados(CHAVE_DAS, {});
}


function marcarDas(competencia, pago) {
  var pagos = getDasPagos();

  pagos[competencia] = pago;

  gravarDados(CHAVE_DAS, pagos);
}


function dasEstaPago(competencia) {
  return getDasPagos()[competencia] === true;
}


// ---------- Apagar tudo ----------

function apagarTudo() {
  apagarDados(CHAVE_CONTA);
  apagarDados(CHAVE_SESSAO);
  apagarDados(CHAVE_CONFIG);
  apagarDados(CHAVE_FECHAMENTOS);
  apagarDados(CHAVE_DAS);
}
