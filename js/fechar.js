// fechar.js
// Formulário de fechamento do caixa.

var podeAbrir = prepararSistema();

// Troca a palavra "vendas" pela que o usuário escolheu no começo.
document.getElementById("rotulo-atendimentos").innerHTML = getTermos().plural;

var campoData = document.getElementById("fec-data");
var campoEntradas = document.getElementById("fec-entradas");
var campoSaidas = document.getElementById("fec-saidas");
var campoRetiradas = document.getElementById("fec-retiradas");
var campoObservacao = document.getElementById("fec-observacao");

aplicarMascaraMoeda(campoEntradas);
aplicarMascaraMoeda(campoSaidas);
aplicarMascaraMoeda(campoRetiradas);


// Preenche o formulário com o fechamento daquele dia, se já existir um.
function carregarDia(data) {
  var fechamento = buscarFechamentoPorData(data);
  var botaoExcluir = document.getElementById("btn-excluir");

  limparErro("erro-fec-data");

  if (fechamento === null) {
    marcarOpcao("opcoes-situacao", "normal");
    marcarOpcao("opcoes-clima", "");

    campoEntradas.value = "";
    campoSaidas.value = "";
    campoRetiradas.value = "";
    campoObservacao.value = "";
    document.getElementById("fec-atendimentos").value = "";

    botaoExcluir.style.display = "none";
  } else {
    marcarOpcao("opcoes-situacao", fechamento.situacao);
    marcarOpcao("opcoes-clima", fechamento.clima);

    escreverMoedaNoCampo(campoEntradas, fechamento.entradas);
    escreverMoedaNoCampo(campoSaidas, fechamento.saidas);
    escreverMoedaNoCampo(campoRetiradas, fechamento.retiradas);

    campoObservacao.value = fechamento.observacao;
    document.getElementById("fec-atendimentos").value = fechamento.atendimentos;

    botaoExcluir.style.display = "inline-flex";
  }

  atualizarContador();
  atualizarPelaSituacao();
  atualizarResumo();
}


// Quando o dia é marcado como "Não abri" não faz sentido pedir valores.
function atualizarPelaSituacao() {
  var fechado = lerOpcaoMarcada("opcoes-situacao") === "fechado";

  if (fechado === true) {
    document.getElementById("grupo-valores").style.display = "none";
    document.getElementById("campo-clima").style.display = "none";
    document.getElementById("resumo-fechamento").style.display = "none";
  } else {
    document.getElementById("grupo-valores").style.display = "grid";
    document.getElementById("campo-clima").style.display = "flex";
    document.getElementById("resumo-fechamento").style.display = "grid";
  }
}


// Mostra o lucro enquanto a pessoa digita.
function atualizarResumo() {
  var entradas = textoParaNumero(campoEntradas.value);
  var saidas = textoParaNumero(campoSaidas.value);
  var retiradas = textoParaNumero(campoRetiradas.value);

  document.getElementById("resumo-lucro").innerHTML = formatarMoeda(entradas - saidas);
  document.getElementById("resumo-sobra").innerHTML = formatarMoeda(entradas - saidas - retiradas);
}


function atualizarContador() {
  document.getElementById("contador-obs").innerHTML = campoObservacao.value.length;
}


function guardarFechamento() {
  var data = campoData.value;

  limparErro("erro-fec-data");

  if (data === "") {
    mostrarErro("erro-fec-data", "Escolha o dia do fechamento.");
    return;
  }

  // Como as datas são texto no formato ano-mês-dia, dá para comparar direto.
  if (data > dataDeHoje()) {
    mostrarErro("erro-fec-data", "Não é possível fechar um dia que ainda não aconteceu.");
    return;
  }

  var situacao = lerOpcaoMarcada("opcoes-situacao");
  var clima = lerOpcaoMarcada("opcoes-clima");
  var entradas = textoParaNumero(campoEntradas.value);
  var saidas = textoParaNumero(campoSaidas.value);
  var retiradas = textoParaNumero(campoRetiradas.value);
  var atendimentos = Number(document.getElementById("fec-atendimentos").value);

  if (isNaN(atendimentos) === true || atendimentos < 0) {
    atendimentos = 0;
  }

  // Em um dia fechado não houve movimento nenhum.
  if (situacao === "fechado") {
    entradas = 0;
    saidas = 0;
    retiradas = 0;
    atendimentos = 0;
    clima = "";
  }

  salvarFechamento({
    id: gerarId(),
    data: data,
    entradas: entradas,
    saidas: saidas,
    retiradas: retiradas,
    atendimentos: atendimentos,
    situacao: situacao,
    clima: clima,
    observacao: campoObservacao.value.trim(),
    demo: false
  });

  // Não troco de página: a tela mostra o aviso e carrega de novo o dia
  // salvo, agora já com o botão de excluir disponível.
  mostrarAvisoRapido("Fechamento do dia salvo.", "ok");
  carregarDia(data);
}


function apagarFechamento() {
  var fechamento = buscarFechamentoPorData(campoData.value);

  if (fechamento === null) {
    return;
  }

  var confirmou = confirm("Apagar o fechamento de " + dataParaTexto(campoData.value) + "?");

  if (confirmou === false) {
    return;
  }

  excluirFechamento(fechamento.id);

  mostrarAvisoRapido("Fechamento apagado.", "ok");
  carregarDia(campoData.value);
}


// ---- Eventos ----

campoEntradas.addEventListener("input", atualizarResumo);
campoSaidas.addEventListener("input", atualizarResumo);
campoRetiradas.addEventListener("input", atualizarResumo);
campoObservacao.addEventListener("input", atualizarContador);

campoData.addEventListener("change", function () {
  carregarDia(campoData.value);
});

var opcoesSituacao = document.getElementById("opcoes-situacao").querySelectorAll("input");

for (var i = 0; i < opcoesSituacao.length; i++) {
  opcoesSituacao[i].addEventListener("change", atualizarPelaSituacao);
}

document.getElementById("form-fechar").addEventListener("submit", function (evento) {
  evento.preventDefault();
  guardarFechamento();
});

ligarBotao("btn-excluir", apagarFechamento);


// ---- Ao abrir a tela ----

// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
function montarTela() {
  carregarDia(campoData.value);
}


if (podeAbrir === true) {
  // A tela anterior pode ter deixado um recado dizendo qual dia abrir.
  var diaParaAbrir = pegarRecado("dia");

  if (diaParaAbrir === null) {
    diaParaAbrir = dataDeHoje();
  }

  campoData.value = diaParaAbrir;
  carregarDia(diaParaAbrir);
}
