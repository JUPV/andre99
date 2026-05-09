import { Router } from 'express';
import { empresaRepository, dadosTrimestraisRepository, dadosDiariosRepository, logColetaRepository } from '../database/repositories';
import { executarColetaManual } from '../services/coleta-automatica';

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

    const resultado = await Promise.all(empresas.map(async (empresa) => {
      // Buscar todos os dados trimestrais da empresa (últimos 8 trimestres = 2 anos)
      const trimestrais = await dadosTrimestraisRepository.buscarPorEmpresa(empresa.id!, 8);

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
        const data = new Date(dado.dataBalanco);
        const ano = data.getFullYear();
        const mes = data.getMonth() + 1;

        // Determinar trimestre (1T, 2T, 3T, 4T)
        let trimestre = '';
        if (mes <= 3) trimestre = '1T';
        else if (mes <= 6) trimestre = '2T';
        else if (mes <= 9) trimestre = '3T';
        else trimestre = '4T';

        const chave = `${trimestre}${ano.toString().slice(-2)}`;

        dadosOrganizados.trimestres[chave] = {
          lucroLiquido3m: dado.lucroLiquido3m,
          lucroLiquido12m: dado.lucroLiquido12m,
          receitaLiquida3m: dado.receitaLiquida3m,
          receitaLiquida12m: dado.receitaLiquida12m,
          ebit3m: dado.ebit3m,
          ebit12m: dado.ebit12m,
          dataBalanco: dado.dataBalanco
        };
      });

      // Adicionar dados mais recentes como "1T Online"
      if (trimestrais.length > 0) {
        const ultimo = trimestrais[0];
        dadosOrganizados.online = {
          lucroLiquido3m: ultimo.lucroLiquido3m,
          lucroLiquido12m: ultimo.lucroLiquido12m,
          receitaLiquida3m: ultimo.receitaLiquida3m,
          receitaLiquida12m: ultimo.receitaLiquida12m,
          ebit3m: ultimo.ebit3m,
          ebit12m: ultimo.ebit12m,
          dataBalanco: ultimo.dataBalanco
        };
      }

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
        receita12m: anterior.receitaLiquida12m ?
          ((atual.receitaLiquida12m - anterior.receitaLiquida12m) / Math.abs(anterior.receitaLiquida12m)) * 100 : null,
        lucro12m: anterior.lucroLiquido12m ?
          ((atual.lucroLiquido12m - anterior.lucroLiquido12m) / Math.abs(anterior.lucroLiquido12m)) * 100 : null,
        ebit12m: anterior.ebit12m ?
          ((atual.ebit12m - anterior.ebit12m) / Math.abs(anterior.ebit12m)) * 100 : null,
        receita3m: anterior.receitaLiquida3m ?
          ((atual.receitaLiquida3m - anterior.receitaLiquida3m) / Math.abs(anterior.receitaLiquida3m)) * 100 : null,
        lucro3m: anterior.lucroLiquido3m ?
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

export default router;
