import { test } from "node:test";
import assert from "node:assert/strict";
import { readPathwayState, writePathwayState, initialPathwayState, profileSignature, clearPathwayState } from "../src/utils/pathwayState.js";

function withStorage(run) {
  const originalSession = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const originalLocal = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  let user = { userId: 1 };
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), key: index => [...values.keys()][index], get length() { return values.size; } };
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: storage });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => JSON.stringify(user) } });
  try { run({ values, setUser: next => { user = next; } }); }
  finally {
    if (originalSession) Object.defineProperty(globalThis, "sessionStorage", originalSession); else delete globalThis.sessionStorage;
    if (originalLocal) Object.defineProperty(globalThis, "localStorage", originalLocal); else delete globalThis.localStorage;
  }
}

test("refresh and back restore edited profiles and both course sections rather than the original home submission", () => withStorage(() => {
  const incoming = { qualificationLevel: "OL_PASS", interests: "Agriculture" };
  const edited = { ...incoming, qualificationLevel: "AL_PASS", district: "Kandy", skills: "Programming" };
  const result = { recommendedCourses: [{ id: 24 }], alternativeCourses: [{ id: 30 }] };
  writePathwayState("guide", { form: edited, result, sourceKey: profileSignature(incoming) });
  const restored = initialPathwayState(incoming);
  assert.deepEqual(restored.form, edited);
  assert.deepEqual(restored.result, result);
  assert.equal(restored.needsRequest, false);
  assert.deepEqual(initialPathwayState().result, result);
}));

test("unfinished drafts survive refresh and a genuinely new home submission replaces an older result", () => withStorage(() => {
  const form = { qualificationLevel: "OL_FAIL", age: "17", highestSchoolGrade: "9", interests: "Agriculture" };
  writePathwayState("home", { form });
  assert.deepEqual(readPathwayState("home").form, form);
  writePathwayState("guide", { form, result: null, sourceKey: profileSignature(form) });
  assert.equal(initialPathwayState(form).needsRequest, false);
  const next = { ...form, qualificationLevel: "AL_PASS" };
  assert.deepEqual(initialPathwayState(next), { form: next, result: null, sourceKey: profileSignature(next), needsRequest: true });
}));

test("saved pathway data is isolated by account and cleared on sign out", () => withStorage(({ setUser, values }) => {
  writePathwayState("guide", { form: { qualificationLevel: "OL_PASS" } });
  setUser({ userId: 2 });
  assert.deepEqual(readPathwayState("guide"), {});
  writePathwayState("home", { form: { qualificationLevel: "AL_PASS" } });
  values.set("unrelated", "keep");
  clearPathwayState();
  assert.equal(values.size, 1);
  assert.equal(values.get("unrelated"), "keep");
}));

test("malformed saved data and disabled storage do not break the forms", () => withStorage(({ values }) => {
  for (const value of ["{broken", '{"version":1,"form":[]}', '{"version":1,"form":{"interests":[]}}']) {
    values.set("cp_pathway_v1:1:guide", value);
    assert.deepEqual(readPathwayState("guide"), {});
  }
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, get() { throw new Error("Storage disabled"); } });
  assert.deepEqual(readPathwayState("guide"), {});
  assert.doesNotThrow(() => writePathwayState("guide", { form: {} }));
  assert.doesNotThrow(clearPathwayState);
}));
