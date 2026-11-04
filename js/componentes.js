// componentes.js
// Pedaços de HTML que aparecem em mais de uma tela. Todas as funções daqui
// devolvem texto, e quem chama é que coloca na página com innerHTML.

// Caixa de aviso colorida.
function montarAlerta(tipo, titulo, texto, acoes) {
  var html = '<div class="alerta alerta-' + tipo + '">';

  html = html + '<p class="alerta-titulo">' + titulo + "</p>";
  html = html + '<p class="alerta-texto">' + texto + "</p>";

  if (acoes !== "") {
    html = html + '<div class="alerta-acoes acoes">' + acoes + "</div>";
  }

  return html + "</div>";
}


function montarBarraProgresso(porcentagem, nivel) {
  var largura = porcentagem;

  // A barra não pode passar de 100% da largura mesmo quando o valor passa.
  if (largura > 100) {
    largura = 100;
  }

  var classe = "progresso-trilha";

  if (nivel === "atencao") {
    classe = "progresso-trilha atencao";
  } else if (nivel === "excedido") {
    classe = "progresso-trilha critico";
  }

  return '<div class="progresso"><div class="' + classe +
         '" style="width:' + largura.toFixed(1) + '%"></div></div>';
}


// Gráfico de barras feito com div, usando a largura em porcentagem.
// itens = [ { rotulo, valor, destaque, nota } ]
function montarGrafico(itens) {
  var maior = 0;

  // Primeiro descubro o maior valor, que vai ser a barra de 100%.
  for (var i = 0; i < itens.length; i++) {
    if (itens[i].valor > maior) {
      maior = itens[i].valor;
    }
  }

  if (maior === 0) {
    maior = 1;
  }

  var html = '<div class="grafico">';

  for (var j = 0; j < itens.length; j++) {
    var item = itens[j];
    var largura = (item.valor / maior) * 100;

    // Barra muito fina fica invisível, mas valor zero não mostra barra.
    if (item.valor > 0 && largura < 1.5) {
      largura = 1.5;
    }

    var classe = "grafico-barra";

    if (item.destaque === true) {
      classe = "grafico-barra destaque";
    }

    var rotulo = item.rotulo;

    if (item.nota !== undefined && item.nota !== "") {
      rotulo = rotulo + ' <span style="color:var(--texto-3)">· ' + item.nota + "</span>";
    }

    html = html + '<div class="grafico-linha">';
    html = html + '<span class="grafico-rotulo">' + rotulo + "</span>";
    html = html + '<span class="grafico-trilho"><span class="' + classe +
                  '" style="width:' + largura.toFixed(1) + '%"></span></span>';
    html = html + '<span class="grafico-valor">' + formatarMoeda(item.valor) + "</span>";
    html = html + "</div>";
  }

  return html + "</div>";
}


// Os quatro indicadores principais de um período.
function montarIndicadores(resumo) {
  var termos = getTermos();
  var classeLucro = "kpi-valor valor-positivo";

  if (resumo.lucro < 0) {
    classeLucro = "kpi-valor valor-negativo";
  }

  var html = '<div class="grid grid-kpis">';

  html = html + '<div class="card">' +
    '<p class="kpi-rotulo">Entrou</p>' +
    '<p class="kpi-valor">' + formatarMoeda(resumo.entradas) + "</p>" +
    '<p class="kpi-nota">em ' + resumo.dias + " dia(s) registrado(s)</p></div>";

  html = html + '<div class="card">' +
    '<p class="kpi-rotulo">Saiu</p>' +
    '<p class="kpi-valor">' + formatarMoeda(resumo.saidas) + "</p>" +
    '<p class="kpi-nota">despesas do negócio</p></div>';

  html = html + '<div class="card">' +
    '<p class="kpi-rotulo">Lucro</p>' +
    '<p class="' + classeLucro + '">' + formatarMoeda(resumo.lucro) + "</p>" +
    '<p class="kpi-nota">o que entrou menos o que saiu</p></div>';

  html = html + '<div class="card">' +
    '<p class="kpi-rotulo">Retirada pessoal</p>' +
    '<p class="kpi-valor">' + formatarMoeda(resumo.retiradas) + "</p>" +
    '<p class="kpi-nota">' + formatarNumero(resumo.atendimentos) + " " + termos.plural +
    " · " + formatarMoeda(resumo.ticketMedio) + " por " + termos.singular + "</p></div>";

  return html + "</div>";
}


