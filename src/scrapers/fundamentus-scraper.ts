import axios from 'axios';
import * as cheerio from 'cheerio';
import { empresaRepository, dadosTrimestraisRepository, dadosDiariosRepository } from '../database/repositories';

export interface DadosFundamentus {
  // Dados básicos
  papel: string;
  nome: string;
  setor: string;
  subsetor: string;

  // Cotação e dados diários
  cotacao: number;
  data_cotacao: string;
  pl: number;
  ev_ebitda: number;
  valor_mercado: number;
  valor_firma: number;
  div_yield: number;
  roe: number;
  roic: number;

  // Dados trimestrais
  data_balanco: string;
  receita_liquida_3m: number;
  ebit_3m: number;
  lucro_liquido_3m: number;
  receita_liquida_12m: number;
  ebit_12m: number;
  lucro_liquido_12m: number;
}

function parseNumero(texto: string): number {
  if (!texto || texto.trim() === '' || texto === '-') return 0;

  // Remove espaços, pontos (separadores de milhar) e substitui vírgula por ponto
  const limpo = texto.trim()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace('%', '');

  return parseFloat(limpo) || 0;
}

function parseData(texto: string): string {
  if (!texto || texto.trim() === '') return '';

  // Converte DD/MM/YYYY para YYYY-MM-DD
  const partes = texto.trim().split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  return texto;
}

export async function coletarDados(codigo: string): Promise<DadosFundamentus | null> {
  try {
    console.log(`Coletando dados de ${codigo}...`);

    const url = `https://fundamentus.com.br/detalhes.php?papel=${codigo}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      responseType: 'arraybuffer'
    });

    // Converter de ISO-8859-1 para UTF-8
    const decoder = new TextDecoder('iso-8859-1');
    const html = decoder.decode(response.data);

    const $ = cheerio.load(html);

    // Função helper para buscar valor em tabela
    const getValor = (labelTexto: string): string => {
      let valor = '';
      $('table span.txt').each((i, el) => {
        const texto = $(el).text().trim();
        if (texto === labelTexto) {
          const tdData = $(el).closest('td').next('td.data');
          valor = tdData.find('span.txt').text().trim();
          return false; // break
        }
      });
      return valor;
    };

    // Extrair dados
    const dados: DadosFundamentus = {
      papel: getValor('Papel'),
      nome: getValor('Empresa'),
      setor: $('td.data a[href*="setor"]').text().trim(),
      subsetor: $('td.data a[href*="segmento"]').text().trim(),

      cotacao: parseNumero(getValor('Cotação')),
      data_cotacao: parseData(getValor('Data últ cot')),
      pl: parseNumero(getValor('P/L')),
      ev_ebitda: parseNumero(getValor('EV / EBITDA')),
      valor_mercado: parseNumero(getValor('Valor de mercado')),
      valor_firma: parseNumero(getValor('Valor da firma')),
      div_yield: parseNumero(getValor('Div. Yield')),
      roe: parseNumero(getValor('ROE')),
      roic: parseNumero(getValor('ROIC')),

      data_balanco: parseData(getValor('Últ balanço processado')),
      receita_liquida_3m: parseNumero(getValor('Receita Líquida')),
      ebit_3m: parseNumero(getValor('EBIT')),
      lucro_liquido_3m: parseNumero(getValor('Lucro Líquido')),
      receita_liquida_12m: 0,
      ebit_12m: 0,
      lucro_liquido_12m: 0,
    };

    // Buscar dados de 12 meses na segunda coluna
    const nivel2Cells = $('td.nivel2:contains("Últimos 12 meses")').closest('tr');
    if (nivel2Cells.length > 0) {
      const tabelaDemonstrativo = nivel2Cells.closest('table');

      // Receita Líquida 12m
      tabelaDemonstrativo.find('tr').each((i, row) => {
        const label = $(row).find('td.label span.txt').first().text().trim();
        if (label === 'Receita Líquida') {
          const valor = $(row).find('td.data span.txt').first().text().trim();
          dados.receita_liquida_12m = parseNumero(valor);
        } else if (label === 'EBIT') {
          const valor = $(row).find('td.data span.txt').first().text().trim();
          dados.ebit_12m = parseNumero(valor);
        } else if (label === 'Lucro Líquido') {
          const valor = $(row).find('td.data span.txt').first().text().trim();
          dados.lucro_liquido_12m = parseNumero(valor);
        }
      });
    }

    console.log('Dados coletados:', dados);
    return dados;

  } catch (error) {
    console.error(`Erro ao coletar dados de ${codigo}:`, error);
    return null;
  }
}

export async function salvarDados(dados: DadosFundamentus) {
  try {
    // Buscar ou criar empresa
    let empresa = await empresaRepository.buscarPorCodigo(dados.papel);

    if (!empresa) {
      console.log(`Criando empresa ${dados.papel}...`);
      empresa = await empresaRepository.criar({
        codigo: dados.papel,
        nome: dados.nome,
        setor: dados.setor,
        subsetor: dados.subsetor,
        ativo: true
      });
    } else {
      // Atualizar informações da empresa
      await empresaRepository.atualizar(empresa.id!, {
        nome: dados.nome,
        setor: dados.setor,
        subsetor: dados.subsetor
      });
    }

    if (!empresa || !empresa.id) {
      throw new Error('Erro ao obter ID da empresa');
    }

    // Salvar dados trimestrais
    if (dados.data_balanco) {
      console.log('Salvando dados trimestrais...');
      await dadosTrimestraisRepository.inserir({
        empresaId: empresa.id,
        dataBalanco: dados.data_balanco,
        receitaLiquida3m: dados.receita_liquida_3m,
        ebit3m: dados.ebit_3m,
        lucroLiquido3m: dados.lucro_liquido_3m,
        receitaLiquida12m: dados.receita_liquida_12m,
        ebit12m: dados.ebit_12m,
        lucroLiquido12m: dados.lucro_liquido_12m
      });
    }

    // Salvar dados diários
    if (dados.data_cotacao) {
      console.log('Salvando dados diários...');
      await dadosDiariosRepository.inserir({
        empresaId: empresa.id,
        data: dados.data_cotacao,
        cotacao: dados.cotacao,
        pl: dados.pl,
        evEbitda: dados.ev_ebitda,
        valorMercado: dados.valor_mercado,
        valorFirma: dados.valor_firma,
        divYield: dados.div_yield,
        roe: dados.roe,
        roic: dados.roic
      });
    }

    console.log(`Dados de ${dados.papel} salvos com sucesso!`);

  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    throw error;
  }
}
