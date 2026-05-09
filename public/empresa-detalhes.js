// Obter código da empresa da URL
const urlParams = new URLSearchParams(window.location.search);
const codigoEmpresa = urlParams.get('codigo');

let dadosEmpresa = null;
let graficoAtual = null;

// Carregar dados da empresa
async function carregarDados() {
  if (!codigoEmpresa) {
    alert('Código da empresa não fornecido!');
    window.location.href = '/empresas.html';
    return;
  }

  try {
    const response = await fetch(`/api/empresas/${codigoEmpresa}/detalhes-completos`);
    if (!response.ok) {
      throw new Error('Empresa não encontrada');
    }

    dadosEmpresa = await response.json();
    renderizarDados();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    alert('Erro ao carregar dados da empresa');
    window.location.href = '/empresas.html';
  }
}

// Renderizar todos os dados
function renderizarDados() {
  const { empresa, ultimoTrimestral, ultimoDiario, trimestrais, diarios, variacoes } = dadosEmpresa;

  // Header
  document.getElementById('empresaNome').textContent = `${empresa.codigo} - ${empresa.nome}`;
  document.getElementById('empresaInfo').textContent = `${empresa.setor || 'N/A'} • ${empresa.subsetor || 'N/A'}`;

  // Cards de resumo
  if (ultimoDiario) {
    document.getElementById('cotacao').textContent = formatarMoeda(ultimoDiario.cotacao);
    document.getElementById('cotacaoData').textContent = formatarData(ultimoDiario.data);
    document.getElementById('pl').textContent = formatarNumero(ultimoDiario.pl, 2);
    document.getElementById('evEbitda').textContent = formatarNumero(ultimoDiario.evEbitda, 2);
    document.getElementById('divYield').textContent = formatarPercentual(ultimoDiario.divYield);
  }

  // Tabela de trimestrais
  renderizarTabelaTrimestrais(trimestrais);

  // Tabela de diários
  renderizarTabelaDiarios(diarios);

  // Gráfico
  atualizarGrafico();
}

// Renderizar tabela trimestral
function renderizarTabelaTrimestrais(trimestrais) {
  const tbody = document.getElementById('tabelaTrimestrais');

  if (trimestrais.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum dado trimestral disponível</td></tr>';
    return;
  }

  tbody.innerHTML = trimestrais.map(dado => {
    const margem = dado.receitaLiquida3m > 0 ?
      (dado.lucroLiquido3m / dado.receitaLiquida3m * 100) : 0;

    return `
            <tr>
                <td>${formatarData(dado.dataBalanco)}</td>
                <td class="text-right">${formatarMilhoes(dado.receitaLiquida3m)}</td>
                <td class="text-right">${formatarMilhoes(dado.ebit3m)}</td>
                <td class="text-right">${formatarMilhoes(dado.lucroLiquido3m)}</td>
                <td class="text-right">${formatarMilhoes(dado.receitaLiquida12m)}</td>
                <td class="text-right">${formatarMilhoes(dado.ebit12m)}</td>
                <td class="text-right">${formatarMilhoes(dado.lucroLiquido12m)}</td>
                <td class="text-right ${margem >= 0 ? 'text-success' : 'text-danger'}">
                    ${formatarPercentual(margem)}
                </td>
            </tr>
        `;
  }).join('');
}

// Renderizar tabela de dados diários
function renderizarTabelaDiarios(diarios) {
  const tbody = document.getElementById('tabelaDiarios');

  if (diarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum dado diário disponível</td></tr>';
    return;
  }

  // Mostrar apenas os últimos 30 dias
  const ultimosDias = diarios.slice(0, 30);

  tbody.innerHTML = ultimosDias.map(dado => `
        <tr>
            <td>${formatarData(dado.data)}</td>
            <td class="text-right">${formatarMoeda(dado.cotacao)}</td>
            <td class="text-right">${formatarNumero(dado.pl, 2)}</td>
            <td class="text-right">${formatarNumero(dado.evEbitda, 2)}</td>
            <td class="text-right">${formatarPercentual(dado.roe)}</td>
            <td class="text-right">${formatarPercentual(dado.roic)}</td>
            <td class="text-right">${formatarMilhoes(dado.valorMercado)}</td>
            <td class="text-right">${formatarPercentual(dado.divYield)}</td>
        </tr>
    `).join('');
}

// Atualizar gráfico
function atualizarGrafico() {
  if (!dadosEmpresa || !dadosEmpresa.trimestrais) return;

  const metrica = document.getElementById('metricas').value;
  const trimestrais = dadosEmpresa.trimestrais.slice(0, 12).reverse();

  let dados3m, dados12m, label;

  if (metrica === 'lucro') {
    dados3m = trimestrais.map(t => t.lucroLiquido3m / 1000000);
    dados12m = trimestrais.map(t => t.lucroLiquido12m / 1000000);
    label = 'Lucro Líquido (R$ milhões)';
  } else if (metrica === 'receita') {
    dados3m = trimestrais.map(t => t.receitaLiquida3m / 1000000);
    dados12m = trimestrais.map(t => t.receitaLiquida12m / 1000000);
    label = 'Receita Líquida (R$ milhões)';
  } else {
    dados3m = trimestrais.map(t => t.ebit3m / 1000000);
    dados12m = trimestrais.map(t => t.ebit12m / 1000000);
    label = 'EBIT (R$ milhões)';
  }

  const labels = trimestrais.map(t => formatarData(t.dataBalanco));

  const ctx = document.getElementById('graficoTrimestral').getContext('2d');

  if (graficoAtual) {
    graficoAtual.destroy();
  }

  graficoAtual = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `${label} - 3M`,
          data: dados3m,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: `${label} - 12M`,
          data: dados12m,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#E5E7EB' }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1F2937',
          titleColor: '#F3F4F6',
          bodyColor: '#E5E7EB',
          borderColor: '#374151',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: '#374151' },
          ticks: { color: '#9CA3AF' }
        },
        y: {
          grid: { color: '#374151' },
          ticks: { color: '#9CA3AF' }
        }
      }
    }
  });
}

// Forçar coleta de dados
async function forcarColeta() {
  if (!confirm(`Deseja forçar a coleta de dados de ${codigoEmpresa}?`)) {
    return;
  }

  try {
    const response = await fetch('/api/coleta/executar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'ambos',
        codigo: codigoEmpresa
      })
    });

    const result = await response.json();
    alert('Coleta iniciada! Os dados serão atualizados em alguns segundos.');

    // Recarregar dados após 5 segundos
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  } catch (error) {
    console.error('Erro ao forçar coleta:', error);
    alert('Erro ao iniciar coleta');
  }
}

// Funções de formatação
function formatarMoeda(valor) {
  if (!valor) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function formatarMilhoes(valor) {
  if (!valor) return 'R$ 0';
  const milhoes = valor / 1000000;
  if (Math.abs(milhoes) < 1) {
    return formatarMoeda(valor);
  }
  return `R$ ${milhoes.toFixed(0)}M`;
}

function formatarNumero(valor, decimais = 0) {
  if (valor === null || valor === undefined) return '-';
  return valor.toFixed(decimais);
}

function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return '-';
  return `${valor.toFixed(1)}%`;
}

function formatarData(data) {
  if (!data) return '-';
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR');
}

// Carregar dados ao iniciar
carregarDados();
