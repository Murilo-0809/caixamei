// tema.js
// Modo claro e modo escuro. A preferência fica salva no navegador, então a
// pessoa escolhe uma vez e todas as telas abrem do jeito que ela gosta.

var CHAVE_TEMA = "caixamei_tema";

var ICONE_LUA = '<svg class="ico" viewBox="0 0 24 24">' +
  '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';

var ICONE_SOL = '<svg class="ico" viewBox="0 0 24 24">' +
  '<circle cx="12" cy="12" r="4"/>' +
  '<path d="M12 2v2M12 20v2M20 12h2M2 12h2M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4' +
  'M18.4 18.4l1.4 1.4M4.2 4.2l1.4 1.4"/></svg>';


function temaEscuroLigado() {
  return localStorage.getItem(CHAVE_TEMA) === "escuro";
}


// Põe ou tira a classe "escuro" no body. É essa classe que troca todas as
// cores do CSS de uma vez.
function aplicarTema() {
  if (temaEscuroLigado() === true) {
    document.body.classList.add("escuro");
  } else {
    document.body.classList.remove("escuro");
  }

  desenharBotaoDeTema();
}


// No modo claro o botão mostra uma lua, no escuro mostra um sol.
function desenharBotaoDeTema() {
  var botao = document.getElementById("btn-tema");

  if (botao === null) {
    return;
  }

  if (temaEscuroLigado() === true) {
    botao.innerHTML = ICONE_SOL;
    botao.setAttribute("aria-label", "Voltar para o modo claro");
  } else {
    botao.innerHTML = ICONE_LUA;
    botao.setAttribute("aria-label", "Ativar o modo escuro");
  }
}


function alternarTema() {
  if (temaEscuroLigado() === true) {
    localStorage.setItem(CHAVE_TEMA, "claro");
  } else {
    localStorage.setItem(CHAVE_TEMA, "escuro");
  }

  aplicarTema();
}


// ---- Ao abrir qualquer tela ----

aplicarTema();

var botaoDeTema = document.getElementById("btn-tema");

if (botaoDeTema !== null) {
  botaoDeTema.addEventListener("click", alternarTema);
}
