(() => {
  const locale = window.location.pathname.split('/')[1];
  const isPublicLocale = locale === 'en' || locale === 'pt-BR' || locale === 'es';
  if (isPublicLocale) {
    document.documentElement.lang = locale;
  } else {
    document.documentElement.lang = 'en';
  }

  let theme = 'dark';
  if (!isPublicLocale) {
    try {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
    } catch {}
  }
  try {
    const saved = window.localStorage.getItem('spryxel.theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch {}
  document.documentElement.dataset.theme = theme;
})();
