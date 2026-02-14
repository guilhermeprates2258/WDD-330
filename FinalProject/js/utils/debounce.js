export function debounce(fn, delay = 350) {
  let t = null;
  return (...args) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), delay);
  };
}
