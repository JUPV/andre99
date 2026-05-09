let dadosComparativos = [];
let setoresDisponiveis = new Set();

// Carregar dados
async function carregarDados() {
  try {
    const response = await fetch('/api/comparativo-trimestral');
    dadosComparativos = await response.json();

    // Extrair setores únicos
    setoresDisponiveis.clear();
    dadosComparativos.forEach(item => {
      if (item.empresa.setor) {
        setoresDisponiveis.add(item.empresa.setor);
      }
    });

    // Preencher select de setores
    const selectSetor = document.getElementById('setor');
    selectSetor.innerHTML = '<option value="">Todos os setores</option>' +
      Array.from(setoresDisponiveis).sort().map(setor =>
        `<option value="${setor}">${setor}</option>`
      ).join('');

    atualizarTabela();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    document.getElementById('corpoTabela').innerHTML = `
            <tr>
                <td colspan="19" class="loading text-danger">
                    Erro ao carregar dados. Tente novamente.
                </td>
            </tr>
        `;
  }
}

// Atualizar tabela
function atualizarTabela() {
  const metrica = document.getElementById('metrica').value;
  const setorFiltro = document.getElementById('setor').value;
  const busca = document.getElementById('busca').value.toUpperCase();
  const unidade = document.getElementById('unidade').value;

  // Filtrar dados
  let dadosFiltrados = dadosComparativos.filter(item => {
    const matchSetor = !setorFiltro || item.empresa.setor === setorFiltro;
    const matchBusca = !busca || item.empresa.codigo.includes(busca);
    return matchSetor && matchBusca;
  });

  // Atualizar contador
  document.getElementById('totalEmpresas').textContent = `${dadosFiltrados.length} empresas`;

  // Renderizar tabela
  renderizarTabela(dadosFiltrados, metrica, unidade);
}

