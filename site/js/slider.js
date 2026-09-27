const STEP_MS = 150; // ~19 s for the full 1900–2026 run
const TICKS = [1900, 1925, 1950, 1975, 2000, 2025];

export function createSlider({ input, button, ticks, min, max, onChange }) {
  input.min = min;
  input.max = max;
  let timer = null;

  for (const year of TICKS.filter((y) => y >= min && y <= max)) {
    const span = document.createElement("span");
    span.textContent = year;
    span.style.left = `${((year - min) / (max - min)) * 100}%`;
    ticks.append(span);
  }

  function set(year) {
    const y = Math.max(min, Math.min(max, Math.round(year)));
    input.value = y;
    input.setAttribute("aria-valuetext", String(y));
    onChange(y);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    button.classList.remove("playing");
    button.setAttribute("aria-label", "Play");
  }

  function play() {
    if (+input.value >= max) set(min);
    button.classList.add("playing");
    button.setAttribute("aria-label", "Pause");
    timer = setInterval(() => {
      if (+input.value >= max) return stop();
      set(+input.value + 1);
    }, STEP_MS);
  }

  button.addEventListener("click", () => (timer ? stop() : play()));
  input.addEventListener("input", () => { stop(); set(+input.value); });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, button, textarea, [contenteditable]")) return;
    if (e.key === " ") { e.preventDefault(); timer ? stop() : play(); }
    if (e.key === "ArrowRight") { stop(); set(+input.value + 1); }
    if (e.key === "ArrowLeft") { stop(); set(+input.value - 1); }
  });

  return { set, get value() { return +input.value; } };
}
