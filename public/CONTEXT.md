# 🎨 Frontend - Interface Web

## 📌 Propósito

Esta pasta contém todos os **arquivos da interface web** do sistema: HTML, CSS e JavaScript vanilla.

## 📁 Estrutura

```
public/
├── styles.css                  # CSS global (1000+ linhas)
├── index.html                  # Redirecionador inteligente
├── dashboard.html              # Dashboard principal
├── dashboard.js                # Lógica do dashboard
├── empresas.html               # Lista de empresas (CRUD)
├── cadastro.html               # Formulário de cadastro/edição
├── comparativo.html            # Análise comparativa trimestral
├── comparativo.js              # Lógica do comparativo
├── empresa-detalhes.html       # Detalhes de uma empresa
├── empresa-detalhes.js         # Lógica dos detalhes
└── status-coletas.html         # Timeline de coletas
```

## 🎨 Design System

### Cores (Dark Theme)
```css
--bg-dark: #0F172A          /* Fundo principal */
--bg-darker: #020617        /* Fundo mais escuro */
--bg-card: #1E293B          /* Cards e containers */
--bg-hover: #334155         /* Hover states */

--primary: #2563EB          /* Azul principal */
--secondary: #10B981        /* Verde sucesso */
--danger: #EF4444           /* Vermelho erro */
--warning: #F59E0B          /* Amarelo aviso */

--text-primary: #F1F5F9     /* Texto principal */
--text-secondary: #94A3B8   /* Texto secundário */
--text-muted: #64748B       /* Texto suave */

--border: #334155           /* Bordas padrão */
```

### Tipografia
```css
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
Font Sizes: 0.75rem → 2rem
Font Weights: 400 (normal), 600 (semi-bold), 700 (bold)
```

### Espaçamento
```css
Padding: 0.5rem, 1rem, 1.5rem, 2rem
Margin: 0.5rem, 1rem, 1.5rem, 2rem
Border Radius: 0.5rem, 0.75rem
```

## 🏗️ Componentes

### Sidebar
```html
<aside class="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">📊</div>
    <div class="sidebar-title">Fundamentus</div>
  </div>
  
  <nav class="sidebar-nav">
    <div class="nav-section">
      <div class="nav-section-title">Principal</div>
      <a href="dashboard.html" class="nav-item active">
        <span class="nav-icon">📊</span>
        <span>Dashboard</span>
      </a>
    </div>
  </nav>
</aside>
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <h2>Título do Card</h2>
    <div class="card-actions">
      <button class="btn btn-primary">Ação</button>
    </div>
  </div>
  <div class="card-body">
    <!-- Conteúdo -->
  </div>
</div>
```

### Botões
```html
<button class="btn btn-primary">Primário</button>
<button class="btn btn-secondary">Secundário</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-danger">Deletar</button>
```

### Formulários
```html
<div class="filter-group">
  <label>Label</label>
  <select class="select">
    <option>Opção 1</option>
  </select>
</div>

<div class="filter-group">
  <label>Buscar</label>
  <input type="text" placeholder="Digite...">
</div>
```

## 📄 Páginas

### 1. **dashboard.html**
**URL**: `/dashboard.html`

**Funcionalidades:**
- 4 cards de estatísticas (total empresas, com dados, sem dados, setores)
- Gráfico de evolução (Chart.js) - Receita e Lucro
- Tabela comparativa das últimas 10 empresas
- Filtros por métrica (Lucro/Receita/EBIT)

**API Calls:**
- `GET /api/empresas` - Listar empresas
- `GET /api/dashboard/comparacao-trimestral` - Dados comparativos

### 2. **empresas.html**
**URL**: `/empresas.html`

**Funcionalidades:**
- Tabela com todas as empresas
- Filtros: código, setor, status (ativo/inativo)
- Ações: Ver, Editar, Ativar/Desativar, Deletar
- Indicador visual de empresas com dados

**API Calls:**
- `GET /api/empresas` - Listar
- `DELETE /api/empresas/:codigo` - Deletar
- `PUT /api/empresas/:codigo` - Toggle ativo

### 3. **cadastro.html**
**URL**: `/cadastro.html` ou `/cadastro.html?codigo=PETR4`

**Funcionalidades:**
- Dual mode: Criar nova OU Editar existente
- Formulário com validação
- Opção de coletar dados automaticamente ao cadastrar
- Redirecionamento após sucesso

**API Calls:**
- `POST /api/empresas` - Criar
- `PUT /api/empresas/:codigo` - Atualizar
- `POST /api/coleta/executar` - Forçar coleta

### 4. **empresa-detalhes.html**
**URL**: `/empresa-detalhes.html?codigo=PETR4`

**Funcionalidades:**
- 4 cards de resumo (Cotação, P/L, EV/EBITDA, Div Yield)
- Gráfico de evolução trimestral (Chart.js)
- Switch entre métricas: Lucro/Receita/EBIT
- Tabela de histórico trimestral
- Tabela de indicadores diários (últimos 30 dias)
- Botão para forçar atualização
- Toggle menu (ocultar sidebar)

**API Calls:**
- `GET /api/empresas/:codigo/detalhes-completos`

### 5. **comparativo.html**
**URL**: `/comparativo.html`

