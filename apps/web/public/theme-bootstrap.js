(() => {
  let theme = 'dark';
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch {}
  try {
    const saved = window.localStorage.getItem('spryxel.theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch {}
  document.documentElement.dataset.theme = theme;
})();
