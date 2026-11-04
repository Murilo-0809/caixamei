// demonstracao.js
// Cria fechamentos fictícios para quem quiser conhecer o sistema sem ter que
// cadastrar dia por dia. Todos ficam marcados com demo: true, então dá para
// removê-los depois sem apagar os fechamentos de verdade.

// Dois meses dão material suficiente para o sistema comparar um mês com o outro.
var DIAS_DE_DEMONSTRACAO = 60;

var CLIMAS_DEMO = ["sol", "sol", "nublado", "chuva", "calor", "sol", "nublado", "frio"];

var OBSERVACOES_DEMO = {
  chuva:   "Movimento fraco por causa da chuva.",
  sol:     "Dia movimentado desde cedo.",
  nublado: "Dia tranquilo.",
  calor:   "Calor forte, boa circulação de pessoas.",
  frio:    "Frio afastou um pouco o movimento."
};


function gerarDadosDemonstracao() {
  var diasAbertos = getDiasFuncionamento();
  var hoje = dataDeHoje();
  var contador = 0;

  // Começo pelo dia mais antigo e vou chegando até ontem.
  for (var i = DIAS_DE_DEMONSTRACAO; i >= 1; i--) {
    var data = somarDias(hoje, -i);

    if (diasAbertos.indexOf(diaDaSemana(data)) === -1) {
      continue;
    }

    if (buscarFechamentoPorData(data) !== null) {
      continue;
    }

    // Deixo dois dias recentes em aberto de propósito, para mostrar como o
    // sistema avisa sobre dias sem fechamento.
    if (i === 2 || i === 5) {
      continue;
    }

    salvarFechamento(criarFechamentoDemo(data, contador));

    contador = contador + 1;
  }

  ajustarRetiradasDoMes();
  marcarDasAnteriores(hoje);

  return contador;
}


function criarFechamentoDemo(data, contador) {
  var numeroDoDia = diaDaSemana(data);
  var clima = CLIMAS_DEMO[contador % CLIMAS_DEMO.length];

  // O movimento muda conforme o dia da semana.
  var fator = 1;

  if (numeroDoDia === 1) {
    fator = 0.80;
  } else if (numeroDoDia === 5) {
    fator = 1.25;
  } else if (numeroDoDia === 6) {
    fator = 1.45;
  }

  // E muda também conforme o tempo.
  if (clima === "chuva") {
    fator = fator * 0.70;
  } else if (clima === "sol") {
    fator = fator * 1.10;
  } else if (clima === "frio") {
    fator = fator * 0.88;
  }

  // De vez em quando um dia diferente, para a lista não ficar toda igual.
  var situacao = "normal";

  if (contador % 17 === 6) {
    situacao = "meio";
    fator = fator * 0.55;
  } else if (contador % 23 === 11) {
    situacao = "feriado";
    fator = fator * 0.65;
  }

  var variacao = 0.85 + Math.random() * 0.30;
  var entradas = arredondarEm5(420 * fator * variacao);
  var saidas = arredondarEm5(entradas * (0.20 + Math.random() * 0.15));
  var atendimentos = Math.round(entradas / 42);

  if (atendimentos < 1) {
    atendimentos = 1;
  }

  // Mais ou menos uma retirada por semana.
  var retiradas = 0;

  if (contador % 7 === 3) {
    retiradas = arredondarEm5(250 + Math.random() * 250);
  }

  return {
    id: gerarId(),
    data: data,
    entradas: entradas,
    saidas: saidas,
    retiradas: retiradas,
    atendimentos: atendimentos,
    situacao: situacao,
    clima: clima,
    observacao: OBSERVACOES_DEMO[clima],
    demo: true
  };
}


// Deixa os valores mais parecidos com os de um caixa de verdade.
function arredondarEm5(valor) {
  return Math.round(valor / 5) * 5;
}


// Aumento a última retirada do mês para as retiradas ficarem acima do lucro.
// Assim a demonstração também mostra o aviso de retirada excessiva.
function ajustarRetiradasDoMes() {
  var doMes = fechamentosDoMes(listarFechamentos(), mesDeHoje());

  var demoDoMes = doMes.filter(function (fechamento) {
    return fechamento.demo === true;
  });

  if (demoDoMes.length < 3) {
    return;
  }

  var resumo = calcularResumo(doMes);

  if (resumo.retiradas > resumo.lucro) {
    return;
  }

  var alvo = demoDoMes[0];

  alvo.retiradas = alvo.retiradas + arredondarEm5(resumo.lucro - resumo.retiradas) + 150;

  salvarFechamento(alvo);
}


// Marca como pagos os vencimentos anteriores ao atual.
function marcarDasAnteriores(hoje) {
  var competencia = mesAnterior(calcularDas(hoje).competenciaVencimento);

  for (var i = 0; i < 5; i++) {
    marcarDas(competencia, true);
    competencia = mesAnterior(competencia);
  }
}


function carregarDemonstracao() {
  if (existemDadosDemo() === true) {
    mostrarAvisoRapido("Os dados de demonstração já estão carregados.", "");
    return;
  }

  gerarDadosDemonstracao();

  // A tela se desenha de novo sozinha, sem recarregar a página.
  atualizarFaixaDemo();
  atualizarTela();

  mostrarAvisoRapido("Dados de demonstração carregados.", "ok");
}
