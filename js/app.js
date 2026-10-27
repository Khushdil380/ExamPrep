/* =============================================================
   app.js — Boot and settings panel open/close only.
   All panel logic lives in settings.js.
   ============================================================= */
const App = (() => {

  async function init() {
    await Data.init();
    Settings.build();
    await _autoStart();
  }

  /* On page load: pick a random subject, start exam immediately */
  async function _autoStart() {
    const { questions, label } = await Data.getRandomSubjectQuestions();
    if (!questions.length) {
      UI.toast('No questions found. Add JSON files and register them in questions/index.json', 'error', 6000);
      return;
    }
    const qs   = UI.shuffle(questions);
    const timerMinutes = Settings.setRecommendedDuration(qs.length);
    const timerSeconds = timerMinutes * 60;
    Exam.start({ questions: qs, mode: 'exam', timerSeconds, label });
  }

  function openSettings() {
    document.getElementById('settingsPanel').classList.add('open');
    document.getElementById('settingsOverlay').classList.add('open');
  }

  function closeSettings() {
    document.getElementById('settingsPanel').classList.remove('open');
    document.getElementById('settingsOverlay').classList.remove('open');
  }

  async function downloadSample() {
    try {
      const response = await fetch('data/sample.json');
      if (!response.ok) throw new Error(`Could not load sample JSON (${response.status}).`);
      const sample = await response.text();
      const url = URL.createObjectURL(new Blob([sample], { type: 'application/json' }));
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: 'sample-category.json',
      });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Sample JSON download failed:', error);
      UI.toast('Could not download the sample JSON. Please check that data/sample.json is available.', 'error', 5000);
    }
  }

  return { init, openSettings, closeSettings, downloadSample };
})();

window.addEventListener('DOMContentLoaded', () => App.init());
