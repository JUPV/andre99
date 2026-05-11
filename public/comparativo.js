let dadosComparativos = [];
let setoresDisponiveis = new Set();

const TRIMESTRES = ['1T', '2T', '3T', '4T'];

function anoParaSufixo(ano) {
  return String(ano).slice(-2);
}

function chaveTrimestre(trimestre, ano) {
  return `${trimestre}${anoParaSufixo(ano)}`;
}

function obterAnosDisponiveis(dados) {
  const anos = new Set();

  dados.forEach((item) => {
    Object.keys(item.trimestres || {}).forEach((chave) => {
      const match = chave.match(/^([1-4])T(\d{2})$/);
      if (match) {
        anos.add(2000 + Number(match[2]));
      }
    });
  });

  return Array.from(anos).sort((a, b) => b - a);
}

function preencherAnos() {
  const anos = obterAnosDisponiveis(dadosComparativos);
  const selectAtual = document.getElementById('anoAtual');
  const selectComparacao = document.getElementById('anoComparacao');

  if (anos.length === 0) {
    selectAtual.innerHTML = '';
    selectComparacao.innerHTML = '';
    return;
  }

  const options = anos.map((ano) => `<option value="${ano}">${ano}</option>`).join('');
  selectAtual.innerHTML = options;
  selectComparacao.innerHTML = options;

  const tem2025 = anos.includes(2025);
  const tem2024 = anos.includes(2024);
  const anoAtualPadrao = tem2025 ? 2025 : anos[0];
  const anoComparacaoPadrao = tem2024 ? 2024 : (anos.find((ano) => ano !== anoAtualPadrao) || anoAtualPadrao);

  selectAtual.value = String(anoAtualPadrao);
  selectComparacao.value = String(anoComparacaoPadrao);
}

function atualizarCabecalho(anoAtual, anoComparacao) {
  document.getElementById('h1Atual').textContent = `1T${anoParaSufixo(anoAtual)}`;
  document.getElementById('h1Comparacao').textContent = `1T${anoParaSufixo(anoComparacao)}`;
  document.getElementById('h2Atual').textContent = `2T${anoParaSufixo(anoAtual)}`;
  document.getElementById('h2Comparacao').textContent = `2T${anoParaSufixo(anoComparacao)}`;
  document.getElementById('h3Atual').textContent = `3T${anoParaSufixo(anoAtual)}`;
  document.getElementById('h3Comparacao').textContent = `3T${anoParaSufixo(anoComparacao)}`;
  document.getElementById('h4Atual').textContent = `4T${anoParaSufixo(anoAtual)}`;
  document.getElementById('h4Comparacao').textContent = `4T${anoParaSufixo(anoComparacao)}`;

  document.getElementById('hVar1').textContent = `AH% 1T ${anoAtual}-${anoComparacao}`;
  document.getElementById('hVar2').textContent = `AH% 2T ${anoAtual}-${anoComparacao}`;
  document.getElementById('hVar3').textContent = `AH% 3T ${anoAtual}-${anoComparacao}`;
  document.getElementById('hVar4').textContent = `AH% 4T ${anoAtual}-${anoComparacao}`;

  document.getElementById('hTotalAtual').textContent = String(anoAtual);
  document.getElementById('hTotalComparacao').textContent = String(anoComparacao);
  document.getElementById('hVarAnual').textContent = `AH% ${anoAtual}-${anoComparacao}`;
}

function obterCampoMetrica() {
  const metrica = document.getElementById('metrica').value;
  const campoMap = {
    lucro3m: 'lucroLiquido3m',
    lucro12m: 'lucroLiquido12m',
    receita3m: 'receitaLiquida3m',
    receita12m: 'receitaLiquida12m',
    ebit3m: 'ebit3m',
    ebit12m: 'ebit12m',
  };

  return campoMap[metrica];
}

function obterValor(item, campo, trimestre, ano) {
  const chave = chaveTrimestre(trimestre, ano);
  const valor = item.trimestres?.[chave]?.[campo];

  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
}

function somarValores(lista) {
  const validos = lista.filter((valor) => typeof valor === 'number');
  if (validos.length === 0) {
    return null;
  }

  return validos.reduce((acc, valor) => acc + valor, 0);
}

