import { useState } from "react";

export const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

// Values retain the identifiers understood by the recommendation service.
export const studyStreams = [
  ["Bio", "Biological Science (A/L)"], ["Maths", "Physical Science / Maths (A/L)"],
  ["Commerce", "Commerce"], ["Arts", "Arts"],
  ["Technology", "Engineering Technology (A/L)"], ["BioTechnology", "Biosystems Technology (A/L)"],
  ["Science", "General Science / O/L"], ["Vocational", "Vocational / Technical / NVQ"],
  ["Other", "Other / Not applicable"],
];

export const interestChoices = ["Software Engineering", "Data Science", "Engineering", "Medicine", "Business", "Accounting", "Arts & Design", "Tourism", "Agriculture", "Education", "Cybersecurity", "Marketing", "AI/ML", "Networking", "Media Studies", "Food Technology", "Environmental Science"];
export const skillChoices = ["Problem solving", "Communication", "Teamwork", "Leadership", "Programming", "Mathematics", "Creativity", "Writing", "Languages", "Practical / technical skills"];
export const goalChoices = ["Earn a degree", "Find my first job", "Start a business", "Change careers", "Improve my skills", "Study abroad", "Gain a professional qualification", "Explore my options"];

export default function ProfileChoices({ name, label, options, initialValue = "", onChange }) {
  const initial = initialValue.split(",").map((item) => item.trim()).filter(Boolean);
  const [selected, setSelected] = useState(() => initial.filter((item) => options.includes(item)));
  const [additional, setAdditional] = useState(() => initial.filter((item) => !options.includes(item)).join(", "));
  const notify = (choices, extra) => onChange?.([...new Set([...choices, ...extra.split(",").map((item) => item.trim()).filter(Boolean)])].join(", "));
  const combined = [...new Set([...selected, ...additional.split(",").map((item) => item.trim()).filter(Boolean)])];
  return (
    <fieldset className="profile-choice-field">
      <legend>{label}</legend>
      <p className="profile-choice-hint">Tick any that apply, or add your own.</p>
      <div className="profile-choice-grid">
        {options.map((option) => (
          <label className="profile-choice" key={option}>
            <input type="checkbox" checked={selected.includes(option)}
              onChange={(event) => {
                const next = event.target.checked ? [...selected, option] : selected.filter((item) => item !== option);
                setSelected(next);
                notify(next, additional);
              }} />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <label className="profile-choice-additional">
        Additional {label.toLowerCase()}
        <div className="input-shell">
          <input value={additional} onChange={(event) => { setAdditional(event.target.value); notify(selected, event.target.value); }}
            placeholder="Type your own, separated by commas" />
        </div>
      </label>
      <input type="hidden" name={name} value={combined.join(", ")} />
    </fieldset>
  );
}
