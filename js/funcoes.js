// funcoes.js
// Funções que uso em várias telas: formatar dinheiro, mexer com datas e máscaras.

var NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

var DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

var DIAS_LONGOS = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"
];


// ---------- Texto e números ----------

// Devolve só os algarismos de um texto. "R$ 1.234,56" vira "123456".
function somenteNumeros(texto) {
  var saida = "";

  for (var i = 0; i < texto.length; i++) {
    var caractere = texto[i];

    if (caractere >= "0" && caractere <= "9") {
      saida = saida + caractere;
    }
  }

  return saida;
}


// Coloca o ponto dos milhares: "1234567" vira "1.234.567".
function pontosDeMilhar(texto) {
  var saida = "";
  var contador = 0;

  // Percorro de trás para frente e a cada 3 algarismos coloco um ponto.
  for (var i = texto.length - 1; i >= 0; i--) {
    saida = texto[i] + saida;
    contador = contador + 1;

    if (contador === 3 && i > 0) {
      saida = "." + saida;
      contador = 0;
    }
  }

  return saida;
}


function doisDigitos(numero) {
  if (numero < 10) {
    return "0" + numero;
  }

  return "" + numero;
}


// 1234.5 vira "R$ 1.234,50"
function formatarMoeda(valor) {
  var negativo = false;

  if (valor < 0) {
    negativo = true;
    valor = valor * -1;
  }

  var texto = valor.toFixed(2);
  var partes = texto.split(".");
  var resultado = "R$ " + pontosDeMilhar(partes[0]) + "," + partes[1];

  if (negativo === true) {
    resultado = "-" + resultado;
  }

  return resultado;
}


// Sem os centavos, para quando o valor é grande: "R$ 81.000"
function formatarMoedaCurta(valor) {
  return "R$ " + pontosDeMilhar("" + Math.round(valor));
}


function formatarNumero(valor) {
  return pontosDeMilhar("" + Math.round(valor));
}


function formatarPorcentagem(valor, casas) {
  return valor.toFixed(casas).split(".").join(",") + "%";
}


// Faz o contrário da máscara: "1.234,56" vira 1234.56
function textoParaNumero(texto) {
  if (texto === "" || texto === null || texto === undefined) {
    return 0;
  }

  var digitos = somenteNumeros(texto);

  if (digitos === "") {
    return 0;
  }

  return Number(digitos) / 100;
}


function primeiraMaiuscula(texto) {
  if (texto === "") {
    return "";
  }

  return texto[0].toUpperCase() + texto.substring(1);
}


// Troca os caracteres que quebrariam o HTML. Uso sempre que vou mostrar
// na tela um texto que o usuário digitou.
function textoSeguro(texto) {
  if (texto === null || texto === undefined) {
    return "";
  }

  var saida = "" + texto;

  saida = saida.split("&").join("&amp;");
  saida = saida.split("<").join("&lt;");
  saida = saida.split(">").join("&gt;");
  saida = saida.split('"').join("&quot;");

  return saida;
}


function gerarId() {
  return "f" + Date.now() + Math.floor(Math.random() * 1000);
}


// ---------- Datas ----------
// Guardo as datas como texto no formato "2026-11-03", porque assim elas
// já ficam na ordem certa quando comparadas com > e <.

function criarData(data) {
  var ano = Number(data.substring(0, 4));
  var mes = Number(data.substring(5, 7));
  var dia = Number(data.substring(8, 10));

  return new Date(ano, mes - 1, dia);
}


function dataParaTextoISO(objetoData) {
  var ano = objetoData.getFullYear();
  var mes = objetoData.getMonth() + 1;
  var dia = objetoData.getDate();

  return ano + "-" + doisDigitos(mes) + "-" + doisDigitos(dia);
}


function dataDeHoje() {
  return dataParaTextoISO(new Date());
}


function mesDeHoje() {
  return dataDeHoje().substring(0, 7);
}


function anoDeHoje() {
  return dataDeHoje().substring(0, 4);
}


function mesDaData(data) {
  return data.substring(0, 7);
}


function anoDaData(data) {
  return data.substring(0, 4);
}


// "2026-11-03" vira "03/11/2026"
function dataParaTexto(data) {
  return data.substring(8, 10) + "/" + data.substring(5, 7) + "/" + data.substring(0, 4);
}


// "2026-11-03" vira "terça-feira, 3 de novembro"
function dataPorExtenso(data) {
  var objeto = criarData(data);

  return DIAS_LONGOS[objeto.getDay()] + ", " + objeto.getDate() +
         " de " + NOMES_MESES[objeto.getMonth()];
}


