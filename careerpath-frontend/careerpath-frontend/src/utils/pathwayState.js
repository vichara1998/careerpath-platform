const PREFIX = "cp_pathway_v1:";
const VERSION = 1;
export function profileSignature(form) {
  return JSON.stringify(Object.fromEntries(Object.entries(form || {}).sort(([a], [b]) => a.localeCompare(b))));
}
function storageKey(screen) {
  let owner = "guest";
  try {
    const user = JSON.parse(globalThis.localStorage?.getItem("cp_user") || "null");
    if (user) owner = String(user.userId ?? user.id ?? user.email ?? "signed-in");
  } catch { /* Storage may be disabled. */ }
  return PREFIX + owner + ":" + screen;
}
export function readPathwayState(screen) {
  try {
    const saved = JSON.parse(globalThis.sessionStorage?.getItem(storageKey(screen)) || "null");
    if (saved?.version !== VERSION || !saved.form || typeof saved.form !== "object" || Array.isArray(saved.form)) return {};
    if (Object.values(saved.form).some(value => typeof value !== "string" && typeof value !== "number" && value !== null)) return {};
    return { ...saved, result: saved.result && Array.isArray(saved.result.recommendedCourses) ? saved.result : null };
  } catch { return {}; }
}
export function writePathwayState(screen, state) {
  try { globalThis.sessionStorage?.setItem(storageKey(screen), JSON.stringify({ ...state, version: VERSION })); }
  catch { /* The form still works when storage is unavailable or full. */ }
}
export function clearPathwayState() {
  try {
    const storage = globalThis.sessionStorage;
    if (!storage) return;
    for (let index = storage.length - 1; index >= 0; index--) {
      const key = storage.key(index);
      if (key?.startsWith(PREFIX)) storage.removeItem(key);
    }
  } catch { /* Signing out must still work if storage is unavailable. */ }
}
export function initialPathwayState(incomingProfile) {
  const saved = readPathwayState("guide");
  const sourceKey = profileSignature(incomingProfile);
  if (incomingProfile && saved.sourceKey !== sourceKey)
    return { form: incomingProfile, result: null, sourceKey, needsRequest: true };
  return { ...saved, sourceKey: saved.sourceKey || sourceKey, needsRequest: false };
}
