export function normalizeUnsplashItem(item) {
  return {
    source: "unsplash",
    id: item.id,
    title: item.alt_description || item.description || "Untitled reference",
    authorName: item.user?.name || "Unknown",
    authorUsername: item.user?.username || "",
    authorProfileUrl: item.user?.links?.html || "",
    imageUrlSmall: item.urls?.small || "",
    imageUrlRegular: item.urls?.regular || "",
    width: item.width ?? null,
    height: item.height ?? null,
    color: item.color || "",
    likes: item.likes ?? 0,
    createdAt: item.created_at || "",
    tags: Array.isArray(item.tags) ? item.tags.map(t => t.title).filter(Boolean) : [],
    sourceUrl: item.links?.html || "",
  };
}

export function normalizePexelsItem(item) {
  return {
    source: "pexels",
    id: String(item.id),
    title: item.alt || "Untitled reference",
    authorName: item.photographer || "Unknown",
    authorUsername: "",
    authorProfileUrl: item.photographer_url || "",
    imageUrlSmall: item.src?.medium || "",
    imageUrlRegular: item.src?.large2x || item.src?.large || item.src?.original || "",
    width: item.width ?? null,
    height: item.height ?? null,
    color: item.avg_color || "",
    likes: 0, // Pexels doesn’t provide likes in the same way
    createdAt: "",
    tags: [],
    sourceUrl: item.url || "",
  };
}
