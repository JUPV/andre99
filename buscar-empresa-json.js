const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
});

async function main() {
  // Teste fixo solicitado pelo usuário.
  const codigo = 'AALR3';
  const symbol = `${codigo}.SA`;
  const anoTeste = 2025;
  const inicioConsulta = `${anoTeste - 1}-01-01`;
  const fimConsulta = `${anoTeste}-12-31`;

  console.log(`[INFO] Iniciando teste online para ${codigo}...`);
  console.log(`[INFO] Buscando no Yahoo Finance: ${symbol}`);
  console.log(`[INFO] Faixa de consulta: ${inicioConsulta} até ${fimConsulta}`);

  const [resumo, financeiros] = await Promise.all([
    yahooFinance.quoteSummary(symbol, { modules: ['price'] }),
    yahooFinance.fundamentalsTimeSeries(symbol, {
      period1: inicioConsulta,
      period2: fimConsulta,
      type: 'quarterly',
      module: 'financials',
    }),
  ]);

  const nome =
    resumo.price?.longName ||
    resumo.price?.shortName ||
    codigo;

  const historico = (financeiros || [])
    .filter((item) => item.TYPE === 'FINANCIALS' && item.periodType === '3M')
    .map((item) => ({
      endDate: item.date,
      totalRevenue: item.totalRevenue,
      netIncome: item.netIncome,
      netIncomeFromContinuingOps: item.netIncomeFromContinuingOperationNetMinorityInterest,
    }));

  if (!historico.length) {
    throw new Error('Sem histórico trimestral de demonstrativo de resultados para o ativo.');
  }

  const registrosNormalizados = historico
    .map((item) => {
      const data = new Date(item.endDate);
      const ano = data.getUTCFullYear();
      const mes = data.getUTCMonth() + 1;
      const trimestreNumero = mes <= 3 ? 1 : mes <= 6 ? 2 : mes <= 9 ? 3 : 4;

      return {
        ano,
        trimestreNumero,
        periodo: `${trimestreNumero}T${String(ano).slice(-2)}`,
        dataFechamento: data.toISOString().slice(0, 10),
        receita: item.totalRevenue ?? null,
        lucro:
          item.netIncome ??
          item.netIncomeFromContinuingOps ??
          null,
      };
    });

  const ultimosTrimestres = registrosNormalizados
    .sort((a, b) => new Date(b.dataFechamento) - new Date(a.dataFechamento))
    .slice(0, 12)
    .map(({ periodo, dataFechamento, receita, lucro }) => ({
      periodo,
      dataFechamento,
      receita,
      lucro,
    }));

  const trimestresAnoTeste = [1, 2, 3, 4].map((trimestreNumero) => {
    const encontrado = registrosNormalizados.find(
      (registro) =>
        registro.ano === anoTeste && registro.trimestreNumero === trimestreNumero
    );

    return {
      periodo: `${trimestreNumero}T${String(anoTeste).slice(-2)}`,
      dataFechamento: encontrado ? encontrado.dataFechamento : null,
      receita: encontrado ? encontrado.receita : null,
      lucro: encontrado ? encontrado.lucro : null,
      encontrado: Boolean(encontrado),
    };
  });

  console.log(`[INFO] Registros trimestrais encontrados: ${historico.length}`);
  console.log(`[INFO] Retornando ${ultimosTrimestres.length} trimestres no JSON final...`);
  console.log(`[INFO] Teste solicitado: 1T a 4T de ${anoTeste}`);

  const resultado = {
    fonte: 'Yahoo Finance (online)',
    empresa: {
      codigo,
      ticker: symbol,
      nome,
    },
    ultimosTrimestres,
    testeAno: anoTeste,
    trimestresAnoTeste,
  };

  console.log(JSON.stringify(resultado, null, 2));
  console.log('[SUCESSO] Teste concluído.');
}

main().catch((error) => {
  console.error('[ERRO] Falha ao buscar dados online:', error.message || error);
  process.exitCode = 1;
});
