const Preloader = (() => {
  const minimumDisplayMs = 2200;
  const startedAt = performance.now();
  let hideRequested = false;

  function hide() {
    if (hideRequested) return;
    hideRequested = true;

    const remainingMs = Math.max(0, minimumDisplayMs - (performance.now() - startedAt));
    window.setTimeout(() => {
      const preloader = document.getElementById('app-preloader');
      if (!preloader) {
        throw new Error('The app preloader element was not found.');
      }

      preloader.setAttribute('aria-hidden', 'true');
      preloader.classList.add('is-hidden');
    }, remainingMs);
  }

  return { hide };
})();
