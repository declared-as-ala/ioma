// Persists a client-generated UUID identifying an anonymous cart/wishlist,
// sent as the X-Guest-Session-Id header (see apps/api's CartService —
// DECISIONS.md explains why a header was chosen over a cross-origin cookie
// for local dev). Safe to call during SSR — returns null server-side, the
// header is simply omitted until a client re-render supplies it.
const STORAGE_KEY = "ioma_guest_session_id";

export function getGuestSessionId(): string | null {
  if (typeof window === "undefined") return null;

  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
