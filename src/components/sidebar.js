/**
 * Sidebar Navigation Component
 */
import { getCurrentRoute, navigate } from '../router.js';
import { getUser } from '../store.js';

const NAV_ITEMS = [
  { hash: '#/', icon: 'layout-dashboard', label: 'Dashboard' },
  { hash: '#/syllabus', icon: 'book-open', label: 'Materi' },
  { hash: '#/tryout', icon: 'trending-up', label: 'Try-Out' },
  { hash: '#/weakness', icon: 'target', label: 'Kelemahan' },
  { hash: '#/timer', icon: 'timer', label: 'Timer' },
  { hash: '#/settings', icon: 'settings', label: 'Pengaturan' },
];

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  const current = getCurrentRoute();
  const user = getUser();

  sidebar.innerHTML = `
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon" style="background:transparent; padding:0;">
          <img src="/favicon-putih.png" alt="Logo" style="width:100%; height:100%; object-fit:contain; border-radius: var(--radius-md);" onerror="this.outerHTML='S'" />
        </div>
        <span class="sidebar__logo-text">jugijagijug0</span>
      </div>
    </div>
    ${user ? `
    <div class="sidebar__user">
      <div class="sidebar__avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
      <div class="sidebar__user-info">
        <div class="sidebar__user-name">${user.name || 'User'}</div>
        <div class="sidebar__user-target">${user.targetUniv || ''} — ${user.targetMajor || ''}</div>
      </div>
    </div>` : ''}
    <nav class="sidebar__nav">
      <ul class="sidebar__list">
        ${NAV_ITEMS.map(item => `
          <li class="sidebar__item ${current === item.hash ? 'active' : ''}" data-route="${item.hash}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
          </li>
        `).join('')}
      </ul>
    </nav>
    <div class="sidebar__footer">
      <div class="sidebar__version">v1.0 — Pejuang PTN 🎯</div>
    </div>
  `;

  // Event listeners
  sidebar.querySelectorAll('.sidebar__item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.route);
      renderSidebar(); // re-render to update active
    });
  });

  // Lucide icons
  if (window.lucide) lucide.createIcons();
}

export function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  const current = getCurrentRoute();
  const mobileItems = NAV_ITEMS.filter(i => i.hash !== '#/settings');

  nav.innerHTML = `
    <ul class="bottom-nav__items">
      ${mobileItems.map(item => `
        <li class="bottom-nav__item ${current === item.hash ? 'active' : ''}" data-route="${item.hash}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
        </li>
      `).join('')}
    </ul>
  `;

  nav.querySelectorAll('.bottom-nav__item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.route);
      renderSidebar();
      renderBottomNav();
    });
  });

  if (window.lucide) lucide.createIcons();
}
