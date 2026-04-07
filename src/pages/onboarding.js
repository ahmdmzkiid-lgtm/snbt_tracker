/**
 * Onboarding Page — 2-step flow
 * Step 1: Auth (Login/Register)
 * Step 2: Profile (Name, Target PTN & Jurusan)
 */
import { setUser, getUser, registerAccount, loginAccount, isLoggedIn, isOnboarded } from '../store.js';
import { navigate } from '../router.js';
import { universities, majors } from '../data/universities.js';

let currentStep = 1;
let authMode = 'register'; // 'register' | 'login'
let authError = '';
let userData = { name: '', targetUniv: '', targetUnivId: '', targetMajor: '' };
let isAuthLoading = false;

export function renderOnboarding() {
  const app = document.getElementById('app');
  app.classList.add('app--onboarding');

  // If already logged in but not onboarded, skip to step 2
  if (isLoggedIn() && !isOnboarded()) {
    currentStep = 2;
    userData = getUser() || userData;
  }

  const container = document.getElementById('page-container');
  container.innerHTML = `<div class="onboarding"><div class="onboarding__card glass-card-static" id="onboarding-card"></div></div>`;
  renderStep();
}

function renderStep() {
  const card = document.getElementById('onboarding-card');
  if (!card) return;

  const steps = [renderStep1Auth, renderStep2Profile];
  card.innerHTML = `
    <div class="onboarding__step-indicator">
      ${[1, 2].map(s => `<div class="onboarding__dot ${s === currentStep ? 'active' : ''} ${s < currentStep ? 'done' : ''}"></div>`).join('')}
    </div>
    ${steps[currentStep - 1]()}
  `;

  attachStepEvents();
  if (window.lucide) lucide.createIcons();
}

function renderStep1Auth() {
  const isLogin = authMode === 'login';
  return `
    <h2 class="onboarding__title">${isLogin ? 'Selamat Datang Kembali! 👋' : 'Buat Akun Kamu 🔐'}</h2>
    <p class="onboarding__subtitle">${isLogin ? 'Login untuk melanjutkan perjalanan SNBT kamu.' : 'Daftar agar data kamu tersimpan dan aman.'}</p>

    ${authError ? `<div class="auth-error"><i data-lucide="alert-circle"></i> ${authError}</div>` : ''}

    <div class="onboarding__form">
      <div>
        <label class="input-label">Email</label>
        <div class="input-icon-wrapper">
          <i data-lucide="mail" class="input-icon"></i>
          <input type="email" class="input-field input-field--icon" id="auth-email" placeholder="nama@email.com" autocomplete="email" />
        </div>
      </div>
      <div>
        <label class="input-label">Password</label>
        <div class="input-icon-wrapper">
          <i data-lucide="lock" class="input-icon"></i>
          <input type="password" class="input-field input-field--icon" id="auth-password" placeholder="${isLogin ? 'Masukkan password' : 'Buat password (min. 4 karakter)'}" autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
        </div>
      </div>

      ${!isLogin ? `
      <div>
        <label class="input-label">Konfirmasi Password</label>
        <div class="input-icon-wrapper">
          <i data-lucide="lock" class="input-icon"></i>
          <input type="password" class="input-field input-field--icon" id="auth-confirm" placeholder="Ulangi password" autocomplete="new-password" />
        </div>
      </div>` : ''}

      <div class="onboarding__actions" style="flex-direction:column;gap:var(--space-md);">
        <button class="btn-primary" id="btn-auth" style="width:100%;padding:14px;" ${isAuthLoading ? 'disabled' : ''}>
          <i data-lucide="${isAuthLoading ? 'loader-2' : (isLogin ? 'log-in' : 'user-plus')}" class="${isAuthLoading ? 'spin' : ''}"></i>
          ${isAuthLoading ? 'Memproses...' : (isLogin ? 'Login' : 'Daftar & Lanjut')}
        </button>
        <div class="auth-toggle">
          ${isLogin
            ? `Belum punya akun? <button id="toggle-auth" class="auth-toggle__link" ${isAuthLoading ? 'disabled' : ''}>Daftar di sini</button>`
            : `Sudah punya akun? <button id="toggle-auth" class="auth-toggle__link" ${isAuthLoading ? 'disabled' : ''}>Login</button>`}
        </div>
      </div>
    </div>
  `;
}

function renderStep2Profile() {
  return `
    <h2 class="onboarding__title">Target Kamu Apa? 🎯</h2>
    <p class="onboarding__subtitle">Isi profil agar tracker ini makin personal.</p>
    
    ${authError ? `<div class="auth-error"><i data-lucide="alert-circle"></i> ${authError}</div>` : ''}

    <div class="onboarding__form">
      <div>
        <label class="input-label">Nama Lengkap</label>
        <input type="text" class="input-field" id="input-name" placeholder="Panggilan akrabmu..." value="${userData.name}" autofocus />
      </div>
      <div>
        <label class="input-label">Universitas Impian</label>
        <div class="autocomplete-wrapper">
          <input type="text" class="input-field" id="input-univ" placeholder="Cari universitas..." value="${userData.targetUniv}" autocomplete="off" />
          <div class="autocomplete-list hidden" id="univ-list"></div>
        </div>
        ${userData.targetUniv ? `<div class="chip-selected">${userData.targetUniv} <button id="clear-univ">✕</button></div>` : ''}
      </div>
      <div>
        <label class="input-label">Jurusan Target</label>
        <div class="autocomplete-wrapper">
          <input type="text" class="input-field" id="input-major" placeholder="Cari jurusan..." value="${userData.targetMajor}" autocomplete="off" />
          <div class="autocomplete-list hidden" id="major-list"></div>
        </div>
        ${userData.targetMajor ? `<div class="chip-selected">${userData.targetMajor} <button id="clear-major">✕</button></div>` : ''}
      </div>
      
      <div class="onboarding__actions" style="margin-top:var(--space-lg);">
        <button class="btn-primary" id="btn-finish" style="width:100%;padding:14px;" ${isAuthLoading ? 'disabled' : ''}>
          <i data-lucide="${isAuthLoading ? 'loader-2' : 'rocket'}" class="${isAuthLoading ? 'spin' : ''}"></i>
          ${isAuthLoading ? 'Menyiapkan Dashboard...' : 'Set Target & Mulai Belajar! 🚀'}
        </button>
      </div>
    </div>
  `;
}

