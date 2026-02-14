import { qs, setText } from "./utils/dom.js";
import { debounce } from "./utils/debounce.js";
import { CATEGORIES } from "./utils/categories.js";
import { Storage } from "./storage/storageService.js";

import { searchUnsplashPhotos, getUnsplashPhotoById } from "./services/unsplashService.js";
import { searchPexelsPhotos, getPexelsPhotoById } from "./services/pexelsService.js";
import { normalizeUnsplashItem, normalizePexelsItem } from "./services/normalize.js";

import { renderCards, renderSkeletonCards } from "./ui/renderCards.js";
import { renderModal } from "./ui/renderModal.js";
import { renderFavorites } from "./ui/renderFavorites.js";

const state = {
  page: 1,
  perPage: 12,
  query: "",
  category: "exteriors",
  sort: "relevance",
  lastBatch: [],
};

init();

function init() {
  // Footer year
  const year = qs("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Theme
  applyTheme(Storage.getTheme());

  // Detect page
  const grid = qs("#grid");
  const favoritesGrid = qs("#favoritesGrid");

  if (favoritesGrid) {
    initFavoritesPage();
    return;
  }

  if (grid) {
    initExplorePage();
  }
}

function initExplorePage() {
  const searchForm = qs("#searchForm");
  const searchInput = qs("#searchInput");
  const categorySelect = qs("#categorySelect");
  const sortSelect = qs("#sortSelect");
  const themeToggle = qs("#themeToggle");
  const loadMoreBtn = qs("#loadMoreBtn");
  const grid = qs("#grid");
  const status = qs("#status");

  // Restore saved prefs
  state.category = Storage.getActiveCategory();
  state.sort = Storage.getSortPreference();
  state.query = Storage.getLastSearch();

  if (categorySelect) categorySelect.value = state.category;
  if (sortSelect) sortSelect.value = state.sort;
  if (searchInput) searchInput.value = state.query;

  // Initial load
  fetchAndRender({ reset: true }).catch((e) => showError(status, e));

  // Events (5+)
  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.query = searchInput?.value.trim() || "";
    Storage.setLastSearch(state.query);
    fetchAndRender({ reset: true }).catch((err) => showError(status, err));
  });

  searchInput?.addEventListener(
    "input",
    debounce(() => {
      state.query = searchInput.value.trim();
      Storage.setLastSearch(state.query);
      fetchAndRender({ reset: true }).catch((err) => showError(status, err));
    }, 450)
  );

  categorySelect?.addEventListener("change", () => {
    state.category = categorySelect.value;
    Storage.setActiveCategory(state.category);
    fetchAndRender({ reset: true }).catch((err) => showError(status, err));
  });

  sortSelect?.addEventListener("change", () => {
    state.sort = sortSelect.value;
    Storage.setSortPreference(state.sort);
    fetchAndRender({ reset: true }).catch((err) => showError(status, err));
  });

  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    Storage.setTheme(next);
    applyTheme(next);
  });

  loadMoreBtn?.addEventListener("click", () => {
    fetchAndRender({ reset: false }).catch((err) => showError(status, err));
  });

  // Card click / keyboard open / fav toggle (event delegation)
  grid?.addEventListener("click", async (e) => {
    const openKey = e.target?.closest("[data-open]")?.getAttribute("data-open");
    const favKey = e.target?.closest("[data-fav]")?.getAttribute("data-fav");

    if (favKey) {
      toggleFavoriteFromKey(favKey);
      // re-render to update buttons quickly
      grid.innerHTML = renderCards(state.lastBatch);
      return;
    }

    if (openKey) {
      await openDetailsModal(openKey);
    }
  });

  grid?.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const card = e.target?.closest("[data-open]");
    const openKey = card?.getAttribute("data-open");
    if (openKey) await openDetailsModal(openKey);
  });

  // Modal close events
  const modalRoot = qs("#modalRoot");
  modalRoot?.addEventListener("click", (e) => {
    const shouldClose = e.target?.getAttribute("data-close") === "true";
    if (shouldClose) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  async function fetchAndRender({ reset }) {
    if (!grid) return;
    setText(status, "");
    grid.innerHTML = renderSkeletonCards(6);

    if (reset) {
      state.page = 1;
    } else {
      state.page += 1;
    }

    const q = buildQuery();
    const orderBy = state.sort === "latest" ? "latest" : "relevant";

    const [uRes, pRes] = await Promise.allSettled([
      searchUnsplashPhotos({ query: q, page: state.page, perPage: state.perPage, orderBy }),
      searchPexelsPhotos({ query: q, page: state.page, perPage: state.perPage }),
    ]);

    const normalized = [];

    if (uRes.status === "fulfilled") {
      const items = uRes.value?.results || [];
      normalized.push(...items.map(normalizeUnsplashItem));
    }

    if (pRes.status === "fulfilled") {
      const items = pRes.value?.photos || [];
      normalized.push(...items.map(normalizePexelsItem));
    }

    // If both failed, throw a helpful error
    if (!normalized.length) {
      const uErr = uRes.status === "rejected" ? uRes.reason : null;
      const pErr = pRes.status === "rejected" ? pRes.reason : null;
      throw new Error(`No results available. ${uErr ? `Unsplash: ${uErr.message}. ` : ""}${pErr ? `Pexels: ${pErr.message}` : ""}`);
    }

    // simple “popular” sort fallback (likes for unsplash)
    const merged = state.sort === "popular"
      ? normalized.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      : normalized;

    // store last batch for quick re-render
    state.lastBatch = merged;

    if (reset) {
      grid.innerHTML = renderCards(merged);
    } else {
      grid.insertAdjacentHTML("beforeend", renderCards(merged));
    }

    setText(status, `Showing results for “${q}” (page ${state.page}).`);
  }

  function buildQuery() {
    // If user typed something, prefer it; otherwise use the category query
    if (state.query && state.query.length >= 2) return state.query;
    return CATEGORIES[state.category] || CATEGORIES.exteriors;
  }

  async function openDetailsModal(openKey) {
    const [source, id] = openKey.split(":");
    const modalRoot = qs("#modalRoot");
    const modalBody = qs("#modalBody");
    if (!modalRoot || !modalBody) return;

    modalRoot.hidden = false;
    document.body.style.overflow = "hidden";
    modalBody.innerHTML = `<div class="skeleton skel-img" style="border-radius:16px"></div>`;

    try {
      let detail;
      if (source === "unsplash") {
        detail = normalizeUnsplashItem(await getUnsplashPhotoById(id));
      } else {
        detail = normalizePexelsItem(await getPexelsPhotoById(id));
      }
      // add a stable key for favorites page
      detail.key = `${detail.source}:${detail.id}`;

      modalBody.innerHTML = renderModal(detail);

      // modal favorite button
      modalBody.querySelector("[data-fav]")?.addEventListener("click", () => {
        toggleFavorite(detail);
        // re-render modal to update button label
        modalBody.innerHTML = renderModal(detail);
      });
    } catch (err) {
      modalBody.innerHTML = `<p class="status">Could not load details. ${escapeHtml(err.message)}</p>`;
    }
  }

  function closeModal() {
    const modalRoot = qs("#modalRoot");
    const modalBody = qs("#modalBody");
    if (!modalRoot || modalRoot.hidden) return;
    modalRoot.hidden = true;
    if (modalBody) modalBody.innerHTML = "";
    document.body.style.overflow = "";
  }

  function toggleFavoriteFromKey(key) {
    // find item in last batch to store minimal info
    const [source, id] = key.split(":");
    const item = state.lastBatch.find((x) => x.source === source && String(x.id) === String(id));
    if (!item) return;

    const favItem = {
      key,
      source: item.source,
      id: String(item.id),
      title: item.title,
      authorName: item.authorName,
      authorProfileUrl: item.authorProfileUrl,
      imageUrlSmall: item.imageUrlSmall,
      width: item.width,
      height: item.height,
      sourceUrl: item.sourceUrl,
    };

    if (Storage.isFavorite(key)) Storage.removeFavorite(key);
    else Storage.addFavorite(favItem);
  }

  function toggleFavorite(detail) {
    const key = `${detail.source}:${detail.id}`;
    const favItem = {
      key,
      source: detail.source,
      id: String(detail.id),
      title: detail.title,
      authorName: detail.authorName,
      authorProfileUrl: detail.authorProfileUrl,
      imageUrlSmall: detail.imageUrlSmall,
      width: detail.width,
      height: detail.height,
      sourceUrl: detail.sourceUrl,
    };

    if (Storage.isFavorite(key)) Storage.removeFavorite(key);
    else Storage.addFavorite(favItem);
  }

  function showError(statusEl, err) {
    setText(statusEl, `Error: ${err.message}`);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

function initFavoritesPage() {
  const favoritesGrid = qs("#favoritesGrid");
  const favoritesStatus = qs("#favoritesStatus");

  const favs = Storage.getFavorites();

  if (favoritesGrid) {
    favoritesGrid.innerHTML = renderFavorites(favs);
    setText(favoritesStatus, favs.length ? `${favs.length} saved reference(s).` : "");
  }

  favoritesGrid?.addEventListener("click", (e) => {
    const key = e.target?.closest("[data-remove]")?.getAttribute("data-remove");
    if (!key) return;
    Storage.removeFavorite(key);
    const updated = Storage.getFavorites();
    favoritesGrid.innerHTML = renderFavorites(updated);
    setText(favoritesStatus, updated.length ? `${updated.length} saved reference(s).` : "");
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
