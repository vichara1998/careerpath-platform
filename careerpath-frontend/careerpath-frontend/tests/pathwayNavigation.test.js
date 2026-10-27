import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { getStudyStreams, getInterestChoices } from "../src/components/profile/profileOptions.js";
import { initialPathwayState, profileSignature, writePathwayState } from "../src/utils/pathwayState.js";

test("course back and refresh restore the rendered results without another API request; edits persist as a draft", async () => {
  const previous = ["localStorage", "sessionStorage"].map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const memory = new Map();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => '{"userId":1}' } });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) } });
  try {
    const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
    const source = transformSync(app.slice(app.indexOf("const recommendationPayload"), app.indexOf("function Login()")), { loader: "jsx" }).code;
    const incoming = { qualificationLevel: "AL_PASS", stream: "Bio", interests: "Agriculture" };
    let requests = 0;
    const mount = profile => {
      let cursor = 0, effects = [];
      const cells = [], dependencies = [];
      const location = { state: profile ? { profile } : null };
      const context = {
        PathwayPreview: "PathwayPreview",
        initialPathwayState, profileSignature, writePathwayState, getStudyStreams, getInterestChoices,
        useLocation: () => location,
        useState(initial) {
          const index = cursor++;
          if (!(index in cells)) cells[index] = typeof initial === "function" ? initial() : initial;
          return [cells[index], value => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
        },
        useRef(initial) { const index = cursor++; return cells[index] ??= { current: initial }; },
        useEffect(effect, deps) {
          const index = cursor++;
          if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) effects.push(effect);
          dependencies[index] = deps;
        },
        recommendApi: { getRecommendations: async () => {
          requests++;
          return { data: { data: { careerFields: ["Agriculture"], recommendedCourses: [{ id: 24, title: "Agriculture degree" }], alternativeCourses: [{ id: 30, title: "Cookery" }] } } };
        } },
        React: { createElement: (type, props, ...children) => ({ type, props, children }) },
        QualificationChoices: "QualificationChoices", ProfileChoices: "ProfileChoices", CourseCard: "CourseCard", Link: "Link", ArrowRight: "ArrowRight", Sparkles: "Sparkles",
        studyStreams: [["Bio", "Biology"]], interestChoices: ["Agriculture"], skillChoices: [], goalChoices: [], districts: [],
        AbortController, apiError: () => "Failed",
      };
      runInNewContext(source, context);
      return () => { cursor = 0; effects = []; const tree = context.Recommendation(); const pending = effects; pending.forEach(effect => effect()); return tree; };
    };
    const find = (node, predicate) => {
      if (!node || typeof node !== "object") return null;
      if (predicate(node)) return node;
      return node.children?.flat().map(child => find(child, predicate)).find(Boolean);
    };
    const first = mount(incoming);
    first();
    await new Promise(resolve => setTimeout(resolve, 0));
    let tree = first();
    assert.equal(find(tree, node => node.type === "CourseCard").props.course.id, 24);
    const back = mount(incoming);
    tree = back();
    assert.equal(find(tree, node => node.type === "CourseCard").props.course.id, 24);
    assert.ok(find(tree, node => node.props?.["aria-label"] === "Eligible courses in other fields"));
    const refresh = mount();
    tree = refresh();
    assert.equal(find(tree, node => node.type === "CourseCard").props.course.id, 24);
    assert.equal(requests, 1);
    find(tree, node => node.type === "QualificationChoices").props.onChange("OL_PASS");
    refresh();
    const restoredDraft = mount();
    tree = restoredDraft();
    assert.equal(find(tree, node => node.type === "QualificationChoices").props.value, "OL_PASS");
    assert.equal(find(tree, node => node.type === "CourseCard"), undefined);
    assert.equal(requests, 1);
  } finally {
    ["localStorage", "sessionStorage"].forEach((key, index) => {
      if (previous[index]) Object.defineProperty(globalThis, key, previous[index]); else delete globalThis[key];
    });
  }
});
