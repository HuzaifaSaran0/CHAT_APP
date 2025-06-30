// Theme switching functionality
document.addEventListener('DOMContentLoaded', function () {
  const themeToggleButtons = document.querySelectorAll('[id^="theme-toggle"]');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  // Check for saved theme preference or use the system preference
  const currentTheme = localStorage.getItem('theme') ||
    (prefersDarkScheme.matches ? 'dark' : 'light');

  // Apply the current theme
  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // Set up event listeners for all theme toggle buttons
  themeToggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  });
});