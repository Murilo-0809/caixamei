// login.js
// Validação do login. Como o protótipo não tem servidor, a senha não é
// conferida: basta um e-mail com @gmail.com para entrar.

ligarOlhinho("olho-log-senha", "log-senha");


function validarLogin() {
  var email = document.getElementById("log-email").value.trim();
  var senha = document.getElementById("log-senha").value;

  var tudoCerto = true;

  limparErro("erro-log-email");
  limparErro("erro-log-senha");

  if (email.indexOf("@gmail.com") <= 0) {
    mostrarErro("erro-log-email", "E-mail inválido. Ele precisa conter @gmail.com.");
    tudoCerto = false;
  }

  if (senha === "") {
    mostrarErro("erro-log-senha", "Digite a sua senha.");
    tudoCerto = false;
  }

  return tudoCerto;
}


function entrarNaConta() {
  var email = document.getElementById("log-email").value.trim();
  var lembrar = document.getElementById("log-lembrar").checked;

  // Se ainda não existir conta salva neste navegador, crio uma com o e-mail
  // digitado para o protótipo poder continuar.
  if (existeConta() === false) {
    salvarConta({
      nomeCompleto: "Usuário de teste",
      nomeNegocio: "Meu negócio",
      cnpj: "",
      ramo: "",
      email: email,
      senha: document.getElementById("log-senha").value
    });
  }

  salvarSessao(true, lembrar);

  if (configuracaoCompleta() === true) {
    window.location.href = "inicio.html";
  } else {
    window.location.href = "atendimentos.html";
  }
}


document.getElementById("form-login").addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (validarLogin() === true) {
    entrarNaConta();
  }
});
