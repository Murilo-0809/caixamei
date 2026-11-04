// historico.js
// Lista todos os dias registrados, com filtro por mês e por situação.

var podeAbrir = prepararSistema();

var filtroMes = document.getElementById("filtro-mes");
var filtroSituacao = document.getElementById("filtro-situacao");


// Monta as opções do filtro de mês com os meses que têm registro.
function preencherFiltroDeMeses() {
  var meses = mesesComRegistro(listarFechamentos());
  var html = '<option value="">Todos os meses</option>';

  for (var i = 0; i < meses.length; i++) {
    html = html + '<option value="' + meses[i] + '">' + rotuloMes(meses[i]) + "</option>";
  }

  filtroMes.innerHTML = html;
}


function montarHistorico() {
  var lista = listarFechamentos();
  var filtrada = lista;

  if (filtroMes.value !== "") {
    filtrada = filtrada.filter(function (fechamento) {
      return mesDaData(fechamento.data) === filtroMes.value;
    });
  }

  if (filtroSituacao.value !== "") {
    filtrada = filtrada.filter(function (fechamento) {
      return fechamento.situacao === filtroSituacao.value;
    });
  }

  var html = "";

  if (lista.length === 0) {
    html = montarVazio(
      "Nenhum dia registrado ainda",
      "Quando você fizer o primeiro fechamento, ele vai aparecer aqui.",
      '<a class="btn btn-primario" href="fechar.html">Fechar o dia</a>'
    );
  } else if (filtrada.length === 0) {
    html = montarVazio(
      "Nenhum dia encontrado",
      "Não há fechamentos com os filtros escolhidos. Tente mudar o mês ou a situação.",
      ""
    );
  } else {
    var resumo = calcularResumo(filtrada);

    html = '<section class="secao"><div class="secao-cabecalho"><div>' +
      '<h2 class="secao-titulo">' + filtrada.length + " dia(s) encontrado(s)</h2>" +
      '<p class="secao-texto">Entrou ' + formatarMoeda(resumo.entradas) +
      " · Saiu " + formatarMoeda(resumo.saidas) +
      " · Lucro " + formatarMoeda(resumo.lucro) + "</p></div></div>";

    html = html + '<div class="lista">';

    for (var i = 0; i < filtrada.length; i++) {
      html = html + cartaoRegistro(filtrada[i], "editar-" + i);
    }

    html = html + "</div></section>";
  }

  document.getElementById("conteudo-historico").innerHTML = html;

  // Cada botão "Editar" precisa saber qual dia abrir.
  for (var j = 0; j < filtrada.length; j++) {
    ligarBotaoDeEdicao("editar-" + j, filtrada[j]);
  }
}


filtroMes.addEventListener("change", montarHistorico);
filtroSituacao.addEventListener("change", montarHistorico);

ligarBotao("btn-limpar-filtros", function () {
  filtroMes.value = "";
  filtroSituacao.value = "";
  montarHistorico();
});


// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
// O filtro de meses também é montado de novo, porque podem ter surgido
// registros de meses que antes não existiam.
function montarTela() {
  preencherFiltroDeMeses();
  montarHistorico();
}


if (podeAbrir === true) {
  preencherFiltroDeMeses();
  montarHistorico();
}