// Cartão de um dia registrado, usado no início e no histórico.
function cartaoRegistro(fechamento, idBotao) {
  var termos = getTermos();
  var lucro = fechamento.entradas - fechamento.saidas;
  var classeLucro = "valor-positivo";

  if (lucro < 0) {
    classeLucro = "valor-negativo";
  }

  var html = '<div class="registro"><div>';

  html = html + '<div class="registro-topo">';
  html = html + '<span class="registro-data">' + dataParaTexto(fechamento.data) + "</span>";
  html = html + '<span class="badge">' + nomeDiaSemana(diaDaSemana(fechamento.data)) + "</span>";
  html = html + '<span class="badge">' + SITUACOES[fechamento.situacao] + "</span>";

  if (fechamento.clima !== "") {
    html = html + '<span class="badge badge-azul">' + CLIMAS[fechamento.clima] + "</span>";
  }

  if (fechamento.demo === true) {
    html = html + '<span class="badge badge-atencao">Demonstração</span>';
  }

  html = html + "</div>";

  html = html + '<dl class="registro-numeros">';
  html = html + '<div class="registro-num"><dt>Entrou</dt><dd>' +
                formatarMoeda(fechamento.entradas) + "</dd></div>";
  html = html + '<div class="registro-num"><dt>Saiu</dt><dd>' +
                formatarMoeda(fechamento.saidas) + "</dd></div>";
  html = html + '<div class="registro-num"><dt>Lucro</dt><dd class="' + classeLucro + '">' +
                formatarMoeda(lucro) + "</dd></div>";

  if (fechamento.retiradas > 0) {
    html = html + '<div class="registro-num"><dt>Retirada</dt><dd>' +
                  formatarMoeda(fechamento.retiradas) + "</dd></div>";
  }

  html = html + '<div class="registro-num"><dt>' + primeiraMaiuscula(termos.plural) +
                "</dt><dd>" + formatarNumero(fechamento.atendimentos) + "</dd></div>";
  html = html + "</dl>";

  if (fechamento.observacao !== "") {
    html = html + '<p class="registro-obs">' + textoSeguro(fechamento.observacao) + "</p>";
  }

  html = html + "</div>";

  html = html + '<div><button class="btn btn-sm btn-secundario" type="button" id="' +
                idBotao + '">Editar</button></div>';

  return html + "</div>";
}


// Mensagem de quando ainda não há nada para mostrar.
function montarVazio(titulo, texto, acoes) {
  var html = '<div class="vazio">';

  html = html + '<p class="vazio-titulo">' + titulo + "</p>";
  html = html + '<p class="vazio-texto">' + texto + "</p>";

  if (acoes !== "") {
    html = html + '<div class="acoes">' + acoes + "</div>";
  }

  return html + "</div>";
}


// Caixa azul com a conclusão de uma análise.
function montarConclusao(texto) {
  return '<div class="alerta alerta-info" style="margin:16px 0 0">' +
         '<p class="alerta-texto">' + texto + "</p></div>";
}


function linhaInfo(rotulo, valor) {
  return '<div class="linha-info"><span class="linha-rotulo">' + rotulo +
         '</span><span class="linha-valor">' + valor + "</span></div>";
}


// Liga um botão a uma função. Se o botão não estiver na tela, não faz nada.
function ligarBotao(id, funcao) {
  var botao = document.getElementById(id);

  if (botao === null) {
    return;
  }

  botao.addEventListener("click", funcao);
}


// Liga o botão "Editar" de um dia. Passo o fechamento como parâmetro para
// cada botão saber qual dia abrir.
function ligarBotaoDeEdicao(id, fechamento) {
  var botao = document.getElementById(id);

  if (botao === null) {
    return;
  }

  botao.addEventListener("click", function () {
    abrirFechamentoDoDia(fechamento.data);
  });
}


// Avisa a tela de fechamento qual dia abrir e vai para lá.
function abrirFechamentoDoDia(data) {
  guardarRecado("dia", data);

  window.location.href = "fechar.html";
}


// Toda tela do sistema tem a sua função montarTela(). Depois de salvar,
// apagar ou carregar dados eu chamo esta função para a tela se desenhar de
// novo com os números atualizados, sem precisar recarregar a página.
function atualizarTela() {
  if (typeof montarTela === "function") {
    montarTela();
  }
}


// Mensagem rápida no rodapé da tela.
function mostrarAvisoRapido(texto, tipo) {
  var caixa = document.getElementById("avisos");

  caixa.innerHTML = '<div class="aviso-rapido ' + tipo + '">' + textoSeguro(texto) + "</div>";

  // Some sozinha depois de três segundos.
  setTimeout(function () {
    caixa.innerHTML = "";
  }, 3000);
}


function mostrarErro(idDoErro, texto) {
  var paragrafo = document.getElementById(idDoErro);

  paragrafo.innerHTML = texto;
  paragrafo.style.display = "block";
}


function limparErro(idDoErro) {
  var paragrafo = document.getElementById(idDoErro);

  paragrafo.innerHTML = "";
  paragrafo.style.display = "none";
}


// Descobre qual opção está marcada num grupo de botões de rádio.
function lerOpcaoMarcada(idDoGrupo) {
  var opcoes = document.getElementById(idDoGrupo).querySelectorAll("input");

  for (var i = 0; i < opcoes.length; i++) {
    if (opcoes[i].checked === true) {
      return opcoes[i].value;
    }
  }

  return "";
}


function marcarOpcao(idDoGrupo, valor) {
  var opcoes = document.getElementById(idDoGrupo).querySelectorAll("input");

  for (var i = 0; i < opcoes.length; i++) {
    opcoes[i].checked = opcoes[i].value === valor;
  }
}


// Devolve os dias marcados, por exemplo [1, 2, 3, 4, 5].
function lerDiasMarcados(idDoGrupo) {
  var caixas = document.getElementById(idDoGrupo).querySelectorAll("input");
  var dias = [];

  for (var i = 0; i < caixas.length; i++) {
    if (caixas[i].checked === true) {
      dias.push(Number(caixas[i].value));
    }
  }

  return dias;
}


function marcarDiasDaSemana(idDoGrupo, dias) {
  var caixas = document.getElementById(idDoGrupo).querySelectorAll("input");

  for (var i = 0; i < caixas.length; i++) {
    caixas[i].checked = dias.indexOf(Number(caixas[i].value)) !== -1;
  }
}
