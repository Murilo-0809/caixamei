// relatorios.js
// Monta o relatório mensal ou anual, pronto para imprimir ou salvar em PDF.

var podeAbrir = prepararSistema();

var seletorTipo = document.getElementById("rel-tipo");
var seletorMes = document.getElementById("rel-mes");
var seletorAno = document.getElementById("rel-ano");


function preencherSelecoes() {
  var lista = listarFechamentos();
  var meses = mesesComRegistro(lista);
  var anos = anosComRegistro(lista);

  var htmlMeses = "";

  for (var i = 0; i < meses.length; i++) {
    htmlMeses = htmlMeses + '<option value="' + meses[i] + '">' +
                rotuloMes(meses[i]) + "</option>";
  }

  seletorMes.innerHTML = htmlMeses;

  var htmlAnos = "";

  for (var j = 0; j < anos.length; j++) {
    htmlAnos = htmlAnos + '<option value="' + anos[j] + '">' + anos[j] + "</option>";
  }

  seletorAno.innerHTML = htmlAnos;
}


// Mostra o seletor de mês ou o de ano, conforme o tipo escolhido.
function atualizarCampos() {
  if (seletorTipo.value === "mensal") {
    document.getElementById("campo-rel-mes").style.display = "flex";
    document.getElementById("campo-rel-ano").style.display = "none";
  } else {
    document.getElementById("campo-rel-mes").style.display = "none";
    document.getElementById("campo-rel-ano").style.display = "flex";
  }
}


function montarRelatorio() {
  var tipo = seletorTipo.value;
  var lista = listarFechamentos();
  var config = getConfig();
  var termos = getTermos();

  var periodo = "";
  var selecionados = [];

  if (tipo === "mensal") {
    periodo = rotuloMes(seletorMes.value);
    selecionados = fechamentosDoMes(lista, seletorMes.value);
  } else {
    periodo = "Ano de " + seletorAno.value;
    selecionados = fechamentosDoAno(lista, seletorAno.value);
  }

  // No relatório os dias ficam em ordem crescente, que é como se lê.
  selecionados.sort(function (a, b) {
    if (a.data < b.data) {
      return -1;
    }
    if (a.data > b.data) {
      return 1;
    }
    return 0;
  });

  var html = '<div class="relatorio">';

  html = html + cabecalhoRelatorio(config, tipo, periodo);

  if (selecionados.length === 0) {
    html = html + '<div class="rel-bloco"><p class="card-legenda">' +
           "Nenhum fechamento registrado neste período.</p></div>";
  } else {
    html = html + blocoResumo(selecionados, termos);

    if (tipo === "anual") {
      html = html + blocoMesAMes(selecionados, seletorAno.value);
    }

    html = html + blocoDias(selecionados, termos);
  }

  html = html + '<div class="rel-rodape">' +
    "Relatório gerado pelo CaixaMEI a partir dos fechamentos de caixa registrados " +
    "pelo próprio usuário. Documento de uso gerencial, sem valor fiscal.</div>";

  document.getElementById("conteudo-relatorio").innerHTML = html + "</div>";
}


function cabecalhoRelatorio(config, tipo, periodo) {
  var nomeTipo = "anual";

  if (tipo === "mensal") {
    nomeTipo = "mensal";
  }

  var html = '<div class="rel-cabecalho"><div>' +
    '<p class="rel-negocio">' + textoSeguro(config.nomeNegocio) + "</p>";

  if (config.cnpj !== "") {
    html = html + '<p class="rel-meta">CNPJ ' + textoSeguro(config.cnpj) + "</p>";
  }

  html = html + '<p class="rel-meta">Relatório ' + nomeTipo + " · " + periodo + "</p></div>";

  html = html + '<div style="text-align:right"><p class="rel-meta">Emitido em</p>' +
    '<p class="rel-negocio" style="font-size:15px">' + dataParaTexto(dataDeHoje()) +
    "</p></div>";

  return html + "</div>";
}


