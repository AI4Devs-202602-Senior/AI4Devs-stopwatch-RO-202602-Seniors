/**
 * Stopwatch & Countdown — script.js
 * All logic is wrapped in an IIFE to avoid global namespace pollution.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
   * CONSTANTS
   * ─────────────────────────────────────────────────────────────── */

  /** SVG circle circumference for a radius-95 ring (2π × 95) */
  const CIRCUMFERENCE = 2 * Math.PI * 95;

  /* ─────────────────────────────────────────────────────────────────
   * TAB SWITCHING
   * ─────────────────────────────────────────────────────────────── */

  /**
   * Switches the visible panel between 'sw' (stopwatch) and 'cd' (countdown).
   * @param {'sw'|'cd'} id
   */
  window.switchTab = function (id) {
    ['sw', 'cd'].forEach(function (key) {
      document.getElementById('tab-' + key).classList.toggle('active', key === id);
      document.getElementById('tab-' + key).setAttribute('aria-selected', key === id);
      document.getElementById('panel-' + key).classList.toggle('active', key === id);
    });
  };

  /* ─────────────────────────────────────────────────────────────────
   * SHARED UTILITIES
   * ─────────────────────────────────────────────────────────────── */

  /**
   * Pads a number to two digits.
   * @param {number} n
   * @returns {string}
   */
  function pad(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, '0');
  }

  /**
   * Updates an SVG progress ring.
   * @param {SVGCircleElement} ringEl  - The progress circle element
   * @param {number}           ratio   - Value between 0 (empty) and 1 (full)
   */
  function setRing(ringEl, ratio) {
    const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, ratio)));
    ringEl.style.strokeDasharray = CIRCUMFERENCE;
    ringEl.style.strokeDashoffset = offset;
  }

  /* ─────────────────────────────────────────────────────────────────
   * ■  STOPWATCH
   * ─────────────────────────────────────────────────────────────── */

  /** @type {number|null} setInterval handle */
  let swInterval  = null;

  /** Elapsed centiseconds (hundredths of a second) */
  let swCs        = 0;

  /** Centiseconds at the moment of the last lap */
  let swLastLapCs = 0;

  /** Total laps recorded */
  let swLapCount  = 0;

  /** Whether the stopwatch is actively ticking */
  let swRunning   = false;

  /* — DOM refs — */
  const swDisplay = document.getElementById('sw-display');
  const swRing    = document.getElementById('sw-ring');
  const swLapList = document.getElementById('sw-laps');
  const swBtnStart = document.getElementById('sw-start');
  const swBtnPause = document.getElementById('sw-pause');
  const swBtnLap   = document.getElementById('sw-lap');
  const swBtnReset = document.getElementById('sw-reset');

  /**
   * Renders the stopwatch display and ring from `swCs`.
   * The ring completes one full revolution every 60 seconds.
   */
  function swRender() {
    const totalSeconds = Math.floor(swCs / 100);
    const minutes      = Math.floor(totalSeconds / 60);
    const seconds      = totalSeconds % 60;
    const cents        = swCs % 100;

    swDisplay.innerHTML = pad(minutes) + ':' + pad(seconds) +
      '<span class="display-sub">:' + pad(cents) + '</span>';

    // Ring fills up once per 60-second cycle
    setRing(swRing, (swCs % 6000) / 6000);
  }

  /**
   * Ticked every 10 ms by the interval; increments centiseconds and re-renders.
   */
  function swTick() {
    swCs += 1;
    swRender();
  }

  /**
   * Starts the stopwatch.
   */
  window.swStart = function () {
    if (swRunning) return;
    swRunning = true;
    swInterval = setInterval(swTick, 10);

    swBtnStart.disabled = true;
    swBtnPause.disabled = false;
    swBtnLap.disabled   = false;
    swBtnReset.disabled = false;
  };

  /**
   * Pauses the stopwatch without resetting the elapsed time.
   */
  window.swPause = function () {
    if (!swRunning) return;
    clearInterval(swInterval);
    swInterval = null;
    swRunning  = false;

    swBtnStart.textContent = 'Resume';
    swBtnStart.disabled    = false;
    swBtnPause.disabled    = true;
    swBtnLap.disabled      = true;
  };

  /**
   * Records a lap: stores the current split and the delta since the last lap.
   */
  window.swLap = function () {
    if (!swRunning) return;

    swLapCount += 1;
    const lapCs   = swCs;
    const deltaCs = lapCs - swLastLapCs;
    swLastLapCs   = lapCs;

    const item = document.createElement('div');
    item.className = 'lap-item';
    item.setAttribute('role', 'listitem');
    item.innerHTML =
      '<span class="lap-num">Lap ' + swLapCount + '</span>' +
      '<span class="lap-time">' + swFormatCs(lapCs)   + '</span>' +
      '<span class="lap-delta">+' + swFormatCs(deltaCs) + '</span>';

    swLapList.prepend(item);
  };

  /**
   * Resets the stopwatch: stops the timer, clears the display and laps.
   */
  window.swReset = function () {
    clearInterval(swInterval);
    swInterval  = null;
    swRunning   = false;
    swCs        = 0;
    swLastLapCs = 0;
    swLapCount  = 0;

    swRender();
    swLapList.innerHTML = '';

    swBtnStart.textContent = 'Start';
    swBtnStart.disabled    = false;
    swBtnPause.disabled    = true;
    swBtnLap.disabled      = true;
    swBtnReset.disabled    = true;
  };

  /**
   * Formats centiseconds into MM:SS:cs string.
   * @param {number} cs
   * @returns {string}
   */
  function swFormatCs(cs) {
    const totalSeconds = Math.floor(cs / 100);
    return pad(Math.floor(totalSeconds / 60)) + ':' +
           pad(totalSeconds % 60) + ':' +
           pad(cs % 100);
  }

  // Initial ring state (empty)
  setRing(swRing, 0);

  /* ─────────────────────────────────────────────────────────────────
   * ■  COUNTDOWN
   * ─────────────────────────────────────────────────────────────── */

  /** @type {number|null} setInterval handle */
  let cdInterval  = null;

  /** Remaining centiseconds */
  let cdRemaining = 0;

  /** Total centiseconds set by the user (used for ring ratio & reset) */
  let cdTotal     = 0;

  /** Whether the countdown is actively ticking */
  let cdRunning   = false;

  /* — DOM refs — */
  const cdInputsEl = document.getElementById('cd-inputs');
  const cdDisplayEl = document.getElementById('cd-display');
  const cdRingEl    = document.getElementById('cd-ring');
  const cdDoneBanner = document.getElementById('cd-done');
  const cdBtnStart  = document.getElementById('cd-start');
  const cdBtnPause  = document.getElementById('cd-pause');
  const cdBtnReset  = document.getElementById('cd-reset');

  /**
   * Reads the three number inputs and returns total centiseconds.
   * @returns {number}
   */
  function cdReadInputs() {
    const h = Math.max(0, parseInt(document.getElementById('cd-h').value, 10) || 0);
    const m = Math.max(0, parseInt(document.getElementById('cd-m').value, 10) || 0);
    const s = Math.max(0, parseInt(document.getElementById('cd-s').value, 10) || 0);
    return (h * 3600 + m * 60 + s) * 100;
  }

  /**
   * Renders the countdown display and ring from `cdRemaining`.
   */
  function cdRender() {
    const totalSeconds = Math.floor(cdRemaining / 100);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    cdDisplayEl.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);

    // Ring shrinks as time runs out
    const ratio = cdTotal > 0 ? cdRemaining / cdTotal : 0;
    setRing(cdRingEl, ratio);
  }

  /**
   * Ticked every 10 ms; decrements remaining centiseconds and checks for finish.
   */
  function cdTick() {
    cdRemaining = Math.max(0, cdRemaining - 1);
    cdRender();

    if (cdRemaining === 0) {
      cdFinish();
    }
  }

  /**
   * Called when the countdown reaches zero: stops the timer,
   * flashes the display, and plays a beep via Web Audio API.
   */
  function cdFinish() {
    clearInterval(cdInterval);
    cdInterval = null;
    cdRunning  = false;

    cdDisplayEl.classList.add('flash');
    cdDoneBanner.classList.add('visible');

    cdBtnStart.disabled = true;
    cdBtnPause.disabled = true;
    cdBtnReset.disabled = false;

    cdBeep();
  }

  /**
   * Generates a short beep using the Web Audio API — no external audio files needed.
   */
  function cdBeep() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      gain.connect(ctx.destination);

      // Three-tone alarm: 880 Hz → 660 Hz → 880 Hz
      [880, 660, 880].forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(ctx.currentTime + i * 0.35);
        osc.stop(ctx.currentTime  + i * 0.35 + 0.3);
      });
    } catch (e) {
      // Web Audio not supported — fail silently
    }
  }

  /**
   * Starts the countdown.
   * Guards against zero-time start per the checklist requirement.
   */
  window.cdStart = function () {
    if (cdRunning) return;

    // First start: read from inputs
    if (cdRemaining === 0 && !cdRunning) {
      cdTotal     = cdReadInputs();
      cdRemaining = cdTotal;
    }

    if (cdRemaining === 0) {
      // Cannot start with zero time — briefly shake the inputs
      cdInputsEl.style.animation = 'none';
      cdInputsEl.offsetWidth; // reflow
      cdInputsEl.style.animation = 'shake .4s ease';
      return;
    }

    // Hide inputs, show display
    cdInputsEl.style.display  = 'none';
    cdDisplayEl.style.display = 'block';
    cdDisplayEl.classList.remove('flash');
    cdDoneBanner.classList.remove('visible');

    cdRunning  = true;
    cdInterval = setInterval(cdTick, 10);
    cdRender();

    cdBtnStart.textContent = 'Resume';
    cdBtnStart.disabled    = true;
    cdBtnPause.disabled    = false;
    cdBtnReset.disabled    = false;
  };

  /**
   * Pauses the countdown without resetting the remaining time.
   */
  window.cdPause = function () {
    if (!cdRunning) return;
    clearInterval(cdInterval);
    cdInterval = null;
    cdRunning  = false;

    cdBtnStart.disabled = false;
    cdBtnPause.disabled = true;
  };

  /**
   * Resets the countdown to the originally set duration and returns to input mode.
   */
  window.cdReset = function () {
    clearInterval(cdInterval);
    cdInterval = null;
    cdRunning  = false;
    cdRemaining = cdTotal;

    cdDisplayEl.classList.remove('flash');
    cdDoneBanner.classList.remove('visible');

    // Return to input mode
    cdDisplayEl.style.display = 'none';
    cdInputsEl.style.display  = 'flex';

    setRing(cdRingEl, 1);

    cdBtnStart.textContent = 'Start';
    cdBtnStart.disabled    = false;
    cdBtnPause.disabled    = true;
    cdBtnReset.disabled    = true;
  };

  /**
   * Increments or decrements an h/m/s spinner input.
   * @param {'h'|'m'|'s'} unit
   * @param {1|-1}         dir
   */
  window.cdSpin = function (unit, dir) {
    const el  = document.getElementById('cd-' + unit);
    const max = unit === 'h' ? 99 : 59;
    let   val = parseInt(el.value, 10) || 0;
    val = Math.min(max, Math.max(0, val + dir));
    el.value = pad(val);

    // Reset remaining so the next Start reads fresh values
    cdRemaining = 0;
    cdTotal     = 0;
    setRing(cdRingEl, 0);
  };

  // Clamp inputs on direct keyboard entry
  ['cd-h', 'cd-m', 'cd-s'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', function () {
      const max = id === 'cd-h' ? 99 : 59;
      this.value = pad(Math.min(max, Math.max(0, parseInt(this.value, 10) || 0)));
      cdRemaining = 0;
      cdTotal     = 0;
      setRing(cdRingEl, 0);
    });
  });

  // Shake keyframe injected via JS (avoids adding to the global stylesheet)
  (function injectShake() {
    const style = document.createElement('style');
    style.textContent = '@keyframes shake{0%,100%{transform:none}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}';
    document.head.appendChild(style);
  }());

  // Initial ring state
  setRing(cdRingEl, 0);

}());
