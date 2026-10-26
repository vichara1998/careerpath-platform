export function isTokenValid(token) {
  if (typeof token !== "string" || !token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function readSession() {
  try {
    const user = JSON.parse(localStorage.getItem("cp_user"));
    const token = localStorage.getItem("cp_token");
    if (user && typeof user === "object" && !Array.isArray(user) && isTokenValid(token)) {
      return { user, token };
    }
  } catch {
    // Invalid saved data must not prevent the app from loading.
  }
  return { user: null, token: null };
}
