import axios from 'axios';
import * as cheerio from 'cheerio';

async function testarScraping() {
  try {
    const url = 'https://fundamentus.com.br/detalhes.php?papel=PETR4';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    console.log('\n=== TESTANDO LABELS ===\n');

    // Listar todas as labels encontradas
    const labels: string[] = [];
    $('table span.txt').each((i, el) => {
      const texto = $(el).text().trim();
      if (texto && !labels.includes(texto)) {
        labels.push(texto);
      }
    });

    console.log('Labels encontrados:', labels.slice(0, 30));

    // Testar busca específica
    const getValor = (labelTexto: string): string => {
      let valor = '';
      $('table span.txt').each((i, el) => {
        const texto = $(el).text().trim();
        if (texto === labelTexto) {
          const tdData = $(el).closest('td').next('td.data');
          valor = tdData.find('span.txt').text().trim();
          return false;
        }
      });
      return valor;
    };

    console.log('\n=== TESTANDO VALORES ESPECÍFICOS ===\n');

    const testLabels = [
      'Cotação',
      'Data últ cot',
      'Últ balanço processado',
      'P/L',
      'EV / EBITDA',
      'Receita Líquida',
      'EBIT',
      'Lucro Líquido'
    ];

    testLabels.forEach(label => {
      const valor = getValor(label);
      console.log(`${label}: "${valor}"`);
    });

    // Verificar setor e subsetor
    console.log('\n=== SETOR E SUBSETOR ===\n');
    const setor = $('td.data a[href*="setor"]').text().trim();
    const subsetor = $('td.data a[href*="segmento"]').text().trim();
    console.log('Setor:', setor);
    console.log('Subsetor:', subsetor);

  } catch (error) {
    console.error('Erro:', error);
  }
}

testarScraping();
