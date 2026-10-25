// Extrait de bibliography.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
'use strict';
  const savedTheme = localStorage.getItem('biq-theme');
  const darkMode = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('biq-theme', isDark ? 'light' : 'dark');
  });
