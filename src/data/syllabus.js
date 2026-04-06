/**
 * Struktur Materi SNBT — Syllabus Data
 */
export function getDefaultSyllabus() {
  return [
    {
      id: 'tps',
      name: 'Tes Potensi Skolastik (TPS)',
      icon: 'brain',
      topics: [
        { id: 'tps-pu', name: 'Penalaran Umum', status: 'belum' },
        { id: 'tps-ppu', name: 'Pengetahuan dan Pemahaman Umum', status: 'belum' },
        { id: 'tps-pbm', name: 'Kemampuan Memahami Bacaan dan Menulis', status: 'belum' },
        { id: 'tps-pk', name: 'Penalaran Kuantitatif', status: 'belum' },
      ],
    },
    {
      id: 'literasi-id',
      name: 'Literasi Bahasa Indonesia',
      icon: 'book-open',
      topics: [
        { id: 'lid-membaca', name: 'Memahami Isi Bacaan', status: 'belum' },
        { id: 'lid-kalimat', name: 'Kalimat Efektif', status: 'belum' },
        { id: 'lid-paragraf', name: 'Pengembangan Paragraf', status: 'belum' },
        { id: 'lid-ejaan', name: 'Ejaan & Tanda Baca (PUEBI)', status: 'belum' },
        { id: 'lid-makna', name: 'Makna Kata & Istilah', status: 'belum' },
      ],
    },
    {
      id: 'literasi-en',
      name: 'Literasi Bahasa Inggris',
      icon: 'globe',
      topics: [
        { id: 'len-reading', name: 'Reading Comprehension', status: 'belum' },
        { id: 'len-vocab', name: 'Vocabulary in Context', status: 'belum' },
        { id: 'len-grammar', name: 'Grammar & Structure', status: 'belum' },
        { id: 'len-inference', name: 'Inference & Analysis', status: 'belum' },
      ],
    },
    {
      id: 'penalaran-mat',
      name: 'Penalaran Matematika',
      icon: 'calculator',
      topics: [
        { id: 'pm-aljabar', name: 'Aljabar', status: 'belum' },
        { id: 'pm-geometri', name: 'Geometri & Pengukuran', status: 'belum' },
        { id: 'pm-statistik', name: 'Statistika & Peluang', status: 'belum' },
        { id: 'pm-aritmatika', name: 'Aritmatika Sosial', status: 'belum' },
        { id: 'pm-logika', name: 'Logika Matematika', status: 'belum' },
        { id: 'pm-barisan', name: 'Barisan & Deret', status: 'belum' },
      ],
    },
  ];
}

/* Status definitions */
export const STATUS_MAP = {
  'belum': { label: 'Belum Disentuh', color: 'red', weight: 0 },
  'teori': { label: 'Paham Teori', color: 'blue', weight: 0.3 },
  'latihan': { label: 'Latihan Soal', color: 'yellow', weight: 0.6 },
  'mastered': { label: 'Mastered', color: 'green', weight: 1 },
};

export const STATUS_LIST = ['belum', 'teori', 'latihan', 'mastered'];
