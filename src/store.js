/**
 * SNBT Tracker — localStorage State Management
 * Supports per-user data isolation via login accounts.
 */

/* ---- Internal Helpers ---- */
const ACCOUNTS_KEY = 'snbt_accounts';   // { email: { email, passwordHash, createdAt } }
const SESSION_KEY  = 'snbt_session';    // { email }

function get(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Return a storage-key prefix scoped to the current logged-in user. */
function userPrefix() {
  const session = getCurrentSession();
  if (session && session.email) return `snbt_${session.email}_`;
  return 'snbt_guest_'; // fallback for not-yet-logged-in
}

function userKey(name) {
  return userPrefix() + name;
}

const BASE_URL = 'http://localhost:3000';

/* ================================================
   AUTH — Register / Login / Logout
   ================================================ */

/**
 * Register a new account.
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function registerAccount(email, password) {
  console.log('registerAccount called for:', email);
  try {
    const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: email.split('@')[0] }), // better-auth needs name
    });

    const data = await response.json();
    console.log('Register response:', data);

    if (!response.ok) {
      return { ok: false, error: data.message || 'Gagal daftar.' };
    }

    // Auto-login success, session is handled by cookies usually
    // But we still set our local session for consistency in this app
    set(SESSION_KEY, { email, userId: data.user.id });
    return { ok: true };
  } catch (err) {
    console.error('Register error:', err);
    return { ok: false, error: 'Hubungan ke server terputus.' };
  }
}

/**
 * Login with existing account.
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function loginAccount(email, password) {
  console.log('loginAccount called for:', email);
  try {
    const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      return { ok: false, error: data.message || 'Email atau password salah.' };
    }

    set(SESSION_KEY, { email, userId: data.user.id });
    return { ok: true };
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: 'Hubungan ke server terputus.' };
  }
}


/** Logout current session. */
export function logoutAccount() {
  localStorage.removeItem(SESSION_KEY);
}

/** Get current logged-in session (or null). */
export function getCurrentSession() {
  return get(SESSION_KEY);
}

/** Check if a user is logged in. */
export function isLoggedIn() {
  return !!getCurrentSession();
}

/* ================================================
   USER PROFILE (scoped per account)
   ================================================ */
export function getUser() {
  return get(userKey('user'));
}

export function setUser(user) {
  set(userKey('user'), user);
}

export function isOnboarded() {
  const user = getUser();
  return user && user.name;
}

/* ---- Syllabus ---- */
import { getDefaultSyllabus } from './data/syllabus.js';

export function getSyllabus() {
  return get(userKey('syllabus')) || getDefaultSyllabus();
}

export function setSyllabus(data) {
  set(userKey('syllabus'), data);
}

export function updateTopicStatus(categoryId, topicId, status) {
  const syllabus = getSyllabus();
  const cat = syllabus.find(c => c.id === categoryId);
  if (cat) {
    const topic = cat.topics.find(t => t.id === topicId);
    if (topic) {
      topic.status = status;
      setSyllabus(syllabus);
    }
  }
}

/* ---- Tryouts ---- */
export function getTryouts() {
  return get(userKey('tryouts')) || [];
}

export function addTryout(tryout) {
  const list = getTryouts();
  tryout.id = Date.now();
  tryout.date = tryout.date || new Date().toISOString().slice(0, 10);
  list.push(tryout);
  set(userKey('tryouts'), list);
  return tryout;
}

export function deleteTryout(id) {
  const list = getTryouts().filter(t => t.id !== id);
  set(userKey('tryouts'), list);
}

/* ---- Error Log ---- */
export function getErrorLog() {
  return get(userKey('errors')) || [];
}

export function addErrorEntry(entry) {
  const list = getErrorLog();
  entry.id = Date.now();
  entry.date = new Date().toISOString().slice(0, 10);
  list.push(entry);
  set(userKey('errors'), list);
}

export function deleteErrorEntry(id) {
  const list = getErrorLog().filter(e => e.id !== id);
  set(userKey('errors'), list);
}

/* ---- Study Sessions (Timer) ---- */
export function getSessions() {
  return get(userKey('sessions')) || [];
}

export function addSession(session) {
  const list = getSessions();
  session.id = Date.now();
  session.date = new Date().toISOString();
  list.push(session);
  set(userKey('sessions'), list);
  updateStreak();
}

/* ---- Streak ---- */
export function getStreak() {
  return get(userKey('streak')) || { current: 0, best: 0, lastDate: null, badges: [] };
}

export function updateStreak() {
  const streak = getStreak();
  const today = new Date().toISOString().slice(0, 10);

  if (streak.lastDate === today) return streak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }
  streak.lastDate = today;
  if (streak.current > streak.best) streak.best = streak.current;

  // badges
  const badgeDefs = [
    { days: 3, name: '🔥 Pemula Rajin' },
    { days: 5, name: '💪 Pejuang Tangguh' },
    { days: 7, name: '⚡ Konsisten Seminggu' },
    { days: 14, name: '🏆 Warrior' },
    { days: 30, name: '👑 Legend' },
  ];
  streak.badges = badgeDefs.filter(b => streak.best >= b.days).map(b => b.name);

  set(userKey('streak'), streak);
  return streak;
}

/* ---- Settings ---- */
export function getSettings() {
  return get(userKey('settings')) || { pomodoroMinutes: 25, breakMinutes: 5 };
}

export function setSettings(settings) {
  set(userKey('settings'), settings);
}

/* ---- Computed Helpers ---- */
export function getReadinessPercent() {
  const syllabus = getSyllabus();
  let total = 0;
  let mastered = 0;
  syllabus.forEach(cat => {
    cat.topics.forEach(topic => {
      total++;
      const statusWeights = { 'belum': 0, 'teori': 0.3, 'latihan': 0.6, 'mastered': 1 };
      mastered += statusWeights[topic.status] || 0;
    });
  });
  return total > 0 ? Math.round((mastered / total) * 100) : 0;
}

export function getAvgTryoutScore() {
  const tryouts = getTryouts();
  if (tryouts.length === 0) return 0;
  const total = tryouts.reduce((sum, t) => sum + (t.totalScore || 0), 0);
  const avgTotal = total / tryouts.length;
  return Math.round(avgTotal / 4);
}

export function getWeakTopics() {
  const syllabus = getSyllabus();
  const weak = [];
  syllabus.forEach(cat => {
    cat.topics.forEach(topic => {
      if (topic.status === 'belum' || topic.status === 'teori') {
        weak.push({ ...topic, categoryName: cat.name, categoryId: cat.id });
      }
    });
  });
  return weak.slice(0, 5);
}
