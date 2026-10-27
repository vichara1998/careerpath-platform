// These are discovery suggestions, not admission or subject eligibility rules.
const schoolStreams = {
  OL_FAIL: ["Science", "Vocational", "Other"],
  OL_PASS: ["Science", "Vocational", "Other"],
  AL_FAIL: ["Bio", "Maths", "Commerce", "Arts", "Technology", "BioTechnology", "Other"],
  AL_PASS: ["Bio", "Maths", "Commerce", "Arts", "Technology", "BioTechnology", "Other"],
};
const advancedStreams = [
  ["Computing", "Computing / ICT"], ["Engineering", "Engineering"],
  ["Health", "Health / Life Sciences"], ["Commerce", "Business / Commerce"],
  ["Arts", "Arts / Humanities"], ["Agriculture", "Agriculture / Environment"],
  ["Vocational", "Vocational / Technical / NVQ"], ["Other", "Other / Not applicable"],
];
const fieldsByStream = {
  Science: ["Engineering", "Software Engineering", "Data Science", "Agriculture", "Food Technology", "Environmental Science"],
  Maths: ["Engineering", "Software Engineering", "Data Science", "AI/ML", "Cybersecurity", "Networking"],
  Bio: ["Medicine", "Agriculture", "Food Technology", "Environmental Science"],
  Technology: ["Engineering", "Software Engineering", "Networking", "Cybersecurity", "Data Science", "AI/ML"],
  BioTechnology: ["Agriculture", "Food Technology", "Environmental Science"],
  Commerce: ["Business", "Accounting", "Marketing"],
  Arts: ["Arts & Design", "Media Studies", "Tourism", "Education", "Marketing"],
  Computing: ["Software Engineering", "Data Science", "AI/ML", "Cybersecurity", "Networking"],
  Engineering: ["Engineering", "Software Engineering", "Data Science", "Networking", "Environmental Science"],
  Health: ["Medicine", "Food Technology", "Environmental Science"],
  Agriculture: ["Agriculture", "Food Technology", "Environmental Science"],
  Vocational: ["Engineering", "Networking", "Software Engineering", "Tourism", "Agriculture", "Arts & Design"],
};
export function getStudyStreams(qualification, streams) {
  const qualifications = Array.isArray(qualification) ? qualification : (qualification || "").split(",").map(value => value.trim());
  const available = new Map();
  for (const level of qualifications) {
    const options = schoolStreams[level] ? streams.filter(([value]) => schoolStreams[level].includes(value))
      : ["DIPLOMA", "UNDERGRADUATE", "GRADUATE", "PROFESSIONAL"].includes(level) ? advancedStreams : [];
    for (const [value, label] of options) available.set(value, label);
  }
  return [...available.entries()];
}
export function getInterestChoices(qualification, stream, streams, interests) {
  if (!getStudyStreams(qualification, streams).some(([value]) => value === stream)) return [];
  return stream === "Other" ? interests : (fieldsByStream[stream] || []);
}