function attachStepEvents() {
  if (currentStep === 1) {
    const isLogin = authMode === 'login';
    const toggleAuth = document.getElementById('toggle-auth');
    if (toggleAuth) {
      toggleAuth.addEventListener('click', () => {
        authMode = isLogin ? 'register' : 'login';
        authError = '';
        renderStep();
      });
    }

    const btnAuth = document.getElementById('btn-auth');
    if (btnAuth) btnAuth.addEventListener('click', handleAuth);

    // Enter keys
    const authIds = ['auth-email', 'auth-password', 'auth-confirm'];
    authIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handleAuth();
        });
      }
    });
  } else if (currentStep === 2) {
    const nameInput = document.getElementById('input-name');
    if (nameInput) {
      nameInput.addEventListener('input', () => { userData.name = nameInput.value; });
    }

    const univInput = document.getElementById('input-univ');
    const univList = document.getElementById('univ-list');
    if (univInput) {
      setupAutocomplete(univInput, univList, universities.map(u => u.name), (val) => {
        userData.targetUniv = val;
        userData.targetUnivId = universities.find(u => u.name === val)?.id || '';
        renderStep();
      });
    }

    const clearUniv = document.getElementById('clear-univ');
    if (clearUniv) {
      clearUniv.addEventListener('click', () => { userData.targetUniv = ''; userData.targetUnivId = ''; renderStep(); });
    }

    const majorInput = document.getElementById('input-major');
    const majorList = document.getElementById('major-list');
    if (majorInput) {
      setupAutocomplete(majorInput, majorList, majors, (val) => {
        userData.targetMajor = val;
        renderStep();
      });
    }

    const clearMajor = document.getElementById('clear-major');
    if (clearMajor) {
      clearMajor.addEventListener('click', () => { userData.targetMajor = ''; renderStep(); });
    }

    const btnFinish = document.getElementById('btn-finish');
    if (btnFinish) btnFinish.addEventListener('click', handleProfileFinish);
  }
}

async function handleAuth() {
  if (isAuthLoading) return;
  
  const email = document.getElementById('auth-email')?.value?.trim();
  const password = document.getElementById('auth-password')?.value;
  const isLogin = authMode === 'login';

  console.log(`handleAuth triggered [mode=${authMode}] for:`, email);

  if (!email || !password) {
    console.warn('Auth failed: Email or password missing');
    authError = 'Email dan password harus diisi.';
    renderStep();
    return;
  }

  if (!isLogin) {
    const confirm = document.getElementById('auth-confirm')?.value;
    if (password !== confirm) {
      console.warn('Auth failed: Password mismatch');
      authError = 'Password dan konfirmasi tidak cocok!';
      renderStep();
      return;
    }

    console.log('Attempting to register...');
    isAuthLoading = true;
    renderStep();
    
    const result = await registerAccount(email, password);
    console.log('Register result:', result);

    isAuthLoading = false;
    if (!result.ok) {
      authError = result.error;
      renderStep();
      return;
    }
    // Success register, go to profile step
    authError = '';
    currentStep = 2;
    renderStep();
  } else {
    console.log('Attempting to login...');
    isAuthLoading = true;
    renderStep();

    const result = await loginAccount(email, password);
    console.log('Login result:', result);

    isAuthLoading = false;
    if (!result.ok) {
      authError = result.error;
      renderStep();
      return;
    }
    // Success login. Check if profile exists
    if (isOnboarded()) {
      finishOnboarding();
    } else {
      authError = '';
      currentStep = 2;
      userData = getUser() || userData;
      renderStep();
    }
  }
}


async function handleProfileFinish() {
  if (isAuthLoading) return;

  const name = document.getElementById('input-name')?.value?.trim();
  const univ = document.getElementById('input-univ')?.value?.trim();
  const major = document.getElementById('input-major')?.value?.trim();

  if (!name || !univ || !major) {
    authError = 'Semua data profil wajib diisi agar optimal.';
    renderStep();
    return;
  }

  userData.name = name;
  userData.targetUniv = univ;
  userData.targetMajor = major;

  isAuthLoading = true;
  renderStep();

  // Simulate a bit of loading for UX
  await new Promise(r => setTimeout(r, 600));

  setUser(userData);
  isAuthLoading = false;
  finishOnboarding();
}

function finishOnboarding() {
  const app = document.getElementById('app');
  app.classList.remove('app--onboarding');
  authError = '';
  navigate('#/');
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

export function cleanupOnboarding() {
  const app = document.getElementById('app');
  app.classList.remove('app--onboarding');
}
