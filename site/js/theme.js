// Light/dark toggle. Follows the system setting until the viewer chooses; the choice is remembered.
const root = document.documentElement;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

const current = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");

export function initThemeToggle(button) {
  const label = () => button.setAttribute("aria-label", current() === "dark" ? "Switch to light theme" : "Switch to dark theme");
  button.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable: choice lasts this visit */ }
    label();
  });
  systemDark.addEventListener("change", label);
  label();
}
