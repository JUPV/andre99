import { PrismaClient } from '@prisma/client';
import { coletarDados } from '../scrapers/fundamentus-scraper';

const prisma = new PrismaClient();
const DELAY_ENTRE_COLETAS = 10000; // 10 segundos

async function aguardar(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mostrarProgresso(atual: number, total: number, ticker: string, status: string) {
  const percentual = ((atual / total) * 100).toFixed(1);
  const larguraBarra = 30;
  const preenchido = Math.floor((atual / total) * larguraBarra);
  const vazio = larguraBarra - preenchido;

  const barra = '█'.repeat(preenchido);
  const espacos = ' '.repeat(vazio);

  process.stdout.write('\r\x1b[K');
  process.stdout.write(
    `[${barra}${espacos}] ${percentual}% | ${atual}/${total} | ${ticker} - ${status}`
  );
}

async function coletarTodasEmpresas() {
  console.log('🚀 Iniciando coleta de dados de todas as empresas...\n');

  // Buscar todas as empresas ativas
  const empresas = await prisma.empresa.findMany({
    where: { ativo: true },
    orderBy: { codigo: 'asc' }
  });

  console.log(`📋 ${empresas.length} empresas encontradas\n`);
  console.log(`⏱️  Tempo estimado: ~${Math.ceil((empresas.length * DELAY_ENTRE_COLETAS) / 60000)} minutos\n`);

  const resultado = {
    total: empresas.length,
    sucesso: 0,
    erro: 0,
    detalhes: [] as Array<{ ticker: string; status: string; mensagem?: string }>
  };

  // Processar cada empresa
  for (let i = 0; i < empresas.length; i++) {
    const empresa = empresas[i];

    try {
      mostrarProgresso(i + 1, empresas.length, empresa.codigo, '🔄 Coletando...');

      // Coletar dados
      await coletarDados(empresa.codigo);

      resultado.sucesso++;
      resultado.detalhes.push({
        ticker: empresa.codigo,
        status: 'sucesso',
        mensagem: 'Dados coletados com sucesso'
      });

      mostrarProgresso(i + 1, empresas.length, empresa.codigo, '✅ Sucesso');

      // Aguardar antes da próxima coleta (exceto na última)
      if (i < empresas.length - 1) {
        await aguardar(DELAY_ENTRE_COLETAS);
      }
    } catch (error) {
      resultado.erro++;
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      resultado.detalhes.push({
        ticker: empresa.codigo,
        status: 'erro',
        mensagem
      });

      mostrarProgresso(i + 1, empresas.length, empresa.codigo, '❌ Erro');

      // Aguardar antes da próxima coleta mesmo em caso de erro
      if (i < empresas.length - 1) {
        await aguardar(DELAY_ENTRE_COLETAS);
      }
    }
  }

  console.log('\n\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║     RESUMO DA COLETA                   ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║ Total de empresas:   ${resultado.total.toString().padStart(7)}       ║`);
  console.log(`║ ✅ Sucesso:           ${resultado.sucesso.toString().padStart(7)}       ║`);
  console.log(`║ ❌ Erros:             ${resultado.erro.toString().padStart(7)}       ║`);
  console.log('╚════════════════════════════════════════╝\n');

  // Salvar relatório
  const fs = await import('fs');
  const path = await import('path');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logsDir = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const relatorioPath = path.join(logsDir, `coleta-${timestamp}.json`);
  fs.writeFileSync(relatorioPath, JSON.stringify(resultado, null, 2));

  console.log(`📄 Relatório salvo em: ${relatorioPath}\n`);

  // Mostrar empresas com erro
  if (resultado.erro > 0) {
    console.log('⚠️  Empresas com erro:\n');
    resultado.detalhes
      .filter(d => d.status === 'erro')
      .forEach(d => {
        console.log(`   ${d.ticker}: ${d.mensagem}`);
      });
    console.log('');
  }

  return resultado;
}

coletarTodasEmpresas()
  .then(() => {
    console.log('✅ Coleta finalizada!');
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('❌ Erro na coleta:', error);
    prisma.$disconnect();
    process.exit(1);
  });
