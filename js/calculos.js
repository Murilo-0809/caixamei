// calculos.js
// Todas as contas do sistema ficam aqui. Nenhuma função deste arquivo monta
// tela: elas recebem os dados, calculam e devolvem o resultado.

// Com poucos dias registrados a média não representa nada, então só mostro
// conclusões a partir destes mínimos.
var MINIMO_PARA_ANALISE = 5;
var MINIMO_POR_GRUPO = 2;


// ---------- Somas e médias ----------

// Soma um campo de todos os fechamentos. Exemplo: somar(lista, "entradas")
function somar(lista, campo) {
  return lista.reduce(function (total, fechamento) {
    return total + fechamento[campo];
  }, 0);
}


function media(lista, campo) {
  if (lista.length === 0) {
    return 0;
  }

  return somar(lista, campo) / lista.length;
}


function variacaoPorcentual(valorAtual, valorAnterior) {
  if (valorAnterior === 0) {
    return 0;
  }

  return ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
}


// ---------- Filtros de período ----------

function fechamentosDoMes(lista, competencia) {
  return lista.filter(function (fechamento) {
    return mesDaData(fechamento.data) === competencia;
  });
}


function fechamentosDoAno(lista, ano) {
  return lista.filter(function (fechamento) {
    return anoDaData(fechamento.data) === ano;
  });
}


// Os dias marcados como "não abri" não entram nas médias.
function diasQueAbriram(lista) {
  return lista.filter(function (fechamento) {
    return fechamento.situacao !== "fechado";
  });
}


// ---------- Resumo ----------

function calcularResumo(lista) {
  var entradas = somar(lista, "entradas");
  var saidas = somar(lista, "saidas");
  var atendimentos = somar(lista, "atendimentos");
  var ticketMedio = 0;

  if (atendimentos > 0) {
    ticketMedio = entradas / atendimentos;
  }

  return {
    entradas: entradas,
    saidas: saidas,
    lucro: entradas - saidas,
    retiradas: somar(lista, "retiradas"),
    atendimentos: atendimentos,
    dias: lista.length,
    ticketMedio: ticketMedio
  };
}


function resumoDoMes(lista, competencia) {
  return calcularResumo(fechamentosDoMes(lista, competencia));
}


function resumoDoAno(lista, ano) {
  return calcularResumo(fechamentosDoAno(lista, ano));
}


// ---------- Limite anual de faturamento ----------

function calcularLimiteAnual(lista, ano) {
  var faturamento = resumoDoAno(lista, ano).entradas;
  var porcentagem = (faturamento / LIMITE_ANUAL) * 100;

  var nivel = "ok";

  if (porcentagem >= 100) {
    nivel = "excedido";
  } else if (porcentagem >= 80) {
    nivel = "atencao";
  }

  var restante = LIMITE_ANUAL - faturamento;

  if (restante < 0) {
    restante = 0;
  }

  return {
    ano: ano,
    faturamento: faturamento,
    limite: LIMITE_ANUAL,
    restante: restante,
    porcentagem: porcentagem,
    nivel: nivel
  };
}


// ---------- DAS ----------
// É a guia que o MEI paga todo mês, sempre com vencimento no dia 20.

function calcularDas(hoje) {
  var ano = Number(hoje.substring(0, 4));
  var mes = Number(hoje.substring(5, 7));
  var dia = Number(hoje.substring(8, 10));

  // Se hoje já passou do dia 20, o próximo vencimento é no mês que vem.
  if (dia > 20) {
    mes = mes + 1;

    if (mes === 13) {
      mes = 1;
      ano = ano + 1;
    }
  }

  var competenciaVencimento = ano + "-" + doisDigitos(mes);
  var vencimento = competenciaVencimento + "-20";
  var pago = dasEstaPago(competenciaVencimento);
  var diasRestantes = diasEntreDatas(hoje, vencimento);

  var situacao = "aberto";

  if (pago === true) {
    situacao = "pago";
  } else if (diasRestantes < 0) {
    situacao = "vencido";
  } else if (diasRestantes <= 5) {
    situacao = "proximo";
  }

  return {
    competenciaVencimento: competenciaVencimento,
    // O mês apurado é sempre o anterior ao do vencimento.
    competenciaApurada: mesAnterior(competenciaVencimento),
    vencimento: vencimento,
    diasRestantes: diasRestantes,
    pago: pago,
    situacao: situacao
  };
}


