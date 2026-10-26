import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const source = readFileSync(new URL("../src/components/admin/AdminDesk.jsx", import.meta.url), "utf8");
const find = (node, predicate) => {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  return node.children?.flat().map((child) => find(child, predicate)).find(Boolean);
};

function harness() {
  const state = [], effects = [], scheduled = [], requests = [];
  let cursor = 0, effectCursor = 0, timer;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useRef: () => ({ current: null }),
    useEffect(callback, deps) {
      const index = effectCursor++;
      if (!effects[index] || deps.some((value, i) => value !== effects[index][i])) scheduled.push(callback);
      effects[index] = deps;
    },
  };
  const api = {
    getAllCourses: async (params) => {
      requests.push({ ...params });
      return { data: { data: { content: [{ id: params.page * 10 + 1, title: "Engineering", universityName: "Test university", type: "DEGREE", mode: "PHYSICAL", approved: true }], totalElements: 80, totalPages: 8 } } };
    },
    getCourseSummary: async () => ({ data: { data: { total: 80, pending: 5, published: 70, rejected: 5 } } }),
    getUsers: async () => ({ data: { data: [] } }),
  };
  const context = {
    module: { exports: {} }, exports: {},
    require(name) {
      if (name === "react") return react;
      if (name.includes("adminApi")) return { adminApi: api };
      if (name.includes("useAuth")) return { useAuth: () => ({ user: { id: 1, email: "admin@example.com" } }) };
      if (name.includes("ProfileChoices")) return { districts: ["Colombo", "Kandy"] };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
    setTimeout: (callback) => { timer = callback; return 1; }, clearTimeout: () => {},
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
  };
  runInNewContext(transformSync(source, { loader: "jsx", format: "cjs" }).code, context);
  return {
    requests,
    render() { cursor = 0; effectCursor = 0; return context.module.exports.default(); },
    async flush() { while (scheduled.length) scheduled.shift()(); await new Promise(setImmediate); },
    flushTimer() { timer?.(); },
  };
}

test("admin pagination reaches later courses and filters reset the page", async () => {
  const app = harness();
  app.render(); await app.flush();
  let tree = app.render();
  const next = () => find(tree, (node) => node.props?.["aria-label"] === "Next course page");
  assert.equal(next().props.disabled, false);
  next().props.onClick(); app.render(); await app.flush();
  assert.equal(app.requests.at(-1).page, 1);
  tree = app.render();
  find(tree, (node) => node.props?.["aria-label"] === "Filter course status").props.onChange({ target: { value: "pending" } });
  app.render(); await app.flush();
  assert.equal(app.requests.at(-1).page, 0);
  assert.equal(app.requests.at(-1).status, "pending");
});

test("admin title search is debounced and empty optional filters are omitted", async () => {
  const app = harness();
  const tree = app.render(); await app.flush();
  find(tree, (node) => node.props?.["aria-label"] === "Search course title or university").props.onChange({ target: { value: "  engineering  " } });
  app.render(); await app.flush();
  assert.equal(app.requests.length, 1);
  app.flushTimer(); app.render(); await app.flush();
  assert.equal(app.requests.at(-1).keyword, "engineering");
  assert.equal("type" in app.requests.at(-1), false);
  assert.equal("district" in app.requests.at(-1), false);
});
