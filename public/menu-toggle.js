// =========================================
// MENU TOGGLE PADRÃO
// Reutilizável em todas as páginas
// =========================================

/**
 * Alterna a visibilidade do menu lateral
 */
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('toggleBtn');
  const menuIcon = document.getElementById('menuIcon');
  const menuText = document.getElementById('menuText');

  if (!sidebar) {
    console.error('Sidebar não encontrado. Certifique-se de que o sidebar tem id="sidebar"');
    return;
  }

  // Toggle classes
  sidebar.classList.toggle('collapsed');

  if (mainContent) {
    mainContent.classList.toggle('expanded');
  }

  if (toggleBtn) {
    toggleBtn.classList.toggle('menu-hidden');
  }

  // Atualizar ícone e texto
  const isCollapsed = sidebar.classList.contains('collapsed');

  if (menuIcon) {
    menuIcon.textContent = isCollapsed ? '☰' : '✕';
  }

  if (menuText) {
    menuText.textContent = isCollapsed ? 'Mostrar Menu' : 'Ocultar Menu';
  }

  // Salvar preferência no localStorage
  localStorage.setItem('menuCollapsed', isCollapsed);
}

/**
 * Restaura o estado do menu do localStorage
 */
function restaurarEstadoMenu() {
  const menuCollapsed = localStorage.getItem('menuCollapsed') === 'true';

  if (menuCollapsed) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleBtn');
    const menuIcon = document.getElementById('menuIcon');
    const menuText = document.getElementById('menuText');

    if (sidebar) sidebar.classList.add('collapsed');
    if (mainContent) mainContent.classList.add('expanded');
    if (toggleBtn) toggleBtn.classList.add('menu-hidden');
    if (menuIcon) menuIcon.textContent = '☰';
    if (menuText) menuText.textContent = 'Mostrar Menu';
  }
}

// Restaurar estado ao carregar página
document.addEventListener('DOMContentLoaded', restaurarEstadoMenu);
