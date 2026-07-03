// ===========================================
// THEME (dark / light mode) LOGIC
// ===========================================
const themeIcon = document.getElementById('theme-icon');

function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  if (document.documentElement.classList.contains('dark')) {
    themeIcon.setAttribute('data-lucide', 'sun');
  } else {
    themeIcon.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}
