import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { getStudyStreams, getInterestChoices } from "../src/components/profile/profileOptions.js";
import { readPathwayState, writePathwayState } from "../src/utils/pathwayState.js";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("home submits entered profile values to the protected recommendation flow", () => {
  const source = app.slice(app.indexOf("function Home()"), app.indexOf("function Courses()"));
  const navigations = [];
  const context = {
    useState: (value) => [typeof value === "function" ? value() : value, () => {}], useEffect: () => {},
    readPathwayState, writePathwayState, getStudyStreams, getInterestChoices,
    useNavigate: () => (...args) => navigations.push(args),
    FormData: class { constructor(form) { return Object.entries(form); } },
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
    ArrowRight: "ArrowRight", Sparkles: "Sparkles", Check: "Check",
    QualificationChoices: "QualificationChoices", ProfileChoices: "ProfileChoices", districts: ["Colombo"], studyStreams: [["Bio", "Biological Science"]],
    interestChoices: [], skillChoices: [], goalChoices: [],
  };
  runInNewContext(transformSync(source, { loader: "jsx" }).code, context);
  const root = context.Home();
  const find = (node, predicate) => {
    if (!node || typeof node !== "object") return null;
    if (predicate(node)) return node;
    return node.children?.flat().map(child => find(child, predicate)).find(Boolean);
  };
  const form = find(root, node => node.type === "form");
  assert.ok(form, "home profile must be a submittable form");
  const qualification = find(form, node => node.props?.name === "qualificationLevel");
  assert.equal(qualification.props.required, true);
  const profile = { qualificationLevel: "AL_PASS", interests: "Design", preferredMode: "ONLINE", district: "Colombo" };
  let prevented = false;
  form.props.onSubmit({ preventDefault() { prevented = true; }, currentTarget: profile });
  assert.equal(prevented, true);
  assert.equal(navigations[0][0], "/recommendation");
  assert.deepEqual(JSON.parse(JSON.stringify(navigations[0][1].state.profile)), profile);
});

test("recommendation payload normalizes interests, skills, and optional mode", () => {
  const source = app.slice(app.indexOf("const recommendationPayload"), app.indexOf("function Recommendation()"));
  const context = {};
  runInNewContext(source + "\nglobalThis.payload = recommendationPayload;", context);
  const payload = context.payload({ qualificationLevel: "AL_PASS", interests: " Design, , Art ", skills: "Writing, ", preferredMode: "" });
  assert.deepEqual(JSON.parse(JSON.stringify(payload.interests)), ["Design", "Art"]);
  assert.deepEqual(JSON.parse(JSON.stringify(payload.skills)), ["Writing"]);
  assert.equal(payload.preferredMode, null);
});
