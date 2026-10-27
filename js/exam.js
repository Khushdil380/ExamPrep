/* =============================================================
   exam.js — Exam engine: renders questions, palette, timer, nav.
   ============================================================= */
const Exam = (() => {
  let _qs = [], _idx = 0, _responses = {}, _marked = {}, _visited = {};
  let _mode = 'practice', _timer = null, _secs = 0, _startTime = 0, _label = '';

  function _setPaletteOpen(open) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const drawerOpen = isMobile && open;
    const panel = document.getElementById('palettePanel');
    const trigger = document.getElementById('btnPalette');
    panel.classList.toggle('mobile-open', drawerOpen);
    panel.setAttribute('aria-hidden', String(isMobile && !drawerOpen));
    trigger.setAttribute('aria-expanded', String(drawerOpen));
    document.getElementById('paletteOverlay').classList.toggle('open', drawerOpen);
  }

  function togglePalette() {
    const panel = document.getElementById('palettePanel');
    _setPaletteOpen(!panel.classList.contains('mobile-open'));
  }

  function closePalette() { _setPaletteOpen(false); }

  /* ── Start ── */
  function start({ questions, mode, timerSeconds, label }) {
    _qs = questions; _idx = 0; _responses = {}; _marked = {}; _visited = {};
    _mode = mode || 'practice'; _label = label || ''; _startTime = Date.now();
    clearInterval(_timer);
    closePalette();
    _visited[_qs[0]?.id] = true;

    document.getElementById('examLabel').textContent = label;
    UI.showPage('exam');

    if (timerSeconds > 0) {
      _secs = Math.floor(timerSeconds);
      const box = document.getElementById('timerBox');
      box.style.display = 'block';
      _drawTimer();
      _timer = setInterval(_tick, 1000);
    } else {
      document.getElementById('timerBox').style.display = 'none';
    }
    _render();
  }

  /* ── Timer ── */
  function _tick() {
    _secs--;
    _drawTimer();
    if (_secs <= 0) { clearInterval(_timer); UI.toast('Time up! Auto-submitting…', 'error'); setTimeout(submit, 800); }
  }
  function _drawTimer() {
    const box = document.getElementById('timerBox');
    const m = String(Math.floor(_secs / 60)).padStart(2, '0');
    const s = String(_secs % 60).padStart(2, '0');
    box.textContent = `${m}:${s}`;
    box.className = 'timer' + (_secs <= 60 ? ' danger' : _secs <= 300 ? ' warn' : '');
  }

  /* ── Render question ── */
  function _render() {
    const q = _qs[_idx];
    if (!q) return;
    _visited[q.id] = true;

    // Progress
    document.getElementById('progressFill').style.width = ((_idx + 1) / _qs.length * 100) + '%';

    // Meta
    const metaParts = [
      q._subject      && `<span class="badge badge-gray">${UI.esc(q._subject)}</span>`,
      q._chapterName  && `<span class="badge badge-gray">${UI.esc(q._chapterName)}</span>`,
      q._categoryName && `<span class="badge badge-blue">${UI.esc(q._categoryName)}</span>`,
      q.difficulty    && `<span class="badge ${_dBadge(q.difficulty)}">${UI.esc(q.difficulty)}</span>`,
    ].filter(Boolean);
    document.getElementById('qMeta').innerHTML = metaParts.join('');
    document.getElementById('qCounter').textContent = `Question ${_idx + 1} of ${_qs.length}`;
    document.getElementById('qText').textContent = q.question;

    // Options
    const res    = _responses[q.id];
    const locked = _mode === 'practice' && res !== undefined;
    document.getElementById('optionsList').innerHTML = q.options.map(opt => {
      let cls = 'option' + (res === opt.id ? ' selected' : '');
      if (locked) {
        cls += ' locked';
        if (opt.id === q.correctAnswer) cls += ' correct';
        else if (opt.id === res)        cls += ' wrong';
      }
      return `<div class="${cls}" data-opt="${UI.esc(opt.id)}">
        <span class="option-key">${UI.esc(opt.id)}</span>
        <span>${UI.esc(opt.text)}</span>
      </div>`;
    }).join('');

    if (!locked) {
      document.querySelectorAll('#optionsList .option').forEach(el =>
        el.addEventListener('click', () => _select(el.dataset.opt))
      );
    }

    // Practice feedback
    const fb = document.getElementById('practiceFeedback');
    fb.className = 'practice-feedback';
    if (locked) {
      const ok = res === q.correctAnswer;
      fb.className += ok ? ' show correct-fb' : ' show wrong-fb';
      fb.innerHTML  = `<strong>${ok ? '✓ Correct!' : '✗ Incorrect'}</strong>` +
        (q.explanation ? `<div class="fb-expl">💡 ${UI.esc(q.explanation)}</div>` : '');
    }

    // Buttons
    document.getElementById('btnPrev').disabled  = _idx === 0;
    document.getElementById('btnNext').textContent = _idx === _qs.length - 1 ? 'Review & Submit' : 'Save & Next →';
    const markLabel = _marked[q.id] ? 'Unmark Review' : 'Mark for review';
    document.getElementById('btnMark').textContent = markLabel;
    document.getElementById('btnMarkMobile').textContent = _marked[q.id] ? '★ Marked for review' : '☆ Mark for review';
    document.getElementById('btnClear').disabled = res === undefined;
    document.getElementById('btnClearMobile').hidden = res === undefined;

    _renderPalette();
  }

  function _select(optId) {
    const q = _qs[_idx];
    if (_mode === 'practice' && _responses[q.id] !== undefined) return;
    _responses[q.id] = optId;
    _render();
  }

  function _resetQuestionScroll() {
    document.querySelector('.question-panel').scrollTo(0, 0);
  }

  /* ── Public controls ── */
  function toggleMark()    { const q = _qs[_idx]; if (_marked[q.id]) delete _marked[q.id]; else _marked[q.id] = true; _render(); }
  function clearResponse() { const q = _qs[_idx]; delete _responses[q.id]; _render(); }
  function prev()          { if (_idx > 0) { _idx--; _render(); _resetQuestionScroll(); } }
  function next()          { if (_idx < _qs.length - 1) { _idx++; _visited[_qs[_idx].id] = true; _render(); _resetQuestionScroll(); } else _promptSubmit(); }
  function goTo(i)         { if (i < 0 || i >= _qs.length) return; _idx = i; closePalette(); _render(); _resetQuestionScroll(); }
  function submit()        { _promptSubmit(); }

  function _promptSubmit() {
    const un = _qs.length - Object.keys(_responses).length;
    UI.confirm(un ? `${un} question(s) unanswered. Submit anyway?` : 'Submit the test?',
      () => { clearInterval(_timer); Results.show(_qs, _responses, _mode, Math.round((Date.now()-_startTime)/1000), _label); });
  }

  /* ── Palette ── */
  function _renderPalette() {
    const total    = _qs.length;
    const answered = Object.keys(_responses).length;
    const marked   = Object.keys(_marked).length;
    document.getElementById('pStatAnswered').textContent   = `Answered ${answered}`;
    document.getElementById('pStatMarked').textContent     = `Marked ${marked}`;
    document.getElementById('pStatUnanswered').textContent = `Unanswered ${total - answered}`;

    document.getElementById('paletteGrid').innerHTML = _qs.map((q, i) => {
      const res  = _responses[q.id];
      const isMk = _marked[q.id];
      let cls = 'pq-btn' + (i === _idx ? ' current' : isMk ? ' marked' : res !== undefined ? ' answered' : '');
      return `<button class="${cls}" onclick="Exam.goTo(${i})">${i + 1}</button>`;
    }).join('');
  }

  function _dBadge(d) { return d==='easy' ? 'badge-green' : d==='hard' ? 'badge-red' : 'badge-amber'; }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePalette();
  });
  window.addEventListener('resize', closePalette);

  return { start, prev, next, goTo, toggleMark, clearResponse, submit, togglePalette, closePalette };
})();
