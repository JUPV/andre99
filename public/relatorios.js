// Função para toggle do menu
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');

  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');

  const isCollapsed = sidebar.classList.contains('collapsed');
  document.getElementById('menuIcon').textContent = isCollapsed ? '☰' : '✕';

  // Salva o estado do menu no localStorage
  localStorage.setItem('menuCollapsed', isCollapsed);
}

// Verifica o estado do menu no carregamento da página
function checkMenuState() {
  const isCollapsed = localStorage.getItem('menuCollapsed') === 'true';
  if (isCollapsed) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
    document.getElementById('menuIcon').textContent = '☰';
  } else {
    document.getElementById('menuIcon').textContent = '✕';
  }
}

// Formatar data/hora
function formatarDataHora(isoString) {
  const data = new Date(isoString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');
  const seg = String(data.getSeconds()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}

// Obter ícone e cor por tipo de log
function obterIconeTipo(tipo) {
  const tipos = {
    info: { icone: 'ℹ️', cor: '#3B82F6', label: 'Info' },
    success: { icone: '✅', cor: '#10B981', label: 'Sucesso' },
    warning: { icone: '⚠️', cor: '#F59E0B', label: 'Aviso' },
    error: { icone: '❌', cor: '#EF4444', label: 'Erro' }
  };
  return tipos[tipo] || tipos.info;
}

// Carregar saúde do sistema
async function carregarSaude() {
  try {
    const response = await fetch('/api/relatorios/saude');
    const data = await response.json();

    const statusCard = document.getElementById('statusSistema');
    const statusIcon = document.getElementById('statusIcon');
    const statusValue = document.getElementById('statusValue');

    // Status visual
    const statusConfig = {
      saudavel: { icone: '✅', cor: '#10B981', label: 'Saudável' },
      atencao: { icone: '⚠️', cor: '#F59E0B', label: 'Atenção' },
      critico: { icone: '❌', cor: '#EF4444', label: 'Crítico' }
    };

    const config = statusConfig[data.status];
    statusIcon.textContent = config.icone;
    statusIcon.style.color = config.cor;
    statusValue.textContent = config.label;
    statusValue.style.color = config.cor;

    // Mostrar problemas se houver
    if (data.problemas && data.problemas.length > 0) {
      statusValue.innerHTML = `${config.label}<br><small style="font-size: 0.75rem; opacity: 0.7;">${data.problemas.join(', ')}</small>`;
    }

  } catch (error) {
    console.error('Erro ao carregar saúde:', error);
    document.getElementById('statusValue').textContent = 'Erro ao carregar';
  }
}

// Carregar estatísticas
async function carregarEstatisticas() {
  try {
    const response = await fetch('/api/relatorios/estatisticas');
    const data = await response.json();

    // Atualizar cards superiores
    document.getElementById('totalLogs').textContent = data.banco.totalLogs.toLocaleString();
    document.getElementById('erros24h').textContent = data.coletas.errosUltimas24h.toLocaleString();
    document.getElementById('taxaSucesso').textContent = data.coletas.taxaSucesso;

    // Estatísticas detalhadas
    const html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <!-- Banco de Dados -->
        <div>
          <h3 style="margin-bottom: 0.5rem; color: #2563EB;">🗄️ Banco de Dados</h3>
          <ul style="list-style: none; padding: 0;">
            <li>Empresas: <strong>${data.banco.totalEmpresas}</strong></li>
            <li>Empresas Ativas: <strong>${data.banco.empresasAtivas}</strong></li>
            <li>Dados Trimestrais: <strong>${data.banco.totalTrimestrais.toLocaleString()}</strong></li>
            <li>Dados Diários: <strong>${data.banco.totalDiarios.toLocaleString()}</strong></li>
          </ul>
        </div>

        <!-- Coletas -->
        <div>
          <h3 style="margin-bottom: 0.5rem; color: #10B981;">📊 Coletas (24h)</h3>
          <ul style="list-style: none; padding: 0;">
            <li>Total: <strong>${data.coletas.ultimas24h.toLocaleString()}</strong></li>
            <li style="color: #10B981;">Sucessos: <strong>${(data.coletas.ultimas24h - data.coletas.errosUltimas24h).toLocaleString()}</strong></li>
            <li style="color: #EF4444;">Erros: <strong>${data.coletas.errosUltimas24h.toLocaleString()}</strong></li>
            <li>Taxa: <strong>${data.coletas.taxaSucesso}</strong></li>
          </ul>
        </div>

        <!-- Logs do Sistema -->
        <div>
          <h3 style="margin-bottom: 0.5rem; color: #F59E0B;">📝 Logs Sistema (Total)</h3>
          <ul style="list-style: none; padding: 0;">
            <li>ℹ️ Info: <strong>${data.logs.sistema.porTipo.info.toLocaleString()}</strong></li>
            <li>✅ Sucesso: <strong>${data.logs.sistema.porTipo.success.toLocaleString()}</strong></li>
            <li>⚠️ Avisos: <strong>${data.logs.sistema.porTipo.warning.toLocaleString()}</strong></li>
            <li>❌ Erros: <strong>${data.logs.sistema.porTipo.error.toLocaleString()}</strong></li>
          </ul>
        </div>

        <!-- Últimas Coletas -->
        <div>
          <h3 style="margin-bottom: 0.5rem; color: #8B5CF6;">🕒 Últimas Coletas</h3>
          <ul style="list-style: none; padding: 0; font-size: 0.875rem;">
            ${data.logs.ultimasColetas.slice(0, 5).map(log => {
      const statusEmoji = log.status === 'sucesso' ? '✅' : log.status === 'erro' ? '❌' : '⚠️';
      return `<li>${statusEmoji} ${log.empresa} (${log.tipo})</li>`;
    }).join('')}
          </ul>
        </div>
      </div>
    `;

    document.getElementById('estatisticasDetalhadas').innerHTML = html;

  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    document.getElementById('estatisticasDetalhadas').innerHTML = '<p style="color: #EF4444;">Erro ao carregar estatísticas</p>';
  }
}

// Carregar logs
async function carregarLogs() {
  try {
    const tipo = document.getElementById('filtroTipo').value;
    const limite = document.getElementById('filtroLimite').value;

    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (limite) params.append('limite', limite);

    const response = await fetch(`/api/relatorios/logs?${params}`);
    const data = await response.json();

    const tbody = document.getElementById('logsBody');

    if (data.logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhum log encontrado</td></tr>';
      return;
    }

    tbody.innerHTML = data.logs.map(log => {
      const tipoInfo = obterIconeTipo(log.tipo);
      const detalhesStr = log.detalhes ? JSON.stringify(log.detalhes, null, 2) : '-';
      const hasDetalhes = log.detalhes && Object.keys(log.detalhes).length > 0;

      return `
        <tr>
          <td style="white-space: nowrap;">${formatarDataHora(log.timestamp)}</td>
          <td>
            <span style="color: ${tipoInfo.cor}; font-weight: 600;">
              ${tipoInfo.icone} ${tipoInfo.label}
            </span>
          </td>
          <td><strong>${log.modulo}</strong></td>
          <td>${log.mensagem}</td>
          <td>
            ${hasDetalhes ? `
              <button class="btn btn-sm btn-outline" onclick="mostrarDetalhes(${JSON.stringify(log.detalhes).replace(/"/g, '&quot;')})">
                Ver Detalhes
              </button>
            ` : '-'}
          </td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    document.getElementById('logsBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #EF4444;">Erro ao carregar logs</td></tr>';
  }
}

// Mostrar detalhes em alert
function mostrarDetalhes(detalhes) {
  const detalhesStr = JSON.stringify(detalhes, null, 2);
  alert(`Detalhes do Log:\n\n${detalhesStr}`);
}

// Limpar filtros
function limparFiltros() {
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroLimite').value = '100';
  carregarLogs();
}

// Atualizar tudo
async function atualizarTudo() {
  await Promise.all([
    carregarSaude(),
    carregarEstatisticas(),
    carregarLogs()
  ]);
}

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', async () => {
  checkMenuState();
  await atualizarTudo();

  // Auto-atualizar a cada 30 segundos
  setInterval(atualizarTudo, 30000);
});
