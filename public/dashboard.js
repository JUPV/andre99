// Estado global
let dadosOriginais = [];
let dadosFiltrados = [];
let receitaChart = null;
let lucroChart = null;

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
});

// Carregar dados da API
async function carregarDados() {
  try {
    mostrarLoading(true);
    const response = await fetch('/api/dashboard/comparacao-trimestral');
    const dados = await response.json();

    dadosOriginais = dados;
    dadosFiltrados = [...dados];

    atualizarStats();
    popularFiltros();
    renderizarTabela();
    renderizarGraficos();
    mostrarLoading(false);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarErro('Erro ao carregar dados. Tente novamente.');
  }
}

// Atualizar cards de estatísticas
function atualizarStats() {
  const total = dadosOriginais.length;
  const atualizadas = dadosOriginais.filter(d => d.ultimoTrimestral).length;

  // Calcular crescimento médio
  let somaVariacoes = 0;
  let countVariacoes = 0;
  dadosOriginais.forEach(empresa => {
    if (empresa.variacaoReceita !== null && empresa.variacaoReceita !== undefined) {
      somaVariacoes += empresa.variacaoReceita;
      countVariacoes++;
    }
  });
  const crescimentoMedio = countVariacoes > 0 ? (somaVariacoes / countVariacoes) : 0;

  // Última atualização
  let ultimaData = null;
  dadosOriginais.forEach(empresa => {
    if (empresa.ultimoTrimestral?.dataBalanco) {
      const data = new Date(empresa.ultimoTrimestral.dataBalanco);
      if (!ultimaData || data > ultimaData) {
        ultimaData = data;
      }
    }
  });

  // Atualizar DOM
  document.getElementById('totalEmpresas').textContent = total;
  document.getElementById('empresasAtualizadas').textContent = atualizadas;
  document.getElementById('crescimentoMedio').textContent = formatarPercentual(crescimentoMedio);

  const changeEl = document.getElementById('crescimentoChange');
  if (crescimentoMedio !== 0) {
    changeEl.style.display = 'inline-flex';
    changeEl.className = 'stat-change ' + (crescimentoMedio > 0 ? 'positive' : 'negative');
    changeEl.innerHTML = `<span>${crescimentoMedio > 0 ? '↑' : '↓'}</span><span>${Math.abs(crescimentoMedio).toFixed(2)}%</span>`;
  }

  document.getElementById('ultimaAtualizacao').textContent = ultimaData
    ? formatarDataCurta(ultimaData.toISOString())
    : 'Sem dados';
}

// Popular filtros de setor
function popularFiltros() {
  const setores = [...new Set(dadosOriginais.map(d => d.empresa?.setor).filter(Boolean))];
  const setorFilter = document.getElementById('setorFilter');

  setores.forEach(setor => {
    const option = document.createElement('option');
    option.value = setor;
    option.textContent = setor;
    setorFilter.appendChild(option);
  });
}

// Filtrar dados
function filtrarDados() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const setorFilter = document.getElementById('setorFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;

  dadosFiltrados = dadosOriginais.filter(empresa => {
    // Filtro de busca
    const matchSearch = !search ||
      empresa.empresa.codigo.toLowerCase().includes(search) ||
      empresa.empresa.nome.toLowerCase().includes(search);

    // Filtro de setor
    const matchSetor = !setorFilter || empresa.empresa.setor === setorFilter;
    if (statusFilter === 'online') {
      matchStatus = empresa.statusColeta === 'success' && empresa.ultimoTrimestral;
    } else if (statusFilter === 'pending') {
      matchStatus = empresa.statusColeta === 'pending' || empresa.statusColeta === 'dados_indisponiveis';
    } else if (statusFilter === 'offline') {
      matchStatus = !empresa.ultimoTrimestral;
    }

    return matchSearch && matchSetor && matchStatus;
  });

  ordenarDados();
}