function calcularVariacao(atual, anterior) {
  if (atual === null || anterior === null || anterior === 0) {
    return null;
  }

  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function getClasseVariacao(variacao) {
  if (variacao === null) return '';
  return variacao >= 0 ? 'variacao-positiva' : 'variacao-negativa';
}

function formatarValor(valor, unidade) {
  if (valor === null || valor === undefined) return '-';

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
    default:
      valorFormatado = valorAbs.toFixed(0);
  }

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

function enriquecerDados(item, campo, anoAtual, anoComparacao) {
  const valores = {
    '1TAtual': obterValor(item, campo, '1T', anoAtual),
    '1TComparacao': obterValor(item, campo, '1T', anoComparacao),
    '2TAtual': obterValor(item, campo, '2T', anoAtual),
    '2TComparacao': obterValor(item, campo, '2T', anoComparacao),
    '3TAtual': obterValor(item, campo, '3T', anoAtual),
    '3TComparacao': obterValor(item, campo, '3T', anoComparacao),
    '4TAtual': obterValor(item, campo, '4T', anoAtual),
    '4TComparacao': obterValor(item, campo, '4T', anoComparacao),
  };

  const variacoes = {
    '1T': calcularVariacao(valores['1TAtual'], valores['1TComparacao']),
    '2T': calcularVariacao(valores['2TAtual'], valores['2TComparacao']),
    '3T': calcularVariacao(valores['3TAtual'], valores['3TComparacao']),
    '4T': calcularVariacao(valores['4TAtual'], valores['4TComparacao']),
  };

  const totalAtual = somarValores([
    valores['1TAtual'],
    valores['2TAtual'],
    valores['3TAtual'],
    valores['4TAtual'],
  ]);

  const totalComparacao = somarValores([
    valores['1TComparacao'],
    valores['2TComparacao'],
    valores['3TComparacao'],
    valores['4TComparacao'],
  ]);

  const variacaoAnual = calcularVariacao(totalAtual, totalComparacao);

  return {
    ...item,
    valores,
    variacoes,
    totalAtual,
    totalComparacao,
    variacaoAnual,
  };
}

function aplicarRanking(dados) {
  const rankingTipo = document.getElementById('rankingTipo').value;
  const rankingTrimestre = document.getElementById('rankingTrimestre').value;

  if (rankingTipo === 'todos') {
    return dados;
  }

  const chave = rankingTrimestre === 'anual' ? 'variacaoAnual' : `variacoes.${rankingTrimestre}`;

  const getVariacao = (item) => {
    if (chave === 'variacaoAnual') return item.variacaoAnual;
    return item.variacoes[rankingTrimestre];
  };

  const comVariacao = dados.filter((item) => getVariacao(item) !== null);

  comVariacao.sort((a, b) => {
    const va = getVariacao(a);
    const vb = getVariacao(b);
    return rankingTipo === 'melhores' ? vb - va : va - vb;
  });

  return comVariacao;
}

function abrirDetalhes(codigo) {
  window.location.href = `/empresa-detalhes.html?codigo=${codigo}`;
}

function renderizarTabela(dados, unidade) {
  const tbody = document.getElementById('corpoTabela');

  if (dados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="18" class="loading">Nenhuma empresa encontrada com os filtros selecionados.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = dados.map((item) => {
    return `
      <tr>
        <td onclick="abrirDetalhes('${item.empresa.codigo}')">${item.empresa.codigo}</td>
        <td>${formatarValor(item.valores['1TAtual'], unidade)}</td>
        <td>${formatarValor(item.valores['1TComparacao'], unidade)}</td>
        <td class="${getClasseVariacao(item.variacoes['1T'])}">${formatarPercentual(item.variacoes['1T'])}</td>
        <td>${formatarValor(item.valores['2TAtual'], unidade)}</td>
        <td>${formatarValor(item.valores['2TComparacao'], unidade)}</td>
        <td class="${getClasseVariacao(item.variacoes['2T'])}">${formatarPercentual(item.variacoes['2T'])}</td>
        <td>${formatarValor(item.valores['3TAtual'], unidade)}</td>
        <td>${formatarValor(item.valores['3TComparacao'], unidade)}</td>
        <td class="${getClasseVariacao(item.variacoes['3T'])}">${formatarPercentual(item.variacoes['3T'])}</td>
        <td>${formatarValor(item.valores['4TAtual'], unidade)}</td>
        <td>${formatarValor(item.valores['4TComparacao'], unidade)}</td>
        <td class="${getClasseVariacao(item.variacoes['4T'])}">${formatarPercentual(item.variacoes['4T'])}</td>
        <td class="col-anual">${formatarValor(item.totalAtual, unidade)}</td>
        <td class="col-anual">${formatarValor(item.totalComparacao, unidade)}</td>
        <td class="${getClasseVariacao(item.variacaoAnual)}">${formatarPercentual(item.variacaoAnual)}</td>
        <td class="col-indicador">${formatarNumero(item.pl, 2)}</td>
        <td class="col-indicador">${formatarNumero(item.evEbitda, 2)}</td>
      </tr>
    `;
  }).join('');
}

async function carregarDados() {
  try {
    document.getElementById('corpoTabela').innerHTML = `
      <tr>
        <td colspan="18" class="loading">
          <div>Carregando dados...</div>
        </td>
      </tr>
    `;

    const response = await fetch('/api/comparativo-trimestral');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    dadosComparativos = await response.json();

    const selectMetrica = document.getElementById('metrica');
    if (selectMetrica && !selectMetrica.dataset.inicializado) {
      selectMetrica.value = 'receita3m';
      selectMetrica.dataset.inicializado = 'true';
    }

    setoresDisponiveis.clear();
    dadosComparativos.forEach((item) => {
      if (item.empresa.setor) {
        setoresDisponiveis.add(item.empresa.setor);
      }
    });

    const selectSetor = document.getElementById('setor');
    selectSetor.innerHTML = '<option value="">Todos os setores</option>' +
      Array.from(setoresDisponiveis).sort().map((setor) => `<option value="${setor}">${setor}</option>`).join('');

    preencherAnos();
    atualizarTabela();
  } catch (error) {
    document.getElementById('corpoTabela').innerHTML = `
      <tr>
        <td colspan="18" class="loading text-danger">
          ⚠️ Erro ao carregar dados: ${error.message}<br>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="carregarDados()">Tentar Novamente</button>
        </td>
      </tr>
    `;
  }
}

function atualizarTabela() {
  const campo = obterCampoMetrica();
  const setorFiltro = document.getElementById('setor').value;
  const busca = document.getElementById('busca').value.toUpperCase();
  const unidade = document.getElementById('unidade').value;
  const anoAtual = Number(document.getElementById('anoAtual').value);
  const anoComparacao = Number(document.getElementById('anoComparacao').value);

  if (!anoAtual || !anoComparacao) {
    return;
  }

  atualizarCabecalho(anoAtual, anoComparacao);

  let dadosFiltrados = dadosComparativos.filter((item) => {
    const matchSetor = !setorFiltro || item.empresa.setor === setorFiltro;
    const matchBusca = !busca || item.empresa.codigo.includes(busca);
    return matchSetor && matchBusca;
  });

  let dadosEnriquecidos = dadosFiltrados.map((item) => enriquecerDados(item, campo, anoAtual, anoComparacao));
  dadosEnriquecidos = aplicarRanking(dadosEnriquecidos);

  document.getElementById('totalEmpresas').textContent = `${dadosEnriquecidos.length} empresas`;

  renderizarTabela(dadosEnriquecidos, unidade);
}

function exportarCSV() {
  const campo = obterCampoMetrica();
  const setorFiltro = document.getElementById('setor').value;
  const busca = document.getElementById('busca').value.toUpperCase();
  const anoAtual = Number(document.getElementById('anoAtual').value);
  const anoComparacao = Number(document.getElementById('anoComparacao').value);

  let dadosFiltrados = dadosComparativos.filter((item) => {
    const matchSetor = !setorFiltro || item.empresa.setor === setorFiltro;
    const matchBusca = !busca || item.empresa.codigo.includes(busca);
    return matchSetor && matchBusca;
  });

  let dadosEnriquecidos = dadosFiltrados.map((item) => enriquecerDados(item, campo, anoAtual, anoComparacao));
  dadosEnriquecidos = aplicarRanking(dadosEnriquecidos);

  if (dadosEnriquecidos.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  let csv = `EMPRESA;1T${anoParaSufixo(anoAtual)};1T${anoParaSufixo(anoComparacao)};AH% 1T;2T${anoParaSufixo(anoAtual)};2T${anoParaSufixo(anoComparacao)};AH% 2T;3T${anoParaSufixo(anoAtual)};3T${anoParaSufixo(anoComparacao)};AH% 3T;4T${anoParaSufixo(anoAtual)};4T${anoParaSufixo(anoComparacao)};AH% 4T;${anoAtual};${anoComparacao};AH% Anual;P/L;EV/Ebitda\n`;

  dadosEnriquecidos.forEach((item) => {
    csv += `${item.empresa.codigo};${item.valores['1TAtual'] ?? ''};${item.valores['1TComparacao'] ?? ''};${item.variacoes['1T']?.toFixed(2) || ''};`;
    csv += `${item.valores['2TAtual'] ?? ''};${item.valores['2TComparacao'] ?? ''};${item.variacoes['2T']?.toFixed(2) || ''};`;
    csv += `${item.valores['3TAtual'] ?? ''};${item.valores['3TComparacao'] ?? ''};${item.variacoes['3T']?.toFixed(2) || ''};`;
    csv += `${item.valores['4TAtual'] ?? ''};${item.valores['4TComparacao'] ?? ''};${item.variacoes['4T']?.toFixed(2) || ''};`;
    csv += `${item.totalAtual ?? ''};${item.totalComparacao ?? ''};${item.variacaoAnual?.toFixed(2) || ''};`;
    csv += `${item.pl || ''};${item.evEbitda || ''}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `comparativo_trimestral_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

carregarDados();
