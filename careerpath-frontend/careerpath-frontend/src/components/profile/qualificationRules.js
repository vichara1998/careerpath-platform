// Profile consistency rules, not provider admission rules.
export const qualificationLabels = {
  OL_FAIL: "O/L incomplete", OL_PASS: "O/L passed",
  AL_FAIL: "A/L incomplete", AL_PASS: "A/L passed",
  DIPLOMA: "Diploma completed", UNDERGRADUATE: "Undergraduate (currently studying)",
  GRADUATE: "Graduate (degree completed)", PROFESSIONAL: "Professional qualification",
};
export const qualificationConflicts = [
  ["OL_FAIL", "OL_PASS"], ["AL_FAIL", "AL_PASS"],
  ["OL_FAIL", "AL_PASS"], ["UNDERGRADUATE", "GRADUATE"],
];
export function qualificationConflict(level, selected) {
  const pair = qualificationConflicts.find(pair => pair.includes(level) && pair.some(other => other !== level && selected.includes(other)));
  if (!pair) return "";
  return `Unselect ${qualificationLabels[pair.find(other => other !== level)]} first.`;
}
