/* Goat hover glow (landing card). */
(function() {
  'use strict';
  var goat = document.querySelector('.goat');
  if (!goat) return;
  var hovered = false;
  document.addEventListener('mousemove', function(e) {
    var r = goat.getBoundingClientRect();
    var over = e.clientX >= r.left && e.clientX <= r.right &&
               e.clientY >= r.top  && e.clientY <= r.bottom;
    if (over === hovered) return;
    hovered = over;
    if (over) {
      goat.style.setProperty('--goat-glow',
        'drop-shadow(0 0 16px rgba(255,255,255,0.4)) drop-shadow(0 0 6px rgba(255,255,255,0.2))');
      goat.style.opacity = '0.3';
    } else {
      goat.style.setProperty('--goat-glow', 'drop-shadow(0 0 0 transparent)');
      goat.style.opacity = '0.17';
    }
  });
})();
