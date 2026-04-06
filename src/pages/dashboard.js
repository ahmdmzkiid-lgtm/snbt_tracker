/**
 * Dashboard Page — The "Cockpit"
 */
import { getUser, getReadinessPercent, getAvgTryoutScore, getStreak, getWeakTopics, getTryouts } from '../store.js';
import { navigate } from '../router.js';
import { createLineChart } from '../components/charts.js';

export function renderDashboard() {
  const container = document.getElementById('page-container');
  const user = getUser() || {};
  const readiness = getReadinessPercent();
  const avgScore = getAvgTryoutScore();
  const streak = getStreak();
  const weakTopics = getWeakTopics();
  const tryouts = getTryouts();

  const circumference = 2 * Math.PI * 65;
  const dashoffset = circumference - (readiness / 100) * circumference;

  container.innerHTML = `
    <div class="dashboard">
      <!-- Greeting -->
      <div class="dashboard__greeting">
        <h1 class="dashboard__greeting-text">Hei, ${user.name || 'Pejuang'}! Kamu <span>${readiness}%</span> siap untuk SNBT 🔥</h1>
        <p class="dashboard__target">${user.targetUniv || ''} ${user.targetMajor ? '— ' + user.targetMajor : ''}</p>
      </div>

      <!-- Hero Section: Readiness Ring -->
      <div class="dashboard__hero glass-card-static">
        <div class="readiness-ring">
          <svg viewBox="0 0 160 160" width="160" height="160">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="100%" stop-color="#06b6d4"/>
              </linearGradient>
            </defs>
            <circle class="readiness-ring__bg" cx="80" cy="80" r="65"/>
            <circle class="readiness-ring__fill" cx="80" cy="80" r="65"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashoffset}"
              style="--ring-circumference: ${circumference}"
            />
          </svg>
          <div class="readiness-ring__text">
            <div class="readiness-ring__percent">${readiness}%</div>
            <div class="readiness-ring__label">Kesiapan</div>
          </div>
        </div>
        <div class="dashboard__hero-info">
          <h2 class="dashboard__hero-title">${readiness >= 75 ? '🎉 Luar biasa!' : readiness >= 50 ? '💪 Terus semangat!' : '🚀 Ayo mulai jalan!'}</h2>
          <p class="dashboard__hero-desc">
            ${readiness >= 75
              ? 'Kamu sudah menguasai sebagian besar materi. Fokus kerjakan latihan soal dan TO untuk mempertajam!'
              : readiness >= 50
                ? 'Progress kamu sudah setengah jalan. Rajin review dan latihan soal akan bikin skor makin naik.'
                : 'Masih banyak materi yang perlu dipelajari. Mulai dari topik yang kamu paling sukai dulu!'}
          </p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-row">
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--blue"><i data-lucide="trending-up"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${avgScore || '—'}</div>
            <div class="stat-card__label">Rata-rata Skor TO</div>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--orange"><i data-lucide="flame"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${streak.current} hari</div>
            <div class="stat-card__label">Streak Belajar</div>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--red"><i data-lucide="target"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${weakTopics.length}</div>
            <div class="stat-card__label">Topik Lemah</div>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--cyan"><i data-lucide="book-open"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${tryouts.length}</div>
            <div class="stat-card__label">Total Try-Out</div>
          </div>
        </div>
      </div>

      <!-- Score Trend Chart -->
      <div class="dashboard__chart glass-card-static">
        <div class="dashboard__chart-header">
          <h3 class="section-title"><i data-lucide="line-chart"></i> Trend Skor TO</h3>
          ${tryouts.length > 0 ? '' : ''}
        </div>
        <div class="chart-container">
          ${tryouts.length > 0
            ? '<canvas id="dashboard-chart"></canvas>'
            : '<div class="empty-state"><i data-lucide="bar-chart-3" style="width:48px;height:48px;"></i><p class="empty-state__text">Belum ada data TO. Input skor TO pertama kamu!</p><button class="btn-primary" id="goto-tryout"><i data-lucide="plus"></i> Input Skor TO</button></div>'
          }
        </div>
      </div>

      <!-- Weak Topics -->
      ${weakTopics.length > 0 ? `
      <div class="weak-topics">
        <h3 class="section-title"><i data-lucide="alert-triangle"></i> Topik yang Perlu Diperhatikan</h3>
        <div class="weak-topics__grid">
          ${weakTopics.map(t => `
            <div class="weak-topic-card glass-card" data-cat="${t.categoryId}" data-topic="${t.id}">
              <span class="weak-topic-card__cat">${t.categoryName}</span>
              <span class="weak-topic-card__name">${t.name}</span>
              <span class="status-pill status-pill--${t.status === 'belum' ? 'red' : 'blue'}">${t.status === 'belum' ? 'Belum Disentuh' : 'Paham Teori'}</span>
              <button class="btn-ghost" data-goto-syllabus>Pelajari →</button>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Streak -->
      <div class="dashboard__streak glass-card-static">
        <div class="streak__fire">${streak.current > 0 ? '🔥' : '❄️'}</div>
        <div class="streak__info">
          <div class="streak__count">${streak.current > 0 ? `${streak.current} hari streak!` : 'Belum ada streak'}</div>
          <div class="streak__label">Rekor terbaik: ${streak.best} hari</div>
        </div>
        ${streak.badges.length > 0 ? `
        <div class="streak__badges">
          ${streak.badges.map(b => `<span class="streak__badge">${b}</span>`).join('')}
        </div>` : ''}
      </div>
    </div>
  `;

  // Events
  document.getElementById('goto-tryout')?.addEventListener('click', () => navigate('#/tryout'));
  document.querySelectorAll('[data-goto-syllabus]').forEach(btn => btn.addEventListener('click', () => navigate('#/syllabus')));

  if (window.lucide) lucide.createIcons();

  // Render chart if data exists
  if (tryouts.length > 0) {
    const labels = tryouts.map((t, i) => t.platform ? `${t.platform} ${i + 1}` : `TO ${i + 1}`);
    createLineChart('dashboard-chart', labels, [
      {
        label: 'Rata-rata Skor',
        data: tryouts.map(t => Math.round((t.totalScore || 0) / 4)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
      },
    ], { yScale: { min: 0, max: 1000 } });
  }
}
