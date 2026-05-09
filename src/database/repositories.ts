import prisma from './prisma';

// Exportar prisma para uso em outros módulos
export { prisma };

export interface Empresa {
  id?: number;
  codigo: string;
  nome: string;
  setor?: string | null;
  subsetor?: string | null;
  ativo?: boolean;
}

export interface DadosTrimestral {
  id?: number;
  empresaId: number;
  dataBalanco: string;
  receitaLiquida3m?: number | null;
  ebit3m?: number | null;
  lucroLiquido3m?: number | null;
  receitaLiquida12m?: number | null;
  ebit12m?: number | null;
  lucroLiquido12m?: number | null;
}

export interface DadosDiario {
  id?: number;
  empresaId: number;
  data: string;
  cotacao?: number | null;
  pl?: number | null;
  evEbitda?: number | null;
  valorMercado?: number | null;
  valorFirma?: number | null;
  divYield?: number | null;
  roe?: number | null;
  roic?: number | null;
}

export interface LogColeta {
  id?: number;
  empresaId: number;
  tipoColeta: 'diario' | 'trimestral';
  status: 'sucesso' | 'erro' | 'dados_indisponiveis';
  mensagem?: string | null;
  dataReferencia?: string | null;
}

// ============= EMPRESAS =============

export const empresaRepository = {
  async criar(empresa: Empresa) {
    return await prisma.empresa.create({
      data: {
        codigo: empresa.codigo,
        nome: empresa.nome,
        setor: empresa.setor || null,
        subsetor: empresa.subsetor || null,
        ativo: empresa.ativo !== undefined ? empresa.ativo : true,
      },
    });
  },

  async listarTodas() {
    return await prisma.empresa.findMany({
      orderBy: { codigo: 'asc' },
    });
  },

  async listarAtivas() {
    return await prisma.empresa.findMany({
      where: { ativo: true },
      orderBy: { codigo: 'asc' },
    });
  },

  async buscarPorCodigo(codigo: string) {
    return await prisma.empresa.findUnique({
      where: { codigo },
    });
  },

  async buscarPorId(id: number) {
    return await prisma.empresa.findUnique({
      where: { id },
    });
  },

  async atualizar(id: number, empresa: Partial<Empresa>) {
    return await prisma.empresa.update({
      where: { id },
      data: empresa,
    });
  },

  async deletar(id: number) {
    return await prisma.empresa.delete({
      where: { id },
    });
  },

  async toggleAtivo(id: number) {
    const empresa = await prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    return await prisma.empresa.update({
      where: { id },
      data: { ativo: !empresa.ativo },
    });
  },
};

// ============= DADOS TRIMESTRAIS =============

export const dadosTrimestraisRepository = {
  async inserir(dados: DadosTrimestral) {
    return await prisma.dadosTrimestral.upsert({
      where: {
        empresaId_dataBalanco: {
          empresaId: dados.empresaId,
          dataBalanco: dados.dataBalanco,
        },
      },
      update: {
        receitaLiquida3m: dados.receitaLiquida3m,
        ebit3m: dados.ebit3m,
        lucroLiquido3m: dados.lucroLiquido3m,
        receitaLiquida12m: dados.receitaLiquida12m,
        ebit12m: dados.ebit12m,
        lucroLiquido12m: dados.lucroLiquido12m,
      },
      create: {
        empresaId: dados.empresaId,
        dataBalanco: dados.dataBalanco,
        receitaLiquida3m: dados.receitaLiquida3m,
        ebit3m: dados.ebit3m,
        lucroLiquido3m: dados.lucroLiquido3m,
        receitaLiquida12m: dados.receitaLiquida12m,
        ebit12m: dados.ebit12m,
        lucroLiquido12m: dados.lucroLiquido12m,
      },
    });
  },

  async buscarPorEmpresa(empresaId: number, limit: number = 20) {
    return await prisma.dadosTrimestral.findMany({
      where: { empresaId },
      orderBy: { dataBalanco: 'desc' },
      take: limit,
    });
  },

  async buscarUltimo(empresaId: number) {
    return await prisma.dadosTrimestral.findFirst({
      where: { empresaId },
      orderBy: { dataBalanco: 'desc' },
    });
  },
};

