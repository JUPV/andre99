# 🎨 Guia de Padronização da Interface

## 📋 Visão Geral

Este documento define os padrões de interface para todas as páginas do sistema Fundamentus Analytics.

## 🏗️ Estrutura Padrão de Página

### 1. Template HTML Básico

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Nome da Página] - Fundamentus Analytics</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="menu-toggle.css">
  <!-- Scripts específicos da página -->
</head>
<body>
  <div class="app-container">
    <!-- Botão Toggle Menu (opcional, para páginas que precisam) -->
    <button class="toggle-menu" onclick="toggleMenu()" id="toggleBtn">
      <span id="menuIcon">✕</span>
      <span id="menuText">Ocultar Menu</span>
    </button>

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
      <!-- Conteúdo do sidebar aqui -->
    </aside>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="main-content" id="mainContent">
      <!-- Conteúdo da página aqui -->
    </main>
  </div>

  <!-- Scripts -->
  <script src="menu-toggle.js"></script>
  <!-- Scripts específicos da página -->
</body>
</html>
```

## 🎛️ Componentes Padronizados

### Sidebar (Menu Lateral)

**Estrutura fixa para TODAS as páginas:**

```html
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">📈</div>
    <div class="sidebar-title">Fundamentus</div>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section">
      <div class="nav-section-title">Principal</div>
      <a href="dashboard.html" class="nav-item">
        <span class="nav-icon">📊</span>
        <span>Dashboard</span>
      </a>
      <a href="empresas.html" class="nav-item">
        <span class="nav-icon">🏢</span>
        <span>Empresas</span>
      </a>
    </div>

    <div class="nav-section">
      <div class="nav-section-title">Gerenciamento</div>
      <a href="cadastro.html" class="nav-item">
        <span class="nav-icon">➕</span>
        <span>Nova Empresa</span>
      </a>
      <a href="status-coletas.html" class="nav-item">
        <span class="nav-icon">🔄</span>
        <span>Status Coletas</span>
      </a>
      <a href="relatorios.html" class="nav-item">
        <span class="nav-icon">📄</span>
        <span>Relatórios</span>
      </a>
    </div>

    <div class="nav-section">
      <div class="nav-section-title">Análise</div>
      <a href="comparativo.html" class="nav-item">
        <span class="nav-icon">📈</span>
        <span>Comparativos</span>
      </a>
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="user-info">
      <div class="user-avatar">A</div>
      <div class="user-details">
        <div class="user-name">André</div>
        <div class="user-role">Administrador</div>
      </div>
    </div>
  </div>
</aside>
```

**⚠️ IMPORTANTE:**
- NÃO incluir o item "Relatórios" duplicado na seção "Análise"
- Usar sempre `id="sidebar"` no aside para o toggle funcionar
- Marcar como `active` apenas o item da página atual

### Botão Toggle Menu

**Quando usar:**
- ✅ Páginas com muito conteúdo horizontal (tabelas largas, gráficos)
- ✅ Páginas onde o usuário pode precisar de mais espaço
- ❌ Páginas simples de formulário

**Como incluir:**

1. **HTML (antes do sidebar):**
```html
<button class="toggle-menu" onclick="toggleMenu()" id="toggleBtn">
  <span id="menuIcon">✕</span>
  <span id="menuText">Ocultar Menu</span>
</button>
```

2. **CSS (no head):**
```html
<link rel="stylesheet" href="menu-toggle.css">
```

3. **JavaScript (antes do </body>):**
```html
<script src="menu-toggle.js"></script>
```

### Topbar (Barra Superior)

```html
<div class="topbar">
  <div class="topbar-left">
    <h1 class="page-title">[Título da Página]</h1>
  </div>
  <div class="topbar-right">
    <!-- Botões de ação aqui -->
    <button class="topbar-btn" onclick="funcaoAtualizar()">
      <span>🔄</span>
      <span>Atualizar</span>
    </button>
  </div>
