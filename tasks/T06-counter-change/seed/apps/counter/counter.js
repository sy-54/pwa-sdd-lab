export function increment(count) {
  return count + 1;
}

export function decrement(count) {
  return count > 0 ? count - 1 : 0;
}

export function reset() {
  return 0;
}

export function parseCount(value) {
  if (typeof value !== "string" || value === "") {
    return 0;
  }
  if (!/^\d+$/.test(value)) {
    return 0;
  }
  return Number(value);
}
