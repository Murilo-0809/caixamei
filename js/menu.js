// menu.js
// Carregado em todas as telas de dentro do sistema. Cuida do que se repete
// em todas elas: nome do negócio, faixa de demonstração, menu do celular
// e botão de sair.

// Escreve o nome do negócio no topo e no menu lateral.
function escreverNomeDoNegocio() {
  var config = getConfig();

  if (config === null) {
    return;
  }

  document.getElementById("topo-sub").innerHTML = textoSeguro(config.nomeNegocio);
  document.getElementById("sidebar-negocio").innerHTML = textoSeguro(config.nomeNegocio);
}


// Mostra a faixa amarela só quando existem dados de demonstração carregados.
function atualizarFaixaDemo() {
  var faixa = document.getElementById("faixa-demo");

  if (existemDadosDemo() === true) {
    faixa.style.display = "flex";
  } else {
    faixa.style.display = "none";
  }
}


function abrirMenuCelular() {
  document.getElementById("sidebar").style.display = "flex";
  document.getElementById("fundo-menu").style.display = "block";
}


function fecharMenuCelular() {
  // Deixando o display vazio o CSS volta a mandar: no computador o menu
  // continua aparecendo e no celular ele volta a ficar escondido.
  document.getElementById("sidebar").style.display = "";
  document.getElementById("fundo-menu").style.display = "none";
}


function sairDaConta() {
  var confirmou = confirm("Deseja sair da sua conta? Os seus dados continuam salvos neste navegador.");

  if (confirmou === false) {
    return;
  }

  encerrarSessao();

  window.location.href = "apresentacao.html";
}


function removerDemonstracao() {
  if (existemDadosDemo() === false) {
    mostrarAvisoRapido("Não há dados de demonstração para remover.", "");
    return;
  }

  var confirmou = confirm(
    "Remover os dados de demonstração? Os fechamentos que você mesmo criou serão mantidos."
  );

  if (confirmou === false) {
    return;
  }

  removerDadosDemo();

  // Em vez de recarregar a página, mando a tela se desenhar de novo.
  atualizarFaixaDemo();
  atualizarTela();

  mostrarAvisoRapido("Dados de demonstração removidos.", "ok");
}


// Roda em toda tela do sistema, antes do código próprio de cada uma.
// Devolve false quando a pessoa ainda não tem conta, e aí a tela nem chega
// a ser montada porque o navegador já está indo para o começo.
function prepararSistema() {
  if (configuracaoCompleta() === false) {
    window.location.href = "index.html";
    return false;
  }

  escreverNomeDoNegocio();
  atualizarFaixaDemo();

  ligarBotao("btn-menu", abrirMenuCelular);
  ligarBotao("barra-mais", abrirMenuCelular);
  ligarBotao("fundo-menu", fecharMenuCelular);
  ligarBotao("btn-sair", sairDaConta);
  ligarBotao("btn-remover-demo-faixa", removerDemonstracao);

  return true;
}