</div>
```

## 📄 Páginas do Sistema

### Lista de Páginas

| Página | Arquivo | Toggle Menu | Status |
|--------|---------|-------------|--------|
| **Principal** ||||
| Dashboard | `dashboard.html` | ❌ Não | ✅ Padrão |
| Empresas | `empresas.html` | ❌ Não | ✅ Padrão |
| **Gerenciamento** ||||
| Nova Empresa | `cadastro.html` | ❌ Não | ✅ Padrão |
| Status Coletas | `status-coletas.html` | ❌ Não | ✅ Padrão |
| Relatórios | `relatorios.html` | ✅ Sim | ⚠️ Precisa ajuste |
| **Análise** ||||
| Comparativos | `comparativo.html` | ✅ Sim | ⚠️ Precisa ajuste |
| **Detalhes** ||||
| Empresa Detalhes | `empresa-detalhes.html` | ✅ Sim | ✅ Padrão |

## 🔧 Problemas Encontrados e Soluções

### 1. ❌ Problema: "Relatórios" Duplicado

**Descrição:** Item "Relatórios" aparece duas vezes no menu:
- Uma em "Gerenciamento" (funcional)
- Outra em "Análise" (placeholder "Em breve!")

**Solução:**
```html
<!-- REMOVER este item de TODAS as páginas: -->
<a href="#" class="nav-item" onclick="alert('Em breve!'); return false;">
  <span class="nav-icon">📑</span>
  <span>Relatórios</span>
</a>

<!-- MANTER apenas este (na seção Gerenciamento): -->
<a href="relatorios.html" class="nav-item">
  <span class="nav-icon">📄</span>
  <span>Relatórios</span>
</a>
```

### 2. ❌ Problema: Toggle Menu Inconsistente

**Descrição:** Algumas páginas têm botão toggle, outras não, sem critério claro.

**Solução:** Adicionar toggle apenas onde faz sentido:
- ✅ `relatorios.html` - Muitas tabelas e logs
- ✅ `comparativo.html` - Tabela comparativa larga
- ✅ `empresa-detalhes.html` - Gráficos e tabelas
- ❌ Outras páginas - Não precisam

### 3. ❌ Problema: Estrutura de Menu Diferente

**Descrição:** `relatorios.html` tem estrutura de menu diferente (seção "Sistema" ao invés de padrão).

**Solução:** Usar estrutura padrão em todas as páginas.

## 📝 IDs Obrigatórios

Para o sistema funcionar corretamente, os seguintes IDs devem estar presentes:

```html
<!-- Sidebar -->
<aside class="sidebar" id="sidebar">

<!-- Main Content -->
<main class="main-content" id="mainContent">

<!-- Toggle Button (se presente) -->
<button class="toggle-menu" id="toggleBtn">
  <span id="menuIcon">✕</span>
  <span id="menuText">Ocultar Menu</span>
</button>
```

## 🎨 Classes CSS Padronizadas

### Layout
- `.app-container` - Container principal
- `.sidebar` - Menu lateral
- `.main-content` - Área de conteúdo
- `.topbar` - Barra superior

### Sidebar
- `.sidebar-header` - Cabeçalho do menu
- `.sidebar-nav` - Navegação
- `.nav-section` - Seção de itens
- `.nav-item` - Item de menu
- `.nav-item.active` - Item ativo
- `.sidebar-footer` - Rodapé do menu

### Toggle
- `.toggle-menu` - Botão toggle
- `.sidebar.collapsed` - Menu recolhido
- `.main-content.expanded` - Conteúdo expandido
- `.toggle-menu.menu-hidden` - Toggle quando menu oculto

### Botões
- `.topbar-btn` - Botão padrão na topbar
- `.topbar-btn.primary` - Botão primário
- `.btn` - Botão padrão
- `.btn-primary` - Botão primário
- `.btn-outline` - Botão outline

## ✅ Checklist de Padronização

Ao criar ou atualizar uma página, verificar:

- [ ] Estrutura HTML segue o template
- [ ] Sidebar usa estrutura padrão
- [ ] NÃO tem "Relatórios" duplicado
- [ ] Item ativo marcado corretamente
- [ ] IDs obrigatórios presentes
- [ ] Toggle menu (se necessário) implementado corretamente
- [ ] Scripts incluídos na ordem correta
- [ ] Topbar com título e botões apropriados
- [ ] Responsividade testada
- [ ] LocalStorage de toggle funcionando

## 🚀 Como Aplicar em uma Página Existente

### Passo 1: Verificar Estrutura
```bash
# Verificar se tem IDs corretos
grep -n 'id="sidebar"' arquivo.html
grep -n 'id="mainContent"' arquivo.html
```

### Passo 2: Atualizar Sidebar
- Copiar sidebar padrão deste documento
- Marcar item correto como `active`
- Remover duplicatas

### Passo 3: Adicionar Toggle (se necessário)
```html
<!-- No head -->
<link rel="stylesheet" href="menu-toggle.css">

