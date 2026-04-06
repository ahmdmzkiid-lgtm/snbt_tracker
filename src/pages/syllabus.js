/**
 * Syllabus Mastery Tracker Page
 */
import { getSyllabus, updateTopicStatus } from '../store.js';
import { STATUS_MAP, STATUS_LIST } from '../data/syllabus.js';

let activeTab = 0;
let openDropdown = null;

export function renderSyllabus() {
  const container = document.getElementById('page-container');
  const syllabus = getSyllabus();

  container.innerHTML = `
    <div class="syllabus">
      <div class="syllabus__header">
        <h1>📚 Materi SNBT</h1>
      </div>

      <!-- Tabs -->
      <div class="syllabus__tabs" id="syllabus-tabs">
        ${syllabus.map((cat, i) => `
          <button class="syllabus__tab ${i === activeTab ? 'active' : ''}" data-tab="${i}">${cat.name}</button>
        `).join('')}
      </div>

      <!-- Active category -->
      <div id="syllabus-content"></div>
    </div>
  `;

  // Tab click events
  document.querySelectorAll('.syllabus__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = parseInt(tab.dataset.tab);
      renderSyllabus();
    });
  });

  renderCategory(syllabus[activeTab]);
  if (window.lucide) lucide.createIcons();
}

function renderCategory(category) {
  const content = document.getElementById('syllabus-content');
  if (!category) return;

  const totalTopics = category.topics.length;
  const progressSum = category.topics.reduce((sum, t) => sum + (STATUS_MAP[t.status]?.weight || 0), 0);
  const progressPct = totalTopics > 0 ? Math.round((progressSum / totalTopics) * 100) : 0;

  // Count by status
  const statusCounts = {};
  STATUS_LIST.forEach(s => statusCounts[s] = 0);
  category.topics.forEach(t => statusCounts[t.status]++);

  content.innerHTML = `
    <!-- Category Progress -->
    <div class="syllabus__progress-header glass-card-static">
      <div class="syllabus__progress-row">
        <span class="syllabus__progress-label">${category.name}</span>
        <span class="syllabus__progress-pct">${progressPct}% Selesai</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: ${progressPct}%"></div>
      </div>
      <div style="display:flex; gap:var(--space-md); margin-top:var(--space-md); flex-wrap:wrap;">
        ${STATUS_LIST.map(s => `
          <span class="status-pill status-pill--${STATUS_MAP[s].color}" style="font-size:11px;">
            ${STATUS_MAP[s].label}: ${statusCounts[s]}
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Topics -->
    <div class="topic-list">
      ${category.topics.map(topic => {
        const status = STATUS_MAP[topic.status] || STATUS_MAP['belum'];
        const weight = status.weight * 100;
        return `
          <div class="topic-item glass-card" data-topic-id="${topic.id}">
            <div class="topic-item__info">
              <div class="topic-item__name">${topic.name}</div>
              <div class="topic-item__bar">
                <div class="progress-bar" style="height:6px;">
                  <div class="progress-bar__fill" style="width: ${weight}%; ${
                    topic.status === 'mastered' ? 'background: var(--accent-green);' :
                    topic.status === 'latihan' ? 'background: var(--accent-yellow);' :
                    topic.status === 'teori' ? 'background: var(--accent-blue);' :
                    'background: rgba(255,255,255,0.1);'
                  }"></div>
                </div>
              </div>
            </div>
            <div class="topic-item__status" id="status-${topic.id}">
              <span class="status-pill status-pill--${status.color}" data-toggle-status="${topic.id}">${status.label}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Status pill click → dropdown
  content.querySelectorAll('[data-toggle-status]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const topicId = pill.dataset.toggleStatus;
      toggleStatusDropdown(topicId, category.id);
    });
  });
}

// Global click listener to close dropdown, attached only once
if (!window.__syllabusListenerAttached) {
  document.addEventListener('click', () => closeDropdown());
  window.__syllabusListenerAttached = true;
}

function toggleStatusDropdown(topicId, categoryId) {
  closeDropdown();

  const wrapper = document.getElementById(`status-${topicId}`);
  if (!wrapper) return;

  const syllabus = getSyllabus();
  const cat = syllabus.find(c => c.id === categoryId);
  const topic = cat?.topics.find(t => t.id === topicId);
  if (!topic) return;

  // Elevate parent z-index
  const topicItem = wrapper.closest('.topic-item');
  if (topicItem) topicItem.style.zIndex = '50';

  const dropdown = document.createElement('div');
  dropdown.className = 'status-dropdown';
  dropdown.innerHTML = STATUS_LIST.map(s => `
    <div class="status-dropdown__item ${topic.status === s ? 'active' : ''}" data-status="${s}">
      <span class="status-pill status-pill--${STATUS_MAP[s].color}" style="font-size:10px; padding:2px 8px;">${STATUS_MAP[s].label}</span>
    </div>
  `).join('');

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = e.target.closest('.status-dropdown__item');
    if (item) {
      updateTopicStatus(categoryId, topicId, item.dataset.status);
      closeDropdown();
      renderSyllabus(); // re-render
    }
  });

  wrapper.appendChild(dropdown);
  openDropdown = dropdown;
}

function closeDropdown() {
  if (openDropdown) {
    const topicItem = openDropdown.closest('.topic-item');
    if (topicItem) topicItem.style.zIndex = '';
    openDropdown.remove();
    openDropdown = null;
  }
}
