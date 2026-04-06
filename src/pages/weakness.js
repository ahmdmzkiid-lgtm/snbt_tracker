/**
 * Weakness Radar Page
 */
import { getSyllabus, getWeakTopics, getErrorLog, addErrorEntry, deleteErrorEntry } from '../store.js';
import { STATUS_MAP } from '../data/syllabus.js';
import { createRadarChart } from '../components/charts.js';
import { showModal, closeModal, showToast } from '../components/modal.js';

export function renderWeakness() {
  const container = document.getElementById('page-container');
  const syllabus = getSyllabus();
  const weakTopics = getWeakTopics();
  const errorLog = getErrorLog();

  // Calculate mastery per category for radar
  const radarLabels = syllabus.map(c => c.name.replace('Tes Potensi Skolastik (TPS)', 'TPS').replace('Literasi Bahasa Indonesia', 'Lit. Indo').replace('Literasi Bahasa Inggris', 'Lit. Eng').replace('Penalaran Matematika', 'Pen. Mat'));
  const radarData = syllabus.map(cat => {
    const total = cat.topics.length;
    const sum = cat.topics.reduce((s, t) => s + (STATUS_MAP[t.status]?.weight || 0), 0);
    return total > 0 ? Math.round((sum / total) * 100) : 0;
  });

  container.innerHTML = `
    <div class="weakness">
      <div class="weakness__header">
        <h1>🎯 Weakness Radar</h1>
      </div>

      <div class="weakness__grid">
        <!-- Radar Chart -->
        <div class="weakness__radar-card glass-card-static">
          <h3 class="weakness__card-title">Penguasaan per Subtes</h3>
          <div class="radar-container">
            <canvas id="weakness-radar"></canvas>
          </div>
        </div>

        <!-- Priority List -->
        <div class="weakness__priority-card glass-card-static">
          <h3 class="weakness__card-title">🔴 Prioritas Belajar</h3>
          ${weakTopics.length > 0 ? `
          <div class="priority-list">
            ${weakTopics.map((t, i) => `
              <div class="priority-item">
                <div class="priority-item__rank">${i + 1}</div>
                <div class="priority-item__info">
                  <div class="priority-item__name">${t.name}</div>
                  <div class="priority-item__cat">${t.categoryName}</div>
                </div>
                <span class="status-pill status-pill--${t.status === 'belum' ? 'red' : 'blue'}" style="font-size:10px;">${STATUS_MAP[t.status].label}</span>
              </div>
            `).join('')}
          </div>
          ` : '<p style="color:var(--text-muted);font-size:var(--font-sm);">🎉 Tidak ada topik lemah! Semua sudah di tahap latihan atau mastered.</p>'}
        </div>
      </div>

      <!-- Error Log -->
      <div class="weakness__error-log glass-card-static">
        <div class="error-log__header">
          <h3 class="section-title"><i data-lucide="book-x"></i> Bank Soal Salah</h3>
          <button class="btn-primary" id="btn-add-error" style="padding:8px 16px;font-size:var(--font-xs);">
            <i data-lucide="plus"></i> Tambah Soal
          </button>
        </div>

        ${errorLog.length > 0 ? `
        <div class="error-log__list">
          ${errorLog.slice().reverse().map(e => `
            <div class="error-entry">
              <div class="error-entry__question">❓ ${e.question}</div>
              <div class="error-entry__answer">✅ Jawaban: ${e.answer}</div>
              <div class="error-entry__topic">📁 ${e.topic}</div>
              <div class="error-entry__meta">
                <span class="error-entry__date">${e.date}</span>
                <button class="error-entry__delete" data-delete-error="${e.id}">Hapus</button>
              </div>
            </div>
          `).join('')}
        </div>
        ` : '<p style="color:var(--text-muted);font-size:var(--font-sm);margin-top:var(--space-md);">Belum ada catatan soal salah. Mulai catat soal yang sering salah!</p>'}
      </div>
    </div>
  `;

  // Events
  document.getElementById('btn-add-error')?.addEventListener('click', openErrorModal);
  document.querySelectorAll('[data-delete-error]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteErrorEntry(parseInt(btn.dataset.deleteError));
      showToast('Soal dihapus', 'info');
      renderWeakness();
    });
  });

  if (window.lucide) lucide.createIcons();

  // Radar chart
  createRadarChart('weakness-radar', radarLabels, [{
    label: 'Penguasaan (%)',
    data: radarData,
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderColor: '#3b82f6',
    pointBackgroundColor: '#3b82f6',
  }]);
}

function openErrorModal() {
  const syllabus = getSyllabus();
  const topicOptions = syllabus.flatMap(c =>
    c.topics.map(t => `<option value="${c.name} — ${t.name}">${c.name} — ${t.name}</option>`)
  );

  const content = `
    <div class="error-form">
      <div class="form-group">
        <label class="input-label">Soal / Pertanyaan</label>
        <textarea class="input-field" id="error-question" rows="3" placeholder="Tulis soal yang salah..."></textarea>
      </div>
      <div class="form-group">
        <label class="input-label">Jawaban Benar</label>
        <input type="text" class="input-field" id="error-answer" placeholder="Jawaban yang benar" />
      </div>
      <div class="form-group">
        <label class="input-label">Topik Terkait</label>
        <select class="input-field" id="error-topic" style="cursor:pointer;">
          <option value="">Pilih topik...</option>
          ${topicOptions.join('')}
        </select>
      </div>
    </div>
  `;

  showModal('Tambah Soal ke Bank Salah', content, [
    { label: 'Batal', action: 'close', class: 'btn-secondary' },
    {
      label: 'Simpan',
      action: 'save',
      class: 'btn-primary',
      handler: (overlay) => {
        const question = document.getElementById('error-question')?.value?.trim();
        const answer = document.getElementById('error-answer')?.value?.trim();
        const topic = document.getElementById('error-topic')?.value;

        if (!question) { showToast('Tulis soalnya dulu!', 'error'); return; }

        addErrorEntry({ question, answer: answer || '-', topic: topic || 'Umum' });
        closeModal(overlay);
        showToast('Soal berhasil dicatat! 📝', 'success');
        renderWeakness();
      },
    },
  ]);
}
