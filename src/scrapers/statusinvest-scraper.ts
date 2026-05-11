import axios from 'axios';

export interface DadoTrimestrialStatusInvest {
  year: number;
  quarter: number;
  receitaLiquida: number;
  despesas: number;
  lucroLiquido: number;
  margemBruta: number;
  margemEbitda: number;
  margemEbit: number;
  margemLiquida: number;
}

export interface ResultadoScraperStatusInvest {
  sucesso: boolean;
  dados?: DadoTrimestrialStatusInvest[];
  erro?: string;
}

/**
 * Busca dados trimestrais de uma empresa no Status Invest
 * @param codigo Código da ação (ex: PETR4, AERI3)
 * @returns Dados trimestrais ou erro
 */
export async function buscarDadosTrimestraisStatusInvest(
  codigo: string
): Promise<ResultadoScraperStatusInvest> {
  try {
    console.log(`[StatusInvest] Buscando dados de ${codigo}...`);

    const url = `https://statusinvest.com.br/acao/getrevenue?code=${codigo}&type=0&viewType=1`;

    const response = await axios.get<DadoTrimestrialStatusInvest[]>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': `https://statusinvest.com.br/acoes/${codigo.toLowerCase()}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000
    });

    if (!response.data || !Array.isArray(response.data)) {
      return {
        sucesso: false,
        erro: 'Resposta inválida da API'
      };
    }

    if (response.data.length === 0) {
      return {
        sucesso: true,
        dados: []
      };
    }

    console.log(`[StatusInvest] ${codigo}: ${response.data.length} trimestres encontrados`);

    return {
      sucesso: true,
      dados: response.data
    };

  } catch (error: any) {
    console.error(`[StatusInvest] Erro ao buscar ${codigo}:`, error.message);

    if (error.response?.status === 404) {
      return {
        sucesso: false,
        erro: 'Empresa não encontrada no Status Invest'
      };
    }

    if (error.response?.status === 429) {
      return {
        sucesso: false,
        erro: 'Rate limit atingido - muitas requisições'
      };
    }

    return {
      sucesso: false,
      erro: error.message || 'Erro desconhecido'
    };
  }
}

/**
 * Aguarda um tempo aleatório entre min e max milissegundos
 */
export function delayAleatorio(min: number = 2000, max: number = 5000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`[Delay] Aguardando ${delay}ms...`);
  return new Promise(resolve => setTimeout(resolve, delay));
}
