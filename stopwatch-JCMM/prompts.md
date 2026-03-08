# Prompts used

**Chatbot:** Claude (claude.ai — Claude Sonnet 4.6)

---

## Prompt 1 (único prompt utilizado / only prompt used)

> You are an expert frontend developer specializing in vanilla HTML, CSS, and JavaScript.
>
> ## TASK
> Create a fully functional **Stopwatch and Countdown** web application by filling in the seed files provided.
>
> ## SEED FILES TO USE (do not rename or move them)
> - `stopwatch-JCMM/index.html` → already has a basic HTML skeleton; extend it
> - `stopwatch-JCMM/script.js` → currently empty; write all logic here
> - `stopwatch-JCMM/prompts.md` → currently empty; document the prompts used
>
> ## DESIGN REFERENCE
> Base your visual design on the website https://www.online-stopwatch.com/ and on the
> images located at `res/stopwatch.png` (for the stopwatch tab) and `res/countdown.png`
> (for the countdown tab). Key design traits to replicate:
> - Clean, centered layout on a white/light-grey background
> - Two clearly separated tabs or toggle: **Stopwatch** and **Countdown**
> - Large, prominent digital time display (HH:MM:SS or MM:SS:ms format)
> - Clearly labeled action buttons (Start, Stop/Pause, Reset for stopwatch;
>   Set time, Start, Stop/Pause, Reset for countdown)
> - A visual progress indicator (circular ring or progress bar) reflecting elapsed/remaining time
>
> ## FUNCTIONAL REQUIREMENTS
>
> ### Stopwatch
> 1. Display time in **MM:SS:ms** (minutes, seconds, centiseconds) format.
> 2. **Start** button begins counting up from 00:00:00.
> 3. **Stop/Pause** button freezes the display without resetting.
> 4. **Reset** button returns the display to 00:00:00 and stops the timer.
> 5. Lap functionality (optional but valued): pressing **Lap** records the current
>    time in a scrollable list below the display.
>
> ### Countdown
> 1. Allow the user to set a target duration using number inputs or +/– controls
>    for hours, minutes, and seconds.
> 2. **Start** begins counting down from the set time.
> 3. **Stop/Pause** freezes the countdown.
> 4. **Reset** restores the countdown to the last set time.
> 5. When the countdown reaches 00:00:00, trigger a visible alert (color change,
>    flashing display) AND an audible beep using the Web Audio API (no external files).
>
> ## TECHNICAL CONSTRAINTS
> - **Vanilla HTML + CSS + JavaScript only** — no frameworks, no libraries, no CDN imports.
> - All styles must be inside `index.html` within a `<style>` block (no external CSS file).
> - All logic must live in `script.js`, loaded via `<script src="script.js"></script>` at the
>   bottom of `<body>` in `index.html`.
> - Use `setInterval` / `clearInterval` for timing; do NOT use `Date` drift correction
>   unless you explicitly comment why.
> - The UI must be fully responsive and usable on screens from 320 px wide upward.
> - Ensure no global namespace pollution: wrap all code in an IIFE or use ES module patterns.
>
> ## OUTPUT FORMAT
> Return **three separate code blocks**, clearly labelled:
> 1. ```html  ← full content of stopwatch-JCMM/index.html
> 2. ```js    ← full content of stopwatch-JCMM/script.js
> 3. ```md    ← full content of stopwatch-JCMM/prompts.md
>             (include this exact prompt as "Prompt 1" and chatbot name used)
>
> Do NOT add any explanation outside those three code blocks.
>
> ## EXAMPLES
> - Input time set to 00:01:30 → countdown runs 1 min 30 sec → reaches 00:00:00 → red flash + beep.
> - Stopwatch starts → user presses Lap at 00:32:45 → lap appears in list → timer keeps running.
>
> ## QUALITY CHECKLIST (verify before answering)
> - [ ] Both tabs/modes visible and switchable without page reload
> - [ ] Buttons correctly disabled/enabled depending on state (e.g., Start disabled while running)
> - [ ] Time display never shows negative values
> - [ ] Countdown cannot be started with a time of 00:00:00
> - [ ] All JS variables declared with `const` / `let` (no `var`)
> - [ ] Code is commented at function level

---

## Design decisions made by the model

- **Aesthetic:** Warm off-white background (`#f0ede8`) with orange accent (`#e85d26`) for the
  stopwatch and green (`#2a9d5c`) for the countdown — visually distinct, easy to tell apart.
- **Typography:** `DM Mono` for the time display (authentic digital feel) paired with `Outfit`
  for UI labels/buttons.
- **SVG ring indicator:** A stroke-based circle that completes one revolution every 60 seconds
  (stopwatch) or drains linearly from full to empty (countdown).
- **Spinner controls:** The countdown uses ▲/▼ buttons alongside direct number inputs for
  maximum usability on both desktop and touch screens.
- **Audio alarm:** Three-tone beep (880 → 660 → 880 Hz) synthesised entirely with the
  Web Audio API — no external audio files.
- **IIFE pattern:** All code is wrapped in `(function(){})()` so no symbols leak to `window`
  except the explicitly exported handler functions (`swStart`, `cdStart`, etc.).
- **Lap list:** Displays lap number, split time, and delta since the previous lap, prepended
  so the most recent lap is always visible at the top.
