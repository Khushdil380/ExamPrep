/* =============================================================
   results.js — Results display and question review.
   ============================================================= */
const Results = (() => {
  let _d = null;

  function show(questions, responses, mode, elapsed, label) {
    let correct = 0, incorrect = 0, unanswered = 0;
    questions.forEach(q => {
      const r = responses[q.id];
      if      (r === undefined)        unanswered++;
      else if (r === q.correctAnswer)  correct++;
      else                             incorrect++;
    });
    const total    = questions.length;
    const attempted= correct + incorrect;
    const accuracy = attempted ? Math.round(correct / attempted * 100) : 0;
    _d = { questions, responses, correct, incorrect, unanswered, total, attempted, accuracy, elapsed, label };

    Storage.addHistory({ label, total, correct, incorrect, unanswered, accuracy, time: UI.formatTime(elapsed) });

    const circle = document.getElementById('scoreCircle');
    circle.innerHTML = `<span class="pct">${accuracy}%</span><span class="lbl">Accuracy</span>`;
    circle.className = `score-circle ${accuracy>=80?'great':accuracy>=60?'good':accuracy>=40?'avg':'poor'}`;

    _set('rTotal', total); _set('rCorrect', correct); _set('rIncorrect', incorrect);
    _set('rUnanswered', unanswered); _set('rAttempted', attempted);
    _set('rScore', `${correct}/${total}`); _set('rTime', UI.formatTime(elapsed));

    UI.showPage('results');
    renderReview('all');
    document.querySelector('.results-body').scrollTo(0, 0);
  }

  function _set(id, val) { document.getElementById(id).textContent = val; }

  function renderReview(filter) {
    const { questions, responses } = _d;
    document.querySelectorAll('.rtab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));

    const list = filter === 'incorrect'  ? questions.filter(q => responses[q.id] !== undefined && responses[q.id] !== q.correctAnswer)
               : filter === 'unanswered' ? questions.filter(q => responses[q.id] === undefined)
               : filter === 'correct'    ? questions.filter(q => responses[q.id] === q.correctAnswer)
               : questions;

    const container = document.getElementById('reviewList');
    if (!list.length) { container.innerHTML = '<p class="empty-msg">Nothing to show here.</p>'; return; }

    container.innerHTML = list.map(q => {
      const r = responses[q.id], ok = r === q.correctAnswer, skip = r === undefined;
      const qNum = questions.indexOf(q) + 1;
      const statusBadge = skip ? '<span class="badge badge-amber">Skipped</span>'
                        : ok   ? '<span class="badge badge-green">✓ Correct</span>'
                        :        '<span class="badge badge-red">✗ Wrong</span>';
      const opts = q.options.map(opt => {
        let cls = 'rq-option';
        if (opt.id === q.correctAnswer)      cls += ' r-correct';
        else if (opt.id === r && !ok)        cls += ' r-wrong';
        const tag = opt.id === q.correctAnswer ? ' ✓'
                  : opt.id === r && !ok ? ' ← your answer'
                  : opt.id === r && ok  ? ' (your answer)' : '';
        return `<div class="${cls}"><span class="rq-opt-key">${UI.esc(opt.id)}.</span><span>${UI.esc(opt.text)}${tag}</span></div>`;
      }).join('');
      const expl = q.explanation
        ? `<div class="rq-explanation"><strong>Explanation</strong>${UI.esc(q.explanation)}</div>` : '';
      return `<div class="rq-card">
        <div class="rq-head"><strong>Q${qNum}</strong>${statusBadge}
          ${q._categoryName ? `<span class="badge badge-gray">${UI.esc(q._categoryName)}</span>` : ''}
          ${q.source ? `<span class="badge badge-gray">📌 ${UI.esc(q.source)}</span>` : ''}
        </div>
        <div class="rq-body">
          <div class="rq-text">${UI.esc(q.question)}</div>
          <div class="rq-options">${opts}</div>${expl}
        </div></div>`;
    }).join('');
  }

  function retry() {
    if (!_d) return;
    Exam.start({ questions: UI.shuffle(_d.questions), mode: _d.mode || 'exam',
      timerSeconds: 0, label: _d.label });
  }

  return { show, renderReview, retry };
})();
