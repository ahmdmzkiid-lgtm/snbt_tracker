/**
 * Try-Out Analytics Page
 */
import { getTryouts, addTryout, deleteTryout, getAvgTryoutScore } from '../store.js';
import { showModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/modal.js';
import { createLineChart, createBarChart } from '../components/charts.js';

export function renderTryout() {
  const container = document.getElementById('page-container');
  const tryouts = getTryouts();
  const avgScore = getAvgTryoutScore();
  const highScore = tryouts.length > 0 ? Math.max(...tryouts.map(t => t.totalScore || 0)) : 0;

  // Determine trend
  let trend = '—';
  if (tryouts.length >= 2) {
    const last = tryouts[tryouts.length - 1].totalScore || 0;
    const prev = tryouts[tryouts.length - 2].totalScore || 0;
    trend = last > prev ? '↑ Naik' : last < prev ? '↓ Turun' : '→ Stabil';
  }

  container.innerHTML = `
    <div class="tryout">
      <div class="tryout__header">
        <h1>📈 Try-Out Analytics</h1>
        <button class="btn-primary" id="btn-add-to"><i data-lucide="plus"></i> Input Skor TO</button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--green"><i data-lucide="trophy"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${highScore || '—'}</div>
            <div class="stat-card__label">Skor Tertinggi</div>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--blue"><i data-lucide="bar-chart-3"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${avgScore || '—'}</div>
            <div class="stat-card__label">Rata-rata</div>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-card__icon stat-card__icon--cyan"><i data-lucide="trending-up"></i></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${trend}</div>
            <div class="stat-card__label">Trend</div>
          </div>
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="tryout__chart glass-card-static">
        <h3 class="tryout__chart-title">Perkembangan Skor</h3>
        <div class="chart-container">
          ${tryouts.length > 0
            ? '<canvas id="tryout-trend-chart"></canvas>'
            : '<div class="empty-state"><i data-lucide="line-chart" style="width:48px;height:48px;"></i><p class="empty-state__text">Belum ada data. Input skor TO pertama!</p></div>'}
        </div>
      </div>

      <!-- Score Breakdown Chart -->
      ${tryouts.length > 0 ? `
      <div class="tryout__chart glass-card-static">
        <h3 class="tryout__chart-title">Skor per Subtes (TO Terakhir)</h3>
        <div class="chart-container">
          <canvas id="tryout-breakdown-chart"></canvas>
        </div>
      </div>` : ''}

      <!-- History Table -->
      <div class="tryout__history glass-card-static">
        <h3 class="section-title"><i data-lucide="history"></i> Riwayat Try-Out</h3>
        ${tryouts.length > 0 ? `
        <div class="tryout-table-wrapper">
          <table class="tryout-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Platform</th>
                <th>TPS</th>
                <th>Lit. Indo</th>
                <th>Lit. Eng</th>
                <th>Pen. Mat</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${tryouts.slice().reverse().map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.platform || '-'}</td>
                  <td>${t.tps || '-'}</td>
                  <td>${t.lid || '-'}</td>
                  <td>${t.len || '-'}</td>
                  <td>${t.pm || '-'}</td>
                  <td class="${getScoreClass(t.totalScore)}">${t.totalScore || '-'}</td>
                  <td><button class="delete-btn" data-delete-to="${t.id}"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>` : '<p style="color:var(--text-muted);font-size:var(--font-sm);margin-top:var(--space-md);">Belum ada riwayat TO.</p>'}
      </div>
    </div>
  `;

  // Events
  document.getElementById('btn-add-to')?.addEventListener('click', openTOModal);
  document.querySelectorAll('[data-delete-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteTryout(parseInt(btn.dataset.deleteTo));
      showToast('Try-Out dihapus', 'info');
      renderTryout();
    });
  });

  if (window.lucide) lucide.createIcons();

  // Charts
  if (tryouts.length > 0) {
    const labels = tryouts.map((t, i) => `TO ${i + 1}`);

    createLineChart('tryout-trend-chart', labels, [
      { label: 'Rata-rata Skor', data: tryouts.map(t => Math.round((t.totalScore || 0) / 4)), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true },
      { label: 'TPS', data: tryouts.map(t => t.tps || 0), borderColor: '#a855f7', fill: false },
      { label: 'Literasi Indo', data: tryouts.map(t => t.lid || 0), borderColor: '#22c55e', fill: false },
      { label: 'Literasi Eng', data: tryouts.map(t => t.len || 0), borderColor: '#eab308', fill: false },
      { label: 'Pen. Mat', data: tryouts.map(t => t.pm || 0), borderColor: '#f97316', fill: false },
    ], { yScale: { min: 0, max: 1000 } });

    // Breakdown bar chart for latest TO
    const latest = tryouts[tryouts.length - 1];
    createBarChart('tryout-breakdown-chart',
      ['TPS', 'Lit. Indo', 'Lit. Eng', 'Pen. Mat'],
      [{
        label: 'Skor',
        data: [latest.tps || 0, latest.lid || 0, latest.len || 0, latest.pm || 0],
        backgroundColor: ['rgba(168,85,247,0.7)', 'rgba(34,197,94,0.7)', 'rgba(234,179,8,0.7)', 'rgba(249,115,22,0.7)'],
      }]
    );
  }
}

function getScoreClass(score) {
  if (!score) return '';
  if (score >= 700) return 'score-high';
  if (score >= 500) return 'score-mid';
  return 'score-low';
}

function openTOModal() {
  const content = `
    <div class="to-form">
      <div class="form-group">
        <label class="input-label">Platform TO</label>
        <input type="text" class="input-field" id="to-platform" placeholder="e.g. Ruangguru, Quipper, dll" />
      </div>
      <div class="form-group">
        <label class="input-label">Tanggal</label>
        <input type="date" class="input-field" id="to-date" value="${new Date().toISOString().slice(0, 10)}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="input-label">Skor TPS</label>
          <input type="number" class="input-field" id="to-tps" placeholder="0" min="0" max="1000" />
        </div>
        <div class="form-group">
          <label class="input-label">Skor Literasi Indo</label>
          <input type="number" class="input-field" id="to-lid" placeholder="0" min="0" max="1000" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="input-label">Skor Literasi Eng</label>
          <input type="number" class="input-field" id="to-len" placeholder="0" min="0" max="1000" />
        </div>
        <div class="form-group">
          <label class="input-label">Skor Penalaran Mat</label>
          <input type="number" class="input-field" id="to-pm" placeholder="0" min="0" max="1000" />
        </div>
      </div>
    </div>
  `;

  showModal('Input Skor Try-Out', content, [
    { label: 'Batal', action: 'close', class: 'btn-secondary' },
    {
      label: 'Simpan',
      action: 'save',
      class: 'btn-primary',
      handler: (overlay) => {
        const tps = parseInt(document.getElementById('to-tps')?.value) || 0;
        const lid = parseInt(document.getElementById('to-lid')?.value) || 0;
        const len = parseInt(document.getElementById('to-len')?.value) || 0;
        const pm = parseInt(document.getElementById('to-pm')?.value) || 0;
        const totalScore = tps + lid + len + pm;
        const platform = document.getElementById('to-platform')?.value || '';
        const date = document.getElementById('to-date')?.value || new Date().toISOString().slice(0, 10);

        if (totalScore === 0) {
          showToast('Isi minimal satu skor!', 'error');
          return;
        }

        addTryout({ tps, lid, len, pm, totalScore, platform, date });
        closeModal(overlay);
        showToast('Skor TO berhasil disimpan! 🎉', 'success');
        renderTryout();
      },
    },
  ]);
}
