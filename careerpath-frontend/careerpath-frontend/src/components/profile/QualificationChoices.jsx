import { qualificationLabels, qualificationConflict } from "./qualificationRules.js";
const levels = Object.entries(qualificationLabels);
export default function QualificationChoices({ name = "qualificationLevel", value = "", onChange, disabled = false, required = true }) {
  const selected = value.split(",").map(item => item.trim()).filter(Boolean);
  return <fieldset className="profile-choice-field" disabled={disabled}>
    <legend>Qualifications</legend>
    <p className="profile-choice-hint">Choose your latest school results and qualifications already earned. You can explore diploma courses without already holding a diploma. Untick a conflicting choice to change it.</p>
    <div className="profile-choice-grid">
      {levels.map(([level, label], index) => <label key={level} className="profile-choice">
        <input type="checkbox" checked={selected.includes(level)} required={required && selected.length === 0 && index === 0}
          disabled={!selected.includes(level) && !!qualificationConflict(level, selected)}
          aria-describedby={qualificationConflict(level, selected) ? `qualification-conflict-${level}` : undefined}
          onChange={(event) => {
            if (event.target.checked && qualificationConflict(level, selected)) return;
            onChange((event.target.checked ? [...selected, level] : selected.filter(item => item !== level)).join(","));
          }} />
        <span>{label}{qualificationConflict(level, selected) && <small className="qualification-conflict" id={`qualification-conflict-${level}`}>{qualificationConflict(level, selected)}</small>}</span>
      </label>)}
    </div>
    <input type="hidden" name={name} value={selected.join(",")} />
  </fieldset>;
}
