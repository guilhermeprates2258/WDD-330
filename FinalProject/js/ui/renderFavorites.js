export function renderFavorites(items) {
  if (!items.length) {
    return `<p class="status">No favorites yet. Go to Explore and save some references.</p>`;
  }
  return items
    .map((p) => `
      <article class="card">
        <img src="${p.imageUrlSmall}" alt="${escapeHtml(p.title)}" loading="lazy">
        <div class="card-content">
          <div class="badge">${p.source}</div>
          <div class="card-title">${escapeHtml(p.title)}</div>
          <div class="card-meta">
            <span>${escapeHtml(p.authorName)}</span>
            <span>${p.width && p.height ? `${p.width}×${p.height}` : ""}</span>
          </div>
          <div class="card-actions">
            <a class="btn primary" href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer">Open</a>
            <button class="btn danger" type="button" data-remove="${escapeHtml(p.key)}">Remove</button>
          </div>
        </div>
      </article>
    `)
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
