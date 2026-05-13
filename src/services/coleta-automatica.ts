import cron from 'node-cron';
import { empresaRepository, logColetaRepository, dadosTrimestraisRepository, dadosDiariosRepository } from '../database/repositories';
import { coletarDados, salvarDados } from '../scrapers/fundamentus-scraper';
import { logger } from '../utils/logger';

// Flag para controlar se o serviço está rodando
let servicoAtivo = false;

// Função para verificar se deve coletar dados trimestrais
async function verificarEColetarTrimestrais() {
  console.log('\n[Coleta Automática] Verificando dados trimestrais...');
  logger.info('COLETA-AUTO', 'Iniciando verificação de dados trimestrais');

  try {
    const empresas = await empresaRepository.listarAtivas();
    logger.info('COLETA-AUTO', `${empresas.length} empresas ativas para verificar`);

    let sucessos = 0;
    let erros = 0;
    let jaAtualizados = 0;

    for (const empresa of empresas) {
      try {
        // Verificar se deve tentar coletar
        const deveRetentar = await logColetaRepository.verificarSeDeveRetentar(empresa.id!, 'trimestral');

        if (!deveRetentar) {
          console.log(`[${empresa.codigo}] Trimestral já atualizado ou aguardando intervalo de retentativa`);
          jaAtualizados++;
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
          logger.error('COLETA-AUTO', `Erro ao coletar ${empresa.codigo}`);
          erros++;
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
          logger.warning('COLETA-AUTO', `${empresa.codigo}: Dados trimestrais indisponíveis`);
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
          jaAtualizados++;
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
        logger.success('COLETA-AUTO', `${empresa.codigo}: Dados trimestrais atualizados`, { dataBalanco: dados.data_balanco });
        sucessos++;

      } catch (error: any) {
        console.error(`[${empresa.codigo}] Erro ao processar:`, error.message);
        logger.error('COLETA-AUTO', `Erro ao processar ${empresa.codigo}`, { erro: error.message });

        await logColetaRepository.criar({
          empresaId: empresa.id!,
          tipoColeta: 'trimestral',
          status: 'erro',
          mensagem: error.message || 'Erro desconhecido',
        });
        erros++;
      }

      // Aguardar 2 segundos entre empresas para não sobrecarregar o site
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info('COLETA-AUTO', `Verificação trimestral concluída`, {
      total: empresas.length,
      sucessos,
      erros,
      jaAtualizados
    });

  } catch (error) {
    console.error('[Coleta Automática] Erro ao verificar trimestrais:', error);
    logger.error('COLETA-AUTO', 'Erro crítico na verificação trimestral', error);
  }
}

// Função para coletar dados diários
async function coletarDadosDiarios() {
  console.log('\n[Coleta Automática] Coletando dados diários...');
  logger.info('COLETA-AUTO', 'Iniciando coleta de dados diários');

  try {
    const empresas = await empresaRepository.listarAtivas();
    logger.info('COLETA-AUTO', `${empresas.length} empresas para coleta diária`);

    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let sucessos = 0;
    let erros = 0;
    let jaColetados = 0;

    for (const empresa of empresas) {
      try {
        // Verificar se já coletou hoje
        const dadosHoje = await dadosDiariosRepository.buscarUltimo(empresa.id!);

        if (dadosHoje && dadosHoje.data === hoje) {
          console.log(`[${empresa.codigo}] Dados diários já coletados hoje`);
          jaColetados++;
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
          logger.error('COLETA-AUTO', `Erro ao coletar ${empresa.codigo} (diário)`);
          erros++;
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
          logger.warning('COLETA-AUTO', `${empresa.codigo}: Cotação indisponível`);
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
        logger.success('COLETA-AUTO', `${empresa.codigo}: Cotação R$ ${dados.cotacao.toFixed(2)}`);
        sucessos++;

      } catch (error: any) {
        console.error(`[${empresa.codigo}] Erro ao processar:`, error.message);
        logger.error('COLETA-AUTO', `Erro ao processar ${empresa.codigo} (diário)`, { erro: error.message });

        await logColetaRepository.criar({
          empresaId: empresa.id!,
          tipoColeta: 'diario',
          status: 'erro',
          mensagem: error.message || 'Erro desconhecido',
        });
        erros++;
      }

      // Aguardar 2 segundos entre empresas
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info('COLETA-AUTO', `Coleta diária concluída`, {
      total: empresas.length,
      sucessos,
      erros,
      jaColetados
    });

  } catch (error) {
    console.error('[Coleta Automática] Erro ao coletar dados diários:', error);
    logger.error('COLETA-AUTO', 'Erro crítico na coleta diária', error);
  }
}

// Iniciar serviço de coleta automática
export function iniciarColetaAutomatica() {
  if (servicoAtivo) {
    console.log('⚠️ Serviço de coleta automática já está ativo');
    logger.warning('SISTEMA', 'Tentativa de iniciar serviço já ativo');
    return;
  }

  console.log('\n🤖 Iniciando serviço de coleta automática...');
  logger.info('SISTEMA', 'Iniciando serviço de coleta automática');
  servicoAtivo = true;

  // Coletar dados diários todos os dias às 9h (após abertura da bolsa)
  cron.schedule('0 9 * * *', async () => {
    console.log('\n⏰ [CRON] Executando coleta diária agendada');
    logger.info('CRON', 'Executando coleta diária agendada (9h)');
    await coletarDadosDiarios();
  });

  // Coletar dados diários também às 18h (após fechamento)
  cron.schedule('0 18 * * *', async () => {
    console.log('\n⏰ [CRON] Executando coleta diária (tarde)');
    logger.info('CRON', 'Executando coleta diária agendada (18h)');
    await coletarDadosDiarios();
  });

  // Verificar dados trimestrais a cada 3 horas
  cron.schedule('0 */3 * * *', async () => {
    console.log('\n⏰ [CRON] Verificando dados trimestrais');
    logger.info('CRON', 'Verificando dados trimestrais (a cada 3h)');
    await verificarEColetarTrimestrais();
  });

  console.log('✓ Tarefas agendadas:');
  console.log('  • Coleta diária: 09:00 e 18:00');
  console.log('  • Verificação trimestral: a cada 3 horas');
  console.log('');

  logger.success('SISTEMA', 'Serviço de coleta automática iniciado com sucesso', {
    agendamentos: ['9h diário', '18h diário', 'a cada 3h trimestral']
  });

  // NOTA: Coleta inicial removida para evitar sobrecarga
  // As coletas serão executadas apenas nos horários agendados ou via API manual
  console.log('💡 Dica: Use a API /api/coleta/executar para forçar coleta manual');
  logger.info('SISTEMA', 'Aguardando próximo horário agendado para coleta automática');
}

// Executar coleta manual (para testes ou chamada via API)
export async function executarColetaManual(tipo: 'diario' | 'trimestral' | 'ambos' = 'ambos') {
  console.log(`\n🔧 Executando coleta manual (${tipo})...`);
  logger.info('COLETA-MANUAL', `Executando coleta manual: ${tipo}`);

  if (tipo === 'diario' || tipo === 'ambos') {
    await coletarDadosDiarios();
  }

  if (tipo === 'trimestral' || tipo === 'ambos') {
    await verificarEColetarTrimestrais();
  }

  console.log('✓ Coleta manual concluída');
  logger.success('COLETA-MANUAL', 'Coleta manual concluída com sucesso');
}
