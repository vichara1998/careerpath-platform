import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { getStudyStreams, getInterestChoices } from "../src/components/profile/profileOptions.js";
import { initialPathwayState, profileSignature, writePathwayState } from "../src/utils/pathwayState.js";

test("building a pathway displays the returned courses with detail links", async () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const source = app.slice(app.indexOf("const recommendationPayload"), app.indexOf("function Login()"));
  const state = [], requests = [];
  let cursor = 0;
  const context = {
    PathwayPreview: "PathwayPreview",
    initialPathwayState, profileSignature, writePathwayState,
    getStudyStreams, getInterestChoices,
    useLocation: () => ({ state: null }), useRef: () => ({ current: null }), useEffect: () => {},
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    recommendApi: { getRecommendations: async (payload) => {
      requests.push(payload);
      return { data: { data: { careerFields: ["Software Engineering"], pathwaySummary: "Explore computing.", recommendedCourses: [{ id: 20, title: "Software Engineering Degree", universityName: "Test University", mode: "ONLINE", totalFee: 100000 }], alternativeCourses: [{ id: 30, title: "Cookery certificate", careerFields: "Tourism", eligibility: "Open entry", eligibilityStatus: "OPEN_ENTRY", matchWarnings: [] }] } } };
    } },
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
    QualificationChoices: "QualificationChoices", ProfileChoices: "ProfileChoices", CourseCard: "CourseCard", Link: "Link", ArrowRight: "ArrowRight", Sparkles: "Sparkles",
    studyStreams: [], districts: [], interestChoices: [], skillChoices: [], goalChoices: [],
    apiError: () => "Failed", money: (value) => `LKR ${value}`,
  };
  runInNewContext(transformSync(source, { loader: "jsx" }).code, context);
  const find = (node, predicate) => {
    if (!node || typeof node !== "object") return null;
    if (predicate(node)) return node;
    return node.children?.flat().map((child) => find(child, predicate)).find(Boolean);
  };
  const render = () => { cursor = 0; return context.Recommendation(); };
  let tree = render();
  find(tree, (node) => node.type === "QualificationChoices").props.onChange("AL_PASS,DIPLOMA");
  tree = render();
  await find(tree, (node) => node.type === "form").props.onSubmit({ preventDefault() {} });
  tree = render();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].preferredMode, null);
  assert.equal(requests[0].qualificationLevel, "DIPLOMA");
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0].qualifications)), ["AL_PASS", "DIPLOMA"]);
  const card = find(tree, (node) => node.type === "CourseCard");
  assert.equal(card.props.course.id, 20);
  assert.equal(card.props.course.title, "Software Engineering Degree");
  const alternatives = find(tree, node => node.props?.["aria-label"] === "Eligible courses in other fields");
  assert.ok(alternatives);
  assert.equal(find(alternatives, node => node.type === "CourseCard").props.course.id, 30);
  const selectedFields = find(tree, node => node.props?.["aria-label"] === "Recommended course list");
  assert.equal(find(selectedFields, node => node.type === "CourseCard").props.course.id, 20);
});
