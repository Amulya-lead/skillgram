// effects.js - UI enhancements (particles, confetti, sound, glitch, neon theme)

// Load saved preferences or defaults
const defaultPrefs = {
  particles: true,
  sound: true,
  glitch: true,
  confetti: true,
  neon: false,
};
const prefs = JSON.parse(localStorage.getItem('uiEffects')) || defaultPrefs;

// Update UI based on prefs
function applyPrefs() {
  // Neon theme
  if (prefs.neon) {
    document.body.classList.add('neon-mode');
  } else {
    document.body.classList.remove('neon-mode');
  }
  // Glitch on cards
  document.querySelectorAll('.post-card').forEach(card => {
    if (prefs.glitch) card.classList.add('glitch'); else card.classList.remove('glitch');
  });
}

applyPrefs();
// expose for other scripts
window.applyPrefs = applyPrefs;

  

// Settings modal handling
const settingsModal = document.getElementById('settings-modal');
const btnSettings = document.getElementById('btn-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const saveBtn = document.getElementById('save-settings');

if (btnSettings) btnSettings.addEventListener('click', () => settingsModal.classList.add('active'));
if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    prefs.particles = document.getElementById('toggle-particles').checked;
    prefs.sound = document.getElementById('toggle-sound').checked;
    prefs.glitch = document.getElementById('toggle-glitch').checked;
    prefs.confetti = document.getElementById('toggle-confetti').checked;
    prefs.neon = document.getElementById('toggle-neon').checked;
    localStorage.setItem('uiEffects', JSON.stringify(prefs));
    applyPrefs();
    // Toggle particles dynamically
    if (prefs.particles) initParticles(); else destroyParticles();
    settingsModal.classList.remove('active');
  });
}

// ---------- Particles Background ----------
let particlesInstance = null;
function initParticles() {
  if (particlesInstance) return;
  tsParticles.load('tsparticles', {
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 80 },
      color: { value: '#ff00ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.6 }
    }
  }).then(container => { particlesInstance = container; });
}
function destroyParticles() {
  if (particlesInstance) {
    particlesInstance.destroy();
    particlesInstance = null;
  }
}
if (prefs.particles) initParticles();

// ---------- Click Sound ----------
let clickSound = null;
if (prefs.sound) {
  clickSound = new Audio('https://cdn.jsdelivr.net/gh/benwiley4000/wav-library/clap.wav');
}
function playClick() {
  if (prefs.sound && clickSound) clickSound.currentTime = 0, clickSound.play();
}
// Attach to all button clicks (delegated)
document.body.addEventListener('click', e => {
  if (e.target.matches('button, a')) playClick();
});

// ---------- Confetti on New Post ----------
function launchConfetti() {
  if (prefs.confetti && typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}
// Expose globally for other scripts (e.g., UI when a post is created)
window.launchConfetti = launchConfetti;

// ---------- Glitch Hover ----------
// Already handled via CSS class; we just toggle class on cards in applyPrefs()

// Ensure neon toggle checkbox reflects current state on modal open
function syncModal() {
  document.getElementById('toggle-particles').checked = prefs.particles;
  document.getElementById('toggle-sound').checked = prefs.sound;
  document.getElementById('toggle-glitch').checked = prefs.glitch;
  document.getElementById('toggle-confetti').checked = prefs.confetti;
  document.getElementById('toggle-neon').checked = prefs.neon;
}
if (settingsModal) settingsModal.addEventListener('show', syncModal);
// Since custom event may not fire, also sync when opened
if (btnSettings) btnSettings.addEventListener('click', syncModal);

// End of effects.js
