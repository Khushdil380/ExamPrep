/* =============================================================
   ui.js — Page routing, toast, confirm dialog, shared utils.
   ============================================================= */
const UI = (() => {
  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + id);
    if (el) el.classList.add('active');
  }

  function toast(msg, type = 'info', ms = 3000) {
    const wrap = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  let _cb = null;
  function confirm(msg, onYes) {
    document.getElementById('confirmMsg').textContent = msg;
    _cb = onYes;
    document.getElementById('confirmDialog').classList.add('open');
  }
  window._confirmYes = () => { document.getElementById('confirmDialog').classList.remove('open'); if (_cb) _cb(); _cb = null; };
  window._confirmNo  = () => { document.getElementById('confirmDialog').classList.remove('open'); _cb = null; };

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(sec) {
    if (!sec && sec !== 0) return '—';
    const m = Math.floor(sec / 60), s = sec % 60;
    return m ? `${m}m ${s}s` : `${s}s`;
  }

  return { showPage, toast, confirm, esc, shuffle, formatTime };
})();
