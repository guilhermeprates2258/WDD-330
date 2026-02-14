import { Storage } from "../storage/storageService.js";

export function renderSkeletonCards(count = 6) {
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    cards.push(`
      <article class="card" aria-label="Loading">
        <div class="skeleton skel-img"></div>
        <div class="card-content">
          <div class="skeleton skel-line w60"></div>
          <div class="skeleton skel-line w40"></div>
        </div>
      </article>
    `);
  }
  return cards.join("");
}

export function renderCards(items) {
  return items
    .map((p) => {
      const key = `${p.source}:${p.id}`;
      const fav = Storage.isFavorite(key);
      return `
      <article class="card" data-open="${key}" tabindex="0" role="button" aria-label="Open details: ${escapeHtml(p.title)}">
        <img src="${p.imageUrlSmall}" alt="${escapeHtml(p.title)}" loading="lazy">
        <div class="card-content">
          <div class="badge">${p.source}</div>
          <div class="card-title">${escapeHtml(p.title)}</div>
          <div class="card-meta">
            <span>${escapeHtml(p.authorName)}</span>
            <span>${p.width && p.height ? `${p.width}×${p.height}` : ""}</span>
          </div>
          <div class="card-actions">
            <button class="btn primary" type="button" data-open="${key}">Details</button>
            <button class="btn ${fav ? "danger" : ""}" type="button" data-fav="${key}">
              ${fav ? "Unfavorite" : "Favorite"}
            </button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
