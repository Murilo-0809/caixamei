// analises.js
// Comparação entre dias, média por clima, melhor dia da semana e evolução
// dos últimos meses.

var podeAbrir = prepararSistema();


function montarAnalises() {
  var lista = listarFechamentos();

  if (lista.length === 0) {
    document.getElementById("conteudo-analises").innerHTML = montarVazio(
      "Ainda não há o que analisar",
      "As análises comparam dias parecidos entre si. Faça alguns fechamentos " +
      "ou carregue os dados de demonstração para ver como funciona.",
      '<a class="btn btn-primario" href="fechar.html">Fechar o dia</a>' +
      '<button class="btn btn-secundario" type="button" id="btn-demo">' +
      "Carregar dados de demonstração</button>"
    );

    ligarBotao("btn-demo", carregarDemonstracao);
    return;
  }

  var html = "";

  html = html + secaoComparacao(lista);
  html = html + secaoClima(lista);
  html = html + secaoDiaSemana(lista);
  html = html + secaoEvolucao(lista);

  document.getElementById("conteudo-analises").innerHTML = html;

  // O seletor de dia só existe depois do innerHTML, então ligo ele aqui.
  var seletor = document.getElementById("ana-dia");

  seletor.addEventListener("change", function () {
    montarComparacao(seletor.value);
  });

  montarComparacao(seletor.value);
}


function secaoComparacao(lista) {
  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Comparar um dia com o mês anterior</h2>' +
    '<p class="secao-texto">O sistema procura o mesmo dia da semana no mês passado.</p>' +
    '</div></div><div class="card">';

  html = html + '<div class="campo" style="max-width:320px">';
  html = html + '<label class="campo-rotulo" for="ana-dia">Escolha o dia</label>';
  html = html + '<select class="select" id="ana-dia">';

  // Mostro no máximo os 60 dias mais recentes para a lista não ficar enorme.
  var quantos = lista.length;

  if (quantos > 60) {
    quantos = 60;
  }

  for (var i = 0; i < quantos; i++) {
    html = html + '<option value="' + lista[i].data + '">' +
           dataParaTexto(lista[i].data) + " · " +
           nomeDiaSemanaLongo(diaDaSemana(lista[i].data)) + "</option>";
  }

  html = html + "</select></div>";
  html = html + '<div id="ana-comparacao"></div>';

  return html + "</div></section>";
}


function montarComparacao(data) {
  var comparacao = compararComMesAnterior(listarFechamentos(), data);
  var html = "";

  if (comparacao.estado === "sem-dia") {
    html = '<p class="card-legenda">Dia não encontrado.</p>';
  } else if (comparacao.estado === "sem-comparacao") {
    html = montarConclusao(
      "Não há nenhuma " + nomeDiaSemanaLongo(comparacao.diaSemana) +
      " registrada em " + rotuloMes(comparacao.competenciaAnterior) +
      " para comparar com este dia."
    );
  } else {
    var atual = comparacao.atual;
    var baseTexto = "a média das " + nomeDiaSemanaLongo(comparacao.diaSemana) + "s de " +
                    rotuloMes(comparacao.competenciaAnterior);

    if (comparacao.tipo === "dia") {
      baseTexto = dataParaTexto(comparacao.referencia.data) + " (" +
                  nomeDiaSemanaLongo(comparacao.diaSemana) + ")";
    }

    var classe = "valor-positivo";
    var palavra = "a mais";

    if (comparacao.diferenca < 0) {
      classe = "valor-negativo";
      palavra = "a menos";
    }

    html = '<div class="grid grid-2" style="margin-top:16px">';

    html = html + '<div class="card" style="background:var(--fundo-2)">' +
      '<p class="kpi-rotulo">' + dataParaTexto(atual.data) + "</p>" +
      '<p class="kpi-valor">' + formatarMoeda(atual.entradas) + "</p>" +
      '<p class="kpi-nota">' + SITUACOES[atual.situacao] + descreverClima(atual) + "</p></div>";

    if (comparacao.tipo === "dia") {
      html = html + '<div class="card" style="background:var(--fundo-2)">' +
        '<p class="kpi-rotulo">' + dataParaTexto(comparacao.referencia.data) + "</p>" +
        '<p class="kpi-valor">' + formatarMoeda(comparacao.valorBase) + "</p>" +
        '<p class="kpi-nota">' + SITUACOES[comparacao.referencia.situacao] +
        descreverClima(comparacao.referencia) + "</p></div>";
    } else {
      html = html + '<div class="card" style="background:var(--fundo-2)">' +
        '<p class="kpi-rotulo">Média do mês anterior</p>' +
        '<p class="kpi-valor">' + formatarMoeda(comparacao.valorBase) + "</p>" +
        '<p class="kpi-nota">' + nomeDiaSemanaLongo(comparacao.diaSemana) + "s de " +
        rotuloMes(comparacao.competenciaAnterior) + "</p></div>";
    }

    html = html + "</div>";

    html = html + montarConclusao(
      'Neste dia entrou <strong class="' + classe + '">' +
      formatarMoeda(Math.abs(comparacao.diferenca)) + " " + palavra + "</strong> (" +
      formatarPorcentagem(comparacao.porcentagem, 1) + ") em relação a " + baseTexto + "."
    );
  }

  document.getElementById("ana-comparacao").innerHTML = html;
}


