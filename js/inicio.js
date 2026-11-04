// inicio.js
// Monta a tela de início: avisos, resumo do mês, limite anual, DAS e os
// últimos dias registrados.

var podeAbrir = prepararSistema();


function montarInicio() {
  var lista = listarFechamentos();
  var hoje = dataDeHoje();
  var competencia = mesDeHoje();

  var resumo = resumoDoMes(lista, competencia);
  var limite = calcularLimiteAnual(lista, anoDeHoje());
  var das = calcularDas(hoje);
  var pendentes = diasSemFechamento(lista, getDiasFuncionamento(), hoje);
  var avisoRetirada = alertaDeRetiradas(lista, competencia);
  var fechamentoDeHoje = buscarFechamentoPorData(hoje);

  var html = "";

  // ---- Avisos ----

  if (pendentes.length > 0) {
    var tituloPendencia = "Você tem " + pendentes.length + " dias sem fechamento.";

    if (pendentes.length === 1) {
      tituloPendencia = "Você tem 1 dia sem fechamento.";
    }

    html = html + montarAlerta(
      "atencao",
      tituloPendencia,
      "O mais antigo é " + dataParaTexto(pendentes[pendentes.length - 1]) +
      ". Registrar esses dias mantém os seus números corretos.",
      '<button class="btn btn-sm btn-primario" type="button" id="btn-pendencia">' +
      "Fechar " + dataParaTexto(pendentes[0]) + "</button>"
    );
  }

  if (limite.nivel !== "ok") {
    var tituloLimite = "Você já usou " + formatarPorcentagem(limite.porcentagem, 1) +
                       " do limite anual do MEI.";
    var tipoLimite = "atencao";

    if (limite.nivel === "excedido") {
      tituloLimite = "Seu faturamento do ano passou do limite de " +
                     formatarMoedaCurta(limite.limite) + ".";
      tipoLimite = "erro";
    }

    html = html + montarAlerta(
      tipoLimite,
      tituloLimite,
      "Faturamento registrado em " + limite.ano + ": " + formatarMoeda(limite.faturamento) +
      ". Restam " + formatarMoeda(limite.restante) + ".",
      ""
    );
  }

  if (avisoRetirada !== null) {
    html = html + montarAlerta(
      "atencao",
      "Suas retiradas pessoais estão acima do lucro deste mês.",
      "Você retirou " + formatarMoeda(avisoRetirada.retiradas) + " e o lucro do mês é " +
      formatarMoeda(avisoRetirada.lucro) + ". Quando isso acontece, o dinheiro que sai " +
      "é do caixa do negócio.",
      ""
    );
  }

  if (das.situacao === "vencido") {
    html = html + montarAlerta(
      "erro",
      "O DAS de " + rotuloMes(das.competenciaApurada) + " venceu em " +
      dataParaTexto(das.vencimento) + ".",
      "Vencimentos em atraso geram juros e podem desenquadrar o MEI.",
      '<a class="btn btn-sm btn-secundario" href="obrigacoes.html">Ver obrigações</a>'
    );
  } else if (das.situacao === "proximo") {
    html = html + montarAlerta(
      "atencao",
      "O DAS vence em " + das.diasRestantes + " dia(s).",
      "Vencimento em " + dataParaTexto(das.vencimento) + ".",
      '<a class="btn btn-sm btn-secundario" href="obrigacoes.html">Ver obrigações</a>'
    );
  }

  // ---- Chamada principal ----

  if (fechamentoDeHoje === null) {
    html = html + '<div class="secao"><div class="cta-fechar"><div>' +
      "<h2>Fechar o dia de hoje</h2>" +
      "<p>" + primeiraMaiuscula(dataPorExtenso(hoje)) + " · leva cerca de um minuto</p>" +
      '</div><a class="btn btn-grande" href="fechar.html">Fechar o dia</a></div></div>';
  } else {
    html = html + '<div class="secao">' + montarAlerta(
      "ok",
      "O dia de hoje já está fechado.",
      "Entrou " + formatarMoeda(fechamentoDeHoje.entradas) + " e saiu " +
      formatarMoeda(fechamentoDeHoje.saidas) + ".",
      '<button class="btn btn-sm btn-secundario" type="button" id="btn-editar-hoje">' +
      "Editar o fechamento de hoje</button>"
    ) + "</div>";
  }

  // ---- Corpo ----

  if (lista.length === 0) {
    html = html + montarVazio(
      "Seu caixa começa no primeiro fechamento",
      "Registre quanto entrou e quanto saiu hoje. A partir daí o CaixaMEI monta " +
      "o resumo do mês, as análises e os relatórios automaticamente.",
      '<a class="btn btn-primario" href="fechar.html">Fechar o dia</a>' +
      '<button class="btn btn-secundario" type="button" id="btn-demo">' +
      "Carregar dados de demonstração</button>"
    );
  } else {
    html = html + '<section class="secao"><div class="secao-cabecalho"><div>' +
      '<h2 class="secao-titulo">Resumo de ' + rotuloMes(competencia) + "</h2>" +
      '<p class="secao-texto">Calculado a partir dos seus fechamentos.</p></div>' +
      '<a class="btn btn-sm btn-secundario" href="analises.html">Ver análises</a></div>' +
      montarIndicadores(resumo) + "</section>";

    html = html + '<section class="secao"><div class="grid grid-2">' +
      cardLimite(limite) + cardDas(das) + "</div></section>";

    var ultimos = lista.slice(0, 3);

    html = html + '<section class="secao"><div class="secao-cabecalho">' +
      '<h2 class="secao-titulo">Últimos dias registrados</h2>' +
      '<a class="btn btn-sm btn-secundario" href="historico.html">Ver histórico</a></div>';

    html = html + '<div class="lista">';

    for (var i = 0; i < ultimos.length; i++) {
      html = html + cartaoRegistro(ultimos[i], "editar-" + i);
    }

    html = html + "</div></section>";
  }

  document.getElementById("conteudo-inicio").innerHTML = html;

  // ---- Ligando os botões recém-criados ----

  ligarBotao("btn-editar-hoje", function () {
    abrirFechamentoDoDia(hoje);
  });

  ligarBotao("btn-demo", carregarDemonstracao);

  ligarBotao("btn-pagar-das", function () {
    marcarDas(das.competenciaVencimento, true);
    mostrarAvisoRapido("DAS marcado como pago.", "ok");
    montarInicio();
  });

  if (pendentes.length > 0) {
    ligarBotao("btn-pendencia", function () {
      abrirFechamentoDoDia(pendentes[0]);
    });
  }

  for (var k = 0; k < 3; k++) {
    ligarBotaoDeEdicao("editar-" + k, lista[k]);
  }
}


