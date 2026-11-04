// aviso.js
// Só cuida do botão da primeira tela.

document.getElementById("btn-entendi").addEventListener("click", function () {
  // Quem já entrou antes e marcou "lembrar de mim" vai direto para o sistema.
  if (estaLogado() === true && configuracaoCompleta() === true) {
    window.location.href = "inicio.html";
  } else {
    window.location.href = "apresentacao.html";
  }
});
