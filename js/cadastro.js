// cadastro.js
// Validação do formulário de cadastro e criação da conta.

aplicarMascaraCnpj(document.getElementById("cad-cnpj"));

ligarOlhinho("olho-cad-senha", "cad-senha");
ligarOlhinho("olho-cad-senha2", "cad-senha2");


function validarCadastro() {
  var nome = document.getElementById("cad-nome").value.trim();
  var negocio = document.getElementById("cad-negocio").value.trim();
  var cnpj = document.getElementById("cad-cnpj").value;
  var ramo = document.getElementById("cad-ramo").value;
  var email = document.getElementById("cad-email").value.trim();
  var senha = document.getElementById("cad-senha").value;
  var senha2 = document.getElementById("cad-senha2").value;
  var termos = document.getElementById("cad-termos").checked;

  var tudoCerto = true;

  limparErro("erro-cad-nome");
  limparErro("erro-cad-negocio");
  limparErro("erro-cad-cnpj");
  limparErro("erro-cad-ramo");
  limparErro("erro-cad-email");
  limparErro("erro-cad-senha");
  limparErro("erro-cad-senha2");
  limparErro("erro-cad-termos");

  if (nome === "") {
    mostrarErro("erro-cad-nome", "Informe o seu nome completo.");
    tudoCerto = false;
  }

  if (negocio === "") {
    mostrarErro("erro-cad-negocio", "Informe o nome do seu negócio.");
    tudoCerto = false;
  }

  // Confiro só a quantidade de números. Como é um protótipo de teste,
  // qualquer CNPJ com 14 algarismos é aceito.
  if (somenteNumeros(cnpj).length !== 14) {
    mostrarErro("erro-cad-cnpj", "O CNPJ precisa ter 14 números.");
    tudoCerto = false;
  }

  if (ramo === "") {
    mostrarErro("erro-cad-ramo", "Escolha o ramo de atividade.");
    tudoCerto = false;
  }

  // O indexOf devolve a posição onde o texto aparece. Se for maior que zero,
  // é porque existe alguma coisa escrita antes do @gmail.com.
  if (email.indexOf("@gmail.com") <= 0) {
    mostrarErro("erro-cad-email", "O e-mail precisa conter @gmail.com.");
    tudoCerto = false;
  }

  if (senha.length < 8) {
    mostrarErro("erro-cad-senha", "A senha precisa ter pelo menos 8 caracteres.");
    tudoCerto = false;
  }

  if (senha2 !== senha || senha2 === "") {
    mostrarErro("erro-cad-senha2", "As duas senhas precisam ser iguais.");
    tudoCerto = false;
  }

  if (termos === false) {
    mostrarErro("erro-cad-termos", "É preciso aceitar os termos para continuar.");
    tudoCerto = false;
  }

  return tudoCerto;
}


function criarConta() {
  salvarConta({
    nomeCompleto: document.getElementById("cad-nome").value.trim(),
    nomeNegocio: document.getElementById("cad-negocio").value.trim(),
    cnpj: document.getElementById("cad-cnpj").value,
    ramo: document.getElementById("cad-ramo").value,
    email: document.getElementById("cad-email").value.trim(),
    senha: document.getElementById("cad-senha").value
  });

  salvarSessao(true, true);

  window.location.href = "atendimentos.html";
}


document.getElementById("form-cadastro").addEventListener("submit", function (evento) {
  // Sem isso a página recarregaria sozinha ao enviar o formulário.
  evento.preventDefault();

  if (validarCadastro() === true) {
    criarConta();
  }
});


// Os links de termos e privacidade ainda não levam a lugar nenhum.
ligarBotao("link-termos", function (evento) {
  evento.preventDefault();
});

ligarBotao("link-privacidade", function (evento) {
  evento.preventDefault();
});