// ============= DADOS DIÁRIOS =============

export const dadosDiariosRepository = {
  async inserir(dados: DadosDiario) {
    return await prisma.dadosDiario.upsert({
      where: {
        empresaId_data: {
          empresaId: dados.empresaId,
          data: dados.data,
        },
      },
      update: {
        cotacao: dados.cotacao,
        pl: dados.pl,
        evEbitda: dados.evEbitda,
        valorMercado: dados.valorMercado,
        valorFirma: dados.valorFirma,
        divYield: dados.divYield,
        roe: dados.roe,
        roic: dados.roic,
      },
      create: {
        empresaId: dados.empresaId,
        data: dados.data,
        cotacao: dados.cotacao,
        pl: dados.pl,
        evEbitda: dados.evEbitda,
        valorMercado: dados.valorMercado,
        valorFirma: dados.valorFirma,
        divYield: dados.divYield,
        roe: dados.roe,
        roic: dados.roic,
      },
    });
  },

  async buscarPorEmpresa(empresaId: number, limit: number = 30) {
    return await prisma.dadosDiario.findMany({
      where: { empresaId },
      orderBy: { data: 'desc' },
      take: limit,
    });
  },

  async buscarUltimo(empresaId: number) {
    return await prisma.dadosDiario.findFirst({
      where: { empresaId },
      orderBy: { data: 'desc' },
    });
  },

  async buscarPorData(data: string) {
    return await prisma.dadosDiario.findMany({
      where: { data },
      include: {
        empresa: {
          select: {
            codigo: true,
            nome: true,
          },
        },
      },
      orderBy: {
        empresa: {
          codigo: 'asc',
        },
      },
    });
  },
};

// ============= LOGS DE COLETA =============

export const logColetaRepository = {
  async criar(log: LogColeta) {
    return await prisma.logColeta.create({
      data: {
        empresaId: log.empresaId,
        tipoColeta: log.tipoColeta,
        status: log.status,
        mensagem: log.mensagem || null,
        dataReferencia: log.dataReferencia || null,
      },
    });
  },

  async buscarUltimaTentativa(empresaId: number, tipoColeta: 'diario' | 'trimestral') {
    return await prisma.logColeta.findFirst({
      where: {
        empresaId,
        tipoColeta,
      },
      orderBy: {
        tentativaEm: 'desc',
      },
    });
  },

  async buscarTentativasRecentes(empresaId: number, tipoColeta: 'diario' | 'trimestral', limite: number = 10) {
    return await prisma.logColeta.findMany({
      where: {
        empresaId,
        tipoColeta,
      },
      orderBy: {
        tentativaEm: 'desc',
      },
      take: limite,
    });
  },

  async verificarSeDeveRetentar(empresaId: number, tipoColeta: 'diario' | 'trimestral'): Promise<boolean> {
    const ultimaTentativa = await this.buscarUltimaTentativa(empresaId, tipoColeta);

    if (!ultimaTentativa) {
      return true; // Nunca tentou, deve tentar
    }

    if (ultimaTentativa.status === 'sucesso') {
      return false; // Já coletou com sucesso, não precisa retentar agora
    }

    // Se falhou ou dados indisponíveis, verificar se passaram 3 horas
    const horasDesdeUltimaTentativa =
      (Date.now() - new Date(ultimaTentativa.tentativaEm).getTime()) / (1000 * 60 * 60);

    return horasDesdeUltimaTentativa >= 3;
  },

  async listarTodos(limite: number = 100) {
    return await prisma.logColeta.findMany({
      orderBy: {
        tentativaEm: 'desc',
      },
      take: limite,
      include: {
        empresa: {
          select: {
            codigo: true,
            nome: true,
          },
        },
      },
    });
  },
};
