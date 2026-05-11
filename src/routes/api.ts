import { Router } from 'express';
import { empresaRepository, dadosTrimestraisRepository, dadosDiariosRepository, logColetaRepository } from '../database/repositories';
import { executarColetaManual } from '../services/coleta-automatica';
import { lerLogs, obterEstatisticas, TipoLog } from '../utils/logger';
import { prisma } from '../database/repositories';

const router = Router();

// Listar todas as empresas
router.get('/empresas', async (req, res) => {
  try {
    const empresas = await empresaRepository.listarTodas();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Buscar empresa por código
router.get('/empresas/:codigo', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

// Criar nova empresa
router.post('/empresas', async (req, res) => {
  try {
    const { codigo, nome, setor, subsetor } = req.body;

    if (!codigo || !nome) {
      return res.status(400).json({ error: 'Código e nome são obrigatórios' });
    }

    const empresa = await empresaRepository.criar({
      codigo: codigo.toUpperCase(),
      nome,
      setor,
      subsetor,
      ativo: true
    });

    res.status(201).json(empresa);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Empresa já cadastrada' });
    }
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
});

// Atualizar empresa
router.put('/empresas/:codigo', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const { nome, setor, subsetor, ativo } = req.body;
    const empresaAtualizada = await empresaRepository.atualizar(empresa.id!, { nome, setor, subsetor, ativo });
    res.json(empresaAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

// Toggle ativo/inativo
router.patch('/empresas/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const empresa = await empresaRepository.toggleAtivo(id);
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar status' });
  }
});

// Deletar empresa
router.delete('/empresas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await empresaRepository.deletar(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar empresa' });
  }
});

// Dados trimestrais de uma empresa
router.get('/empresas/:codigo/trimestrais', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const dados = await dadosTrimestraisRepository.buscarPorEmpresa(empresa.id!, limit);
    res.json(dados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados trimestrais' });
  }
});

// Dados diários de uma empresa
router.get('/empresas/:codigo/diarios', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const limit = parseInt(req.query.limit as string) || 30;
    const dados = await dadosDiariosRepository.buscarPorEmpresa(empresa.id!, limit);
    res.json(dados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados diários' });
  }
});

