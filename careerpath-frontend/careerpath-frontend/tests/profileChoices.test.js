import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const source = readFileSync(new URL("../src/components/profile/ProfileChoices.jsx", import.meta.url), "utf8");
const find = (node, predicate) => {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  return node.children?.flat().map((child) => find(child, predicate)).find(Boolean);
};

test("profile choices combine ticks and typed entries, retain initial data, and support unticking", () => {
  const state = [];
  let cursor = 0;
  const context = {
    module: { exports: {} }, exports: {},
    require: () => ({ useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { state[index] = value; }];
    } }),
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
  };
  runInNewContext(transformSync(source, { loader: "jsx", format: "cjs" }).code, context);
  const changes = [];
  const render = () => {
    cursor = 0;
    return context.module.exports.default({ name: "skills", label: "Skills", options: ["Communication", "Programming"], initialValue: "Communication, Drawing", onChange: (value) => changes.push(value) });
  };
  let tree = render();
  assert.equal(find(tree, (node) => node.props?.type === "hidden").props.value, "Communication, Drawing");
  const boxes = [];
  const collect = (node) => { if (!node || typeof node !== "object") return; if (node.props?.type === "checkbox") boxes.push(node); node.children?.flat().forEach(collect); };
  collect(tree);
  boxes[1].props.onChange({ target: { checked: true } });
  tree = render();
  find(tree, (node) => node.type === "input" && node.props?.placeholder).props.onChange({ target: { value: "Drawing, Programming, , Writing" } });
  tree = render();
  assert.equal(find(tree, (node) => node.props?.type === "hidden").props.value, "Communication, Programming, Drawing, Writing");
  find(tree, (node) => node.props?.type === "checkbox").props.onChange({ target: { checked: false } });
  assert.equal(changes.at(-1), "Programming, Drawing, Writing");
  assert.equal(context.module.exports.districts.length, 25);
  assert.equal(new Set(context.module.exports.districts).size, 25);
});
