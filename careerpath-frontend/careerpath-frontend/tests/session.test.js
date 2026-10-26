import { test } from "node:test";
import assert from "node:assert/strict";
import { isTokenValid, readSession } from "../src/utils/session.js";

const token = (exp) => `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;

test("rejects missing, malformed, expired, and undated tokens", () => {
  for (const value of [null, "", "undefined", "broken.token", token(0), token(undefined)]) {
    assert.equal(isTokenValid(value), false);
  }
  assert.equal(isTokenValid(token(Date.now() / 1000 + 60)), true);
});

test("restores only complete sessions and tolerates corrupted or unavailable storage", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const validToken = token(Date.now() / 1000 + 60);
  const cases = [
    [{ cp_user: '{broken', cp_token: validToken }, false],
    [{ cp_user: 'null', cp_token: validToken }, false],
    [{ cp_user: '[]', cp_token: validToken }, false],
    [{ cp_token: validToken }, false],
    [{ cp_user: '{"role":"ROLE_STUDENT"}', cp_token: token(0) }, false],
    [{ cp_user: '{"role":"ROLE_STUDENT"}', cp_token: validToken }, true],
  ];
  try {
    for (const [saved, expected] of cases) {
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: key => saved[key] ?? null } });
      const session = readSession();
      assert.equal(!!session.user && !!session.token, expected);
    }
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("Storage disabled"); } });
    assert.deepEqual(readSession(), { user: null, token: null });
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
});