function historicoDas(hoje, quantidade) {
  var competencia = calcularDas(hoje).competenciaVencimento;
  var lista = [];

  for (var i = 0; i < quantidade; i++) {
    lista.push({
      competenciaVencimento: competencia,
      competenciaApurada: mesAnterior(competencia),
      vencimento: competencia + "-20",
      pago: dasEstaPago(competencia)
    });

    competencia = mesAnterior(competencia);
  }

  return lista;
}


// ---------- Avisos ----------

// Procura dias de funcionamento dos últimos 30 dias que ficaram sem fechamento.
function diasSemFechamento(lista, diasFuncionamento, hoje) {
  var pendentes = [];

  for (var i = 1; i <= 30; i++) {
    var data = somarDias(hoje, -i);

    // Só interessa se for um dia em que o negócio costuma abrir
    // e ainda não tiver fechamento salvo.
    if (diasFuncionamento.indexOf(diaDaSemana(data)) === -1) {
      continue;
    }

    if (buscarFechamentoPorData(data) !== null) {
      continue;
    }

    pendentes.push(data);
  }

  return pendentes;
}


// Avisa quando as retiradas pessoais do mês passaram do lucro do mês.
function alertaDeRetiradas(lista, competencia) {
  var resumo = resumoDoMes(lista, competencia);

  if (resumo.dias === 0 || resumo.retiradas === 0) {
    return null;
  }

  if (resumo.retiradas <= resumo.lucro) {
    return null;
  }

  return {
    retiradas: resumo.retiradas,
    lucro: resumo.lucro,
    diferenca: resumo.retiradas - resumo.lucro
  };
}


// ---------- Comparação entre dias ----------

// Compara um dia com o mesmo dia da semana do mês anterior. Exemplo:
// a terceira terça de novembro contra a terceira terça de outubro.
function compararComMesAnterior(lista, data) {
  var atual = buscarFechamentoPorData(data);

  if (atual === null) {
    return { estado: "sem-dia" };
  }

  var objetoData = criarData(data);
  var diaSemanaProcurado = objetoData.getDay();

  // Descobre se é a 1ª, 2ª, 3ª... vez que aquele dia da semana aparece no mês.
  var ocorrencia = Math.ceil(objetoData.getDate() / 7);
  var competenciaAnterior = mesAnterior(mesDaData(data));

  var candidatos = lista.filter(function (fechamento) {
    if (mesDaData(fechamento.data) !== competenciaAnterior) {
      return false;
    }
    return diaDaSemana(fechamento.data) === diaSemanaProcurado;
  });

  candidatos.sort(function (a, b) {
    if (a.data < b.data) {
      return -1;
    }
    if (a.data > b.data) {
      return 1;
    }
    return 0;
  });

  if (candidatos.length === 0) {
    return {
      estado: "sem-comparacao",
      atual: atual,
      diaSemana: diaSemanaProcurado,
      competenciaAnterior: competenciaAnterior
    };
  }

  var referencia = candidatos[ocorrencia - 1];
  var valorBase = 0;
  var tipo = "media";

  if (referencia !== undefined) {
    valorBase = referencia.entradas;
    tipo = "dia";
  } else {
    // Se não existir aquela ocorrência exata, uso a média do mês anterior.
    valorBase = media(candidatos, "entradas");
    referencia = null;
  }

  return {
    estado: "ok",
    tipo: tipo,
    atual: atual,
    referencia: referencia,
    diaSemana: diaSemanaProcurado,
    competenciaAnterior: competenciaAnterior,
    valorBase: valorBase,
    diferenca: atual.entradas - valorBase,
    porcentagem: variacaoPorcentual(atual.entradas, valorBase)
  };
}


// ---------- Análise por clima ----------

