import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import * as qualificationRules from "../src/components/profile/qualificationRules.js";

test("qualifications allow several choices, unticking and require at least one", () => {
  const module = { exports: {} };
  runInNewContext(transformSync(readFileSync(new URL("../src/components/profile/QualificationChoices.jsx", import.meta.url), "utf8"), { loader: "jsx", format: "cjs" }).code,
    { module, exports: module.exports, require: () => qualificationRules, React: { createElement: (type, props, ...children) => ({ type, props, children }) } });
  let value = "";
  const render = () => module.exports.default({ value, onChange: next => { value = next; } });
  const inputs = tree => tree.children.flat().flatMap(child => child?.type === "div" ? child.children.flat().map(label => label.children[0]) : child?.type === "input" ? [child] : []);
  let boxes = inputs(render()).filter(input => input.props.type === "checkbox");
  assert.equal(boxes[0].props.required, true);
  boxes[3].props.onChange({ target: { checked: true } });
  boxes = inputs(render()).filter(input => input.props.type === "checkbox");
  assert.ok(boxes.every(box => !box.props.required));
  boxes[4].props.onChange({ target: { checked: true } });
  assert.equal(value, "AL_PASS,DIPLOMA");
  boxes = inputs(render()).filter(input => input.props.type === "checkbox");
  boxes[3].props.onChange({ target: { checked: false } });
  assert.equal(value, "DIPLOMA");
  value = "OL_FAIL";
  boxes = inputs(render()).filter(input => input.props.type === "checkbox");
  assert.equal(boxes[1].props.disabled, true);
  assert.equal(boxes[3].props.disabled, true);
  boxes[3].props.onChange({ target: { checked: true } });
  assert.equal(value, "OL_FAIL");
  boxes[4].props.onChange({ target: { checked: true } });
  assert.equal(value, "OL_FAIL,DIPLOMA");
  boxes = inputs(render()).filter(input => input.props.type === "checkbox");
  boxes[0].props.onChange({ target: { checked: false } });
  boxes = inputs(render()).filter(input => input.props.type === "checkbox");
  assert.equal(boxes[3].props.disabled, false);
});

test("every conflicting choice is blocked symmetrically, while diploma routes stay independent", () => {
  const { qualificationConflict } = qualificationRules;
  for (const [first, second] of [["OL_FAIL", "OL_PASS"], ["AL_FAIL", "AL_PASS"], ["OL_FAIL", "AL_PASS"], ["UNDERGRADUATE", "GRADUATE"]]) {
    assert.ok(qualificationConflict(first, [second]));
    assert.ok(qualificationConflict(second, [first]));
  }
  for (const school of ["OL_FAIL", "OL_PASS", "AL_FAIL", "AL_PASS"]) {
    for (const independent of ["DIPLOMA", "UNDERGRADUATE", "GRADUATE", "PROFESSIONAL"]) {
      assert.equal(qualificationConflict(independent, [school]), "");
    }
  }
  assert.equal(qualificationConflict("AL_PASS", []), "");
  assert.equal(qualificationConflict("PROFESSIONAL", ["GRADUATE", "DIPLOMA"]), "");
});

test("O/L incomplete keeps vocational interests available without a diploma", async () => {
  const { getStudyStreams, getInterestChoices } = await import("../src/components/profile/profileOptions.js");
  const streams = [["Science", "Science"], ["Vocational", "Vocational"], ["Other", "Other"]];
  assert.ok(getStudyStreams("OL_FAIL", streams).some(([value]) => value === "Vocational"));
  assert.ok(getInterestChoices("OL_FAIL", "Vocational", streams, []).includes("Agriculture"));
});
