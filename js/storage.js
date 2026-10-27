/* =============================================================
   storage.js — localStorage: test history only.
   ============================================================= */
const Storage = (() => {
  const KEY = 'ep_history';

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function addHistory(record) {
    const h = getHistory();
    h.unshift({ ...record, date: new Date().toISOString() });
    if (h.length > 50) h.pop();
    try { localStorage.setItem(KEY, JSON.stringify(h)); } catch {}
  }

  return { getHistory, addHistory };
})();