function mediaPorClima(lista) {
  // Só entram os dias em que abriu e o clima foi informado.
  var base = diasQueAbriram(lista).filter(function (fechamento) {
    return fechamento.clima !== "";
  });

  var grupos = [];

  for (var i = 0; i < ORDEM_CLIMAS.length; i++) {
    var chave = ORDEM_CLIMAS[i];

    var dias = base.filter(function (fechamento) {
      return fechamento.clima === chave;
    });

    if (dias.length > 0) {
      grupos.push({
        id: chave,
        rotulo: CLIMAS[chave],
        dias: dias.length,
        media: media(dias, "entradas")
      });
    }
  }

  grupos.sort(function (a, b) {
    return b.media - a.media;
  });

  var gruposFortes = grupos.filter(function (grupo) {
    return grupo.dias >= MINIMO_POR_GRUPO;
  });

  var confiavel = base.length >= MINIMO_PARA_ANALISE && gruposFortes.length >= 2;

  var melhor = null;
  var pior = null;

  if (confiavel === true && grupos.length > 0) {
    melhor = grupos[0];
    pior = grupos[grupos.length - 1];
  }

  return {
    registros: base.length,
    mediaGeral: media(base, "entradas"),
    grupos: grupos,
    confiavel: confiavel,
    melhor: melhor,
    pior: pior
  };
}


// ---------- Análise por dia da semana ----------

function mediaPorDiaSemana(lista) {
  var base = diasQueAbriram(lista);

  // Começa na segunda e termina no domingo.
  var ordem = [1, 2, 3, 4, 5, 6, 0];
  var grupos = [];

  for (var i = 0; i < ordem.length; i++) {
    var numeroDoDia = ordem[i];

    var dias = base.filter(function (fechamento) {
      return diaDaSemana(fechamento.data) === numeroDoDia;
    });

    grupos.push({
      numero: numeroDoDia,
      rotulo: nomeDiaSemana(numeroDoDia),
      rotuloLongo: nomeDiaSemanaLongo(numeroDoDia),
      dias: dias.length,
      media: media(dias, "entradas")
    });
  }

  var comDados = grupos.filter(function (grupo) {
    return grupo.dias > 0;
  });

  var melhor = null;

  for (var j = 0; j < comDados.length; j++) {
    if (melhor === null || comDados[j].media > melhor.media) {
      melhor = comDados[j];
    }
  }

  return {
    grupos: grupos,
    registros: base.length,
    confiavel: base.length >= MINIMO_PARA_ANALISE && comDados.length >= 2,
    melhor: melhor
  };
}


// ---------- Evolução mês a mês ----------

// Monta os totais dos últimos meses, do mais antigo para o mais novo.
function evolucaoMensal(lista, quantidade, competenciaFinal) {
  var competencia = competenciaFinal;
  var resultado = [];

  for (var i = 0; i < quantidade; i++) {
    var resumo = resumoDoMes(lista, competencia);

    resultado.unshift({
      competencia: competencia,
      rotulo: rotuloMesCurto(competencia),
      entradas: resumo.entradas,
      lucro: resumo.lucro,
      dias: resumo.dias
    });

    competencia = mesAnterior(competencia);
  }

  return resultado;
}


// ---------- Períodos disponíveis (usados nos filtros) ----------

function mesesComRegistro(lista) {
  var meses = [];

  for (var i = 0; i < lista.length; i++) {
    var competencia = mesDaData(lista[i].data);

    if (meses.indexOf(competencia) === -1) {
      meses.push(competencia);
    }
  }

  // O mês atual sempre aparece, mesmo sem nenhum registro ainda.
  if (meses.indexOf(mesDeHoje()) === -1) {
    meses.push(mesDeHoje());
  }

  meses.sort();
  meses.reverse();

  return meses;
}


function anosComRegistro(lista) {
  var anos = [];

  for (var i = 0; i < lista.length; i++) {
    var ano = anoDaData(lista[i].data);

    if (anos.indexOf(ano) === -1) {
      anos.push(ano);
    }
  }

  if (anos.indexOf(anoDeHoje()) === -1) {
    anos.push(anoDeHoje());
  }

  anos.sort();
  anos.reverse();

  return anos;
}
