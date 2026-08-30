import { Game } from './core/Game.js';

function setupOrientationGuard() {
  const guard = document.getElementById('orientation-guard');
  if (!guard) return;

  const updateOrientation = () => {
    const isPortrait = window.innerHeight >= window.innerWidth;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
    const isMobilePortrait = isPortrait && isTouch && window.innerWidth <= 850;

    if (isMobilePortrait) {
      guard.classList.add('active');
    } else {
      guard.classList.remove('active');
    }
  };

  window.addEventListener('resize', updateOrientation, { passive: true });
  window.addEventListener('orientationchange', updateOrientation, { passive: true });
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', updateOrientation);
  }
  updateOrientation();
}

window.addEventListener('DOMContentLoaded', () => {
  setupOrientationGuard();
  const game = new Game();
  window.immuneGame = game;
  window.game = game;
});
