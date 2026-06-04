/* Landing: music player, projects expand, stripes fade-in. */
(function() {
  'use strict';
  var audio = document.getElementById('audio');
  if (!audio) return;

  // ---- DOM refs (player + projects) ----
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
  var lcdTrackNum = document.getElementById('lcdTrackNum');
  var projectsToggle = document.getElementById('projectsToggle');
  var projectListWrap = document.getElementById('projectListWrap');
  var projectsHint = document.getElementById('projectsHint');

  var tracks = window.__TRACKS__ || [];
  var currentTrack = typeof window.__DEFAULT_TRACK_INDEX__ === 'number' ? window.__DEFAULT_TRACK_INDEX__ : 0;
  var killswitchVideo = document.getElementById('killswitchVideo');
  var lcdScreen = document.querySelector('.lcd-screen');

  function currentTrackHasVideo() {
    var t = tracks[currentTrack];
    return !!(t && t.video);
  }

  function syncVideoTime() {
    if (!killswitchVideo || !currentTrackHasVideo() || !audio.duration) return;
    var target = audio.currentTime % (killswitchVideo.duration || audio.duration);
    if (isFinite(target) && Math.abs(killswitchVideo.currentTime - target) > 0.3) {
      killswitchVideo.currentTime = target;
    }
  }

  function syncVideoPlayback() {
    if (!killswitchVideo) return;
    if (!currentTrackHasVideo() || audio.paused) {
      hideVideo();
      return;
    }
    if (lcdScreen) lcdScreen.classList.add('lcd-screen--video');
    killswitchVideo.classList.add('is-active');
    syncVideoTime();
    var playPromise = killswitchVideo.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function() {});
    }
  }

  function hideVideo() {
    if (lcdScreen) lcdScreen.classList.remove('lcd-screen--video');
    if (!killswitchVideo) return;
    killswitchVideo.classList.remove('is-active');
    killswitchVideo.pause();
  }

  // Zero-pad a number to 2 digits ("1" → "01"). Used for the LCD track-number readout.
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

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
    lcdTrackNum.textContent = pad2(currentTrack + 1) + '/' + pad2(tracks.length);
    progressFill.style.width = '0%';
    progressTrack.setAttribute('aria-valuenow', '0');
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    hideVideo();
    if (tracks[currentTrack].video && killswitchVideo) {
      killswitchVideo.currentTime = 0;
    }
    if (autoplay || wasPlaying) {
      audio.play();
    }
  }

  // Load the default track into the player on page load (no autoplay).
  loadTrack(currentTrack, false);

  // Advance to the next track, wrapping around. Used by the skip button and track-ended handler.
  function skipTrack() {
    loadTrack((currentTrack + 1) % tracks.length, true);
  }

  // ---- Web Audio API setup (for the frequency-bar visualizer) ----
  // Lazily initialized on first play because browsers require a user gesture.
  var audioCtx, analyser, source, isSetup = false;

  // ---- Generate the 32 waveform bars ----
  // Each bar is clickable: clicking bar i seeks the audio to fraction i/(NUM_BARS-1) of duration.
  var NUM_BARS = 32;
  var bars = [];
  for (var i = 0; i < NUM_BARS; i++) {
    var bar = document.createElement('div');
    bar.className = 'waveform-bar';
    bar.style.animationDelay = (i * 0.07) + 's';
    bar.dataset.index = i;
    bar.addEventListener('click', onBarClick);
    waveformEl.appendChild(bar);
    bars.push(bar);
  }

  // Seek to the fraction corresponding to the clicked bar's index.
  function onBarClick(e) {
    if (!audio.duration) return;
    var idx = Number(e.currentTarget.dataset.index);
    var pct = idx / (NUM_BARS - 1);
    seekToPct(pct);
  }

  // Visualizer smoothing state — persists across play/pause so the bars decay naturally
  // instead of snapping to zero. ATTACK/RELEASE control how fast bars rise/fall.
  var smoothed = new Float32Array(NUM_BARS);
  var binRanges = null;
  var ATTACK = 0.52;
  var RELEASE = 0.1;

  // Precompute which FFT bins feed each bar. Log-spaced so bass doesn't dominate
  // and highs get enough resolution to actually show up.
  function computeBinRanges() {
    if (!analyser) return;
    var bufLen = analyser.frequencyBinCount;
    var minBin = 2;
    var maxBin = Math.floor(bufLen * 0.75);
    binRanges = [];
    for (var i = 0; i < NUM_BARS; i++) {
      var t0 = i / NUM_BARS;
      var t1 = (i + 1) / NUM_BARS;
      var start = Math.max(minBin, Math.round(minBin * Math.pow(maxBin / minBin, t0)));
      var end = Math.max(start + 1, Math.round(minBin * Math.pow(maxBin / minBin, t1)));
      binRanges.push([start, Math.min(end, bufLen)]);
    }
  }

  function peakForBar(data, range) {
    var peak = 0;
    for (var j = range[0]; j < range[1]; j++) {
      if (data[j] > peak) peak = data[j];
    }
    return peak / 255;
  }

  function setBarHeight(index, level) {
    var h = 8 + level * 92;
    bars[index].style.height = h + '%';
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
      analyser.smoothingTimeConstant = 0.55;
      binRanges = null;
      isSetup = true;
      computeBinRanges();
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
    syncVideoPlayback();
    visualize();
  });

  // On pause: swap icon back, then run a short decay loop so the bars
  // smoothly shrink to idle instead of freezing mid-height.
  audio.addEventListener('pause', function() {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    player.classList.remove('playing');
    hideVideo();
    (function decay() {
      if (!audio.paused) return;
      var active = false;
      for (var i = 0; i < NUM_BARS; i++) {
        smoothed[i] *= 0.78;
        if (smoothed[i] > 0.005) active = true;
        setBarHeight(i, smoothed[i]);
      }
      if (active) requestAnimationFrame(decay);
      else {
        for (var j = 0; j < NUM_BARS; j++) {
          smoothed[j] = 0;
          bars[j].style.height = '8%';
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
  // Update fill width + current time + ARIA value as playback advances (skipped while dragging).
  audio.addEventListener('timeupdate', function() {
    if (!audio.duration || isDragging) return;
    var pct = audio.currentTime / audio.duration;
    progressFill.style.width = (pct * 100) + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    progressTrack.setAttribute('aria-valuenow', Math.round(pct * 100));
    if (currentTrackHasVideo() && !audio.paused) {
      if (audio.currentTime < prevAudioTime - 0.5) {
        var target = audio.currentTime % (killswitchVideo.duration || audio.duration);
        if (isFinite(target)) killswitchVideo.currentTime = target;
      } else {
        syncVideoTime();
      }
    }
    prevAudioTime = audio.currentTime;
  });

  audio.addEventListener('loadedmetadata', function() {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  // ---- Smooth drag-to-seek ----
  // Mouse/touch start on the track begins dragging; global move/up listeners
  // keep seeking working even when the pointer leaves the track.
  var isDragging = false;
  var prevAudioTime = 0;

  // Shared seek helper — used by mouse/touch drag, bar clicks, and keyboard arrows.
  function seekToPct(pct) {
    if (!audio.duration) return;
    pct = Math.max(0, Math.min(1, pct));
    audio.currentTime = pct * audio.duration;
    progressFill.style.width = (pct * 100) + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    progressTrack.setAttribute('aria-valuenow', Math.round(pct * 100));
    if (currentTrackHasVideo()) syncVideoTime();
  }

  function seekTo(clientX) {
    if (!audio.duration) return;
    var rect = progressTrack.getBoundingClientRect();
    seekToPct((clientX - rect.left) / rect.width);
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

  // ---- Keyboard seek on the progress bar (role="slider") ----
  // Arrow keys ± 5s, PageUp/Down ± 10%, Home/End jump to start/end.
  progressTrack.addEventListener('keydown', function(e) {
    if (!audio.duration) return;
    var step = 5; // seconds for arrow keys
    var page = 0.1 * audio.duration; // 10% of track for PageUp/Down
    var t = audio.currentTime;
    var handled = true;
    switch (e.code) {
      case 'ArrowLeft':
      case 'ArrowDown':
        t = Math.max(0, t - step); break;
      case 'ArrowRight':
      case 'ArrowUp':
        t = Math.min(audio.duration, t + step); break;
      case 'PageDown':
        t = Math.max(0, t - page); break;
      case 'PageUp':
        t = Math.min(audio.duration, t + page); break;
      case 'Home':
        t = 0; break;
      case 'End':
        t = audio.duration; break;
      default:
        handled = false;
    }
    if (handled) {
      e.preventDefault();
      seekToPct(t / audio.duration);
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
  // Allow spacebar from anywhere except form controls (where it types a space) and
  // native buttons (where Space triggers their own click). This fixes the bug where
  // clicking Play moved focus to the button and then Space stopped working on empty page clicks.
  document.addEventListener('keydown', function(e) {
    if (e.code !== 'Space') return;
    var target = e.target;
    var tag = (target.tagName || '').toLowerCase();
    var isFormInput = tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
    var isNativeButton = tag === 'button';
    var isSlider = target === progressTrack;
    if (isFormInput || isNativeButton || isSlider) return;
    e.preventDefault();
    togglePlay();
  });

  // ---- Projects expand/collapse ----
  // Clicking the heading toggles the project list + updates the "(click)/(hide)" hint
  // and mirrors state onto aria-expanded for assistive tech.
  // Also zooms the decorative goat as a small delight.
  var goat = document.querySelector('.goat');
  projectsToggle.addEventListener('click', function() {
    var isOpen = projectListWrap.classList.toggle('open');
    projectsHint.textContent = isOpen ? '(hide)' : '(click)';
    projectsToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (goat) goat.classList.toggle('zoomed', isOpen);
  });

  // ---- Audio visualization loop ----
  // Reads FFT data each frame, averages across each bar's bin range,
  // then smooths (attack on rise, release on fall) into the heights.
  function visualize() {
    if (!analyser) { randomVisualize(); return; }
    if (!binRanges) computeBinRanges();
    var data = new Uint8Array(analyser.frequencyBinCount);
    function draw() {
      if (audio.paused) return;
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      var targets = new Float32Array(NUM_BARS);
      var maxT = 0;
      for (var i = 0; i < NUM_BARS; i++) {
        var raw = peakForBar(data, binRanges[i]);
        targets[i] = Math.pow(raw, 0.65);
        if (targets[i] > maxT) maxT = targets[i];
      }
      var scale = maxT > 0.06 ? 1 / maxT : 1;
      for (var i = 0; i < NUM_BARS; i++) {
        var target = Math.min(1, targets[i] * scale);
        var rate = target > smoothed[i] ? ATTACK : RELEASE;
        smoothed[i] += (target - smoothed[i]) * rate;
        setBarHeight(i, smoothed[i]);
      }
    }
    draw();
  }

  function randomVisualize() {
    var phase = 0;
    function draw() {
      if (audio.paused) return;
      requestAnimationFrame(draw);
      phase += 0.14;
      for (var i = 0; i < NUM_BARS; i++) {
        var wave = (Math.sin(phase + i * 0.42) + 1) * 0.22;
        var target = Math.min(1, wave + Math.random() * 0.32);
        var rate = target > smoothed[i] ? ATTACK : RELEASE;
        smoothed[i] += (target - smoothed[i]) * rate;
        setBarHeight(i, smoothed[i]);
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
