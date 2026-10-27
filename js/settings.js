/* =============================================================
   settings.js — Settings panel logic.
   Subjects + chapters (practice) and mock exams are MUTUALLY EXCLUSIVE.
   Subjects/chapters scroll after 5 visible items.
   ============================================================= */
const Settings = (() => {
  const DEFAULT_SECONDS_PER_QUESTION = 45;
  let _durationManuallyChanged = false;
  let _durationRequest = 0;
  let _subjectSelectionRequest = 0;

  /* ── Build the entire panel from index data ── */
  function build() {
    document.getElementById('settingDurationMinutes').addEventListener('input', () => {
      _durationManuallyChanged = true;
    });
    _buildSubjects();
    _buildMockExams();
  }

  function setRecommendedDuration(questionCount) {
    return _setRecommendedDuration(questionCount);
  }

  function _setRecommendedDuration(questionCount) {
    const minutes = Math.round(questionCount * DEFAULT_SECONDS_PER_QUESTION / 60);
    if (!_durationManuallyChanged) {
      document.getElementById('settingDurationMinutes').value = String(minutes);
    }
    return minutes;
  }

  function _readDurationMinutes() {
    const input = document.getElementById('settingDurationMinutes');
    const minutes = Number(input.value);
    if (!input.value.trim() || !Number.isSafeInteger(minutes) || minutes < 0 ||
        minutes > Math.floor(Number.MAX_SAFE_INTEGER / 60)) {
      UI.toast('Enter a whole number of minutes (0 = no timer).', 'error');
      input.focus();
      return null;
    }
    return minutes;
  }

  async function _updatePracticeDuration() {
    if (_durationManuallyChanged) return;
    const request = ++_durationRequest;
    const subjectIds = _checkedSubjects();
    if (!subjectIds.length) return;
    const questions = await Data.getPracticeQuestions(subjectIds,
      _checkedChapters().length ? _checkedChapters() : null);
    if (request !== _durationRequest) return;
    _setRecommendedDuration(questions.length);
  }

  /* ── PRACTICE: subjects ── */
  function _buildSubjects() {
    const wrap = document.getElementById('settingSubjects');
    wrap.innerHTML = '';
    Data.getSubjects().forEach(s => {
      const lbl = _checkLabel('settingSubject', s.id, s.name, _onSubjectChange);
      wrap.appendChild(lbl);
    });
    _buildChapters([]);
  }

  async function _onSubjectChange() {
    _clearMockSelection();               // mutual exclusion
    const request = ++_subjectSelectionRequest;
    const subjectIds = _checkedSubjects();
    _durationManuallyChanged = false;
    if (!subjectIds.length) {
      _buildChapters([]);
      return;
    }
    await Data.loadSubjectIndexes(subjectIds);
    if (request !== _subjectSelectionRequest) return;
    _buildChapters(subjectIds);
    _updatePracticeDuration();
  }

  /* ── PRACTICE: chapters grouped by subject ── */
  function _buildChapters(subjectIds) {
    const wrap = document.getElementById('settingChapters');
    wrap.innerHTML = '';
    if (!subjectIds.length) {
      wrap.innerHTML = '<span class="dim-text">Select subject(s) first</span>';
      return;
    }
    subjectIds.forEach(sId => {
      const subj    = Data.getSubjects().find(s => s.id === sId);
      const chapters = Data.getChapters([sId]);
      if (!subj || !chapters.length) return;

      // Subject label header
      const hdr = document.createElement('div');
      hdr.className = 'ch-subject-header';
      hdr.textContent = subj.name;
      wrap.appendChild(hdr);

      // Scrollable chapter list
      const list = document.createElement('div');
      list.className = 'scrollable-list';
      chapters.forEach(ch => list.appendChild(_checkLabel('settingChapter', ch.id, ch.name, _onChapterChange)));
      wrap.appendChild(list);
    });
    // Default: all checked
    wrap.querySelectorAll('input[name="settingChapter"]').forEach(c => c.checked = true);
  }

  function _onChapterChange() {
    _updatePracticeDuration();
  }

  /* ── MOCK: exams + test select ── */
  function _buildMockExams() {
    const wrap = document.getElementById('settingExams');
    wrap.innerHTML = '';
    Data.getExams().forEach(e => {
      const lbl = _radioLabel('settingExam', e.id, e.name, () => _onExamChange(e.id));
      wrap.appendChild(lbl);
    });
    document.getElementById('settingTestSelect').innerHTML = '<option value="">— Select Test —</option>';
  }

  function _onExamChange(examId) {
    _clearPracticeSelection();           // mutual exclusion
    _durationManuallyChanged = false;
    const sel = document.getElementById('settingTestSelect');
    sel.innerHTML = '<option value="">— All Tests —</option>';
    Data.getTests(examId).forEach(t => {
      sel.innerHTML += `<option value="${UI.esc(t.id)}">${UI.esc(t.name)}</option>`;
    });
    sel.onchange = () => _onTestChange(examId);
    _updateMockDuration(examId, '');
  }

  async function _updateMockDuration(examId, testId) {
    const request = ++_durationRequest;
    const tests = testId
      ? Data.getTests(examId).filter(test => test.id === testId)
      : Data.getTests(examId);
    const testData = await Promise.all(
      tests.map(test => Data.getMockTest(examId, test.id))
    );
    const questionCount = testData.reduce(
      (count, data) => count + (data?.questions.length || 0), 0
    );
    const declaredMinutes = testData.reduce(
      (minutes, data) => minutes + (Number(data?.durationMinutes) || 0), 0
    );
    if (request !== _durationRequest || _durationManuallyChanged) return;
    if (testId && declaredMinutes > 0) {
      document.getElementById('settingDurationMinutes').value = String(declaredMinutes);
    } else {
      _setRecommendedDuration(questionCount);
    }
  }

  function _onTestChange(examId) {
    _durationManuallyChanged = false;
    _updateMockDuration(examId, document.getElementById('settingTestSelect').value);
  }

  /* ── Mutual exclusion ── */
  function _clearMockSelection() {
    document.querySelectorAll('input[name="settingExam"]').forEach(r => r.checked = false);
    document.getElementById('settingTestSelect').innerHTML = '<option value="">— Select Test —</option>';
  }
  function _clearPracticeSelection() {
    _subjectSelectionRequest++;
    document.querySelectorAll('input[name="settingSubject"]').forEach(c => c.checked = false);
    _buildChapters([]);
  }

  /* ── Start session ── */
  async function start() {
    const examRadio = document.querySelector('input[name="settingExam"]:checked');
    if (examRadio) return _startMock(examRadio.value);
    return _startPractice();
  }

  async function _startMock(examId) {
    const testId  = document.getElementById('settingTestSelect').value;
    const tests   = testId ? [Data.getTests(examId).find(t => t.id === testId)] : Data.getTests(examId);
    const testData = await Promise.all(
      tests.filter(Boolean).map(t => Data.getMockTest(examId, t.id))
    );
    const allQ = testData.flatMap(data => data?.questions || []);
    if (!allQ.length) { UI.toast('No questions found for this mock test.', 'error'); return; }
    const exam    = Data.getExams().find(e => e.id === examId);
    const tMeta   = testId ? Data.getTests(examId).find(t => t.id === testId) : null;
    const durationMinutes = _readDurationMinutes();
    if (durationMinutes === null) return;
    App.closeSettings();
    Exam.start({ questions: allQ, mode: 'exam',
      timerSeconds: durationMinutes * 60,
      label: `${exam.name} · ${tMeta?.name || 'All Tests'}` });
  }

  async function _startPractice() {
    const subIds = _checkedSubjects();
    const chIds  = _checkedChapters();
    const mode   = document.getElementById('settingMode').value;
    const order  = document.getElementById('settingOrder').value;
    const numQInput = document.getElementById('settingNumQ');
    const numQ = Number(numQInput.value);
    const durationMinutes = _readDurationMinutes();
    if (durationMinutes === null) return;
    const maxQuestions = Number(numQInput.max);
    if (!numQInput.value.trim() || !Number.isInteger(numQ) || numQ < 0 || numQ > maxQuestions) {
      UI.toast(`Enter a whole number from 0 to ${maxQuestions} (0 = all).`, 'error');
      numQInput.focus();
      return;
    }
    if (!subIds.length) { UI.toast('Select at least one subject.', 'error'); return; }
    let qs = await Data.getPracticeQuestions(subIds, chIds.length ? chIds : null);
    if (!qs.length) { UI.toast('No questions found.', 'error'); return; }
    if (order === 'shuffle') qs = UI.shuffle(qs);
    if (numQ > 0 && numQ < qs.length) qs = qs.slice(0, numQ);
    const label = subIds.map(id => Data.getSubjects().find(s => s.id === id)?.name).filter(Boolean).join(', ');
    App.closeSettings();
    Exam.start({ questions: qs, mode,
      timerSeconds: durationMinutes * 60, label });
  }

  /* ── Helpers ── */
  function _checkedSubjects() {
    return [...document.querySelectorAll('input[name="settingSubject"]:checked')].map(c => c.value);
  }
  function _checkedChapters() {
    return [...document.querySelectorAll('input[name="settingChapter"]:checked')].map(c => c.value);
  }

  function _checkLabel(name, value, text, onChange) {
    const lbl = document.createElement('label');
    lbl.className = 'check-item';
    lbl.innerHTML = `<input type="checkbox" name="${name}" value="${UI.esc(value)}"> ${UI.esc(text)}`;
    if (onChange) lbl.querySelector('input').addEventListener('change', onChange);
    return lbl;
  }

  function _radioLabel(name, value, text, onChange) {
    const lbl = document.createElement('label');
    lbl.className = 'check-item radio-item';
    lbl.innerHTML = `<input type="radio" name="${name}" value="${UI.esc(value)}"> ${UI.esc(text)}`;
    lbl.querySelector('input').addEventListener('change', onChange);
    return lbl;
  }

  return { build, start, setRecommendedDuration };
})();
