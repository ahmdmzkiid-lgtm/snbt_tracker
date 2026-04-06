/**
 * Study Timer Page — Pomodoro + Session Log + Heatmap
 */
import { getSyllabus, addSession, getSessions, getStreak, getSettings } from '../store.js';
import { showToast } from '../components/modal.js';

let timerInterval = null;
let isRunning = false;
let isPaused = false;
let timeLeft = 25 * 60; // seconds
let totalTime = 25 * 60;
let currentPhase = 'focus'; // 'focus' | 'break'
let selectedTopic = '';

export function renderTimer() {
  const container = document.getElementById('page-container');
  const settings = getSettings();
  const syllabus = getSyllabus();
  const sessions = getSessions();
  const streak = getStreak();
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter(s => s.date?.startsWith(today));

  if (!isRunning && !isPaused) {
    timeLeft = (currentPhase === 'focus' ? settings.pomodoroMinutes : settings.breakMinutes) * 60;
    totalTime = timeLeft;
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const circumference = 2 * Math.PI * 95;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) : 0;
  const dashoffset = circumference - progress * circumference;

  // Heatmap — last 28 days
  const heatmapData = buildHeatmap(sessions);

  // Topic options
  const topicOpts = syllabus.flatMap(c => c.topics.map(t => `<option value="${t.name}" ${selectedTopic === t.name ? 'selected' : ''}>${c.name.replace('Tes Potensi Skolastik (TPS)', 'TPS').replace('Literasi Bahasa Indonesia', 'Lit. Indo').replace('Literasi Bahasa Inggris', 'Lit. Eng').replace('Penalaran Matematika', 'Pen. Mat')} — ${t.name}</option>`));

  container.innerHTML = `
    <div class="timer-page">
      <div class="timer-page__header">
        <h1>⏱️ Study Timer</h1>
      </div>

      <div class="timer__grid">
        <!-- Timer -->
        <div class="timer__main-card glass-card-static">
          <div class="timer__topic-picker">
            <div class="timer__topic-label">Sedang mempelajari:</div>
            <select class="timer__topic-select" id="timer-topic">
              <option value="">— Pilih topik —</option>
              ${topicOpts.join('')}
            </select>
          </div>

          <div class="timer__display">
            <svg viewBox="0 0 220 220" width="220" height="220">
              <defs>
                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#06b6d4"/>
                </linearGradient>
              </defs>
              <circle class="timer__circle-bg" cx="110" cy="110" r="95"/>
              <circle class="timer__circle-fill" cx="110" cy="110" r="95"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashoffset}"
              />
            </svg>
            <div class="timer__time-text">
              <div class="timer__time">${minutes}:${seconds}</div>
              <div class="timer__phase">${currentPhase === 'focus' ? '🎯 Fokus' : '☕ Istirahat'}</div>
            </div>
          </div>

          <div class="timer__controls">
            <button class="timer__btn timer__btn--secondary" id="timer-reset" title="Reset">
              <i data-lucide="rotate-ccw"></i>
            </button>
            <button class="timer__btn timer__btn--play" id="timer-toggle" title="${isRunning ? 'Pause' : 'Play'}">
              <i data-lucide="${isRunning ? 'pause' : 'play'}"></i>
            </button>
            <button class="timer__btn timer__btn--secondary" id="timer-skip" title="Skip ke istirahat">
              <i data-lucide="skip-forward"></i>
            </button>
          </div>
        </div>

        <!-- Sessions Today -->
        <div class="timer__sessions-card glass-card-static">
          <h3 class="timer__sessions-title">📝 Sesi Hari Ini (${todaySessions.length})</h3>
          ${todaySessions.length > 0 ? `
          <div class="session-list">
            ${todaySessions.slice().reverse().map(s => `
              <div class="session-item">
                <div>
                  <div class="session-item__topic">${s.topic || 'Umum'}</div>
                  <div class="session-item__time">${new Date(s.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="session-item__duration">${s.duration} min</div>
              </div>
            `).join('')}
          </div>
          ` : '<p style="color:var(--text-muted);font-size:var(--font-sm);">Belum ada sesi hari ini. Mulai timer untuk mencatat!</p>'}

          <!-- Streak -->
          <div style="margin-top:var(--space-lg);padding-top:var(--space-md);border-top:1px solid var(--border-subtle);">
            <div style="display:flex;align-items:center;gap:var(--space-sm);">
              <span style="font-size:1.5rem;">${streak.current > 0 ? '🔥' : '❄️'}</span>
              <div>
                <div style="font-weight:600;font-size:var(--font-sm);">${streak.current} hari streak</div>
                <div style="font-size:var(--font-xs);color:var(--text-muted);">Best: ${streak.best} hari</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap -->
      <div class="timer__heatmap glass-card-static">
        <h3 class="heatmap__title">📅 Aktivitas 4 Minggu Terakhir</h3>
        <div class="heatmap__grid">
          ${heatmapData.cells.map(c => `<div class="heatmap__cell heatmap__cell--${c.level}" title="${c.date}: ${c.count} sesi"></div>`).join('')}
        </div>
        <div class="heatmap__labels">
          ${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => `<div class="heatmap__label">${d}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Events
  document.getElementById('timer-topic')?.addEventListener('change', (e) => {
    selectedTopic = e.target.value;
  });

  document.getElementById('timer-toggle')?.addEventListener('click', toggleTimer);
  document.getElementById('timer-reset')?.addEventListener('click', resetTimer);
  document.getElementById('timer-skip')?.addEventListener('click', skipPhase);

  if (window.lucide) lucide.createIcons();
}