// Resumo completo de uma empresa
router.get('/empresas/:codigo/resumo', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const ultimoTrimestral = await dadosTrimestraisRepository.buscarUltimo(empresa.id!);
    const ultimoDiario = await dadosDiariosRepository.buscarUltimo(empresa.id!);
    const historicoDiario = await dadosDiariosRepository.buscarPorEmpresa(empresa.id!, 30);

    res.json({
      empresa,
      ultimoTrimestral,
      ultimoDiario,
      historicoDiario
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

// ============= COLETA AUTOMÁTICA =============

// Executar coleta manual
router.post('/coleta/executar', async (req, res) => {
  try {
    const { tipo, codigo } = req.body; // 'diario', 'trimestral' ou 'ambos', e código opcional

    // Se código específico foi fornecido, executar só para essa empresa
    if (codigo) {
      const empresa = await empresaRepository.buscarPorCodigo(codigo.toUpperCase());
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      // Importar e executar coleta específica
      const { coletarDados, salvarDados } = await import('../scrapers/fundamentus-scraper');

      const dados = await coletarDados(empresa.codigo);
      if (dados) {
        await salvarDados(dados);
        return res.json({
          message: 'Coleta executada com sucesso',
          empresa: codigo.toUpperCase()
        });
      } else {
        return res.status(500).json({ error: 'Erro ao coletar dados' });
      }
    }

    // Executar em background para não travar a requisição
    executarColetaManual(tipo || 'ambos').catch(error => {
      console.error('Erro na coleta manual:', error);
    });

    res.json({
      message: 'Coleta iniciada em background',
      tipo: tipo || 'ambos'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao iniciar coleta' });
  }
});

// Listar logs de coleta
router.get('/coleta/logs', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite as string) || 100;
    const logs = await logColetaRepository.listarTodos(limite);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

// Buscar logs de uma empresa específica
router.get('/coleta/logs/:codigo', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const tipo = req.query.tipo as 'diario' | 'trimestral' | undefined;
    const limite = parseInt(req.query.limite as string) || 20;

    if (tipo) {
      const logs = await logColetaRepository.buscarTentativasRecentes(empresa.id!, tipo, limite);
      res.json(logs);
    } else {
      // Buscar ambos os tipos
      const logsDiarios = await logColetaRepository.buscarTentativasRecentes(empresa.id!, 'diario', limite);
      const logsTrimestrais = await logColetaRepository.buscarTentativasRecentes(empresa.id!, 'trimestral', limite);

      res.json({
        diarios: logsDiarios,
        trimestrais: logsTrimestrais
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs da empresa' });
  }
});

// ============= DASHBOARD =============

// Comparação trimestral de todas as empresas
router.get('/dashboard/comparacao-trimestral', async (req, res) => {
  try {
    const empresas = await empresaRepository.listarTodas();

    const resultado = await Promise.all(empresas.map(async (empresa) => {
      const ultimoTrimestral = await dadosTrimestraisRepository.buscarUltimo(empresa.id!);
      const ultimoDiario = await dadosDiariosRepository.buscarUltimo(empresa.id!);
      const ultimoLog = await logColetaRepository.buscarUltimaTentativa(empresa.id!, 'trimestral');

      // Buscar trimestre anterior para comparação (assumindo trimestres a cada 3 meses)
      let trimestreAnterior = null;
      let variacaoReceita = null;
      let variacaoLucro = null;

      if (ultimoTrimestral) {
        const todosTrimestrais = await dadosTrimestraisRepository.buscarPorEmpresa(empresa.id!, 10);
        if (todosTrimestrais.length >= 2) {
          // Pegar o trimestre anterior ao último
          trimestreAnterior = todosTrimestrais[1];

          // Calcular variações
          if (trimestreAnterior.receitaLiquida12m && ultimoTrimestral.receitaLiquida12m) {
            variacaoReceita = ((ultimoTrimestral.receitaLiquida12m - trimestreAnterior.receitaLiquida12m) / Math.abs(trimestreAnterior.receitaLiquida12m)) * 100;
          }

          if (trimestreAnterior.lucroLiquido12m && ultimoTrimestral.lucroLiquido12m) {
            variacaoLucro = ((ultimoTrimestral.lucroLiquido12m - trimestreAnterior.lucroLiquido12m) / Math.abs(trimestreAnterior.lucroLiquido12m)) * 100;
          }
        }
      }

      return {
        empresa,
        ultimoTrimestral,
        trimestreAnterior,
        ultimoDiario,
        variacaoReceita,
        variacaoLucro,
        statusColeta: ultimoLog?.status
      };
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar comparação trimestral:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

// Logs detalhados com informações de empresa
router.get('/coleta/logs-detalhados', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite as string) || 100;
    const logs = await logColetaRepository.listarTodos(limite);

    // Buscar informações das empresas
    const logsComEmpresas = await Promise.all(logs.map(async (log) => {
      const empresa = await empresaRepository.buscarPorId(log.empresaId);
      return {
        ...log,
        empresa
      };
    }));

    res.json(logsComEmpresas);
  } catch (error) {
    console.error('Erro ao buscar logs detalhados:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

// ============= COMPARATIVO TRIMESTRAL =============

// Comparativo completo trimestral de todas as empresas
router.get('/comparativo-trimestral', async (req, res) => {
  try {
    const empresas = await empresaRepository.listarTodas();

    const pontuarRegistro = (dado: any) => {
      const campos = [
        dado.receitaLiquida3m,
        dado.ebit3m,
        dado.lucroLiquido3m,
        dado.receitaLiquida12m,
        dado.ebit12m,
        dado.lucroLiquido12m,
      ];

      const preenchidos = campos.filter((valor) => valor !== null && valor !== undefined).length;
      const bonusReceita3m = dado.receitaLiquida3m !== null && dado.receitaLiquida3m !== undefined ? 100 : 0;

      return bonusReceita3m + preenchidos;
    };

    const ehDataInicioTrimestre = (dataBalanco: string) => {
      const partes = dataBalanco.split('-');
      if (partes.length !== 3) return false;
      const mes = Number(partes[1]);
      const dia = Number(partes[2]);
      return dia === 1 && [1, 4, 7, 10].includes(mes);
    };

    const resultado = await Promise.all(empresas.map(async (empresa) => {
      // Busca ampla para não cortar trimestres quando houver datas legadas duplicadas.
      const trimestrais = await dadosTrimestraisRepository.buscarPorEmpresa(empresa.id!, 40);

      // Buscar último dado diário para P/L e EV/EBITDA
      const ultimoDiario = await dadosDiariosRepository.buscarUltimo(empresa.id!);

      // Organizar dados por trimestre/ano
      const dadosOrganizados: any = {
        empresa: {
          codigo: empresa.codigo,
          nome: empresa.nome,
          setor: empresa.setor
        },
        pl: ultimoDiario?.pl || 0,
        evEbitda: ultimoDiario?.evEbitda || 0,
        trimestres: {}
      };

      // Processar cada dado trimestral
      trimestrais.forEach(dado => {
        const partesData = dado.dataBalanco.split('-');
        if (partesData.length < 2) return;

        const ano = Number(partesData[0]);
        const mes = Number(partesData[1]);
        if (!Number.isFinite(ano) || !Number.isFinite(mes)) return;

        // Determinar trimestre (1T, 2T, 3T, 4T)
        let trimestre = '';
        if (mes <= 3) trimestre = '1T';
        else if (mes <= 6) trimestre = '2T';
        else if (mes <= 9) trimestre = '3T';
        else trimestre = '4T';

        const chave = `${trimestre}${String(ano).slice(-2)}`;

        const candidato = {
          lucroLiquido3m: dado.lucroLiquido3m,
          lucroLiquido12m: dado.lucroLiquido12m,
          receitaLiquida3m: dado.receitaLiquida3m,
          receitaLiquida12m: dado.receitaLiquida12m,
          ebit3m: dado.ebit3m,
          ebit12m: dado.ebit12m,
          dataBalanco: dado.dataBalanco
        };

        const atual = dadosOrganizados.trimestres[chave];
        if (!atual) {
          dadosOrganizados.trimestres[chave] = candidato;
          return;
        }

        const scoreAtual = pontuarRegistro(atual);
        const scoreCandidato = pontuarRegistro(candidato);

        if (scoreCandidato > scoreAtual) {
          dadosOrganizados.trimestres[chave] = candidato;
          return;
        }

        if (scoreCandidato === scoreAtual) {
          const atualInicio = ehDataInicioTrimestre(atual.dataBalanco);
          const candidatoInicio = ehDataInicioTrimestre(candidato.dataBalanco);

          if (candidatoInicio && !atualInicio) {
            dadosOrganizados.trimestres[chave] = candidato;
          }
        }
      });

      return dadosOrganizados;
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar comparativo trimestral:', error);
    res.status(500).json({ error: 'Erro ao buscar comparativo' });
  }
});

// Detalhes completos de uma empresa
router.get('/empresas/:codigo/detalhes-completos', async (req, res) => {
  try {
    const empresa = await empresaRepository.buscarPorCodigo(req.params.codigo.toUpperCase());
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Buscar todos os dados
    const trimestrais = await dadosTrimestraisRepository.buscarPorEmpresa(empresa.id!, 20);
    const diarios = await dadosDiariosRepository.buscarPorEmpresa(empresa.id!, 90);
    const ultimoDiario = await dadosDiariosRepository.buscarUltimo(empresa.id!);
    const ultimoTrimestral = await dadosTrimestraisRepository.buscarUltimo(empresa.id!);
    const logs = await logColetaRepository.buscarTentativasRecentes(empresa.id!, 'trimestral', 10);

    // Calcular variações
    let variacoes: any = {};
    if (trimestrais.length >= 2) {
      const atual = trimestrais[0];
      const anterior = trimestrais[1];

      variacoes = {
        receita12m: anterior.receitaLiquida12m && atual.receitaLiquida12m ?
          ((atual.receitaLiquida12m - anterior.receitaLiquida12m) / Math.abs(anterior.receitaLiquida12m)) * 100 : null,
        lucro12m: anterior.lucroLiquido12m && atual.lucroLiquido12m ?
          ((atual.lucroLiquido12m - anterior.lucroLiquido12m) / Math.abs(anterior.lucroLiquido12m)) * 100 : null,
        ebit12m: anterior.ebit12m && atual.ebit12m ?
          ((atual.ebit12m - anterior.ebit12m) / Math.abs(anterior.ebit12m)) * 100 : null,
        receita3m: anterior.receitaLiquida3m && atual.receitaLiquida3m ?
          ((atual.receitaLiquida3m - anterior.receitaLiquida3m) / Math.abs(anterior.receitaLiquida3m)) * 100 : null,
        lucro3m: anterior.lucroLiquido3m && atual.lucroLiquido3m ?
          ((atual.lucroLiquido3m - anterior.lucroLiquido3m) / Math.abs(anterior.lucroLiquido3m)) * 100 : null,
      };
    }

    res.json({
      empresa,
      ultimoTrimestral,
      ultimoDiario,
      trimestrais,
      diarios,
      variacoes,
      logs
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes completos:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da empresa' });
  }
});

// ============= RELATÓRIOS E LOGS =============

// Obter logs do sistema
router.get('/relatorios/logs', async (req, res) => {
  try {
    const { tipo, limite } = req.query;

    let logs = lerLogs();

    // Filtrar por tipo se especificado
    if (tipo && ['info', 'success', 'warning', 'error'].includes(tipo as string)) {
      logs = logs.filter(l => l.tipo === tipo);
    }

    // Limitar resultados
    const limit = limite ? parseInt(limite as string) : 100;
    logs = logs.slice(0, limit);

    res.json({ logs, total: logs.length });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

// Obter estatísticas do sistema
router.get('/relatorios/estatisticas', async (req, res) => {
  try {
    const statsLogs = obterEstatisticas();

    // Estatísticas do banco de dados
    const [
      totalEmpresas,
      empresasAtivas,
      totalTrimestrais,
      totalDiarios,
      totalLogs,
      ultimosLogs
    ] = await Promise.all([
      prisma.empresa.count(),
      prisma.empresa.count({ where: { ativo: true } }),
      prisma.dadosTrimestral.count(),
      prisma.dadosDiario.count(),
      prisma.logColeta.count(),
      prisma.logColeta.findMany({
        take: 10,
        orderBy: { tentativaEm: 'desc' },
        include: {
          empresa: {
            select: { codigo: true, nome: true }
          }
        }
      })
    ]);

    // Contar logs de coleta por status
    const logsPorStatus = await prisma.logColeta.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusCount: Record<string, number> = {};
    for (const item of logsPorStatus) {
      statusCount[item.status] = Number(item._count.status);
    }

    // Últimas 24 horas
    const ultimas24h = new Date();
    ultimas24h.setHours(ultimas24h.getHours() - 24);

    const [
      coletasUltimas24h,
      errosUltimas24h
    ] = await Promise.all([
      prisma.logColeta.count({
        where: {
          tentativaEm: { gte: ultimas24h }
        }
      }),
      prisma.logColeta.count({
        where: {
          tentativaEm: { gte: ultimas24h },
          status: 'erro'
        }
      })
    ]);

    res.json({
      sistema: {
        online: true,
        versao: '1.0.0',
        dataHora: new Date().toISOString()
      },
      banco: {
        totalEmpresas: Number(totalEmpresas),
        empresasAtivas: Number(empresasAtivas),
        totalTrimestrais: Number(totalTrimestrais),
        totalDiarios: Number(totalDiarios),
        totalLogs: Number(totalLogs)
      },
      coletas: {
        porStatus: statusCount,
        ultimas24h: Number(coletasUltimas24h),
        errosUltimas24h: Number(errosUltimas24h),
        taxaSucesso: coletasUltimas24h > 0
          ? ((coletasUltimas24h - errosUltimas24h) / coletasUltimas24h * 100).toFixed(2) + '%'
          : 'N/A'
      },
      logs: {
        sistema: statsLogs,
        ultimasColetas: ultimosLogs.map((log: any) => ({
          empresa: log.empresa.codigo,
          tipo: log.tipoColeta,
          status: log.status,
          mensagem: log.mensagem,
          dataHora: log.tentativaEm
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Relatório resumido de saúde do sistema
router.get('/relatorios/saude', async (req, res) => {
  try {
    const agora = new Date();
    const ultimas24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

    // Verificar coletas nas últimas 24h
    const coletasRecentes = await prisma.logColeta.count({
      where: {
        tentativaEm: { gte: ultimas24h }
      }
    });

    const errosRecentes = await prisma.logColeta.count({
      where: {
        tentativaEm: { gte: ultimas24h },
        status: 'erro'
      }
    });

    // Verificar empresas sem dados
    const empresasSemDados = await prisma.empresa.count({
      where: {
        ativo: true,
        dadosTrimestrais: {
          none: {}
        }
      }
    });

    // Status de saúde
    let status: 'saudavel' | 'atencao' | 'critico';
    const problemas: string[] = [];

    if (errosRecentes > 0) {
      const taxaErro = (errosRecentes / coletasRecentes) * 100;
      if (taxaErro > 50) {
        status = 'critico';
        problemas.push(`Taxa de erro alta: ${taxaErro.toFixed(1)}%`);
      } else if (taxaErro > 20) {
        status = 'atencao';
        problemas.push(`Taxa de erro moderada: ${taxaErro.toFixed(1)}%`);
      } else {
        status = 'saudavel';
      }
    } else if (coletasRecentes === 0) {
      status = 'atencao';
      problemas.push('Nenhuma coleta nas últimas 24h');
    } else {
      status = 'saudavel';
    }

    if (empresasSemDados > 0) {
      problemas.push(`${empresasSemDados} empresas ativas sem dados`);
    }

    res.json({
      status,
      timestamp: agora.toISOString(),
      metricas: {
        coletasUltimas24h: Number(coletasRecentes),
        errosUltimas24h: Number(errosRecentes),
        taxaSucesso: coletasRecentes > 0
          ? ((coletasRecentes - errosRecentes) / coletasRecentes * 100).toFixed(1) + '%'
          : 'N/A',
        empresasSemDados: Number(empresasSemDados)
      },
      problemas
    });
  } catch (error) {
    console.error('Erro ao verificar saúde:', error);
    res.status(500).json({
      status: 'critico',
      error: 'Erro ao verificar saúde do sistema',
      timestamp: new Date().toISOString()
    });
  }
});

// ============= STATUS INVEST IMPORTAÇÃO =============

// Preview de dados trimestrais do Status Invest (últimos 5 anos)
router.get('/empresas/:codigo/preview-status-invest', async (req, res) => {
  try {
    const codigo = req.params.codigo.toUpperCase();

    // Importar o scraper do Status Invest
    const { buscarDadosTrimestraisStatusInvest } = await import('../scrapers/statusinvest-scraper');

    const resultado = await buscarDadosTrimestraisStatusInvest(codigo);

    if (!resultado.sucesso) {
      return res.status(404).json({
        error: 'Dados não encontrados',
        detalhes: resultado.erro
      });
    }

    // Filtrar apenas últimos 5 anos (20 trimestres)
    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - 5);

    const dadosFiltrados = resultado.dados.filter(dado => {
      const dataDado = new Date(dado.year, (dado.quarter - 1) * 3, 1);
      return dataDado >= dataLimite;
    });

    res.json({
      sucesso: true,
      codigo,
      totalTrimestres: dadosFiltrados.length,
      dados: dadosFiltrados
    });
  } catch (error: any) {
    console.error('Erro ao buscar preview Status Invest:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados do Status Invest',
      detalhes: error.message
    });
  }
});

// Importar e salvar dados trimestrais do Status Invest
router.post('/empresas/:codigo/importar-trimestrais', async (req, res) => {
  try {
    const codigo = req.params.codigo.toUpperCase();
    const empresa = await empresaRepository.buscarPorCodigo(codigo);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const { dados } = req.body;

    if (!dados || !Array.isArray(dados)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    let salvos = 0;
    let atualizados = 0;
    let erros = 0;

    for (const dado of dados) {
      try {
        // Calcular data do balanço (último dia do trimestre)
        const ano = dado.year;
        const mesUltimoDiaTrimestre = dado.quarter * 3;
        const ultimoDiaTrimestre = new Date(ano, mesUltimoDiaTrimestre, 0).getDate();
        const dataBalanco = `${ano}-${String(mesUltimoDiaTrimestre).padStart(2, '0')}-${String(ultimoDiaTrimestre).padStart(2, '0')}`;

        const dadoParaSalvar = {
          empresaId: empresa.id!,
          dataBalanco,
          ano,
          trimestre: dado.quarter,
          receitaLiquida3m: dado.receitaLiquida || null,
          lucroLiquido3m: dado.lucroLiquido || null,
          despesas: dado.despesas || null,
          margemBruta: dado.margemBruta || null,
          margemEbitda: dado.margemEbitda || null,
          margemEbit: dado.margemEbit || null,
          margemLiquida: dado.margemLiquida || null,
          // Campos 12m vazios por enquanto
          receitaLiquida12m: null,
          ebit12m: null,
          lucroLiquido12m: null,
          ebit3m: null
        };

        // Upsert (criar ou atualizar)
        const resultado = await prisma.dadosTrimestral.upsert({
          where: {
            empresaId_dataBalanco: {
              empresaId: empresa.id!,
              dataBalanco
            }
          },
          update: dadoParaSalvar,
          create: dadoParaSalvar
        });

        if (resultado) {
          // Verificar se foi update ou create checando se já existia
          const jaExistia = await prisma.dadosTrimestral.count({
            where: {
              empresaId: empresa.id!,
              dataBalanco,
              id: { not: resultado.id }
            }
          });

          if (jaExistia > 0) {
            atualizados++;
          } else {
            salvos++;
          }
        }
      } catch (error) {
        console.error(`Erro ao salvar trimestre ${dado.quarter}/${dado.year}:`, error);
        erros++;
      }
    }

    res.json({
      sucesso: true,
      codigo,
      salvos,
      atualizados,
      erros,
      total: dados.length
    });
  } catch (error: any) {
    console.error('Erro ao importar dados trimestrais:', error);
    res.status(500).json({
      error: 'Erro ao importar dados',
      detalhes: error.message
    });
  }
});

// Atualizar um dado trimestral específico
router.put('/dados-trimestrais/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      receitaLiquida3m,
      lucroLiquido3m,
      despesas,
      margemBruta,
      margemEbitda,
      margemEbit,
      margemLiquida,
      ebit3m,
      receitaLiquida12m,
      ebit12m,
      lucroLiquido12m
    } = req.body;

    // Verificar se o dado existe
    const dadoExistente = await prisma.dadosTrimestral.findUnique({
      where: { id }
    });

    if (!dadoExistente) {
      return res.status(404).json({ error: 'Dado trimestral não encontrado' });
    }

    // Atualizar apenas os campos fornecidos
    const dadoAtualizado = await prisma.dadosTrimestral.update({
      where: { id },
      data: {
        receitaLiquida3m: receitaLiquida3m !== undefined ? receitaLiquida3m : dadoExistente.receitaLiquida3m,
        lucroLiquido3m: lucroLiquido3m !== undefined ? lucroLiquido3m : dadoExistente.lucroLiquido3m,
        despesas: despesas !== undefined ? despesas : dadoExistente.despesas,
        margemBruta: margemBruta !== undefined ? margemBruta : dadoExistente.margemBruta,
        margemEbitda: margemEbitda !== undefined ? margemEbitda : dadoExistente.margemEbitda,
        margemEbit: margemEbit !== undefined ? margemEbit : dadoExistente.margemEbit,
        margemLiquida: margemLiquida !== undefined ? margemLiquida : dadoExistente.margemLiquida,
        ebit3m: ebit3m !== undefined ? ebit3m : dadoExistente.ebit3m,
        receitaLiquida12m: receitaLiquida12m !== undefined ? receitaLiquida12m : dadoExistente.receitaLiquida12m,
        ebit12m: ebit12m !== undefined ? ebit12m : dadoExistente.ebit12m,
        lucroLiquido12m: lucroLiquido12m !== undefined ? lucroLiquido12m : dadoExistente.lucroLiquido12m
      }
    });

    res.json(dadoAtualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar dado trimestral:', error);
    res.status(500).json({
      error: 'Erro ao atualizar dado',
      detalhes: error.message
    });
  }
});

export default router;
