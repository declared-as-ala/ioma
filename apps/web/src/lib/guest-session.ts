// Persists a client-generated UUID identifying an anonymous cart/wishlist,
// sent as the X-Guest-Session-Id header.
const STORAGE_KEY = "ioma_guest_session_id";

function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    try {
      return window.crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails
    }
  }
  // Robust RFC4122 v4 fallback for non-secure contexts (e.g. plain HTTP IP address)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getGuestSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return generateUUID();
  }
}