function toggleTimer() {
  if (isRunning) {
    // Pause
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = true;
    renderTimer();
  } else {
    // Start
    isRunning = true;
    isPaused = false;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        onTimerComplete();
      }
      updateTimerDisplay();
    }, 1000);
    renderTimer();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isPaused = false;
  const settings = getSettings();
  timeLeft = (currentPhase === 'focus' ? settings.pomodoroMinutes : settings.breakMinutes) * 60;
  totalTime = timeLeft;
  renderTimer();
}

function skipPhase() {
  clearInterval(timerInterval);
  isRunning = false;
  isPaused = false;
  if (currentPhase === 'focus') {
    // Record session
    const settings = getSettings();
    addSession({ topic: selectedTopic || 'Umum', duration: settings.pomodoroMinutes });
    showToast(`Sesi ${settings.pomodoroMinutes} menit dicatat! 🎉`, 'success');
  }
  currentPhase = currentPhase === 'focus' ? 'break' : 'focus';
  const settings = getSettings();
  timeLeft = (currentPhase === 'focus' ? settings.pomodoroMinutes : settings.breakMinutes) * 60;
  totalTime = timeLeft;
  renderTimer();
}

function onTimerComplete() {
  if (currentPhase === 'focus') {
    const settings = getSettings();
    addSession({ topic: selectedTopic || 'Umum', duration: settings.pomodoroMinutes });
    showToast(`🎉 Sesi fokus selesai! Saatnya istirahat.`, 'success');
    currentPhase = 'break';
  } else {
    showToast('☕ Istirahat selesai! Yuk lanjut belajar!', 'info');
    currentPhase = 'focus';
  }
  const settings = getSettings();
  timeLeft = (currentPhase === 'focus' ? settings.pomodoroMinutes : settings.breakMinutes) * 60;
  totalTime = timeLeft;
  renderTimer();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const timeEl = document.querySelector('.timer__time');
  if (timeEl) timeEl.textContent = `${minutes}:${seconds}`;

  // Update circle
  const circumference = 2 * Math.PI * 95;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) : 0;
  const dashoffset = circumference - progress * circumference;
  const circle = document.querySelector('.timer__circle-fill');
  if (circle) circle.setAttribute('stroke-dashoffset', dashoffset);
}

function buildHeatmap(sessions) {
  const cells = [];
  const today = new Date();
  // Find the most recent Monday
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - mondayOffset - 21); // 4 weeks back from this week's monday

  for (let i = 0; i < 28; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const count = sessions.filter(s => s.date?.startsWith(dateStr)).length;
    let level = '';
    if (count >= 4) level = 'l4';
    else if (count >= 3) level = 'l3';
    else if (count >= 2) level = 'l2';
    else if (count >= 1) level = 'l1';
    cells.push({ date: dateStr, count, level });
  }
  return { cells };
}
