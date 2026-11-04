// dias.js
// Segunda pergunta da configuração inicial: em quais dias o negócio abre.

var configSalva = getConfig();

if (configSalva !== null) {
  marcarDiasDaSemana("dias-semana-inicial", configSalva.dias);
}


document.getElementById("btn-continuar").addEventListener("click", function () {
  var dias = lerDiasMarcados("dias-semana-inicial");

  limparErro("erro-dias");

  if (dias.length === 0) {
    mostrarErro("erro-dias", "Escolha pelo menos um dia da semana.");
    return;
  }

  var config = getConfig();

  config.dias = dias;
  config.configurado = true;

  salvarConfig(config);

  window.location.href = "inicio.html";
});
