import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../src/store/slices/uiSlice.js", import.meta.url), "utf8")
  .replace(/^import .*;\r?\n/, "")
  .replace(/export const[\s\S]*$/, "");

test("saved and system themes match Redux and the first toggle changes the visible theme", () => {
  for (const [saved, system, expected] of [["dark", false, true], ["light", true, false], [null, true, true], [null, false, false]]) {
    let config;
    let visible;
    const writes = [];
    runInNewContext(source, {
      localStorage: { getItem: () => saved, setItem: (...args) => writes.push(args) },
      window: { matchMedia: () => ({ matches: system }) },
      document: { documentElement: { classList: { toggle: (_, value) => { visible = value; } } } },
      createSlice: value => { config = value; return value; },
    });
    assert.equal(config.initialState.darkMode, expected);
    assert.equal(visible, expected);
    config.reducers.toggleDarkMode(config.initialState);
    assert.equal(visible, !expected);
    assert.equal(writes[0][1], expected ? "light" : "dark");
  }
});