function descreverClima(fechamento) {
  if (fechamento.clima === "") {
    return "";
  }

  return " · " + CLIMAS[fechamento.clima];
}


function secaoClima(lista) {
  var porClima = mediaPorClima(lista);

  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Quanto você vende em cada tipo de dia</h2>' +
    '<p class="secao-texto">Média do que entrou por dia, separada pelo tempo que fazia.</p>' +
    '</div></div><div class="card">';

  if (porClima.grupos.length === 0) {
    return html + '<p class="card-legenda">Nenhum dia com o tempo informado até agora.</p>' +
           "</div></section>";
  }

  var itens = [];

  for (var i = 0; i < porClima.grupos.length; i++) {
    var grupo = porClima.grupos[i];
    var destaque = porClima.melhor !== null && porClima.melhor.id === grupo.id;

    itens.push({
      rotulo: grupo.rotulo,
      valor: grupo.media,
      destaque: destaque,
      nota: grupo.dias + " dia(s)"
    });
  }

  html = html + montarGrafico(itens);

  if (porClima.confiavel === true) {
    html = html + montarConclusao(
      "Nos dias de " + porClima.melhor.rotulo.toLowerCase() + " você vende em média " +
      formatarMoeda(porClima.melhor.media) + ", contra " +
      formatarMoeda(porClima.pior.media) + " nos dias de " +
      porClima.pior.rotulo.toLowerCase() + "."
    );
  } else {
    html = html + montarConclusao(
      "Ainda são poucos dias registrados para tirar uma conclusão. A partir de " +
      MINIMO_PARA_ANALISE + " dias com o tempo informado o sistema mostra uma " +
      "comparação mais segura."
    );
  }

  return html + "</div></section>";
}


function secaoDiaSemana(lista) {
  var porDia = mediaPorDiaSemana(lista);

  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Melhor dia da semana</h2>' +
    '<p class="secao-texto">Média do que entrou em cada dia da semana.</p>' +
    '</div></div><div class="card">';

  var itens = [];

  for (var i = 0; i < porDia.grupos.length; i++) {
    var grupo = porDia.grupos[i];
    var destaque = porDia.melhor !== null && porDia.melhor.numero === grupo.numero;
    var nota = grupo.dias + " dia(s)";

    if (grupo.dias === 0) {
      nota = "sem registro";
    }

    itens.push({
      rotulo: grupo.rotuloLongo,
      valor: grupo.media,
      destaque: destaque,
      nota: nota
    });
  }

  html = html + montarGrafico(itens);

  if (porDia.confiavel === true && porDia.melhor !== null) {
    html = html + montarConclusao(
      "O seu melhor dia é " + porDia.melhor.rotuloLongo + ", com média de " +
      formatarMoeda(porDia.melhor.media) + " por dia."
    );
  } else {
    html = html + montarConclusao(
      "Com mais dias registrados o sistema consegue apontar com segurança qual " +
      "é o seu melhor dia da semana."
    );
  }

  return html + "</div></section>";
}


function secaoEvolucao(lista) {
  var evolucao = evolucaoMensal(lista, 6, mesDeHoje());

  var html = '<section class="secao"><div class="secao-cabecalho"><div>' +
    '<h2 class="secao-titulo">Evolução dos últimos 6 meses</h2>' +
    '<p class="secao-texto">Total que entrou em cada mês.</p>' +
    '</div></div><div class="card">';

  var itens = [];

  for (var i = 0; i < evolucao.length; i++) {
    var nota = evolucao[i].dias + " dia(s)";

    if (evolucao[i].dias === 0) {
      nota = "sem registro";
    }

    itens.push({
      rotulo: evolucao[i].rotulo,
      valor: evolucao[i].entradas,
      destaque: evolucao[i].competencia === mesDeHoje(),
      nota: nota
    });
  }

  return html + montarGrafico(itens) + "</div></section>";
}


// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
function montarTela() {
  montarAnalises();
}


if (podeAbrir === true) {
  montarAnalises();
}
