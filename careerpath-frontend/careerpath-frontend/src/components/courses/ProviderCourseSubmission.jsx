import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { adminApi } from "../../api/adminApi.js";
import { courseApi } from "../../api/courseApi.js";
import CourseEditModal from "./CourseEditModal.jsx";
import CourseImageField from "./CourseImageField.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const emptyCourse = {
  title: "",
  description: "",
  type: "DEGREE",
  level: "",
  mode: "PHYSICAL",
  feePerYear: "",
  totalFee: "",
  eligibility: "",
  durationMonths: "",
  district: "",
  province: "",
  careerFields: "",
  intakeDate: "",
  applicationDeadline: "",
  applicationLink: "",
  thumbnailUrl: "",
  universityId: "",
};

export default function ProviderCourseSubmission() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [form, setForm] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [myCoursesError, setMyCoursesError] = useState("");
  const [myCourses, setMyCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);

  useEffect(() => {
    let active = true;
    courseApi
      .getMine({ page: 0, size: 50 })
      .then(({ data }) => {
        if (active) setMyCourses(data.data?.content || []);
      })
      .catch(() => {
        if (active)
          setMyCoursesError(
            "Could not load your submissions. Restart the backend with the latest course API.",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      ...form,
      universityId: Number(form.universityId),
      feePerYear: form.feePerYear ? Number(form.feePerYear) : null,
      totalFee: form.totalFee ? Number(form.totalFee) : null,
      durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
      intakeDate: form.intakeDate || null,
      applicationDeadline: form.applicationDeadline || null,
      thumbnailUrl: form.thumbnailUrl || null,
    };
    try {
      const { data } = await courseApi.create(payload);
      setSuccess(`“${data.data.title}” was submitted for review.`);
      setMyCourses((current) => [data.data, ...current]);
      setForm(emptyCourse);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not submit this course. Please check the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveCourse = async (courseId, payload) => {
    const { data } = isAdmin
      ? await adminApi.updateCourse(courseId, payload)
      : await courseApi.updateMine(courseId, payload);
    setMyCourses((current) =>
      current.map((course) =>
        course.id === data.data.id ? data.data : course,
      ),
    );
    setSuccess(
      isAdmin
        ? `“${data.data.title}” was updated.`
        : `“${data.data.title}” was resubmitted for admin approval.`,
    );
    return data.data;
  };

  return (
    <section className="page-container content-section provider-course-page">
      <header className="page-intro">
        <p className="eyebrow">PROVIDER PORTAL</p>
        <h1>Submit a course</h1>
        <p>
          Add course details and a photo for the directory. Submissions are
          reviewed before publication.
        </p>
      </header>
      <form className="form-panel provider-course-form" onSubmit={submit}>
        <label className="field-label">
          Course title
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="BSc (Hons) Software Engineering"
          />
        </label>
        <label className="field-label">
          Description
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="What will students learn?"
          />
        </label>
        <div className="form-two">
          <label className="field-label">
            University ID
            <input
              required
              type="number"
              min="1"
              value={form.universityId}
              onChange={(event) => update("universityId", event.target.value)}
              placeholder="Contact an administrator for the ID"
            />
          </label>
          <label className="field-label">
            Qualification level
            <input
              maxLength={100}
              value={form.level}
              onChange={(event) => update("level", event.target.value)}
              placeholder="BSc (Hons)"
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
              {[
                "DEGREE",
                "DIPLOMA",
                "NVQ",
                "CERTIFICATE",
                "ONLINE_CERTIFICATION",
                "VOCATIONAL",
                "SHORT_COURSE",
                "POSTGRADUATE",
              ].map((type) => (
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
              {["PHYSICAL", "ONLINE", "HYBRID"].map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>
        </div>
        <CourseImageField
          value={form.thumbnailUrl}
          onChange={(value) => update("thumbnailUrl", value)}
        />
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
              onChange={(event) => update("durationMonths", event.target.value)}
            />
          </label>
          <label className="field-label">
            Career fields <span>comma separated</span>
            <input
              value={form.careerFields}
              onChange={(event) => update("careerFields", event.target.value)}
              placeholder="Software Engineering, Data Science"
            />
          </label>
        </div>
        <div className="form-two">
          <label className="field-label">
            District
            <input
              value={form.district}
              onChange={(event) => update("district", event.target.value)}
            />
          </label>
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
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="notice notice-success" role="status">
            {success}
          </p>
        )}
        <button className="button-primary" disabled={saving} type="submit">
          {saving ? "Submitting..." : "Submit for review"}
          <ArrowRight size={17} />
        </button>
      </form>
      {myCoursesError && (
        <p
          className="notice notice-error provider-submissions-error"
          role="alert"
        >
          {myCoursesError}
        </p>
      )}
      {myCourses.length > 0 && (
        <section className="provider-submissions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR CATALOGUE</p>
              <h2>Your submissions</h2>
            </div>
            <span className="queue-count">{myCourses.length} courses</span>
          </div>
          <div className="admin-table-wrap">
            {myCourses.map((course) => (
              <article className="provider-course-row" key={course.id}>
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" />
                ) : (
                  <span className="provider-course-no-image">No image</span>
                )}
                <div>
                  <strong>{course.title}</strong>
                  <span>
                    {course.approved
                      ? "Published"
                      : course.rejected
                        ? "Rejected"
                        : "Pending review"}
                  </span>
                </div>
                <button
                  className="button-outline"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditCourse(course);
                  }}
                  type="button"
                >
                  Edit course
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {editCourse && (
        <CourseEditModal
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onSave={saveCourse}
          providerEdit={!isAdmin}
        />
      )}
    </section>
  );
}
