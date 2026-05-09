const app = {
  empresas: [],
  empresaSelecionada: null,

  async init() {
    await this.carregarEmpresas();
  },

  async carregarEmpresas() {
    try {
      const response = await fetch('/api/empresas');
      this.empresas = await response.json();
      this.renderizarEmpresas();
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      this.mostrarErro('Erro ao carregar empresas');
    }
  },

  renderizarEmpresas() {
    const container = document.getElementById('empresasList');

    if (this.empresas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Nenhuma empresa cadastrada</h3>
          <p>Clique em "Nova Empresa" para começar</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.empresas.map(empresa => `
      <div class="card" onclick="app.verDetalhes('${empresa.codigo}')">
        ${empresa.ativo ? '' : '<span class="card-badge">Inativo</span>'}
        <div class="card-code">${empresa.codigo}</div>
        <div class="card-name">${empresa.nome}</div>
        <div class="card-price" style="font-size: 0.9rem; opacity: 0.8;">
          ${empresa.setor || 'Sem setor'}
        </div>
      </div>
    `).join('');
  },

  async buscarEmpresa() {
    const codigo = document.getElementById('codigoInput').value.trim().toUpperCase();
    if (!codigo) return;

    await this.verDetalhes(codigo);
  },

  async verDetalhes(codigo) {
    try {
      const response = await fetch(`/api/empresas/${codigo}/resumo`);

      if (!response.ok) {
        alert('Empresa não encontrada');
        return;
      }

      const dados = await response.json();
      this.empresaSelecionada = dados;
      this.renderizarDetalhes(dados);

      // Scroll suave até a seção de detalhes
      document.getElementById('detalhesSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      alert('Erro ao buscar detalhes da empresa');
    }
  },

  renderizarDetalhes(dados) {
    const section = document.getElementById('detalhesSection');
    section.style.display = 'block';

    document.getElementById('detalhesNome').textContent =
      `${dados.empresa.codigo} - ${dados.empresa.nome}`;

    // Renderizar métricas
    if (dados.ultimoDiario) {
      this.renderizarMetricas(dados.ultimoDiario);
    }

    // Renderizar dados trimestrais
    if (dados.ultimoTrimestral) {
      this.renderizarTrimestrais([dados.ultimoTrimestral]);
    }

    // Renderizar histórico diário
    if (dados.historicoDiario) {
      this.renderizarDiarios(dados.historicoDiario);
    }
  },

  renderizarMetricas(dados) {
    const container = document.getElementById('metricas');

    const metricas = [
      { label: 'Cotação', valor: this.formatarMoeda(dados.cotacao) },
      { label: 'P/L', valor: this.formatarNumero(dados.pl) },
      { label: 'EV/EBITDA', valor: this.formatarNumero(dados.ev_ebitda) },
      { label: 'Div. Yield', valor: this.formatarPorcentagem(dados.div_yield) },
      { label: 'ROE', valor: this.formatarPorcentagem(dados.roe) },
      { label: 'ROIC', valor: this.formatarPorcentagem(dados.roic) },
    ];

    container.innerHTML = metricas.map(m => `
      <div class="metric">
        <div class="metric-label">${m.label}</div>
        <div class="metric-value">${m.valor}</div>
      </div>
    `).join('');
  },

  renderizarTrimestrais(dados) {
    const table = document.getElementById('trimestraisTable');

    if (!dados || dados.length === 0) {
      table.innerHTML = '<tr><td colspan="7">Sem dados trimestrais</td></tr>';
      return;
    }

    table.innerHTML = `
      <thead>
        <tr>
          <th>Data Balanço</th>
          <th class="number">Receita (3m)</th>
          <th class="number">EBIT (3m)</th>
          <th class="number">Lucro (3m)</th>
          <th class="number">Receita (12m)</th>
          <th class="number">EBIT (12m)</th>
          <th class="number">Lucro (12m)</th>
        </tr>
      </thead>
      <tbody>
        ${dados.map(d => `
          <tr>
            <td>${this.formatarData(d.dataBalanco)}</td>
            <td class="number">${this.formatarMilhoes(d.receitaLiquida3m)}</td>
            <td class="number">${this.formatarMilhoes(d.ebit3m)}</td>
            <td class="number">${this.formatarMilhoes(d.lucroLiquido3m)}</td>
            <td class="number">${this.formatarMilhoes(d.receitaLiquida12m)}</td>
            <td class="number">${this.formatarMilhoes(d.ebit12m)}</td>
            <td class="number">${this.formatarMilhoes(d.lucroLiquido12m)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  },

  renderizarDiarios(dados) {
    const table = document.getElementById('diariosTable');

    if (!dados || dados.length === 0) {
      table.innerHTML = '<tr><td colspan="4">Sem dados diários</td></tr>';
      return;
    }

    table.innerHTML = `
      <thead>
        <tr>
          <th>Data</th>
          <th class="number">Cotação</th>
          <th class="number">P/L</th>
          <th class="number">EV/EBITDA</th>
        </tr>
      </thead>
      <tbody>
        ${dados.map(d => `
          <tr>
            <td>${this.formatarData(d.data)}</td>
            <td class="number">${this.formatarMoeda(d.cotacao)}</td>
            <td class="number">${this.formatarNumero(d.pl)}</td>
            <td class="number">${this.formatarNumero(d.ev_ebitda)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  },

  abrirModalNovaEmpresa() {
    document.getElementById('modalNovaEmpresa').classList.add('active');
    document.getElementById('formNovaEmpresa').reset();
  },

  fecharModal() {
    document.getElementById('modalNovaEmpresa').classList.remove('active');
  },

  async salvarNovaEmpresa(event) {
    event.preventDefault();

    const empresa = {
      codigo: document.getElementById('novoCodigo').value.trim().toUpperCase(),
      nome: document.getElementById('novoNome').value.trim(),
      setor: document.getElementById('novoSetor').value.trim(),
      subsetor: document.getElementById('novoSubsetor').value.trim(),
    };

    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa)
      });

      if (response.ok) {
        alert('Empresa cadastrada com sucesso!');
        this.fecharModal();
        await this.carregarEmpresas();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao cadastrar empresa');
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa');
    }
  },

  // Funções de formatação
  formatarMoeda(valor) {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  formatarNumero(valor, decimais = 2) {
    if (!valor && valor !== 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais
    }).format(valor);
  },

  formatarPorcentagem(valor) {
    if (!valor && valor !== 0) return '-';
    return `${this.formatarNumero(valor)}%`;
  },

  formatarMilhoes(valor) {
    if (!valor && valor !== 0) return '-';
    const milhoes = valor / 1000000;
    return `${this.formatarNumero(milhoes, 1)}M`;
  },

  formatarData(data) {
    if (!data) return '-';
    const partes = data.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
  },

  mostrarErro(mensagem) {
    alert(mensagem);
  }
};

// Inicializar app quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Permitir buscar com Enter
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('codigoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      app.buscarEmpresa();
    }
  });
});
