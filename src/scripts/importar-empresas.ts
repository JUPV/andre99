import * as fs from 'fs';
import * as path from 'path';
import { empresaRepository } from '../database/repositories';
import { coletarDados as coletarDadosFundamentus } from '../scrapers/fundamentus-scraper';

// Configurações
const DELAY_ENTRE_COLETAS = 10000; // 10 segundos entre cada coleta
const DELAY_APENAS_CADASTRO = 100; // 100ms entre cadastros sem coleta

interface EmpresaJson {
  ticker: string;
  nome: string;
  setor: string;
  subsetor: string;
}

interface ResultadoImportacao {
  total: number;
  cadastradas: number;
  jaExistiam: number;
  coletadas: number;
  erros: number;
  detalhes: Array<{
    ticker: string;
    status: 'cadastrada' | 'ja_existia' | 'coletada' | 'erro';
    mensagem: string;
  }>;
}

// Utilitário para delay
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para mostrar progresso
function mostrarProgresso(atual: number, total: number, ticker: string, status: string) {
  const percentual = ((atual / total) * 100).toFixed(1);
  const barra = '█'.repeat(Math.floor(atual / total * 30));
  const espacos = '░'.repeat(30 - Math.floor(atual / total * 30));

  process.stdout.write('\r\x1b[K'); // Limpa a linha
  process.stdout.write(
    `[${barra}${espacos}] ${percentual}% | ${atual}/${total} | ${ticker} - ${status}`
  );
}

// Função principal de importação
async function importarEmpresas(
  coletarDadosAtivo: boolean = false
): Promise<ResultadoImportacao> {
  console.log('🚀 Iniciando importação de empresas...\n');

  // Ler arquivo JSON
  const arquivoPath = path.join(process.cwd(), 'empresa.json');

  if (!fs.existsSync(arquivoPath)) {
    throw new Error('Arquivo empresa.json não encontrado na raiz do projeto!');
  }

  const conteudo = fs.readFileSync(arquivoPath, 'utf-8');
  const empresas: EmpresaJson[] = JSON.parse(conteudo);

  console.log(`📋 ${empresas.length} empresas encontradas no arquivo\n`);

  if (coletarDadosAtivo) {
  }

  const resultado: ResultadoImportacao = {
    total: empresas.length,
    cadastradas: 0,
    jaExistiam: 0,
    coletadas: 0,
    erros: 0,
    detalhes: []
  };

  // Processar cada empresa
  for (let i = 0; i < empresas.length; i++) {
    const empresa = empresas[i];

    try {
      // Verificar se já existe
      const existente = await empresaRepository.buscarPorCodigo(empresa.ticker);

      if (existente) {
        mostrarProgresso(i + 1, empresas.length, empresa.ticker, '⏭️  Já existe');
        resultado.jaExistiam++;
        resultado.detalhes.push({
          ticker: empresa.ticker,
          status: 'ja_existia',
          mensagem: 'Empresa já cadastrada'
        });

        // Delay curto mesmo para empresas existentes
        await sleep(DELAY_APENAS_CADASTRO);
        continue;
      }

      // Cadastrar nova empresa
      await empresaRepository.criar({
        codigo: empresa.ticker,
        nome: empresa.nome,
        setor: empresa.setor,
        subsetor: empresa.subsetor,
        ativo: true
      });

      mostrarProgresso(i + 1, empresas.length, empresa.ticker, '✅ Cadastrada');
      resultado.cadastradas++;
      resultado.detalhes.push({
        ticker: empresa.ticker,
        status: 'cadastrada',
        mensagem: 'Empresa cadastrada com sucesso'
      });

      // Se modo coleta estiver ativo, coletar dados
      if (coletarDadosAtivo) {
        mostrarProgresso(i + 1, empresas.length, empresa.ticker, '🔄 Coletando...');

        try {
          await coletarDadosFundamentus(empresa.ticker);
          resultado.coletadas++;
          resultado.detalhes[resultado.detalhes.length - 1].status = 'coletada';
          resultado.detalhes[resultado.detalhes.length - 1].mensagem = 'Empresa cadastrada e dados coletados';
        } catch (erroColeta: any) {
          mostrarProgresso(i + 1, empresas.length, empresa.ticker, '⚠️  Coleta falhou');
          // Não incrementa erro total, empresa foi cadastrada
          console.error(`\n⚠️  Erro ao coletar ${empresa.ticker}: ${erroColeta.message}`);
        }

        // Delay entre coletas para evitar bloqueio
        if (i < empresas.length - 1) {
          await sleep(DELAY_ENTRE_COLETAS);
        }
      } else {
        // Delay curto apenas para cadastro
        await sleep(DELAY_APENAS_CADASTRO);
      }

    } catch (erro: any) {
      mostrarProgresso(i + 1, empresas.length, empresa.ticker, '❌ Erro');
      resultado.erros++;
      resultado.detalhes.push({
        ticker: empresa.ticker,
        status: 'erro',
        mensagem: erro.message
      });
      console.error(`\n❌ Erro ao processar ${empresa.ticker}: ${erro.message}`);
    }
  }

  console.log('\n'); // Nova linha após a barra de progresso
  return resultado;
}

