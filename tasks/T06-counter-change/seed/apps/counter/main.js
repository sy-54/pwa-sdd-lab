import { increment, decrement, reset, parseCount } from "./counter.js";

const STORAGE_KEY = "counter:count";

const countEl = document.querySelector('[data-testid="count"]');
const incEl = document.querySelector('[data-testid="inc"]');
const decEl = document.querySelector('[data-testid="dec"]');
const resetEl = document.querySelector('[data-testid="reset"]');

function save(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

function load() {
  const parsed = parseCount(localStorage.getItem(STORAGE_KEY));
  save(parsed);
  return parsed;
}

let count = load();

function render() {
  countEl.textContent = String(count);
}

function update(next) {
  count = next;
  save(count);
  render();
}

incEl.addEventListener("click", () => update(increment(count)));
decEl.addEventListener("click", () => update(decrement(count)));
resetEl.addEventListener("click", () => update(reset()));

render();