<!-- Antes do sidebar -->
<button class="toggle-menu" onclick="toggleMenu()" id="toggleBtn">
  <span id="menuIcon">✕</span>
  <span id="menuText">Ocultar Menu</span>
</button>

<!-- Antes do </body> -->
<script src="menu-toggle.js"></script>
```

### Passo 4: Testar
- [ ] Menu abre/fecha ao clicar no toggle
- [ ] Estado persiste ao recarregar página
- [ ] Navegação entre páginas funciona
- [ ] Item ativo está correto
- [ ] Sem erros no console

## 📚 Arquivos de Referência

### Arquivos Criados
- `public/menu-toggle.js` - Lógica do menu toggle
- `public/menu-toggle.css` - Estilos do toggle
- `PADRONIZACAO-INTERFACE.md` - Este documento

### Arquivos para Atualizar
1. ✅ `public/comparativo.html` - Remover duplicata, ajustar sidebar
2. ✅ `public/relatorios.html` - Padronizar sidebar
3. ✅ `public/dashboard.html` - Remover duplicata
4. ✅ `public/empresas.html` - Remover duplicata
5. ✅ `public/cadastro.html` - Remover duplicata
6. ✅ `public/status-coletas.html` - Remover duplicata
7. ✅ `public/empresa-detalhes.html` - Remover duplicata

## 💡 Boas Práticas

### ✅ FAÇA
- Use estrutura padrão de sidebar em todas as páginas
- Mantenha IDs consistentes
- Teste toggle menu ao adicionar
- Documente desvios do padrão

### ❌ NÃO FAÇA
- Não crie variações do sidebar
- Não adicione itens de menu sem critério
- Não duplique funcionalidades
- Não remova IDs obrigatórios

## 🐛 Troubleshooting

### Toggle não funciona
**Problema:** Botão não abre/fecha menu

**Soluções:**
1. Verificar se `menu-toggle.js` está incluído
2. Verificar se IDs estão corretos (`sidebar`, `mainContent`, `toggleBtn`)
3. Verificar console do navegador para erros

### Menu não persiste estado
**Problema:** Estado do menu não é salvo

**Solução:** Verificar se localStorage está habilitado no navegador

### Sidebar diferente em cada página
**Problema:** Menus inconsistentes

**Solução:** Copiar sidebar padrão deste documento para todas as páginas

---

## 📊 Status da Padronização

| Componente | Status | Data |
|-----------|--------|------|
| Template HTML | ✅ Definido | 11/05/2026 |
| Sidebar Padrão | ✅ Definido | 11/05/2026 |
| Toggle Menu | ✅ Implementado | 11/05/2026 |
| Documentação | ✅ Completa | 11/05/2026 |
| Aplicação nas Páginas | ⏳ Em andamento | 11/05/2026 |

---

**Última atualização:** 11 de Maio de 2026
**Responsável:** Sistema de Padronização
**Versão:** 1.0
