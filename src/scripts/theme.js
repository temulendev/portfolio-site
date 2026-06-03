/* Shared theme toggle + color picker (all pages). */
(function() {
  'use strict';

  var themeToggle = document.getElementById('themeToggle');
  var themePicker = document.querySelector('.theme-picker');
  var themePickerToggle = document.getElementById('themePickerToggle');
  var themePickerMenu = document.getElementById('themePickerMenu');
  var themeSwatches = document.querySelectorAll('.theme-swatch');

  function getDefaultColor() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'forest' : 'amber';
  }

  function applyThemeColor(color, explicit) {
    if (color) {
      document.documentElement.setAttribute('data-color', color);
      if (explicit) localStorage.setItem('theme-color-explicit', color);
    } else {
      document.documentElement.removeAttribute('data-color');
    }
    for (var i = 0; i < themeSwatches.length; i++) {
      var sw = themeSwatches[i];
      sw.setAttribute('data-active', sw.dataset.themeColor === color ? 'true' : 'false');
      sw.setAttribute('aria-checked', sw.dataset.themeColor === color ? 'true' : 'false');
    }
  }

  var savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.innerHTML = '&#9788;';
  }

  applyThemeColor(localStorage.getItem('theme-color-explicit') || getDefaultColor());

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      themeToggle.classList.remove('spinning');
      void themeToggle.offsetWidth;
      themeToggle.classList.add('spinning');
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '&#9790;';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '&#9788;';
      }
      if (!localStorage.getItem('theme-color-explicit')) {
        applyThemeColor(getDefaultColor());
      }
      setTimeout(function() { themeToggle.classList.remove('spinning'); }, 400);
    });
  }

  if (themePickerToggle && themePickerMenu) {
    var setPickerOpen = function(open) {
      if (open) {
        themePickerMenu.removeAttribute('hidden');
        themePickerToggle.setAttribute('aria-expanded', 'true');
      } else {
        themePickerMenu.setAttribute('hidden', '');
        themePickerToggle.setAttribute('aria-expanded', 'false');
      }
    };

    themePickerToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      setPickerOpen(themePickerMenu.hasAttribute('hidden'));
    });

    for (var s = 0; s < themeSwatches.length; s++) {
      themeSwatches[s].addEventListener('click', function() {
        applyThemeColor(this.dataset.themeColor, true);
      });
    }

    document.addEventListener('click', function(e) {
      if (!themePickerMenu.hasAttribute('hidden') && !themePicker.contains(e.target)) {
        setPickerOpen(false);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.code === 'Escape' && !themePickerMenu.hasAttribute('hidden')) {
        setPickerOpen(false);
        themePickerToggle.focus();
      }
    });
  }
})();
