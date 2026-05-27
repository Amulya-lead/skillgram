// ui.js - Dynamic UI enhancements for Skillgram

// Scroll-to-Top Button
function initScrollTopButton() {
  const btn = document.getElementById('btn-scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Theme toggle (dark/light) with icon update
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('btn-toggle-theme');
  if (!themeToggleBtn) return;
  
  // Initialize based on saved preference
  const saved = localStorage.getItem('theme') || 'dark';
  const isLight = saved === 'light';
  if (isLight) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }

  // Set correct icon on load
  const icon = themeToggleBtn.querySelector('i');
  if (icon) {
    icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  // Click handler toggles theme and icon
  themeToggleBtn.addEventListener('click', () => {
    const nowLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', nowLight ? 'light' : 'dark');
    if (icon) {
      icon.className = nowLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  });
}

// Stats count-up animation helper (exposed for app.js to use)
function animateStat(el, target) {
  if (!el) return;
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
window.animateStat = animateStat;

// Initialize all custom UI features after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollTopButton();
  initThemeToggle();
});
