// lib/likes-storage.ts

const storageKey = () => {
  const today = new Date().toISOString().slice(0, 10); // "2025-06-15"
  return `liked_dishes_${today}`;
};

export function loadLikedToday(): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveLikedToday(liked: Set<string>) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify([...liked]));
  } catch { /* empty */ }
}

// Optional: clean up old keys
export function pruneOldLikes() {
  const today = storageKey();
  Object.keys(localStorage)
    .filter((k) => k.startsWith("liked_dishes_") && k !== today)
    .forEach((k) => localStorage.removeItem(k));
}