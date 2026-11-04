// obrigacoes.js
// Limite anual de faturamento, vencimentos do DAS e declaração anual.

var podeAbrir = prepararSistema();


function montarObrigacoes() {
  var lista = listarFechamentos();
  var hoje = dataDeHoje();
  var limite = calcularLimiteAnual(lista, anoDeHoje());
  var das = calcularDas(hoje);
  var historico = historicoDas(hoje, 6);

  var html = "";

  html = html + secaoLimite(limite);
  html = html + secaoProximoDas(das);
  html = html + secaoHistoricoDas(historico);
  html = html + secaoDeclaracao(lista, limite);

  document.getElementById("conteudo-obrigacoes").innerHTML = html;

  ligarBotao("btn-marcar", function () {
    marcarDas(das.competenciaVencimento, true);
    mostrarAvisoRapido("DAS marcado como pago.", "ok");
    montarObrigacoes();
  });

  ligarBotao("btn-desmarcar", function () {
    marcarDas(das.competenciaVencimento, false);
    mostrarAvisoRapido("Pagamento desmarcado.", "");
    montarObrigacoes();
  });

  for (var i = 0; i < historico.length; i++) {
    ligarBotaoDeDas("das-" + i, historico[i]);
  }
}


function secaoLimite(limite) {
  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Limite anual de faturamento</h2>' +
    '<p class="secao-texto">O MEI pode faturar até ' + formatarMoeda(limite.limite) +
    ' por ano.</p></div></div><div class="card">';

  html = html + '<p class="kpi-rotulo">Faturamento registrado em ' + limite.ano + "</p>" +
    '<p class="kpi-valor" style="margin:4px 0 14px">' + formatarMoeda(limite.faturamento) +
    "</p>" + montarBarraProgresso(limite.porcentagem, limite.nivel) +
    '<div class="progresso-legenda"><span>' + formatarPorcentagem(limite.porcentagem, 1) +
    " utilizado</span><span>Restam " + formatarMoeda(limite.restante) + "</span></div>";

  if (limite.nivel === "excedido") {
    html = html + montarAlerta(
      "erro",
      "Você passou do limite anual.",
      "Quando o faturamento ultrapassa o limite, o MEI pode ser desenquadrado e " +
      "passar a pagar impostos como microempresa. Procure a sua contabilidade.",
      ""
    );
  } else if (limite.nivel === "atencao") {
    html = html + montarAlerta(
      "atencao",
      "Você já passou de 80% do limite anual.",
      "Vale acompanhar de perto para não ser desenquadrado da categoria.",
      ""
    );
  }

  return html + "</div></section>";
}


function secaoProximoDas(das) {
  var selo = '<span class="badge">Em aberto</span>';

  if (das.pago === true) {
    selo = '<span class="badge badge-ok">Pago</span>';
  } else if (das.situacao === "vencido") {
    selo = '<span class="badge badge-erro">Vencido</span>';
  } else if (das.situacao === "proximo") {
    selo = '<span class="badge badge-atencao">Vence em breve</span>';
  }

  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">DAS, a guia mensal</h2>' +
    '<p class="secao-texto">O DAS vence todo dia 20 e se refere ao mês anterior.</p>' +
    '</div></div><div class="card">';

  html = html + '<div style="display:flex;justify-content:space-between;gap:12px">' +
    '<div><p class="card-titulo">Próximo vencimento</p>' +
    '<p class="card-legenda">Competência ' + rotuloMes(das.competenciaApurada) +
    "</p></div>" + selo + "</div>" +
    '<p class="kpi-valor" style="margin:14px 0 4px">' + dataParaTexto(das.vencimento) + "</p>";

  if (das.pago === false && das.diasRestantes >= 0) {
    html = html + '<p class="kpi-nota">Faltam ' + das.diasRestantes + " dia(s).</p>";
  } else if (das.pago === false) {
    html = html + '<p class="kpi-nota">Venceu há ' + Math.abs(das.diasRestantes) + " dia(s).</p>";
  }

  html = html + '<div class="acoes" style="margin-top:16px">';

  if (das.pago === true) {
    html = html + '<button class="btn btn-sm btn-secundario" type="button" id="btn-desmarcar">' +
           "Desmarcar pagamento</button>";
  } else {
    html = html + '<button class="btn btn-sm btn-primario" type="button" id="btn-marcar">' +
           "Marcar como pago</button>";
  }

  return html + "</div></div></section>";
}


function secaoHistoricoDas(historico) {
  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Últimos vencimentos</h2>' +
    '<p class="secao-texto">Marque os meses que você já pagou.</p></div></div>';

  html = html + '<div class="card"><div class="tabela-wrap"><table class="tabela">';
  html = html + "<thead><tr><th>Competência</th><th>Vencimento</th><th>Situação</th>" +
         '<th class="num">Ação</th></tr></thead><tbody>';

  for (var i = 0; i < historico.length; i++) {
    var item = historico[i];
    var situacao = '<span class="badge">Em aberto</span>';
    var textoBotao = "Marcar como pago";

    if (item.pago === true) {
      situacao = '<span class="badge badge-ok">Pago</span>';
      textoBotao = "Desmarcar";
    }

    html = html + "<tr><td>" + rotuloMes(item.competenciaApurada) + "</td>";
    html = html + "<td>" + dataParaTexto(item.vencimento) + "</td>";
    html = html + "<td>" + situacao + "</td>";
    html = html + '<td class="num"><button class="btn btn-sm btn-sutil" type="button" id="das-' +
           i + '">' + textoBotao + "</button></td></tr>";
  }

  return html + "</tbody></table></div></div></section>";
}


function secaoDeclaracao(lista, limite) {
  var anoPassado = Number(anoDeHoje()) - 1;
  var resumoAnoPassado = resumoDoAno(lista, "" + anoPassado);

  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Declaração anual (DASN-SIMEI)</h2>' +
    '<p class="secao-texto">Entregue uma vez por ano, até 31 de maio.</p></div></div>';

  html = html + '<div class="card"><div class="linhas">';
  html = html + linhaInfo("Faturamento de " + anoDeHoje() + " até agora",
                          formatarMoeda(limite.faturamento));
  html = html + linhaInfo("Faturamento de " + anoPassado,
                          formatarMoeda(resumoAnoPassado.entradas));
  html = html + "</div>";

  html = html + '<p class="card-legenda" style="margin-top:16px">' +
    "Use o relatório anual do CaixaMEI para conferir o valor declarado na DASN-SIMEI." +
    '</p><div class="acoes" style="margin-top:12px">' +
    '<a class="btn btn-sm btn-secundario" href="relatorios.html">Abrir relatórios</a></div>';

  return html + "</div></section>";
}


// Cada linha da tabela tem o seu botão, então passo o item como parâmetro.
function ligarBotaoDeDas(id, item) {
  var botao = document.getElementById(id);

  if (botao === null) {
    return;
  }

  botao.addEventListener("click", function () {
    marcarDas(item.competenciaVencimento, item.pago !== true);
    montarObrigacoes();
  });
}


// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
function montarTela() {
  montarObrigacoes();
}


if (podeAbrir === true) {
  montarObrigacoes();
}