// Ordenar dados
function ordenarDados() {
  const sortBy = document.getElementById('sortBy').value;

  dadosFiltrados.sort((a, b) => {
    switch (sortBy) {
      case 'crescimento':
        return (b.variacaoReceita || -999) - (a.variacaoReceita || -999);
      case 'receita':
        return (b.ultimoTrimestral?.receitaLiquida12m || 0) - (a.ultimoTrimestral?.receitaLiquida12m || 0);
      case 'lucro':
        return (b.ultimoTrimestral?.lucroLiquido12m || 0) - (a.ultimoTrimestral?.lucroLiquido12m || 0);
      default: // codigo
        return a.empresa.codigo.localeCompare(b.empresa.codigo);
    }
  });

  renderizarTabela();
}

// Renderizar tabela
function renderizarTabela() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  const info = document.getElementById('resultadosInfo');
  info.textContent = `Mostrando ${dadosFiltrados.length} de ${dadosOriginais.length} empresas`;

  if (dadosFiltrados.length === 0) {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('dataTable').style.display = 'none';
    return;
  }

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('dataTable').style.display = 'table';

  dadosFiltrados.forEach(empresa => {
    const tr = document.createElement('tr');
    tr.className = 'fade-in';

    // Status
    let statusBadge = '';
    if (empresa.ultimoTrimestral) {
      statusBadge = '<span class="badge success">✅ Online</span>';
    } else if (empresa.status === 'pending') {
      statusBadge = '<span class="badge warning">⏳ Pendente</span>';
    } else {
      statusBadge = '<span class="badge neutral">📭 Sem Dados</span>';
    }

    // Trimestre
    const trimestre = empresa.ultimoTrimestral?.dataBalanco
      ? formatarData(empresa.ultimoTrimestral.dataBalanco)
      : '-';

    // Receitas
    const receitaAtual = empresa.ultimoTrimestral?.receitaLiquida12m || 0;
    const receitaAnterior = empresa.penultimoTrimestral?.receitaLiquida12m || 0;
    const varReceita = empresa.variacaoReceita;

    // Lucros
    const lucroAtual = empresa.ultimoTrimestral?.lucroLiquido12m || 0;
    const lucroAnterior = empresa.penultimoTrimestral?.lucroLiquido12m || 0;
    const varLucro = empresa.variacaoLucro;

    // Indicadores
    const pl = empresa.ultimoDiario?.pl || '-';
    const evEbitda = empresa.ultimoDiario?.evEbitda || '-';

    tr.innerHTML = `
      <td>
        <div style="font-weight: 600; color: var(--text-primary);">${empresa.empresa.codigo}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.125rem;">${empresa.empresa.nome}</div>
      </td>
      <td>${statusBadge}</td>
      <td>${trimestre}</td>
      <td class="text-right">${formatarMilhoes(receitaAtual)}</td>
      <td class="text-right">${formatarMilhoes(receitaAnterior)}</td>
      <td class="text-right">${formatarVariacao(varReceita)}</td>
      <td class="text-right">${formatarMilhoes(lucroAtual)}</td>
      <td class="text-right">${formatarMilhoes(lucroAnterior)}</td>
      <td class="text-right">${formatarVariacao(varLucro)}</td>
      <td class="text-right">${typeof pl === 'number' ? pl.toFixed(2) : pl}</td>
      <td class="text-right">${typeof evEbitda === 'number' ? evEbitda.toFixed(2) : evEbitda}</td>
      <td class="text-center">
        <div class="btn-group">
          <button class="btn btn-small btn-outline" onclick="verDetalhes('${empresa.empresa.codigo}')" title="Ver detalhes">
            👁️
          </button>
          <button class="btn btn-small btn-outline" onclick="editarEmpresa('${empresa.empresa.codigo}')" title="Editar">
            ✏️
          </button>
          <button class="btn btn-small btn-outline" onclick="forcarColeta('${empresa.empresa.codigo}')" title="Forçar coleta">
            🔄
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Renderizar gráficos
function renderizarGraficos() {
  // Top 10 empresas por receita
  const top10Receita = [...dadosOriginais]
    .filter(e => e.ultimoTrimestral)
    .sort((a, b) => (b.ultimoTrimestral?.receitaLiquida12m || 0) - (a.ultimoTrimestral?.receitaLiquida12m || 0))
    .slice(0, 10);

  const top10Lucro = [...dadosOriginais]
    .filter(e => e.ultimoTrimestral)
    .sort((a, b) => (b.ultimoTrimestral?.lucroLiquido12m || 0) - (a.ultimoTrimestral?.lucroLiquido12m || 0))
    .slice(0, 10);

  // Gráfico de Receita
  const ctxReceita = document.getElementById('receitaChart');
  if (receitaChart) receitaChart.destroy();

  receitaChart = new Chart(ctxReceita, {
    type: 'bar',
    data: {
      labels: top10Receita.map(e => e.empresa.codigo),
      datasets: [{
        label: 'Receita Atual',
        data: top10Receita.map(e => (e.ultimoTrimestral?.receitaLiquida12m || 0) / 1000000),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1
      }, {
        label: 'Receita Anterior',
        data: top10Receita.map(e => (e.penultimoTrimestral?.receitaLiquida12m || 0) / 1000000),
        backgroundColor: 'rgba(100, 116, 139, 0.5)',
        borderColor: 'rgba(100, 116, 139, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#f1f5f9'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2) + 'M';
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        },
        y: {
          ticks: {
            color: '#94a3b8',
            callback: (value) => 'R$ ' + value + 'M'
          },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        }
      }
    }
  });

  // Gráfico de Lucro
  const ctxLucro = document.getElementById('lucroChart');
  if (lucroChart) lucroChart.destroy();

  lucroChart = new Chart(ctxLucro, {
    type: 'bar',
    data: {
      labels: top10Lucro.map(e => e.empresa.codigo),
      datasets: [{
        label: 'Lucro Atual',
        data: top10Lucro.map(e => (e.ultimoTrimestral?.lucroLiquido12m || 0) / 1000000),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }, {
        label: 'Lucro Anterior',
        data: top10Lucro.map(e => (e.penultimoTrimestral?.lucroLiquido12m || 0) / 1000000),
        backgroundColor: 'rgba(100, 116, 139, 0.5)',
        borderColor: 'rgba(100, 116, 139, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#f1f5f9'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2) + 'M';
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        },
        y: {
          ticks: {
            color: '#94a3b8',
            callback: (value) => 'R$ ' + value + 'M'
          },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        }
      }
    }
  });
}

// Ações
function verDetalhes(codigo) {
  window.location.href = `/?empresa=${codigo}`;
}

function editarEmpresa(codigo) {
  window.location.href = `cadastro.html?codigo=${codigo}`;
}

async function forcarColeta(codigo) {
  if (!confirm(`Forçar coleta de dados para ${codigo}?`)) return;

  try {
    const response = await fetch('/api/coleta/executar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });

    const result = await response.json();
    alert(result.message || 'Coleta iniciada com sucesso!');

    // Recarregar dados após 2 segundos
    setTimeout(carregarDados, 2000);
  } catch (error) {
    console.error('Erro ao forçar coleta:', error);
    alert('Erro ao iniciar coleta. Tente novamente.');
  }
}

// Utilitários
function formatarMilhoes(valor) {
  if (!valor || valor === 0) return '-';
  return (valor / 1000000).toFixed(2) + 'M';
}

function formatarVariacao(valor) {
  if (valor === null || valor === undefined) return '-';
  const sinal = valor >= 0 ? '+' : '';
  const classe = valor > 0 ? 'text-success' : valor < 0 ? 'text-danger' : '';
  return `<span class="${classe}">${sinal}${valor.toFixed(2)}%</span>`;
}

function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return '0%';
  const sinal = valor >= 0 ? '+' : '';
  return `${sinal}${valor.toFixed(2)}%`;
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR');
}

function formatarDataCurta(dataStr) {
  if (!dataStr) return '-';
  const data = new Date(dataStr);
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  return `${dia}/${mes}`;
}

function mostrarLoading(show) {
  document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
  document.getElementById('dataTable').style.display = show ? 'none' : 'table';
}

function mostrarErro(mensagem) {
  alert(mensagem);
  mostrarLoading(false);
}
