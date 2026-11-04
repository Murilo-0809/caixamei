// configuracoes.js
// Dados do negócio, dados de demonstração e apagar tudo.

var podeAbrir = prepararSistema();

aplicarMascaraCnpj(document.getElementById("cfg-cnpj"));

// O limite anual é fixo, então só mostro o valor na tela.
document.getElementById("valor-limite").innerHTML = formatarMoeda(LIMITE_ANUAL);


function carregarConfiguracoes() {
  var config = getConfig();

  document.getElementById("cfg-negocio").value = config.nomeNegocio;
  document.getElementById("cfg-cnpj").value = config.cnpj;
  document.getElementById("cfg-ramo").value = config.ramo;
  document.getElementById("cfg-termo").value = config.termo;

  marcarDiasDaSemana("dias-semana-config", config.dias);

  atualizarTextoDaDemonstracao();
}


function guardarConfiguracoes() {
  var negocio = document.getElementById("cfg-negocio").value.trim();
  var dias = lerDiasMarcados("dias-semana-config");

  limparErro("erro-config");

  if (negocio === "") {
    mostrarErro("erro-config", "Informe o nome do negócio.");
    return;
  }

  if (dias.length === 0) {
    mostrarErro("erro-config", "Escolha pelo menos um dia de funcionamento.");
    return;
  }

  salvarConfig({
    nomeNegocio: negocio,
    cnpj: document.getElementById("cfg-cnpj").value,
    ramo: document.getElementById("cfg-ramo").value.trim(),
    termo: document.getElementById("cfg-termo").value,
    dias: dias,
    configurado: true
  });

  escreverNomeDoNegocio();
  mostrarAvisoRapido("Configurações salvas.", "ok");
}


function atualizarTextoDaDemonstracao() {
  var texto = document.getElementById("texto-demo");
  var quantidade = contarDadosDemo();

  if (quantidade === 0) {
    texto.innerHTML = "Nenhum dado de demonstração carregado.";
  } else {
    texto.innerHTML = "Hoje existem <strong>" + quantidade +
                      " fechamentos de demonstração</strong> salvos.";
  }
}


function apagarTudoDoSistema() {
  var confirmou = confirm(
    "Apagar TODOS os dados deste navegador? A conta e todos os fechamentos serão perdidos."
  );

  if (confirmou === false) {
    return;
  }

  apagarTudo();

  window.location.href = "index.html";
}


document.getElementById("form-config").addEventListener("submit", function (evento) {
  evento.preventDefault();
  guardarConfiguracoes();
});

ligarBotao("btn-carregar-demo", carregarDemonstracao);
ligarBotao("btn-remover-demo", removerDemonstracao);
ligarBotao("btn-apagar-tudo", apagarTudoDoSistema);


// Nome que o resto do sistema usa quando precisa que esta tela se atualize.
function montarTela() {
  atualizarTextoDaDemonstracao();
}


if (podeAbrir === true) {
  carregarConfiguracoes();
}
