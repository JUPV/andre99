import { prisma } from '../database/prisma';
import {
  buscarDadosTrimestraisStatusInvest,
  delayAleatorio,
  DadoTrimestrialStatusInvest
} from '../scrapers/statusinvest-scraper';

interface ResultadoImportacao {
  totalEmpresas: number;
  sucessos: number;
  erros: number;
  semDados: number;
  trimestresImportados: number;
  empresasComErro: string[];
}

/**
 * Converte dados do Status Invest para formato do banco
 */
function converterParaFormatoBanco(
  empresaId: number,
  dado: DadoTrimestrialStatusInvest
) {
  // Calcula a data do balanço (último dia do trimestre)
  const mesDoTrimestre = dado.quarter * 3; // Q1=3, Q2=6, Q3=9, Q4=12
  const ultimoDiaDoMes = new Date(dado.year, mesDoTrimestre, 0).getDate();
  const dataBalanco = `${dado.year}-${String(mesDoTrimestre).padStart(2, '0')}-${ultimoDiaDoMes}`;

  return {
    empresaId,
    dataBalanco,
    ano: dado.year,
    trimestre: dado.quarter,
    receitaLiquida3m: dado.receitaLiquida,
    lucroLiquido3m: dado.lucroLiquido,
    despesas: dado.despesas,
    margemBruta: dado.margemBruta,
    margemEbitda: dado.margemEbitda,
    margemEbit: dado.margemEbit,
    margemLiquida: dado.margemLiquida,
    ebit3m: null, // Não vem do Status Invest, calcular depois se necessário
    coletadoEm: new Date()
  };
}

/**
 * Importa dados trimestrais de uma empresa específica
 */
async function importarEmpresa(
  empresa: { id: number; codigo: string; nome: string }
): Promise<{ sucesso: boolean; trimestres: number; erro?: string }> {

  try {
    console.log(`\n========================================`);
    console.log(`Processando: ${empresa.codigo} - ${empresa.nome}`);
    console.log(`========================================`);

    // Busca dados no Status Invest
    const resultado = await buscarDadosTrimestraisStatusInvest(empresa.codigo);

    if (!resultado.sucesso) {
      // Registra erro no log
      await prisma.logColeta.create({
        data: {
          empresaId: empresa.id,
          tipoColeta: 'trimestral',
          status: 'erro',
          mensagem: resultado.erro,
          tentativaEm: new Date()
        }
      });

      console.error(`❌ Erro: ${resultado.erro}`);
      return { sucesso: false, trimestres: 0, erro: resultado.erro };
    }

    if (!resultado.dados || resultado.dados.length === 0) {
      // Registra que não há dados disponíveis
      await prisma.logColeta.create({
        data: {
          empresaId: empresa.id,
          tipoColeta: 'trimestral',
          status: 'dados_indisponiveis',
          mensagem: 'Nenhum dado trimestral encontrado no Status Invest',
          tentativaEm: new Date()
        }
      });

      console.log(`⚠️  Sem dados disponíveis`);
      return { sucesso: true, trimestres: 0 };
    }

    // Salva cada trimestre no banco
    let trimestresImportados = 0;
    for (const dado of resultado.dados) {
      const dadoBanco = converterParaFormatoBanco(empresa.id, dado);

      try {
        await prisma.dadosTrimestral.upsert({
          where: {
            empresaId_dataBalanco: {
              empresaId: empresa.id,
              dataBalanco: dadoBanco.dataBalanco
            }
          },
          create: dadoBanco,
          update: {
            receitaLiquida3m: dadoBanco.receitaLiquida3m,
            lucroLiquido3m: dadoBanco.lucroLiquido3m,
            despesas: dadoBanco.despesas,
            margemBruta: dadoBanco.margemBruta,
            margemEbitda: dadoBanco.margemEbitda,
            margemEbit: dadoBanco.margemEbit,
            margemLiquida: dadoBanco.margemLiquida,
            ano: dadoBanco.ano,
            trimestre: dadoBanco.trimestre,
            coletadoEm: dadoBanco.coletadoEm
          }
        });

        trimestresImportados++;
      } catch (error: any) {
        console.error(`   ❌ Erro ao salvar trimestre ${dado.year}Q${dado.quarter}:`, error.message);
      }
    }

    // Registra sucesso no log
    await prisma.logColeta.create({
      data: {
        empresaId: empresa.id,
        tipoColeta: 'trimestral',
        status: 'sucesso',
        mensagem: `${trimestresImportados} trimestres importados`,
        dataReferencia: resultado.dados[0] ?
          `${resultado.dados[0].year}Q${resultado.dados[0].quarter}` : null,
        tentativaEm: new Date()
      }
    });

    console.log(`✅ Sucesso: ${trimestresImportados} trimestres importados`);
    return { sucesso: true, trimestres: trimestresImportados };

  } catch (error: any) {
    console.error(`❌ Erro inesperado: ${error.message}`);

    // Registra erro no log
    try {
      await prisma.logColeta.create({
        data: {
          empresaId: empresa.id,
          tipoColeta: 'trimestral',
          status: 'erro',
          mensagem: `Erro inesperado: ${error.message}`,
          tentativaEm: new Date()
        }
      });
    } catch (logError) {
      console.error(`Erro ao registrar log:`, logError);
    }

    return { sucesso: false, trimestres: 0, erro: error.message };
  }
}

