/**
 * Achievement / Badge Definitions
 */
export const achievements = [
  { id: 'streak-3', name: '🔥 Pemula Rajin', desc: 'Belajar 3 hari berturut-turut', requirement: { type: 'streak', days: 3 } },
  { id: 'streak-5', name: '💪 Pejuang Tangguh', desc: 'Belajar 5 hari berturut-turut', requirement: { type: 'streak', days: 5 } },
  { id: 'streak-7', name: '⚡ Konsisten Seminggu', desc: 'Belajar 7 hari berturut-turut', requirement: { type: 'streak', days: 7 } },
  { id: 'streak-14', name: '🏆 Warrior', desc: 'Belajar 14 hari berturut-turut', requirement: { type: 'streak', days: 14 } },
  { id: 'streak-30', name: '👑 Legend', desc: 'Belajar 30 hari berturut-turut', requirement: { type: 'streak', days: 30 } },
  { id: 'mastery-25', name: '📖 Quarter Way', desc: 'Kuasai 25% materi', requirement: { type: 'mastery', percent: 25 } },
  { id: 'mastery-50', name: '🌟 Halfway Hero', desc: 'Kuasai 50% materi', requirement: { type: 'mastery', percent: 50 } },
  { id: 'mastery-75', name: '🚀 Almost There', desc: 'Kuasai 75% materi', requirement: { type: 'mastery', percent: 75 } },
  { id: 'mastery-100', name: '🎓 Master SNBT', desc: 'Kuasai semua materi!', requirement: { type: 'mastery', percent: 100 } },
  { id: 'to-5', name: '📊 Data Driven', desc: 'Input 5 skor Try-Out', requirement: { type: 'tryouts', count: 5 } },
  { id: 'to-10', name: '📈 Statistician', desc: 'Input 10 skor Try-Out', requirement: { type: 'tryouts', count: 10 } },
];
