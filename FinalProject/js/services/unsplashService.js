import { CONFIG } from "../config.js";

const BASE_URL = "https://api.unsplash.com";

function assertKey() {
  if (!CONFIG.UNSPLASH_ACCESS_KEY) {
    throw new Error("Missing VITE_UNSPLASH_ACCESS_KEY in .env");
  }
}

export async function searchUnsplashPhotos({ query, page = 1, perPage = CONFIG.PER_PAGE, orderBy = "relevant" }) {
  assertKey();

  const url = new URL(`${BASE_URL}/search/photos`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("order_by", orderBy);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash search failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getUnsplashPhotoById(id) {
  assertKey();

  const res = await fetch(`${BASE_URL}/photos/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash detail failed (${res.status}): ${text}`);
  }

  return res.json();
}
