const KEY = "archvizHub";

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

function readAll() {
  const raw = localStorage.getItem(KEY);
  return raw ? safeParse(raw, {}) : {};
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const Storage = {
  getTheme() {
    return readAll().theme || "light";
  },
  setTheme(theme) {
    const data = readAll();
    data.theme = theme;
    writeAll(data);
  },

  getLastSearch() {
    return readAll().lastSearch || "";
  },
  setLastSearch(q) {
    const data = readAll();
    data.lastSearch = q;
    writeAll(data);
  },

  getActiveCategory() {
    return readAll().activeCategory || "exteriors";
  },
  setActiveCategory(cat) {
    const data = readAll();
    data.activeCategory = cat;
    writeAll(data);
  },

  getSortPreference() {
    return readAll().sortPreference || "relevance";
  },
  setSortPreference(sort) {
    const data = readAll();
    data.sortPreference = sort;
    writeAll(data);
  },

  getFavorites() {
    return readAll().favorites || [];
  },
  isFavorite(key) {
    return Storage.getFavorites().some((f) => f.key === key);
  },
  addFavorite(item) {
    const data = readAll();
    const favorites = data.favorites || [];
    if (!favorites.some((f) => f.key === item.key)) {
      favorites.unshift(item);
    }
    data.favorites = favorites;
    writeAll(data);
  },
  removeFavorite(key) {
    const data = readAll();
    const favorites = data.favorites || [];
    data.favorites = favorites.filter((f) => f.key !== key);
    writeAll(data);
  },
};
