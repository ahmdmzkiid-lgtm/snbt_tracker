/**
 * Settings Page
 */
import { getUser, setUser, getSettings, setSettings, logoutAccount, getCurrentSession } from '../store.js';
import { showToast } from '../components/modal.js';
import { navigate } from '../router.js';
import { renderSidebar } from '../components/sidebar.js';
import { universities, majors } from '../data/universities.js';

export function renderSettings() {
  const container = document.getElementById('page-container');
  const user = getUser() || {};
  const settings = getSettings();
  const session = getCurrentSession();

  container.innerHTML = `
    <div class="settings" style="animation:fadeIn 0.4s ease;">
      <h1 style="font-size:var(--font-xl);font-weight:800;margin-bottom:var(--space-xl);">⚙️ Pengaturan</h1>

      <!-- Account Info -->
      <div class="glass-card-static" style="padding:var(--space-lg);margin-bottom:var(--space-xl);">
        <h3 style="font-weight:700;margin-bottom:var(--space-md);">Akun</h3>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-md);">
          <div style="display:flex;align-items:center;gap:var(--space-md);">
            <div style="width:44px;height:44px;background:var(--gradient-primary);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--font-lg);color:white;">${(user.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-weight:600;">${user.name || 'User'}</div>
              <div style="font-size:var(--font-xs);color:var(--text-muted);">${session?.email || 'Tidak ada email'}</div>
            </div>
          </div>
          <button class="btn-secondary" id="btn-logout" style="border-color:rgba(239,68,68,0.3);color:var(--accent-red);">
            <i data-lucide="log-out"></i> Logout
          </button>
        </div>
      </div>

      <!-- Profile -->
      <div class="glass-card-static" style="padding:var(--space-lg);margin-bottom:var(--space-xl);">
        <h3 style="font-weight:700;margin-bottom:var(--space-md);">Profil</h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-md);">
          <div>
            <label class="input-label">Nama</label>
            <input type="text" class="input-field" id="setting-name" value="${user.name || ''}" />
          </div>
          <div>
            <label class="input-label">Universitas Target</label>
            <div class="autocomplete-wrapper">
              <input type="text" class="input-field" id="setting-univ" placeholder="Cari universitas..." value="${user.targetUniv || ''}" autocomplete="off" />
              <div class="autocomplete-list hidden" id="setting-univ-list"></div>
            </div>
          </div>
          <div>
            <label class="input-label">Jurusan Target</label>
            <div class="autocomplete-wrapper">
              <input type="text" class="input-field" id="setting-major" placeholder="Cari jurusan..." value="${user.targetMajor || ''}" autocomplete="off" />
              <div class="autocomplete-list hidden" id="setting-major-list"></div>
            </div>
          </div>
          <button class="btn-primary" id="save-profile" style="align-self:flex-start;">Simpan Profil</button>
        </div>
      </div>

      <!-- Timer Settings -->
      <div class="glass-card-static" style="padding:var(--space-lg);margin-bottom:var(--space-xl);">
        <h3 style="font-weight:700;margin-bottom:var(--space-md);">Timer Pomodoro</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);">
          <div>
            <label class="input-label">Durasi Fokus (menit)</label>
            <input type="number" class="input-field" id="setting-pomodoro" value="${settings.pomodoroMinutes}" min="5" max="120" />
          </div>
          <div>
            <label class="input-label">Durasi Istirahat (menit)</label>
            <input type="number" class="input-field" id="setting-break" value="${settings.breakMinutes}" min="1" max="30" />
          </div>
        </div>
        <button class="btn-primary" id="save-timer" style="margin-top:var(--space-md);">Simpan Timer</button>
      </div>

      <!-- Reset -->
      <div class="glass-card-static" style="padding:var(--space-lg);border:1px solid rgba(239,68,68,0.2);">
        <h3 style="font-weight:700;margin-bottom:var(--space-sm);color:var(--accent-red);">⚠️ Zona Bahaya</h3>
        <p style="font-size:var(--font-sm);color:var(--text-muted);margin-bottom:var(--space-md);">Reset semua data dan mulai dari awal. Tindakan ini tidak bisa dibatalkan!</p>
        <button class="btn-secondary" id="reset-all" style="border-color:rgba(239,68,68,0.3);color:var(--accent-red);">Reset Semua Data</button>
      </div>
    </div>
  `;

  // Autocomplete setup
  const univInput = document.getElementById('setting-univ');
  const univList = document.getElementById('setting-univ-list');
  if (univInput) {
    setupAutocomplete(univInput, univList, universities.map(u => u.name), (val) => {
      univInput.value = val;
    });
  }

  const majorInput = document.getElementById('setting-major');
  const majorList = document.getElementById('setting-major-list');
  if (majorInput) {
    setupAutocomplete(majorInput, majorList, majors, (val) => {
      majorInput.value = val;
    });
  }

  // Events
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logoutAccount();
    showToast('Berhasil logout! 👋', 'info');
    navigate('#/onboarding');
  });

  document.getElementById('save-profile')?.addEventListener('click', () => {
    const name = document.getElementById('setting-name')?.value?.trim();
    const targetUniv = document.getElementById('setting-univ')?.value?.trim();
    const targetMajor = document.getElementById('setting-major')?.value?.trim();
    setUser({ ...user, name, targetUniv, targetMajor });
    renderSidebar();
    showToast('Profil disimpan! ✅', 'success');
  });

  document.getElementById('save-timer')?.addEventListener('click', () => {
    const pomodoroMinutes = parseInt(document.getElementById('setting-pomodoro')?.value) || 25;
    const breakMinutes = parseInt(document.getElementById('setting-break')?.value) || 5;
    setSettings({ pomodoroMinutes, breakMinutes });
    showToast('Pengaturan timer disimpan! ✅', 'success');
  });

  document.getElementById('reset-all')?.addEventListener('click', () => {
    if (confirm('Yakin mau reset SEMUA data? Ini tidak bisa dibatalkan! 😱')) {
      localStorage.clear();
      showToast('Data berhasil direset', 'info');
      navigate('#/onboarding');
    }
  });

  if (window.lucide) lucide.createIcons();
}

function setupAutocomplete(input, list, items, onSelect) {
  input.addEventListener('input', () => {
    const val = input.value.toLowerCase();
    if (val.length < 1) { list.classList.add('hidden'); return; }
    const filtered = items.filter(i => i.toLowerCase().includes(val)).slice(0, 8);
    if (filtered.length === 0) { list.classList.add('hidden'); return; }
    list.innerHTML = filtered.map(i => `<div class="autocomplete-item">${i}</div>`).join('');
    list.classList.remove('hidden');
    list.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        onSelect(item.textContent);
        list.classList.add('hidden');
      });
    });
  });

  input.addEventListener('blur', () => { setTimeout(() => list.classList.add('hidden'), 200); });
}