function cardLimite(limite) {
  return '<div class="card">' +
    '<p class="card-titulo">Limite anual do MEI</p>' +
    '<p class="card-legenda">Faturamento de ' + limite.ano + " sobre o limite de " +
    formatarMoedaCurta(limite.limite) + ".</p>" +
    '<p class="kpi-valor" style="margin:14px 0 10px">' + formatarMoeda(limite.faturamento) +
    "</p>" + montarBarraProgresso(limite.porcentagem, limite.nivel) +
    '<div class="progresso-legenda"><span>' + formatarPorcentagem(limite.porcentagem, 1) +
    " utilizado</span><span>Restam " + formatarMoeda(limite.restante) + "</span></div></div>";
}


function cardDas(das) {
  var selo = '<span class="badge">Em aberto</span>';

  if (das.pago === true) {
    selo = '<span class="badge badge-ok">Pago</span>';
  } else if (das.situacao === "vencido") {
    selo = '<span class="badge badge-erro">Vencido</span>';
  } else if (das.situacao === "proximo") {
    selo = '<span class="badge badge-atencao">Vence em breve</span>';
  }

  var nota = "Faltam " + das.diasRestantes + " dia(s).";

  if (das.pago === true) {
    nota = "Você marcou este vencimento como pago.";
  } else if (das.diasRestantes < 0) {
    nota = "Venceu há " + Math.abs(das.diasRestantes) + " dia(s).";
  }

  var botao = '<a class="btn btn-sm btn-secundario" href="obrigacoes.html">Ver obrigações</a>';

  if (das.pago === false) {
    botao = '<button class="btn btn-sm btn-secundario" type="button" id="btn-pagar-das">' +
            "Marcar como pago</button>";
  }

  return '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;gap:12px">' +
    '<div><p class="card-titulo">Próximo DAS</p>' +
    '<p class="card-legenda">Competência ' + rotuloMes(das.competenciaApurada) +
    "</p></div>" + selo + "</div>" +
    '<p class="kpi-valor" style="margin:14px 0 4px">' + dataParaTexto(das.vencimento) + "</p>" +
    '<p class="kpi-nota">' + nota + "</p>" +
    '<div class="acoes" style="margin-top:16px">' + botao + "</div></div>";
}


// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
function montarTela() {
  montarInicio();
}


if (podeAbrir === true) {
  montarInicio();
}
