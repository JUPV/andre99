import cron from 'node-cron';
import { empresaRepository, logColetaRepository, dadosTrimestraisRepository, dadosDiariosRepository } from '../database/repositories';
import { coletarDados, salvarDados } from '../scrapers/fundamentus-scraper';

// Flag para controlar se o serviço está rodando
let servicoAtivo = false;

// Função para verificar se deve coletar dados trimestrais
async function verificarEColetarTrimestrais() {
  console.log('\n[Coleta Automática] Verificando dados trimestrais...');

  try {
    const empresas = await empresaRepository.listarAtivas();

    for (const empresa of empresas) {
      try {
        // Verificar se deve tentar coletar
        const deveRetentar = await logColetaRepository.verificarSeDeveRetentar(empresa.id!, 'trimestral');

        if (!deveRetentar) {
          console.log(`[${empresa.codigo}] Trimestral já atualizado ou aguardando intervalo de retentativa`);
          continue;
        }

        console.log(`[${empresa.codigo}] Coletando dados trimestrais...`);

        const dados = await coletarDados(empresa.codigo);

        if (!dados) {
          await logColetaRepository.criar({
            empresaId: empresa.id!,
            tipoColeta: 'trimestral',
            status: 'erro',
            mensagem: 'Erro ao coletar dados do site',
          });
          continue;
        }

        // Verificar se há dados trimestrais disponíveis
        if (!dados.data_balanco) {
          await logColetaRepository.criar({
            empresaId: empresa.id!,
            tipoColeta: 'trimestral',
            status: 'dados_indisponiveis',
            mensagem: 'Data de balanço não disponível',
          });
          console.log(`[${empresa.codigo}] Dados trimestrais ainda não disponíveis`);
          continue;
        }

        // Verificar se já existe esse trimestre no banco
        const jaExiste = await dadosTrimestraisRepository.buscarPorEmpresa(empresa.id!, 1);

        if (jaExiste.length > 0 && jaExiste[0].dataBalanco === dados.data_balanco) {
          await logColetaRepository.criar({
            empresaId: empresa.id!,
            tipoColeta: 'trimestral',
            status: 'sucesso',
            mensagem: 'Dados já atualizados',
            dataReferencia: dados.data_balanco,
          });
          console.log(`[${empresa.codigo}] Trimestre ${dados.data_balanco} já cadastrado`);
          continue;
        }

        // Salvar novos dados
        await salvarDados(dados);

        await logColetaRepository.criar({
          empresaId: empresa.id!,
          tipoColeta: 'trimestral',
          status: 'sucesso',
          mensagem: 'Dados coletados com sucesso',
          dataReferencia: dados.data_balanco,
        });

        console.log(`[${empresa.codigo}] ✓ Dados trimestrais atualizados (${dados.data_balanco})`);

      } catch (error: any) {
        console.error(`[${empresa.codigo}] Erro ao processar:`, error.message);

        await logColetaRepository.criar({
          empresaId: empresa.id!,
          tipoColeta: 'trimestral',
          status: 'erro',
          mensagem: error.message || 'Erro desconhecido',
        });
      }

      // Aguardar 2 segundos entre empresas para não sobrecarregar o site
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('[Coleta Automática] Erro ao verificar trimestrais:', error);
  }
}

// Função para coletar dados diários
async function coletarDadosDiarios() {
  console.log('\n[Coleta Automática] Coletando dados diários...');

  try {
    const empresas = await empresaRepository.listarAtivas();
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    for (const empresa of empresas) {
      try {
        // Verificar se já coletou hoje
        const dadosHoje = await dadosDiariosRepository.buscarUltimo(empresa.id!);

        if (dadosHoje && dadosHoje.data === hoje) {
          console.log(`[${empresa.codigo}] Dados diários já coletados hoje`);
          continue;
        }

        console.log(`[${empresa.codigo}] Coletando dados diários...`);

        const dados = await coletarDados(empresa.codigo);

        if (!dados) {
          await logColetaRepository.criar({
            empresaId: empresa.id!,
            tipoColeta: 'diario',
            status: 'erro',
            mensagem: 'Erro ao coletar dados do site',
          });
          continue;
        }

        // Verificar se há cotação disponível
        if (!dados.cotacao || dados.cotacao === 0) {
          await logColetaRepository.criar({
            empresaId: empresa.id!,
            tipoColeta: 'diario',
            status: 'dados_indisponiveis',
            mensagem: 'Cotação não disponível',
          });
          console.log(`[${empresa.codigo}] Cotação não disponível`);
          continue;
        }

        // Salvar dados
        await salvarDados(dados);

        await logColetaRepository.criar({
          empresaId: empresa.id!,
          tipoColeta: 'diario',
          status: 'sucesso',
          mensagem: 'Dados coletados com sucesso',
          dataReferencia: dados.data_cotacao,
        });

        console.log(`[${empresa.codigo}] ✓ Dados diários atualizados (R$ ${dados.cotacao.toFixed(2)})`);

      } catch (error: any) {
        console.error(`[${empresa.codigo}] Erro ao processar:`, error.message);

        await logColetaRepository.criar({
          empresaId: empresa.id!,
          tipoColeta: 'diario',
          status: 'erro',
          mensagem: error.message || 'Erro desconhecido',
        });
      }

      // Aguardar 2 segundos entre empresas
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('[Coleta Automática] Erro ao coletar dados diários:', error);
  }
}

// Iniciar serviço de coleta automática
export function iniciarColetaAutomatica() {
  if (servicoAtivo) {
    console.log('⚠️ Serviço de coleta automática já está ativo');
    return;
  }

  console.log('\n🤖 Iniciando serviço de coleta automática...');
  servicoAtivo = true;

  // Coletar dados diários todos os dias às 9h (após abertura da bolsa)
  cron.schedule('0 9 * * *', async () => {
    console.log('\n⏰ [CRON] Executando coleta diária agendada');
    await coletarDadosDiarios();
  });

  // Coletar dados diários também às 18h (após fechamento)
  cron.schedule('0 18 * * *', async () => {
    console.log('\n⏰ [CRON] Executando coleta diária (tarde)');
    await coletarDadosDiarios();
  });

  // Verificar dados trimestrais a cada 3 horas
  cron.schedule('0 */3 * * *', async () => {
    console.log('\n⏰ [CRON] Verificando dados trimestrais');
    await verificarEColetarTrimestrais();
  });

  console.log('✓ Tarefas agendadas:');
  console.log('  • Coleta diária: 09:00 e 18:00');
  console.log('  • Verificação trimestral: a cada 3 horas');
  console.log('');

  // Executar uma coleta inicial logo após iniciar
  setTimeout(async () => {
    console.log('🚀 Executando coleta inicial...');
    await coletarDadosDiarios();
    await verificarEColetarTrimestrais();
  }, 5000); // Aguarda 5 segundos para dar tempo do servidor iniciar
}

// Executar coleta manual (para testes ou chamada via API)
export async function executarColetaManual(tipo: 'diario' | 'trimestral' | 'ambos' = 'ambos') {
  console.log(`\n🔧 Executando coleta manual (${tipo})...`);

  if (tipo === 'diario' || tipo === 'ambos') {
    await coletarDadosDiarios();
  }

  if (tipo === 'trimestral' || tipo === 'ambos') {
    await verificarEColetarTrimestrais();
  }

  console.log('✓ Coleta manual concluída');
}