**Funcionalidades:**
- Tabela comparativa de TODAS as empresas
- Formato: `EMPRESA | 1T Online | 1T26 | 1T25 | AH% | 2T25 | 2T24 | AH% ...`
- Filtros: Métrica (3M/12M), Setor, Busca, Unidade (Milhões/Milhares/Reais)
- Cores: Verde (positivo), Vermelho (negativo)
- Sticky headers e primeira coluna
- Exportação CSV
- Click no código abre detalhes
- Toggle menu (ocultar sidebar)

**API Calls:**
- `GET /api/comparativo-trimestral` - Dados completos

### 6. **status-coletas.html**
**URL**: `/status-coletas.html`

**Funcionalidades:**
- Timeline visual de coletas
- Filtros: Empresa, Status, Tipo de coleta
- Marcadores coloridos (sucesso/warning/erro)
- Countdown para próxima verificação (3h)
- Detalhes de cada log (mensagem, data, horário)

**API Calls:**
- `GET /api/coleta/logs` - Logs de coletas

### 7. **index.html**
**URL**: `/` ou `/?empresa=PETR4`

**Funcionalidades:**
- Redirecionador inteligente
- Se `?empresa=CODIGO`: redireciona para empresa-detalhes.html
- Se não: redireciona para dashboard.html

## 🔌 Integração com API

### Padrão fetch()
```javascript
async function carregarDados() {
  try {
    const response = await fetch('/api/empresas');
    if (!response.ok) throw new Error('Erro na requisição');
    
    const empresas = await response.json();
    renderizar(empresas);
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar dados');
  }
}
```

### POST com body
```javascript
async function cadastrar() {
  const dados = {
    codigo: document.getElementById('codigo').value,
    nome: document.getElementById('nome').value,
    setor: document.getElementById('setor').value
  };
  
  const response = await fetch('/api/empresas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  
  if (response.ok) {
    alert('Cadastrado com sucesso!');
  }
}
```

## 📊 Chart.js

### Gráficos de Linha
```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['1T25', '2T25', '3T25', '4T25'],
    datasets: [{
      label: 'Lucro Líquido',
      data: [10000, 12000, 15000, 18000],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});
```

## 🎯 Toggle Menu

Funcionalidade para ocultar sidebar e ganhar espaço:

```html
<button class="toggle-menu" onclick="toggleMenu()" id="toggleBtn">
  <span id="menuIcon">☰</span>
  <span id="menuText">Ocultar Menu</span>
</button>
```

```javascript
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('toggleBtn');
  
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');
  
  const isCollapsed = sidebar.classList.contains('collapsed');
  document.getElementById('menuIcon').textContent = isCollapsed ? '☰' : '✕';
  document.getElementById('menuText').textContent = isCollapsed ? 'Mostrar Menu' : 'Ocultar Menu';
}
```

## 🎨 Classes Utilitárias

```css
.text-success    /* Verde */
.text-danger     /* Vermelho */
.text-warning    /* Amarelo */
.text-muted      /* Cinza */
.text-center     /* Centralizado */
.text-right      /* Alinhado direita */

.mt-1, .mt-2, .mt-3, .mt-4    /* Margin top */
.mb-1, .mb-2, .mb-3, .mb-4    /* Margin bottom */

.flex            /* Display flex */
.flex-between    /* Space between */
.flex-center     /* Centralizado */
.gap-1, .gap-2, .gap-3         /* Gap entre itens */
```

## 🔄 Formatação de Números

```javascript
// Formatar moeda
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Formatar número
function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

// Formatar percentual
function formatarPercentual(valor) {
  return `${valor.toFixed(2)}%`;
}

// Abreviar números grandes
function abreviar(valor) {
  if (valor >= 1000000000) return `${(valor / 1000000000).toFixed(1)}B`;
  if (valor >= 1000000) return `${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `${(valor / 1000).toFixed(1)}K`;
  return valor.toString();
}
```

## 📱 Responsividade

CSS já tem media queries para mobile:

```css
@media (max-width: 768px) {
  .sidebar {
    width: 70px; /* Sidebar colapsada */
  }
  
  .sidebar-title,
  .nav-section-title,
  .user-details {
    display: none; /* Ocultar textos */
  }
  
  .stats-grid {
    grid-template-columns: 1fr; /* 1 coluna */
  }
}
```

## ⚠️ Boas Práticas

### 1. **Sempre tratar erros**
```javascript
try {
  const dados = await fetch('/api/empresas');
  // ...
} catch (error) {
  console.error(error);
  mostrarMensagemErro('Erro ao carregar dados');
}
```

### 2. **Loading states**
```javascript
document.getElementById('loading').style.display = 'block';
await carregarDados();
document.getElementById('loading').style.display = 'none';
```

### 3. **Validação de formulários**
```javascript
if (!codigo || codigo.length < 4) {
  alert('Código inválido');
  return;
}
```

### 4. **Evitar XSS**
```javascript
// ❌ PERIGOSO
element.innerHTML = userInput;

// ✅ SEGURO
element.textContent = userInput;
```

## 🐛 Debugging

Console do navegador (F12):
```javascript
console.log('Dados:', dados);
console.table(empresas);
console.error('Erro:', error);
```

## 🚀 Melhorias Futuras

- [ ] Framework moderno (React/Vue)
- [ ] TypeScript no frontend
- [ ] Testes automatizados (Jest/Cypress)
- [ ] Service Workers (PWA)
- [ ] Dark/Light mode toggle
- [ ] Internacionalização (i18n)
- [ ] Skeleton loaders
- [ ] Infinite scroll nas tabelas
- [ ] Filtros avançados com múltipla seleção
