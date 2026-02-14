export function qs(sel, parent = document) {
  return parent.querySelector(sel);
}
export function qsa(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}
export function setText(el, text) {
  if (el) el.textContent = text;
}
