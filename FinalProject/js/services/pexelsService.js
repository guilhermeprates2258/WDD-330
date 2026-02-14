import { CONFIG } from "../config.js";

const BASE_URL = "https://api.pexels.com/v1";

function assertKey() {
  if (!CONFIG.PEXELS_API_KEY) {
    throw new Error("Missing VITE_PEXELS_API_KEY in .env");
  }
}

export async function searchPexelsPhotos({ query, page = 1, perPage = CONFIG.PER_PAGE }) {
  assertKey();

  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: CONFIG.PEXELS_API_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pexels search failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getPexelsPhotoById(id) {
  assertKey();

  const res = await fetch(`${BASE_URL}/photos/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: CONFIG.PEXELS_API_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pexels detail failed (${res.status}): ${text}`);
  }

  return res.json();
}
