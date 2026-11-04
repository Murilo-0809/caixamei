// atendimentos.js
// Primeira pergunta da configuração inicial: como o usuário chama os
// atendimentos do negócio dele.

var configSalva = getConfig();

// Se a pessoa voltou para esta tela, deixo marcada a opção que ela já tinha
// escolhido antes.
if (configSalva !== null) {
  marcarOpcao("escolhas-termo", configSalva.termo);
}


document.getElementById("btn-continuar").addEventListener("click", function () {
  var conta = getConta();

  // Guardo o que já dá para guardar. Os dias ficam para a próxima tela, e só
  // lá a configuração é marcada como completa.
  salvarConfig({
    nomeNegocio: conta.nomeNegocio,
    cnpj: conta.cnpj,
    ramo: conta.ramo,
    termo: lerOpcaoMarcada("escolhas-termo"),
    dias: getDiasFuncionamento(),
    configurado: false
  });

  window.location.href = "dias.html";
});
