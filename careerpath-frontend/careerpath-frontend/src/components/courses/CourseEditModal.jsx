import ProfileChoices, { districts, interestChoices } from "../profile/ProfileChoices.jsx";
import { useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { createPortal } from "react-dom";
import CourseImageField from "./CourseImageField.jsx";

const courseTypes = [
  "DEGREE",
  "DIPLOMA",
  "NVQ",
  "CERTIFICATE",
  "ONLINE_CERTIFICATION",
  "VOCATIONAL",
  "SHORT_COURSE",
  "POSTGRADUATE",
];

const studyModes = ["PHYSICAL", "ONLINE", "HYBRID"];

export default function CourseEditModal({
  course,
  onClose,
  onSave,
  providerEdit = false,
}) {
  const [form, setForm] = useState(() => ({
    title: course.title || "",
    description: course.description || "",
    type: course.type || "DEGREE",
    level: course.level || "",
    mode: course.mode || "PHYSICAL",
    feePerYear: course.feePerYear ?? "",
    totalFee: course.totalFee ?? "",
    eligibility: course.eligibility || "",
    durationMonths: course.durationMonths ?? "",
    district: course.district || "",
    province: course.province || "",
    careerFields: course.careerFields || "",
    intakeDate: course.intakeDate || "",
    applicationDeadline: course.applicationDeadline || "",
    applicationLink: course.applicationLink || "",
    thumbnailUrl: course.thumbnailUrl || "",
    universityId: course.universityId ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isNew = !course.id;
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("input, button")?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.careerFields.length > 200) {
      setError("Career fields must fit within 200 characters. Remove a few choices or shorten additional fields.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      title: form.title.trim(),
      universityId: Number(form.universityId),
      feePerYear: form.feePerYear === "" ? null : Number(form.feePerYear),
      totalFee: form.totalFee === "" ? null : Number(form.totalFee),
      durationMonths:
        form.durationMonths === "" ? null : Number(form.durationMonths),
      intakeDate: form.intakeDate || null,
      applicationDeadline: form.applicationDeadline || null,
      thumbnailUrl: form.thumbnailUrl.trim() || null,
    };
    try {
      await onSave(course.id, payload);
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not update this course. Check the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="dialog-backdrop course-editor-backdrop" role="presentation" onMouseDown={() => !saving && onClose()}>
      <form
        ref={dialog}
        className="confirm-dialog course-edit-dialog"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-edit-title"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !saving) onClose();
          if (event.key !== "Tab") return;
          const controls = dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href]');
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
      >
        <div className="course-edit-heading">
          <div>
            <p className="eyebrow">
              {providerEdit ? "PROVIDER EDIT" : "COURSE CATALOGUE"}
            </p>
            <h2 id="course-edit-title">{isNew ? "Add a course" : "Edit course"}</h2>
          </div>
          <button
            className="course-edit-close"
            disabled={saving}
            onClick={onClose}
            type="button"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>
        <div className="course-edit-body">
        {providerEdit && (
          <p className="course-edit-review-note">
            Saving sends this course back for admin approval before it is
            published again.
          </p>
        )}
        <div className="course-edit-fields">
          <label className="field-label">
            Course title
            <input
              required
              maxLength={200}
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </label>
          <CourseImageField
            value={form.thumbnailUrl}
            onChange={(value) => update("thumbnailUrl", value)}
          />
          <div className="form-two">
            <label className="field-label">
              University ID
              <input
                required
                min="1"
                type="number"
                value={form.universityId}
                disabled={providerEdit}
                onChange={(event) => update("universityId", event.target.value)}
              />
            </label>
            <label className="field-label">
              Level
              <input
                maxLength={100}
                value={form.level}
                onChange={(event) => update("level", event.target.value)}
              />
            </label>
          </div>
          <div className="form-two">
            <label className="field-label">
              Course type
              <select
                value={form.type}
                onChange={(event) => update("type", event.target.value)}
              >
                {courseTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Study mode
              <select
                value={form.mode}
                onChange={(event) => update("mode", event.target.value)}
              >
                {studyModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-two">
            <label className="field-label">
              Total fee (LKR)
              <input
                min="0"
                type="number"
                value={form.totalFee}
                onChange={(event) => update("totalFee", event.target.value)}
              />
            </label>
            <label className="field-label">
              Annual fee (LKR)
              <input
                min="0"
                type="number"
                value={form.feePerYear}
                onChange={(event) => update("feePerYear", event.target.value)}
              />
            </label>
          </div>
          <div className="form-two">
            <label className="field-label">
              Duration (months)
              <input
                min="1"
                type="number"
                value={form.durationMonths}
                onChange={(event) =>
                  update("durationMonths", event.target.value)
                }
              />
            </label>
            </div>
            <ProfileChoices name="careerFields" label="Career fields" options={interestChoices} initialValue={form.careerFields} onChange={(value) => update("careerFields", value)} />
          <div className="form-two">
            <label className="field-label">District<select value={form.district} onChange={(event) => update("district", event.target.value)}><option value="">Choose a district (optional)</option>{form.district && !districts.includes(form.district) && <option value={form.district}>{form.district} (current)</option>}{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
            <label className="field-label">
              Province
              <input
                value={form.province}
                onChange={(event) => update("province", event.target.value)}
              />
            </label>
          </div>
          <label className="field-label">
            Eligibility
            <input
              value={form.eligibility}
              onChange={(event) => update("eligibility", event.target.value)}
            />
          </label>
          <div className="form-two">
            <label className="field-label">
              Intake date
              <input
                type="date"
                value={form.intakeDate}
                onChange={(event) => update("intakeDate", event.target.value)}
              />
            </label>
            <label className="field-label">
              Application deadline
              <input
                type="date"
                value={form.applicationDeadline}
                onChange={(event) =>
                  update("applicationDeadline", event.target.value)
                }
              />
            </label>
          </div>
          <label className="field-label">
            Application link
            <input
              value={form.applicationLink}
              onChange={(event) =>
                update("applicationLink", event.target.value)
              }
            />
          </label>
        </div>
        </div>
        <div className="course-edit-footer">
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        <div className="confirm-actions">
          <button className="button-outline" disabled={saving} onClick={onClose} type="button">
            Cancel
          </button>
          <button className="button-primary" disabled={saving} type="submit">
            <Save size={17} />{" "}
            {saving
              ? "Saving..."
              : providerEdit
                ? "Save and resubmit"
                : isNew ? "Create for review" : "Save changes"}
          </button>
        </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
