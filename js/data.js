/* =============================================================
   data.js — Loads questions/index.json + mock-tests/index.json,
   fetches category/mock files on demand.
   ============================================================= */
const Data = (() => {
  let _qIndex    = null;   // questions/index.json + subject indexes
  let _mockIndex = null;   // mock-tests/index.json
  let _cache     = {};     // filePath → questions array

  /* ── Init: load both index files ── */
  async function init() {
    const [questionIndex, mockIndex] = await Promise.all([
      _fetchJSON('questions/index.json').catch(() => ({ subjects: [] })),
      _fetchJSON('mock-tests/index.json').catch(() => ({ exams: [] })),
    ]);

    _qIndex = {
      subjects: await Promise.all((questionIndex.subjects || []).map(async subject => {
        try {
          const subjectIndex = await _fetchJSON(subject.file);
          return { ...subject, chapters: subjectIndex.chapters || [] };
        } catch (error) {
          console.warn('Could not load subject index:', subject.file, error);
          return { ...subject, chapters: [] };
        }
      })),
    };
    _mockIndex = mockIndex;
  }

  async function _fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return res.json();
  }

  async function _loadFile(path) {
    if (_cache[path]) return _cache[path];
    try {
      const data = await _fetchJSON(path);
      _cache[path] = Array.isArray(data) ? data : (data.questions || []);
    } catch (e) {
      console.warn('Could not load:', path, e);
      _cache[path] = [];
    }
    return _cache[path];
  }

  /* ── Practice: subjects / chapters ── */
  function getSubjects() {
    return (_qIndex?.subjects || []).map(s => ({ id: s.subjectId, name: s.subjectName }));
  }

  function getChapters(subjectIds) {
    const ids = Array.isArray(subjectIds) ? subjectIds : [subjectIds];
    const result = [];
    (_qIndex?.subjects || []).forEach(s => {
      if (!ids.includes(s.subjectId)) return;
      s.chapters.forEach(ch => {
        if (!result.find(r => r.id === ch.chapterId))
          result.push({ id: ch.chapterId, name: ch.chapterName, subjectId: s.subjectId });
      });
    });
    return result;
  }

  /** Fetch + enrich questions for given subject(s) and chapter(s) */
  async function getPracticeQuestions(subjectIds, chapterIds) {
    const sIds = subjectIds?.length ? subjectIds : getSubjects().map(s => s.id);
    const questions = [];

    for (const subj of (_qIndex?.subjects || [])) {
      if (!sIds.includes(subj.subjectId)) continue;
      for (const ch of subj.chapters) {
        if (chapterIds?.length && !chapterIds.includes(ch.chapterId)) continue;
        for (const cat of ch.categories) {
          const raw = await _loadFile(cat.file);
          raw.forEach(q => questions.push({
            ...q,
            _subject:      subj.subjectName,
            _subjectId:    subj.subjectId,
            _chapterName:  ch.chapterName,
            _chapterId:    ch.chapterId,
            _categoryName: cat.categoryName,
            _categoryId:   cat.categoryId,
          }));
        }
      }
    }
    return questions;
  }

  /** Pick a random subject and return all its questions (for auto-start) */
  async function getRandomSubjectQuestions() {
    const subjects = getSubjects();
    if (!subjects.length) return { questions: [], label: 'No questions loaded' };
    const subj = subjects[Math.floor(Math.random() * subjects.length)];
    const questions = await getPracticeQuestions([subj.id], null);
    return { questions, label: subj.name };
  }

  /* ── Mock tests ── */
  function getExams() {
    return (_mockIndex?.exams || []).map(e => ({ id: e.examId, name: e.examName }));
  }

  function getTests(examId) {
    const exam = (_mockIndex?.exams || []).find(e => e.examId === examId);
    return (exam?.tests || []).map(t => ({ id: t.testId, name: t.testName, file: t.file, examId }));
  }

  async function getMockTest(examId, testId) {
    const exam = (_mockIndex?.exams || []).find(e => e.examId === examId);
    if (!exam) return null;
    const test = exam.tests.find(t => t.testId === testId);
    if (!test) return null;
    const raw = await _fetchJSON(test.file);
    const questions = (raw.questions || []).map(q => ({
      ...q,
      _subject:     raw.examName,
      _chapterName: '',
      _categoryName: '',
    }));
    return {
      examName:        raw.examName,
      testName:        raw.testName,
      durationMinutes: raw.durationMinutes,
      instructions:    raw.instructions,
      questions,
    };
  }

  return { init, getSubjects, getChapters, getPracticeQuestions, getRandomSubjectQuestions, getExams, getTests, getMockTest };
})();
