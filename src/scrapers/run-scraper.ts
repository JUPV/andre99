import { coletarDados, salvarDados } from './fundamentus-scraper';
import { empresaRepository } from '../database/repositories';

async function main() {
  console.log('=== Iniciando coleta de dados ===\n');

  // Verificar argumentos da linha de comando
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Coletar papéis específicos passados como argumentos
    for (const codigo of args) {
      console.log(`\n--- Coletando ${codigo} ---`);
      const dados = await coletarDados(codigo.toUpperCase());

      if (dados) {
        await salvarDados(dados);
      } else {
        console.error(`Falha ao coletar dados de ${codigo}`);
      }

      // Aguardar 2 segundos entre requisições
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } else {
    // Coletar todas as empresas ativas do banco
    const empresas = await empresaRepository.listarAtivas();

    if (empresas.length === 0) {
      console.log('Nenhuma empresa ativa cadastrada.');
      console.log('Use: npm run scrape PETR4 VALE3 ITUB4');
      return;
    }

    console.log(`Encontradas ${empresas.length} empresas ativas\n`);

    for (const empresa of empresas) {
      console.log(`\n--- Coletando ${empresa.codigo} ---`);
      const dados = await coletarDados(empresa.codigo);

      if (dados) {
        await salvarDados(dados);
      } else {
        console.error(`Falha ao coletar dados de ${empresa.codigo}`);
      }

      // Aguardar 2 segundos entre requisições
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n=== Coleta finalizada ===');
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
