/* ============================================================
   Temulen Iveelt — portfolio landing page script
   Two IIFEs:
     1) Main — music player, theme toggle, projects expand, stripes fade-in
     2) Goat — hover glow on the decorative goat image
   ============================================================ */


/* ============================================================
   1) MAIN IIFE
   ============================================================ */
(function() {
  'use strict';

  // ---- DOM refs (all elements the player/theme/projects logic touches) ----
  var audio = document.getElementById('audio');
  var playPauseBtn = document.getElementById('playPauseBtn');
  var skipBtn = document.getElementById('skipBtn');
  var playIcon = document.getElementById('playIcon');
  var pauseIcon = document.getElementById('pauseIcon');
  var loopBtn = document.getElementById('loopBtn');
  var progressTrack = document.getElementById('progressTrack');
  var progressFill = document.getElementById('progressFill');
  var currentTimeEl = document.getElementById('currentTime');
  var totalTimeEl = document.getElementById('totalTime');
  var waveformEl = document.getElementById('waveform');
  var player = document.getElementById('player');
  var lcdTitle = document.getElementById('lcdTitle');
  var lcdArtist = document.getElementById('lcdArtist');
  var lcdAlbum = document.getElementById('lcdAlbum');
  var lcdDate = document.getElementById('lcdDate');
  var projectsToggle = document.getElementById('projectsToggle');
  var projectListWrap = document.getElementById('projectListWrap');
  var projectsHint = document.getElementById('projectsHint');
  var themeToggle = document.getElementById('themeToggle');

  // ---- Track list ----
  // Paths are relative to landing/index.html so the audio files in the repo root
  // need the ../ prefix. `album` accepts HTML (used for the colored "Synchronicity" title).
  var tracks = [
    { src: '../angelIns.mp3', title: 'angel.mp3', artist: 'Temulen Iveelt', album: '', date: '12.31.2025' },
    { src: '../everybreathyoutake.mp3', title: 'Every Breath You Take.mp3', artist: 'Temulen Iveelt', album: 'The Police — <span class="sync-blue">Synch</span><span class="sync-yellow">roni</span><span class="sync-red">city</span>', date: '07.30.2025' }
  ];
  var currentTrack = 0;

  // Swap the audio element to a new track and update the LCD metadata.
  // If already playing (or autoplay=true), resume playback on the new track.
  function loadTrack(index, autoplay) {
    var wasPlaying = !audio.paused;
    currentTrack = index;
    var t = tracks[currentTrack];
    audio.src = t.src;
    audio.load();
    lcdTitle.textContent = t.title;
    lcdArtist.textContent = t.artist;
    lcdAlbum.innerHTML = t.album;
    lcdDate.textContent = t.date;
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    if (autoplay || wasPlaying) {
      audio.play();
    }
  }

  // Advance to the next track, wrapping around. Used by the skip button and track-ended handler.
  function skipTrack() {
    loadTrack((currentTrack + 1) % tracks.length, true);
  }

  // ---- Theme toggle ----
  // Restore saved theme on load; click flips the attribute on <html>, persists to localStorage,
  // swaps the icon (☾/☀), and triggers a one-shot 360° rotation via the .spinning class.
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '&#9788;';
  }

  themeToggle.addEventListener('click', function() {
    // Remove + reflow + re-add to restart the rotate animation every click.
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
    setTimeout(function() { themeToggle.classList.remove('spinning'); }, 400);
  });

  // ---- Web Audio API setup (for the frequency-bar visualizer) ----
  // Lazily initialized on first play because browsers require a user gesture.
  var audioCtx, analyser, source, isSetup = false;

  // ---- Generate the 32 waveform bars ----
  var NUM_BARS = 32;
  var bars = [];
  for (var i = 0; i < NUM_BARS; i++) {
    var bar = document.createElement('div');
    bar.className = 'waveform-bar';
    bar.style.animationDelay = (i * 0.07) + 's';
    waveformEl.appendChild(bar);
    bars.push(bar);
  }

  // Visualizer smoothing state — persists across play/pause so the bars decay naturally
  // instead of snapping to zero. ATTACK/RELEASE control how fast bars rise/fall.
  var smoothed = new Float32Array(NUM_BARS);
  var binRanges = null;
  var ATTACK = 0.35;
  var RELEASE = 0.14;

  // Precompute which FFT bins feed each bar. Log-spaced so bass doesn't dominate
  // and highs get enough resolution to actually show up.
  function computeBinRanges() {
    if (!analyser) return;
    var bufLen = analyser.frequencyBinCount;
    var minBin = 2;
    var maxBin = Math.floor(bufLen * 0.75);
    binRanges = [];
    for (var i = 0; i < NUM_BARS; i++) {
      var start = Math.max(minBin, Math.round(minBin * Math.pow(maxBin / minBin, i / NUM_BARS)));
      var end   = Math.max(start + 1, Math.round(minBin * Math.pow(maxBin / minBin, (i + 1) / NUM_BARS)));
      binRanges.push([start, Math.min(end, bufLen)]);
    }
  }

  // Seconds → "m:ss" for the LCD time readouts.
  function formatTime(s) {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // Wire up AudioContext → AnalyserNode → destination on first play.
  // Guarded by isSetup so we only do this once per page load.
  function setupAudio() {
    if (isSetup) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      isSetup = true;
    } catch(e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  // Play/pause entry point — also used by the spacebar handler below.
  function togglePlay() {
    setupAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (audio.paused) audio.play();
    else audio.pause();
  }

  // ---- UI state sync (audio element events → DOM) ----

  // On play: swap icon, mark player as .playing, start drawing bars.
  audio.addEventListener('play', function() {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    player.classList.add('playing');
    visualize();
  });

  // On pause: swap icon back, then run a short decay loop so the bars
  // smoothly shrink to idle instead of freezing mid-height.
  audio.addEventListener('pause', function() {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    player.classList.remove('playing');
    (function decay() {
      if (!audio.paused) return;
      var active = false;
      for (var i = 0; i < NUM_BARS; i++) {
        smoothed[i] *= 0.78;
        if (smoothed[i] > 0.005) active = true;
        bars[i].style.height = Math.max(2, smoothed[i] * 100) + '%';
      }
      if (active) requestAnimationFrame(decay);
      else {
        for (var j = 0; j < NUM_BARS; j++) {
          smoothed[j] = 0;
          bars[j].style.height = '2px';
        }
      }
    })();
  });

  // At track end: auto-advance unless loop is on (audio.loop handles that natively).
  audio.addEventListener('ended', function() {
    if (!audio.loop) {
      skipTrack();
    }
  });

  // ---- Progress tracking ----
  // Update fill width + current time as playback advances (skipped while dragging).
  audio.addEventListener('timeupdate', function() {
    if (!audio.duration || isDragging) return;
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', function() {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  // ---- Smooth drag-to-seek ----
  // Mouse/touch start on the track begins dragging; global move/up listeners
  // keep seeking working even when the pointer leaves the track.
  var isDragging = false;

  function seekTo(clientX) {
    if (!audio.duration) return;
    var rect = progressTrack.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    progressFill.style.width = (pct * 100) + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }

  progressTrack.addEventListener('mousedown', function(e) {
    isDragging = true;
    progressFill.classList.add('dragging');
    seekTo(e.clientX);
  });

  document.addEventListener('mousemove', function(e) {
    if (isDragging) seekTo(e.clientX);
  });

  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      progressFill.classList.remove('dragging');
    }
  });

  progressTrack.addEventListener('touchstart', function(e) {
    isDragging = true;
    progressFill.classList.add('dragging');
    seekTo(e.touches[0].clientX);
  }, {passive: true});

  document.addEventListener('touchmove', function(e) {
    if (isDragging) seekTo(e.touches[0].clientX);
  }, {passive: true});

  document.addEventListener('touchend', function() {
    if (isDragging) {
      isDragging = false;
      progressFill.classList.remove('dragging');
    }
  });

  // ---- Transport button wiring ----
  playPauseBtn.addEventListener('click', togglePlay);
  skipBtn.addEventListener('click', skipTrack);

  // ---- Loop toggle ----
  // Flips audio.loop + the LOOP button's active styling.
  loopBtn.addEventListener('click', function() {
    audio.loop = !audio.loop;
    loopBtn.classList.toggle('active', audio.loop);
  });

  // ---- Keyboard shortcut: spacebar plays/pauses ----
  // Only when focus is on <body> so typing elsewhere doesn't steal the key.
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      togglePlay();
    }
  });

  // ---- Projects expand/collapse ----
  // Clicking the heading toggles the project list + updates the "(click)/(hide)" hint.
  // Also zooms the decorative goat as a small delight.
  var goat = document.querySelector('.goat');
  projectsToggle.addEventListener('click', function() {
    var isOpen = projectListWrap.classList.toggle('open');
    projectsHint.textContent = isOpen ? '(hide)' : '(click)';
    if (goat) goat.classList.toggle('zoomed', isOpen);
  });

  // ---- Audio visualization loop ----
  // Reads FFT data each frame, averages across each bar's bin range,
  // then smooths (attack on rise, release on fall) into the heights.
  function visualize() {
    if (!analyser) { randomVisualize(); return; }
    if (!binRanges) computeBinRanges();
    var bufLen = analyser.frequencyBinCount;
    var data = new Uint8Array(bufLen);
    function draw() {
      if (audio.paused) return;
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      for (var i = 0; i < NUM_BARS; i++) {
        var r = binRanges[i];
        var sum = 0;
        var count = r[1] - r[0];
        for (var j = r[0]; j < r[1]; j++) sum += data[j];
        var avg = (sum / count) / 255;
        // Tilt: boost highs so the spectrum reads evenly across the bar row.
        var gain = 1 + (i / (NUM_BARS - 1)) * 1.0;
        var target = Math.min(1, avg * gain);
        var rate = target > smoothed[i] ? ATTACK : RELEASE;
        smoothed[i] += (target - smoothed[i]) * rate;
        bars[i].style.height = Math.max(2, smoothed[i] * 100) + '%';
      }
    }
    draw();
  }

  // Fallback visualizer used when Web Audio isn't available — just noise,
  // but smoothed through the same attack/release so it still looks alive.
  function randomVisualize() {
    function draw() {
      if (audio.paused) return;
      requestAnimationFrame(draw);
      for (var i = 0; i < NUM_BARS; i++) {
        var target = Math.random() * 0.7 + 0.1;
        var rate = target > smoothed[i] ? ATTACK : RELEASE;
        smoothed[i] += (target - smoothed[i]) * rate;
        bars[i].style.height = Math.max(2, smoothed[i] * 100) + '%';
      }
    }
    draw();
  }

  // ---- Stripes fade-in on load ----
  // The three flag stripes start at opacity:0 and fade in on the next frame
  // (CSS transition handles the staggered timing via transition-delay).
  requestAnimationFrame(function() {
    document.querySelector('.stripe--blue').classList.add('visible');
    document.querySelector('.stripe--yellow').classList.add('visible');
    document.querySelector('.stripe--red').classList.add('visible');
  });

})();


/* ============================================================
   2) GOAT HOVER GLOW
   The goat has pointer-events: none (so it doesn't block clicks),
   which means :hover won't fire. Instead we hit-test mouse position
   against its bounding rect and apply the glow via a CSS custom property.
   ============================================================ */
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