// Renderizar tabela
function renderizarTabela(dados, metrica, unidade) {
  const tbody = document.getElementById('corpoTabela');

  if (dados.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="19" class="loading">
                    Nenhuma empresa encontrada com os filtros selecionados.
                </td>
            </tr>
        `;
    return;
  }

  // Mapeamento de métricas para campos
  const campoMap = {
    'lucro3m': { campo: 'lucroLiquido3m', label: 'Lucro 3M' },
    'lucro12m': { campo: 'lucroLiquido12m', label: 'Lucro 12M' },
    'receita3m': { campo: 'receitaLiquida3m', label: 'Receita 3M' },
    'receita12m': { campo: 'receitaLiquida12m', label: 'Receita 12M' },
    'ebit3m': { campo: 'ebit3m', label: 'EBIT 3M' },
    'ebit12m': { campo: 'ebit12m', label: 'EBIT 12M' }
  };

  const campo = campoMap[metrica].campo;

  tbody.innerHTML = dados.map(item => {
    // Obter valores dos trimestres
    const online = item.online?.[campo] || 0;
    const t1_26 = item.trimestres['1T26']?.[campo] || 0;
    const t1_25 = item.trimestres['1T25']?.[campo] || 0;
    const t2_25 = item.trimestres['2T25']?.[campo] || 0;
    const t2_24 = item.trimestres['2T24']?.[campo] || 0;
    const t3_25 = item.trimestres['3T25']?.[campo] || 0;
    const t3_24 = item.trimestres['3T24']?.[campo] || 0;
    const t4_25 = item.trimestres['4T25']?.[campo] || 0;
    const t4_24 = item.trimestres['4T24']?.[campo] || 0;

    // Calcular totais anuais
    const total2025 = (t1_25 + t2_25 + t3_25 + t4_25) || 0;
    const total2024 = (t1_25 + t2_24 + t3_24 + t4_24) || 0;

    // Calcular variações
    const var1T = calcularVariacao(t1_26, t1_25);
    const var2T = calcularVariacao(t2_25, t2_24);
    const var3T = calcularVariacao(t3_25, t3_24);
    const var4T = calcularVariacao(t4_25, t4_24);
    const varAnual = calcularVariacao(total2025, total2024);

    return `
            <tr>
                <td onclick="abrirDetalhes('${item.empresa.codigo}')">${item.empresa.codigo}</td>
                <td class="col-online">${formatarValor(online, unidade)}</td>
                <td>${formatarValor(t1_26, unidade)}</td>
                <td>${formatarValor(t1_25, unidade)}</td>
                <td class="${getClasseVariacao(var1T)}">${formatarPercentual(var1T)}</td>
                <td>${formatarValor(t2_25, unidade)}</td>
                <td>${formatarValor(t2_24, unidade)}</td>
                <td class="${getClasseVariacao(var2T)}">${formatarPercentual(var2T)}</td>
                <td>${formatarValor(t3_25, unidade)}</td>
                <td>${formatarValor(t3_24, unidade)}</td>
                <td class="${getClasseVariacao(var3T)}">${formatarPercentual(var3T)}</td>
                <td>${formatarValor(t4_25, unidade)}</td>
                <td>${formatarValor(t4_24, unidade)}</td>
                <td class="${getClasseVariacao(var4T)}">${formatarPercentual(var4T)}</td>
                <td class="col-anual">${formatarValor(total2025, unidade)}</td>
                <td class="col-anual">${formatarValor(total2024, unidade)}</td>
                <td class="${getClasseVariacao(varAnual)}">${formatarPercentual(varAnual)}</td>
                <td class="col-indicador">${formatarNumero(item.pl, 2)}</td>
                <td class="col-indicador">${formatarNumero(item.evEbitda, 2)}</td>
            </tr>
        `;
  }).join('');
}

// Calcular variação percentual
function calcularVariacao(atual, anterior) {
  if (!anterior || anterior === 0) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

// Obter classe CSS para variação
function getClasseVariacao(variacao) {
  if (variacao === null) return '';
  return variacao >= 0 ? 'variacao-positiva' : 'variacao-negativa';
}

// Formatação de valores
function formatarValor(valor, unidade) {
  if (!valor || valor === 0) return '-';

  let valorFormatado;
  const isNegativo = valor < 0;
  const valorAbs = Math.abs(valor);

  switch (unidade) {
    case 'milhoes':
      valorFormatado = (valorAbs / 1000000).toFixed(0);
      break;
    case 'milhares':
      valorFormatado = (valorAbs / 1000).toFixed(0);
      break;
    default: // reais
      valorFormatado = valorAbs.toFixed(0);
  }

  // Adicionar separador de milhares
  valorFormatado = valorFormatado.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const classe = isNegativo ? 'valor-negativo' : '';
  return `<span class="${classe}">${isNegativo ? '-' : ''}${valorFormatado}</span>`;
}

function formatarNumero(valor, decimais = 0) {
  if (valor === null || valor === undefined || valor === 0) return '-';
  return valor.toFixed(decimais);
}

function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return '-';
  const sinal = valor >= 0 ? '+' : '';
  return `${sinal}${valor.toFixed(2)}%`;
}

// Abrir detalhes da empresa
function abrirDetalhes(codigo) {
  window.location.href = `/empresa-detalhes.html?codigo=${codigo}`;
}

// Exportar para CSV
function exportarCSV() {
  const metrica = document.getElementById('metrica').value;
  const setorFiltro = document.getElementById('setor').value;
  const busca = document.getElementById('busca').value.toUpperCase();

  // Filtrar dados
  let dadosFiltrados = dadosComparativos.filter(item => {
    const matchSetor = !setorFiltro || item.empresa.setor === setorFiltro;
    const matchBusca = !busca || item.empresa.codigo.includes(busca);
    return matchSetor && matchBusca;
  });

  if (dadosFiltrados.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  // Criar CSV
  const campoMap = {
    'lucro3m': 'lucroLiquido3m',
    'lucro12m': 'lucroLiquido12m',
    'receita3m': 'receitaLiquida3m',
    'receita12m': 'receitaLiquida12m',
    'ebit3m': 'ebit3m',
    'ebit12m': 'ebit12m'
  };
  const campo = campoMap[metrica];

  // Cabeçalho
  let csv = 'EMPRESA;1T Online;1T26;1T25;AH% 1T26-1T25;2T25;2T24;AH% 2T25-2T24;3T25;3T24;AH% 3T25-3T24;4T25;4T24;AH% 4T25-4T24;2025;2024;AH% 25-24;P/L;EV/Ebitda\n';

  // Dados
  dadosFiltrados.forEach(item => {
    const online = item.online?.[campo] || 0;
    const t1_26 = item.trimestres['1T26']?.[campo] || 0;
    const t1_25 = item.trimestres['1T25']?.[campo] || 0;
    const t2_25 = item.trimestres['2T25']?.[campo] || 0;
    const t2_24 = item.trimestres['2T24']?.[campo] || 0;
    const t3_25 = item.trimestres['3T25']?.[campo] || 0;
    const t3_24 = item.trimestres['3T24']?.[campo] || 0;
    const t4_25 = item.trimestres['4T25']?.[campo] || 0;
    const t4_24 = item.trimestres['4T24']?.[campo] || 0;

    const total2025 = (t1_25 + t2_25 + t3_25 + t4_25) || 0;
    const total2024 = (t1_25 + t2_24 + t3_24 + t4_24) || 0;

    const var1T = calcularVariacao(t1_26, t1_25);
    const var2T = calcularVariacao(t2_25, t2_24);
    const var3T = calcularVariacao(t3_25, t3_24);
    const var4T = calcularVariacao(t4_25, t4_24);
    const varAnual = calcularVariacao(total2025, total2024);

    csv += `${item.empresa.codigo};${online};${t1_26};${t1_25};${var1T?.toFixed(2) || '-'};`;
    csv += `${t2_25};${t2_24};${var2T?.toFixed(2) || '-'};`;
    csv += `${t3_25};${t3_24};${var3T?.toFixed(2) || '-'};`;
    csv += `${t4_25};${t4_24};${var4T?.toFixed(2) || '-'};`;
    csv += `${total2025};${total2024};${varAnual?.toFixed(2) || '-'};`;
    csv += `${item.pl || '-'};${item.evEbitda || '-'}\n`;
  });

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `comparativo_trimestral_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// Inicializar
carregarDados();