/**
 * Importa dados históricos de todas as empresas
 */
async function importarTodasEmpresas() {
  const inicioGeral = Date.now();

  console.log('='.repeat(60));
  console.log('IMPORTAÇÃO DE DADOS TRIMESTRAIS - STATUS INVEST');
  console.log('='.repeat(60));
  console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

  const resultado: ResultadoImportacao = {
    totalEmpresas: 0,
    sucessos: 0,
    erros: 0,
    semDados: 0,
    trimestresImportados: 0,
    empresasComErro: []
  };

  try {
    // Busca todas as empresas ativas
    const empresas = await prisma.empresa.findMany({
      where: { ativo: true },
      select: { id: true, codigo: true, nome: true },
      orderBy: { codigo: 'asc' }
    });

    resultado.totalEmpresas = empresas.length;
    console.log(`📊 Total de empresas a processar: ${empresas.length}\n`);

    // Processa cada empresa
    for (let i = 0; i < empresas.length; i++) {
      const empresa = empresas[i];
      const progresso = `[${i + 1}/${empresas.length}]`;

      console.log(`\n${progresso} Processando ${empresa.codigo}...`);

      // Importa dados da empresa
      const resultadoEmpresa = await importarEmpresa(empresa);

      // Atualiza estatísticas
      if (resultadoEmpresa.sucesso) {
        if (resultadoEmpresa.trimestres > 0) {
          resultado.sucessos++;
          resultado.trimestresImportados += resultadoEmpresa.trimestres;
        } else {
          resultado.semDados++;
        }
      } else {
        resultado.erros++;
        resultado.empresasComErro.push(`${empresa.codigo} - ${resultadoEmpresa.erro}`);
      }

      // Delay aleatório entre 2 e 5 segundos (exceto na última)
      if (i < empresas.length - 1) {
        await delayAleatorio(2000, 5000);
      }
    }

  } catch (error: any) {
    console.error('\n❌ Erro fatal durante importação:', error.message);
    throw error;
  }

  // Relatório final
  const tempoTotal = Math.round((Date.now() - inicioGeral) / 1000);
  const minutos = Math.floor(tempoTotal / 60);
  const segundos = tempoTotal % 60;

  console.log('\n' + '='.repeat(60));
  console.log('RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Empresas com sucesso:      ${resultado.sucessos}`);
  console.log(`⚠️  Empresas sem dados:        ${resultado.semDados}`);
  console.log(`❌ Empresas com erro:         ${resultado.erros}`);
  console.log(`📈 Total de trimestres:       ${resultado.trimestresImportados}`);
  console.log(`⏱️  Tempo total:               ${minutos}m ${segundos}s`);
  console.log('='.repeat(60));

  if (resultado.empresasComErro.length > 0) {
    console.log('\n❌ EMPRESAS COM ERRO:');
    resultado.empresasComErro.forEach(erro => console.log(`   - ${erro}`));
  }

  console.log(`\n🏁 Finalizado em: ${new Date().toLocaleString('pt-BR')}\n`);

  // Salva log geral (desabilitado por enquanto)
  // const logData = {
  //   timestamp: new Date().toISOString(),
  //   tipo: 'importacao-trimestral-statusinvest',
  //   resultado
  // };
  // await salvarLog('importacao', logData);

  return resultado;
}

// Execução do script
if (require.main === module) {
  importarTodasEmpresas()
    .then(() => {
      console.log('✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { importarTodasEmpresas, importarEmpresa };