// 0 é domingo e 6 é sábado
function diaDaSemana(data) {
  return criarData(data).getDay();
}


function nomeDiaSemana(numero) {
  return DIAS_CURTOS[numero];
}


function nomeDiaSemanaLongo(numero) {
  return DIAS_LONGOS[numero];
}


// "2026-11" vira "Novembro de 2026"
function rotuloMes(competencia) {
  var mes = Number(competencia.substring(5, 7));

  return primeiraMaiuscula(NOMES_MESES[mes - 1]) + " de " + competencia.substring(0, 4);
}


// "2026-11" vira "Nov"
function rotuloMesCurto(competencia) {
  var mes = Number(competencia.substring(5, 7));

  return primeiraMaiuscula(NOMES_MESES[mes - 1].substring(0, 3));
}


function somarDias(data, quantidade) {
  var ano = Number(data.substring(0, 4));
  var mes = Number(data.substring(5, 7));
  var dia = Number(data.substring(8, 10));

  // O Date já acerta sozinho quando o dia passa do fim do mês.
  return dataParaTextoISO(new Date(ano, mes - 1, dia + quantidade));
}


function mesAnterior(competencia) {
  var ano = Number(competencia.substring(0, 4));
  var mes = Number(competencia.substring(5, 7));

  mes = mes - 1;

  if (mes === 0) {
    mes = 12;
    ano = ano - 1;
  }

  return ano + "-" + doisDigitos(mes);
}


function diasEntreDatas(dataInicial, dataFinal) {
  var diferenca = criarData(dataFinal).getTime() - criarData(dataInicial).getTime();

  // 86400000 é a quantidade de milissegundos que tem em um dia.
  return Math.round(diferenca / 86400000);
}


// ---------- Máscaras ----------

// Formata o campo de dinheiro enquanto a pessoa digita.
function aplicarMascaraMoeda(campo) {
  campo.addEventListener("input", function () {
    var digitos = somenteNumeros(campo.value);

    if (digitos === "") {
      campo.value = "";
      return;
    }

    // Precisa de pelo menos 3 algarismos para sobrar algo antes da vírgula.
    while (digitos.length < 3) {
      digitos = "0" + digitos;
    }

    var centavos = digitos.substring(digitos.length - 2);
    var reais = digitos.substring(0, digitos.length - 2);

    while (reais.length > 1 && reais[0] === "0") {
      reais = reais.substring(1);
    }

    campo.value = pontosDeMilhar(reais) + "," + centavos;
  });
}


// Formata o CNPJ: 00.000.000/0001-00
function aplicarMascaraCnpj(campo) {
  campo.addEventListener("input", function () {
    var digitos = somenteNumeros(campo.value);

    if (digitos.length > 14) {
      digitos = digitos.substring(0, 14);
    }

    var saida = "";

    for (var i = 0; i < digitos.length; i++) {
      if (i === 2 || i === 5) {
        saida = saida + ".";
      }
      if (i === 8) {
        saida = saida + "/";
      }
      if (i === 12) {
        saida = saida + "-";
      }

      saida = saida + digitos[i];
    }

    campo.value = saida;
  });
}


// Escreve um valor já formatado dentro de um campo de dinheiro.
function escreverMoedaNoCampo(campo, valor) {
  if (valor === 0) {
    campo.value = "";
    return;
  }

  var partes = valor.toFixed(2).split(".");

  campo.value = pontosDeMilhar(partes[0]) + "," + partes[1];
}


// ---------- Botão de mostrar a senha ----------

var OLHO_ABERTO =
  '<svg class="ico" viewBox="0 0 24 24">' +
  '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>' +
  '<circle cx="12" cy="12" r="3"/></svg>';

var OLHO_FECHADO =
  '<svg class="ico" viewBox="0 0 24 24">' +
  '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>' +
  '<circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/></svg>';


// Troca o tipo do campo entre "password" e "text" quando clica no olhinho.
function ligarOlhinho(idBotao, idCampo) {
  var botao = document.getElementById(idBotao);
  var campo = document.getElementById(idCampo);

  botao.innerHTML = OLHO_ABERTO;

  botao.addEventListener("click", function () {
    if (campo.type === "password") {
      campo.type = "text";
      botao.innerHTML = OLHO_FECHADO;
    } else {
      campo.type = "password";
      botao.innerHTML = OLHO_ABERTO;
    }
  });
}