// Função para salvar relatório
function salvarRelatorio(resultado: ResultadoImportacao) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nomeArquivo = `logs/importacao-${timestamp}.json`;

  // Criar diretório logs se não existir
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }

  fs.writeFileSync(nomeArquivo, JSON.stringify(resultado, null, 2));
  return nomeArquivo;
}

// Função para mostrar resumo
function mostrarResumo(resultado: ResultadoImportacao) {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     RESUMO DA IMPORTAÇÃO               ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║ Total de empresas:        ${resultado.total.toString().padStart(4)}       ║`);
  console.log(`║ ✅ Cadastradas:            ${resultado.cadastradas.toString().padStart(4)}       ║`);
  console.log(`║ 📊 Dados coletados:        ${resultado.coletadas.toString().padStart(4)}       ║`);
  console.log(`║ ⏭️  Já existiam:            ${resultado.jaExistiam.toString().padStart(4)}       ║`);
  console.log(`║ ❌ Erros:                  ${resultado.erros.toString().padStart(4)}       ║`);
  console.log('╚════════════════════════════════════════╝\n');

  if (resultado.erros > 0) {
    console.log('⚠️  Empresas com erro:');
    resultado.detalhes
      .filter(d => d.status === 'erro')
      .forEach(d => console.log(`   - ${d.ticker}: ${d.mensagem}`));
    console.log('');
  }
}

// Script principal
async function main() {
  try {
    // Verificar argumentos de linha de comando
    const args = process.argv.slice(2);
    const coletarAgora = args.includes('--coletar') || args.includes('-c');

    if (!coletarAgora) {
      console.log('ℹ️  Modo: APENAS CADASTRO (rápido)');
      console.log('ℹ️  Para coletar dados também, use: npm run importar -- --coletar\n');
    }

    const resultado = await importarEmpresas(coletarAgora);

    // Mostrar resumo
    mostrarResumo(resultado);

    // Salvar relatório
    const arquivoRelatorio = salvarRelatorio(resultado);
    console.log(`📄 Relatório salvo em: ${arquivoRelatorio}\n`);

    if (!coletarAgora && resultado.cadastradas > 0) {
      console.log('💡 Para coletar os dados das empresas cadastradas, você pode:');
      console.log('   1. Aguardar a coleta automática (programada para 9h e 18h)');
      console.log('   2. Executar: npm run importar -- --coletar');
      console.log('   3. Usar a interface web para forçar coleta individual\n');
    }

    process.exit(0);
  } catch (erro: any) {
    console.error('\n❌ Erro fatal:', erro.message);
    process.exit(1);
  }
}

// Executar
main();
