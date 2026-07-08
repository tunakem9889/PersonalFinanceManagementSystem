/**
 * Decode a JWT payload (base64url) without verifying signature.
 * Returns null if the token is malformed.
 */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string;
  email: string;
}

export function getAuthState(): AuthState {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return { isAuthenticated: false, isAdmin: false, username: "", email: "" };
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return { isAuthenticated: false, isAdmin: false, username: "", email: "" };
  }

  // Check expiry
  const exp = payload.exp as number | undefined;
  if (exp && Date.now() / 1000 > exp) {
    return { isAuthenticated: false, isAdmin: false, username: "", email: "" };
  }

  // --- Determine role ---
  // 1. Try from JWT claims (roles claim added in backend)
  const jwtRoles: string[] = Array.isArray(payload.roles)
    ? (payload.roles as string[])
    : Array.isArray(payload.authorities)
    ? (payload.authorities as string[])
    : [];

  // 2. Fallback: read from user stored in localStorage (set during login from /api/users/profile)
  let storedRole = "";
  let username = String(payload.sub ?? "");
  let email = String(payload.sub ?? "");

  try {
    const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
    if (stored.username) username = stored.username;
    if (stored.email) email = stored.email;
    if (stored.role) storedRole = stored.role as string;
  } catch {/* ignore */}

  const allRoles = jwtRoles.length > 0 ? jwtRoles : storedRole ? [storedRole] : [];
  const isAdmin = allRoles.includes("ROLE_ADMIN");

  return { isAuthenticated: true, isAdmin, username, email };
}

/**
 * Simple hook that reads auth state on every render.
 */
export function useAuthState(): AuthState {
  return getAuthState();
}
