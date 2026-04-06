/**
 * Toast Notification Utility
 */
export function showToast(message, type = 'info', duration = 3000) {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  root.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Modal Utility
 */
export function showModal(title, contentHTML, actions = []) {
  const root = document.getElementById('modal-root');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
        <button class="modal__close" data-action="close"><i data-lucide="x"></i></button>
      </div>
      <div class="modal__body">${contentHTML}</div>
      ${actions.length > 0 ? `
        <div class="modal__footer">
          ${actions.map(a => `<button class="${a.class || 'btn-secondary'}" data-action="${a.action}">${a.label}</button>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  root.appendChild(overlay);
  if (window.lucide) lucide.createIcons();

  // Close handler
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('[data-action="close"]')) {
      closeModal(overlay);
    }
    actions.forEach(a => {
      if (e.target.closest(`[data-action="${a.action}"]`) && a.handler) {
        a.handler(overlay);
      }
    });
  });

  // animate in
  requestAnimationFrame(() => overlay.classList.add('active'));
  return overlay;
}

export function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}