function blocoResumo(selecionados, termos) {
  var resumo = calcularResumo(selecionados);
  var abertos = diasQueAbriram(selecionados);

  var html = '<div class="rel-bloco"><h3>Resumo do período</h3><div class="linhas">';

  html = html + linhaInfo("Total que entrou", formatarMoeda(resumo.entradas));
  html = html + linhaInfo("Total que saiu", formatarMoeda(resumo.saidas));
  html = html + linhaInfo("Lucro do período", formatarMoeda(resumo.lucro));
  html = html + linhaInfo("Retiradas pessoais", formatarMoeda(resumo.retiradas));
  html = html + linhaInfo("Dias registrados", formatarNumero(resumo.dias));
  html = html + linhaInfo("Dias em que abriu", formatarNumero(abertos.length));
  html = html + linhaInfo("Total de " + termos.plural, formatarNumero(resumo.atendimentos));
  html = html + linhaInfo("Valor médio por " + termos.singular,
                          formatarMoeda(resumo.ticketMedio));

  if (abertos.length > 0) {
    html = html + linhaInfo("Média por dia aberto", formatarMoeda(media(abertos, "entradas")));
  }

  return html + "</div></div>";
}


function blocoMesAMes(selecionados, ano) {
  var html = '<div class="rel-bloco"><h3>Mês a mês</h3>';

  html = html + '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
    '<th>Mês</th><th class="num">Dias</th><th class="num">Entrou</th>' +
    '<th class="num">Saiu</th><th class="num">Lucro</th></tr></thead><tbody>';

  for (var mes = 1; mes <= 12; mes++) {
    var resumo = resumoDoMes(selecionados, ano + "-" + doisDigitos(mes));

    // Mês sem nenhum registro não precisa aparecer.
    if (resumo.dias === 0) {
      continue;
    }

    html = html + "<tr><td>" + primeiraMaiuscula(NOMES_MESES[mes - 1]) + "</td>" +
      '<td class="num">' + resumo.dias + "</td>" +
      '<td class="num">' + formatarMoeda(resumo.entradas) + "</td>" +
      '<td class="num">' + formatarMoeda(resumo.saidas) + "</td>" +
      '<td class="num">' + formatarMoeda(resumo.lucro) + "</td></tr>";
  }

  return html + "</tbody></table></div></div>";
}


function blocoDias(selecionados, termos) {
  var html = '<div class="rel-bloco"><h3>Dias do período</h3>';

  html = html + '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
    "<th>Data</th><th>Dia</th><th>Situação</th><th>Tempo</th>" +
    '<th class="num">Entrou</th><th class="num">Saiu</th>' +
    '<th class="num">Lucro</th><th class="num">Retirada</th>' +
    '<th class="num">' + primeiraMaiuscula(termos.plural) + "</th></tr></thead><tbody>";

  for (var i = 0; i < selecionados.length; i++) {
    var f = selecionados[i];
    var clima = "-";

    if (f.clima !== "") {
      clima = CLIMAS[f.clima];
    }

    html = html + "<tr><td>" + dataParaTexto(f.data) + "</td>";
    html = html + "<td>" + nomeDiaSemana(diaDaSemana(f.data)) + "</td>";
    html = html + "<td>" + SITUACOES[f.situacao] + "</td>";
    html = html + "<td>" + clima + "</td>";
    html = html + '<td class="num">' + formatarMoeda(f.entradas) + "</td>";
    html = html + '<td class="num">' + formatarMoeda(f.saidas) + "</td>";
    html = html + '<td class="num">' + formatarMoeda(f.entradas - f.saidas) + "</td>";
    html = html + '<td class="num">' + formatarMoeda(f.retiradas) + "</td>";
    html = html + '<td class="num">' + formatarNumero(f.atendimentos) + "</td></tr>";
  }

  return html + "</tbody></table></div></div>";
}


seletorTipo.addEventListener("change", function () {
  atualizarCampos();
  montarRelatorio();
});

seletorMes.addEventListener("change", montarRelatorio);
seletorAno.addEventListener("change", montarRelatorio);

ligarBotao("btn-imprimir", function () {
  window.print();
});


// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
// As listas de mês e de ano também são montadas de novo.
function montarTela() {
  preencherSelecoes();
  atualizarCampos();
  montarRelatorio();
}


if (podeAbrir === true) {
  preencherSelecoes();
  atualizarCampos();
  montarRelatorio();
}
