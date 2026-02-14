import { Storage } from "../storage/storageService.js";

export function renderModal(project) {
  const key = `${project.source}:${project.id}`;
  const fav = Storage.isFavorite(key);

  const tags = project.tags && project.tags.length
    ? `<p><strong>Tags:</strong> ${project.tags.slice(0, 8).map(escapeHtml).join(", ")}</p>`
    : "";

  return `
    <h2 id="modalTitle" class="sr-only">${escapeHtml(project.title)}</h2>

    <div class="modal-grid">
      <div class="modal-hero">
        <img src="${project.imageUrlRegular}" alt="${escapeHtml(project.title)}">
      </div>

      <div class="kv">
        <h3>${escapeHtml(project.title)}</h3>
        <p><strong>Source:</strong> ${project.source}</p>
        <p><strong>Author:</strong>
          <a href="${project.authorProfileUrl}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(project.authorName)}
          </a>
        </p>
        ${project.color ? `<p><strong>Color:</strong> ${escapeHtml(project.color)}</p>` : ""}
        ${project.width && project.height ? `<p><strong>Dimensions:</strong> ${project.width}×${project.height}</p>` : ""}
        ${Number.isFinite(project.likes) ? `<p><strong>Likes:</strong> ${project.likes}</p>` : ""}
        ${project.createdAt ? `<p><strong>Created:</strong> ${escapeHtml(project.createdAt.slice(0, 10))}</p>` : ""}
        ${tags}

        <p>
          <a class="btn" href="${project.sourceUrl}" target="_blank" rel="noopener noreferrer">Open source page</a>
        </p>

        <p>
          <button class="btn ${fav ? "danger" : "primary"}" type="button" data-fav="${key}">
            ${fav ? "Remove from favorites" : "Save to favorites"}
          </button>
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
