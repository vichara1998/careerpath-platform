import { test } from "node:test";
import assert from "node:assert/strict";
import { getStudyStreams, getInterestChoices } from "../src/components/profile/profileOptions.js";
const streams = ["Science", "Bio", "Maths", "Commerce", "Arts", "Technology", "BioTechnology", "Other"].map(value => [value, value]);
const interests = ["Agriculture", "Engineering", "Networking"];
const fields = (level, stream) => getInterestChoices(level, stream, streams, interests);
test("qualification controls study streams", () => {
  assert.deepEqual(getStudyStreams("", streams), []);
  assert.deepEqual(getStudyStreams("OL_PASS", streams).map(([value]) => value), ["Science", "Other"]);
  assert.ok(getStudyStreams("AL_PASS", streams).some(([value]) => value === "Maths"));
  for (const level of ["DIPLOMA", "UNDERGRADUATE", "GRADUATE", "PROFESSIONAL"]) {
    assert.ok(getStudyStreams(level, streams).some(([value]) => value === "Computing"));
    assert.ok(!getStudyStreams(level, streams).some(([value]) => value === "Maths"));
  }
});
test("multiple qualifications combine streams without duplicates", () => {
  const options = getStudyStreams("OL_PASS,AL_PASS,DIPLOMA", streams).map(([value]) => value);
  assert.ok(options.includes("Science") && options.includes("Maths") && options.includes("Computing"));
  assert.equal(new Set(options).size, options.length);
  assert.ok(fields("AL_PASS,DIPLOMA", "Agriculture").includes("Agriculture"));
});
test("Physical Science suggests technical interests and rejects incompatible qualification", () => {
  assert.ok(fields("AL_PASS", "Maths").includes("Engineering"));
  assert.ok(!fields("AL_PASS", "Maths").includes("Medicine"));
  assert.ok(!fields("AL_PASS", "Maths").includes("Agriculture"));
  assert.deepEqual(fields("OL_PASS", "Maths"), []);
});
test("biological and agriculture fields do not suggest Networking", () => {
  for (const [level, stream] of [["AL_PASS", "Bio"], ["AL_FAIL", "BioTechnology"], ["GRADUATE", "Agriculture"]]) {
    assert.ok(fields(level, stream).includes("Agriculture"));
    assert.ok(!fields(level, stream).includes("Networking"));
  }
});
test("no stream gives no suggestions while Other allows career exploration", () => {
  assert.deepEqual(fields("AL_PASS", ""), []);
  assert.deepEqual(fields("AL_PASS", "Other"), interests);
});
