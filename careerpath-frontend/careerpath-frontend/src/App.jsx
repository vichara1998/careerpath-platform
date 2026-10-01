import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import CourseCard from "./components/courses/CourseCard.jsx";
import { courseApi } from "./api/courseApi.js";
import { recommendApi } from "./api/recommendApi.js";
import { authApi } from "./api/authApi.js";
import { adminApi } from "./api/adminApi.js";
import { useAuth } from "./hooks/useAuth.js";
import { login, register } from "./store/slices/authSlice.js";
import { ArrowRight, Search, ShieldAlert, Sparkles } from "lucide-react";

const money = (amount) =>
  amount == null
    ? "Fee not listed"
    : `LKR ${Number(amount).toLocaleString("en-LK")}`;
const apiError = (error) =>
  error.response?.data?.message ||
  (error.code === "ERR_NETWORK"
    ? "Could not reach CareerPath. Check that the backend is running on port 8081."
    : "Something went wrong. Please try again.");

function Home() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    courseApi
      .getFeatured()
      .then(({ data }) => {
        if (active) setFeatured(data.data || []);
      })
      .catch((requestError) => {
        if (active) setError(apiError(requestError));
      });
    return () => {
      active = false;
    };
  }, [retryCount]);

  return (
    <div>
      <section className="home-hero">
        <div className="page-container home-hero-inner">
          <div className="max-w-2xl">
            <p className="eyebrow">
              <span className="eyebrow-mark" /> EDUCATION PATHWAYS IN SRI LANKA
            </p>
            <h1>
              Build a future that fits <em>you.</em>
            </h1>
            <p className="hero-copy">
              Explore real courses, compare study options, and get a practical
              pathway shaped around your qualifications and goals.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="button-primary">
                Explore courses <ArrowRight size={17} />
              </Link>
              <Link to="/recommendation" className="button-light">
                <Sparkles size={16} /> Find my pathway
              </Link>
            </div>
            <div className="hero-note">
              <span className="hero-note-line" /> From your next step to your
              next chapter.
            </div>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>YOUR</span>
            <strong>
              NEXT
              <br />
              STEP
            </strong>
            <span>STARTS HERE</span>
            <div className="stamp-arrow">↗</div>
          </div>
        </div>
      </section>

      <section className="page-container content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A GOOD PLACE TO START</p>
            <h2>Featured courses</h2>
          </div>
          <Link to="/courses" className="text-link">
            Browse all courses <ArrowRight size={16} />
          </Link>
        </div>
        {error ? (
          <div className="notice notice-error">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : featured.length ? (
          <div className="course-grid">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            Courses will appear here once they are published.
          </div>
        )}
      </section>
    </div>
  );
}

function Courses() {
  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    mode: "",
    district: "",
    maxFee: "",
    careerField: "",
    page: 0,
  });
  const [courses, setCourses] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    courseApi
      .search({ ...filters, size: 12 })
      .then(({ data }) => {
        if (!active) return;
        setCourses(data.data?.content || []);
        setPageInfo({
          totalPages: data.data?.totalPages || 0,
          totalElements: data.data?.totalElements || 0,
        });
      })
      .catch((requestError) => {
        if (active) setError(apiError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, retryCount]);

  const update = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 0 }));

  return (
    <div className="page-container content-section">
      <div className="page-intro">
        <p className="eyebrow">COURSE DIRECTORY</p>
        <h1>Find your next step.</h1>
        <p>
          Search approved courses from education providers across Sri Lanka.
        </p>
      </div>
      <form
        className="course-search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search size={19} aria-hidden="true" />
        <input
          aria-label="Search courses"
          placeholder="Search by course, subject or provider"
          value={filters.keyword}
          onChange={(event) => update("keyword", event.target.value)}
        />
        <span>{pageInfo.totalElements} results</span>
      </form>
      <div className="filter-row">
        <select
          aria-label="Course type"
          value={filters.type}
          onChange={(event) => update("type", event.target.value)}
        >
          <option value="">All course types</option>
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
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          aria-label="Study mode"
          value={filters.mode}
          onChange={(event) => update("mode", event.target.value)}
        >
          <option value="">Any study mode</option>
          {["PHYSICAL", "ONLINE", "HYBRID"].map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <input
          aria-label="District"
          placeholder="District"
          value={filters.district}
          onChange={(event) => update("district", event.target.value)}
        />
        <input
          aria-label="Maximum fee"
          type="number"
          min="0"
          placeholder="Max fee (LKR)"
          value={filters.maxFee}
          onChange={(event) => update("maxFee", event.target.value)}
        />
      </div>
      {error && (
        <div className="notice notice-error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {loading ? (
        <p className="empty-inline">Loading courses...</p>
      ) : courses.length ? (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="empty-state">
            <h2>No courses found</h2>
            <p>Try a different search or remove a filter.</p>
          </div>
        )
      )}
      {pageInfo.totalPages > 1 && (
        <div className="pagination">
          <button
            className="button-outline"
            disabled={filters.page === 0}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page - 1 }))
            }
          >
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {pageInfo.totalPages}
          </span>
          <button
            className="button-outline"
            disabled={filters.page + 1 >= pageInfo.totalPages}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page + 1 }))
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function AdminDesk() {
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "DEGREE",
    level: "",
    mode: "PHYSICAL",
    feePerYear: "",
    totalFee: "",
    eligibility: "",
    durationMonths: "",
    district: "Colombo",
    province: "Western",
    careerFields: "",
    universityId: "",
  });
  const [createdCourse, setCreatedCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingError, setPendingError] = useState("");
  const [users, setUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [recordsError, setRecordsError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const loadPendingCourses = () => {
    adminApi
      .getPendingCourses({ page: 0, size: 20 })
      .then(({ data }) => setPendingCourses(data.data?.content || []))
      .catch((requestError) => setPendingError(apiError(requestError)));
  };

  const loadAdminRecords = () => {
    Promise.all([
      adminApi.getUsers(),
      adminApi.getAllCourses({ page: 0, size: 50 }),
    ])
      .then(([usersResponse, coursesResponse]) => {
        setUsers(usersResponse.data.data || []);
        setAllCourses(coursesResponse.data.data?.content || []);
      })
      .catch((requestError) => setRecordsError(apiError(requestError)));
  };

  useEffect(() => {
    loadPendingCourses();
    loadAdminRecords();
  }, []);

  const deleteUser = (user) => {
    if (user.email === currentUser?.email) return;
    setConfirmAction({
      title: "Delete this user?",
      message: `${user.fullName}'s account and related data will be removed. This cannot be undone.`,
      confirmLabel: "Delete user",
      action: () => adminApi.deleteUser(user.id).then(loadAdminRecords),
    });
  };

  const deleteCourse = (course) => {
    setConfirmAction({
      title: "Delete this course?",
      message: `"${course.title}" will be permanently removed from the catalogue.`,
      confirmLabel: "Delete course",
      action: () =>
        adminApi.deleteCourse(course.id).then(() => {
          loadAdminRecords();
          loadPendingCourses();
        }),
    });
  };

  const rejectCourse = (course) => {
    setConfirmAction({
      title: "Reject this course?",
      message: `"${course.title}" will be marked rejected and kept out of the public directory.`,
      confirmLabel: "Reject course",
      action: () =>
        adminApi.rejectCourse(course.id).then(() => {
          loadAdminRecords();
          loadPendingCourses();
        }),
    });
  };

  const runConfirmedAction = () => {
    confirmAction
      ?.action()
      .catch((requestError) => setRecordsError(apiError(requestError)))
      .finally(() => setConfirmAction(null));
  };

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        universityId: Number(form.universityId),
        feePerYear: form.feePerYear ? Number(form.feePerYear) : null,
        totalFee: form.totalFee ? Number(form.totalFee) : null,
        durationMonths: form.durationMonths
          ? Number(form.durationMonths)
          : null,
      };
      const { data } = await courseApi.create(payload);
      setCreatedCourse(data.data);
      setForm((current) => ({ ...current, title: "", description: "" }));
      loadPendingCourses();
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container content-section admin-desk">
      <div className="page-intro admin-intro">
        <p className="eyebrow">ADMIN DESK</p>
        <h1>Keep the catalogue useful.</h1>
        <p>
          Add a course for review, keep provider information consistent, and
          make the public directory worth returning to.
        </p>
      </div>
      <div className="admin-layout">
        <form className="form-panel admin-course-form" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CATALOGUE</p>
              <h2>Add a course</h2>
            </div>
            <span className="admin-status">Needs approval</span>
          </div>
          <label className="field-label">
            Course title
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="BSc (Hons) Software Engineering"
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="What will students learn?"
              rows="4"
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
                placeholder="For example, 6 for SLIIT"
              />
            </label>
            <label className="field-label">
              Level
              <input
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
          <div className="form-two">
            <label className="field-label">
              Total fee (LKR)
              <input
                type="number"
                min="0"
                value={form.totalFee}
                onChange={(event) => update("totalFee", event.target.value)}
              />
            </label>
            <label className="field-label">
              Duration (months)
              <input
                type="number"
                min="1"
                value={form.durationMonths}
                onChange={(event) =>
                  update("durationMonths", event.target.value)
                }
              />
            </label>
          </div>
          <label className="field-label">
            Career fields <span>comma separated</span>
            <input
              value={form.careerFields}
              onChange={(event) => update("careerFields", event.target.value)}
              placeholder="Software Engineering, Data Science"
            />
          </label>
          {error && <p className="notice notice-error">{error}</p>}
          <button className="button-primary" disabled={loading}>
            {loading ? "Saving course..." : "Submit course"}
            <ArrowRight size={17} />
          </button>
        </form>
        <aside className="admin-side-panel">
          <p className="eyebrow">ADMIN NOTE</p>
          <h2>One clean source of truth.</h2>
          <p>
            New courses are saved as pending by the backend. An administrator
            can approve them before they appear in the public directory.
          </p>
          <div className="admin-rule" />
          <p className="detail-muted">
            University IDs follow the seeded catalogue: SLIIT is 6, NSBM is 7,
            NIBM is 8.
          </p>
          {createdCourse && (
            <div className="notice notice-success">
              {createdCourse.title} was saved for approval.
            </div>
          )}
        </aside>
      </div>
      <section className="admin-queue">
        <div className="section-heading">
          <div>
            <p className="eyebrow">REVIEW QUEUE</p>
            <h2>Courses waiting for approval</h2>
          </div>
          <span className="queue-count">{pendingCourses.length} pending</span>
        </div>
        {pendingError && <p className="notice notice-error">{pendingError}</p>}
        {pendingCourses.length
          ? pendingCourses.map((course) => (
              <article className="pending-row" key={course.id}>
                <div>
                  <strong>{course.title}</strong>
                  <span>
                    {course.universityName} · {course.type} · {course.mode}
                  </span>
                </div>
                <button
                  className="button-primary"
                  onClick={() =>
                    adminApi
                      .approveCourse(course.id)
                      .then(loadPendingCourses)
                      .catch((requestError) =>
                        setPendingError(apiError(requestError)),
                      )
                  }
                >
                  Approve course
                </button>
                <button
                  className="danger-button"
                  onClick={() => rejectCourse(course)}
                >
                  Reject
                </button>
              </article>
            ))
          : !pendingError && (
              <p className="empty-inline">No courses are waiting for review.</p>
            )}
      </section>
      <section className="admin-records">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CONTROL ROOM</p>
            <h2>Users and courses</h2>
          </div>
          <span className="queue-count">
            {users.length} users · {allCourses.length} courses
          </span>
        </div>
        {recordsError && <p className="notice notice-error">{recordsError}</p>}
        <div className="admin-table-wrap">
          <div className="admin-table-heading">
            <strong>Users</strong>
            <span>Account access and roles</span>
          </div>
          {users.map((adminUser) => (
            <div className="admin-table-row" key={adminUser.id}>
              <div>
                <strong>{adminUser.fullName}</strong>
                <span>{adminUser.email}</span>
              </div>
              <span className="admin-row-meta">
                {adminUser.role.replace("ROLE_", "")} · {adminUser.status}
              </span>
              <button
                className="danger-button"
                disabled={adminUser.email === currentUser?.email}
                onClick={() => deleteUser(adminUser)}
              >
                {adminUser.email === currentUser?.email
                  ? "Current account"
                  : "Delete user"}
              </button>
            </div>
          ))}
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table-heading">
            <strong>Courses</strong>
            <span>Published and pending catalogue entries</span>
          </div>
          {allCourses.map((course) => (
            <div className="admin-table-row" key={course.id}>
              <div>
                <strong>{course.title}</strong>
                <span>
                  {course.universityName} · {course.type}
                </span>
              </div>
              <span
                className={`admin-row-meta ${course.approved ? "is-approved" : course.rejected ? "is-rejected" : "is-pending"}`}
              >
                {course.approved
                  ? "Published"
                  : course.rejected
                    ? "Rejected"
                    : "Pending"}
              </span>
              <button
                className="danger-button"
                onClick={() => deleteCourse(course)}
              >
                Delete course
              </button>
            </div>
          ))}
        </div>
      </section>
      {confirmAction && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={() => setConfirmAction(null)}
        >
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="confirm-icon">
              <ShieldAlert size={19} />
            </div>
            <h2 id="admin-confirm-title">{confirmAction.title}</h2>
            <p>{confirmAction.message}</p>
            <div className="confirm-actions">
              <button
                className="button-outline"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button className="button-primary" onClick={runConfirmedAction}>
                {confirmAction.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    let active = true;
    courseApi
      .getById(id)
      .then(({ data }) => {
        if (active) setCourse(data.data);
      })
      .catch((requestError) => {
        if (active) setError(apiError(requestError));
      });
    return () => {
      active = false;
    };
  }, [id, retryCount]);

  return (
    <div className="page-container content-section">
      {error ? (
        <div className="notice notice-error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      ) : !course ? (
        <p className="empty-inline">Loading course...</p>
      ) : (
        <article className="detail-layout">
          <div>
            <Link to="/courses" className="text-link">
              ← All courses
            </Link>
            <p className="eyebrow detail-eyebrow">
              {course.type?.replaceAll("_", " ")} · {course.mode}
            </p>
            <h1>{course.title}</h1>
            <p className="detail-provider">
              {course.universityName}
              {course.district ? ` · ${course.district}` : ""}
            </p>
            <div className="detail-copy">
              {course.description ||
                "Contact the provider for more information about this course."}
            </div>
            <div className="detail-facts">
              <div>
                <span>Duration</span>
                <strong>
                  {course.durationMonths
                    ? `${course.durationMonths} months`
                    : "Not listed"}
                </strong>
              </div>
              <div>
                <span>Level</span>
                <strong>{course.level || "Not listed"}</strong>
              </div>
              <div>
                <span>Eligibility</span>
                <strong>{course.eligibility || "Contact provider"}</strong>
              </div>
              <div>
                <span>Application deadline</span>
                <strong>{course.applicationDeadline || "Not listed"}</strong>
              </div>
            </div>
          </div>
          <aside className="detail-aside">
            <span className="eyebrow">COURSE FEES</span>
            <strong className="detail-price">{money(course.totalFee)}</strong>
            {course.feePerYear != null && (
              <p>{money(course.feePerYear)} per year</p>
            )}
            {course.applicationLink ? (
              <a
                className="button-primary"
                href={course.applicationLink}
                target="_blank"
                rel="noreferrer"
              >
                Apply with provider <ArrowRight size={17} />
              </a>
            ) : (
              <p className="detail-muted">
                Application details are not available yet.
              </p>
            )}
          </aside>
        </article>
      )}
    </div>
  );
}

function Recommendation() {
  const [form, setForm] = useState({
    qualificationLevel: "",
    stream: "",
    gpa: "",
    interests: "",
    skills: "",
    careerGoal: "",
    preferredMode: "",
    district: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const submitProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      qualificationLevel: form.qualificationLevel || null,
      preferredMode: form.preferredMode || null,
      interests: form.interests
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      skills: form.skills
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };
    try {
      const { data } = await recommendApi.getRecommendations(payload);
      setResult(data.data);
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const text = message.trim();
    setMessage("");
    setChatLoading(true);
    setChatError("");
    try {
      const { data } = await recommendApi.chat({ message: text, history });
      setHistory((current) => [
        ...current,
        { role: "user", content: text },
        { role: "assistant", content: data.data },
      ]);
      setChatError("");
    } catch (requestError) {
      setMessage(text);
      setChatError(apiError(requestError));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="page-container content-section">
      <div className="page-intro">
        <p className="eyebrow">CAREER GUIDE</p>
        <h1>Make your next move clearer.</h1>
        <p>
          Share your background and interests to get a pathway and relevant
          courses.
        </p>
      </div>
      <div className="recommendation-layout">
        <form className="form-panel" onSubmit={submitProfile}>
          <h2>Your profile</h2>
          <label className="field-label">
            Highest qualification
            <select
              required
              value={form.qualificationLevel}
              onChange={(event) =>
                setForm({ ...form, qualificationLevel: event.target.value })
              }
            >
              <option value="">Choose a level</option>
              {[
                "OL_FAIL",
                "OL_PASS",
                "AL_FAIL",
                "AL_PASS",
                "DIPLOMA",
                "UNDERGRADUATE",
                "GRADUATE",
                "PROFESSIONAL",
              ].map((level) => (
                <option key={level} value={level}>
                  {level.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Study stream
            <input
              placeholder="Science, Commerce, Arts, Maths..."
              value={form.stream}
              onChange={(event) =>
                setForm({ ...form, stream: event.target.value })
              }
            />
          </label>
          <label className="field-label">
            Interests <span>comma separated</span>
            <input
              placeholder="Software engineering, design"
              value={form.interests}
              onChange={(event) =>
                setForm({ ...form, interests: event.target.value })
              }
            />
          </label>
          <label className="field-label">
            Skills <span>comma separated</span>
            <input
              placeholder="Problem solving, communication"
              value={form.skills}
              onChange={(event) =>
                setForm({ ...form, skills: event.target.value })
              }
            />
          </label>
          <label className="field-label">
            Career goal
            <input
              placeholder="What would you like to do?"
              value={form.careerGoal}
              onChange={(event) =>
                setForm({ ...form, careerGoal: event.target.value })
              }
            />
          </label>
          <div className="form-two">
            <label className="field-label">
              Study mode
              <select
                value={form.preferredMode}
                onChange={(event) =>
                  setForm({ ...form, preferredMode: event.target.value })
                }
              >
                <option value="">Any mode</option>
                {["PHYSICAL", "ONLINE", "HYBRID"].map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              District
              <input
                placeholder="Any district"
                value={form.district}
                onChange={(event) =>
                  setForm({ ...form, district: event.target.value })
                }
              />
            </label>
          </div>
          {error && <p className="notice notice-error">{error}</p>}
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? "Finding options..." : "Build my pathway"}
            <ArrowRight size={17} />
          </button>
        </form>
        <section className="result-panel" aria-live="polite">
          {result ? (
            <>
              <p className="eyebrow">YOUR PATHWAY</p>
              <h2>A direction to explore</h2>
              <div className="field-tags">
                {result.careerFields?.map((field) => (
                  <span key={field}>{field}</span>
                ))}
              </div>
              <p className="pathway-summary">{result.pathwaySummary}</p>
              <h3>Relevant courses</h3>
              {result.recommendedCourses?.length ? (
                <div className="recommend-course-list">
                  {result.recommendedCourses.map((course, index) => (
                    <Link
                      key={`${course.id}-${index}`}
                      to={`/courses/${course.id}`}
                    >
                      <strong>{course.title}</strong>
                      <span>
                        {course.universityName} · {course.mode}
                      </span>
                      <span>{money(course.totalFee)}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="detail-muted">
                  No matching courses found yet. Browse the course directory for
                  more options.
                </p>
              )}
            </>
          ) : (
            <div className="result-empty">
              <div className="result-icon">
                <Sparkles size={21} />
              </div>
              <h2>Your pathway starts here.</h2>
              <p>
                Complete your profile to see suggested career fields, practical
                guidance, and matching courses.
              </p>
            </div>
          )}
        </section>
      </div>
      <section className="chat-panel">
        <div>
          <p className="eyebrow">CAREER ASSISTANT</p>
          <h2>Have a question?</h2>
          <p>Ask about study choices or career directions in Sri Lanka.</p>
        </div>
        <div className="chat-content">
          {history.length > 0 && (
            <div className="chat-thread">
              {history.map((item, index) => (
                <p
                  className={
                    item.role === "user" ? "chat-user" : "chat-assistant"
                  }
                  key={`${item.role}-${index}`}
                >
                  {item.content}
                </p>
              ))}
            </div>
          )}
          {chatError && (
            <div className="notice notice-error">
              <span>{chatError}</span>
              <button type="button" onClick={sendMessage}>
                Try again
              </button>
            </div>
          )}
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              aria-label="Ask the career assistant"
              placeholder="Ask a career question..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button
              className="button-primary"
              type="submit"
              disabled={chatLoading}
            >
              {chatLoading ? "Thinking..." : "Ask assistant"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await dispatch(login(form)).unwrap();
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to get guidance tailored to your goals."
    >
      <form className="auth-form" onSubmit={submit}>
        <label className="field-label">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </label>
        <label className="field-label">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
        </label>
        {error && <p className="notice notice-error">{error}</p>}
        <button className="button-primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight size={17} />
        </button>
      </form>
      <p className="auth-switch">
        New to CareerPath? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return undefined;
    }

    let active = true;
    authApi
      .verifyEmail(token)
      .then(({ data }) => {
        if (!active) return;
        setStatus("success");
        setMessage(data.message || "Your email has been verified.");
      })
      .catch((requestError) => {
        if (!active) return;
        setStatus("error");
        setMessage(apiError(requestError));
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <div className="auth-page verification-page">
      <section className="auth-aside">
        <p className="eyebrow">CAREERPATH SRI LANKA</p>
        <h1>One small step, then you are ready to explore.</h1>
        <p>
          We use email verification to keep your account and recommendations
          personal.
        </p>
      </section>
      <section className="auth-main">
        <div className="auth-box verification-box">
          <p className="eyebrow">EMAIL VERIFICATION</p>
          {status === "loading" ? (
            <>
              <h2>Checking your link...</h2>
              <p>Please wait while we confirm your account.</p>
            </>
          ) : (
            <>
              <h2>
                {status === "success"
                  ? "You are verified."
                  : "That link did not work."}
              </h2>
              <p
                className={
                  status === "error"
                    ? "notice notice-error"
                    : "notice notice-success"
                }
              >
                {message}
              </p>
              <Link
                to={status === "success" ? "/login" : "/"}
                className="button-primary"
              >
                {status === "success"
                  ? "Continue to sign in"
                  : "Back to CareerPath"}
                <ArrowRight size={17} />
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await dispatch(register(form)).unwrap();
      navigate("/login", {
        state: { notice: "Account created. Sign in to continue." },
      });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      title="Start your journey"
      subtitle="Create an account to explore your options."
    >
      <form className="auth-form" onSubmit={submit}>
        <label className="field-label">
          Full name
          <input
            required
            minLength="2"
            maxLength="100"
            autoComplete="name"
            value={form.fullName}
            onChange={(event) =>
              setForm({ ...form, fullName: event.target.value })
            }
          />
        </label>
        <label className="field-label">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </label>
        <label className="field-label">
          Password
          <input
            type="password"
            required
            minLength="8"
            maxLength="50"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
          <span>Use 8 to 50 characters.</span>
        </label>
        <label className="field-label">
          Account type
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option value="STUDENT">Student</option>
            <option value="PROVIDER">Course provider</option>
            <option value="UNIVERSITY">University</option>
          </select>
        </label>
        <label className="field-label">
          Phone <span>optional</span>
          <input
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />
        </label>
        {error && <p className="notice notice-error">{error}</p>}
        <button className="button-primary" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
          <ArrowRight size={17} />
        </button>
      </form>
      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  const location = useLocation();
  return (
    <div className="auth-page">
      <section className="auth-aside">
        <p className="eyebrow">CAREERPATH SRI LANKA</p>
        <h1>There is more than one way forward.</h1>
        <p>
          Find learning paths that meet you where you are, and help you move
          toward where you want to be.
        </p>
      </section>
      <section className="auth-main">
        <div className="auth-box">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {location.state?.notice && (
            <p className="notice notice-success">{location.state.notice}</p>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <AdminDesk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendation"
              element={
                <ProtectedRoute>
                  <Recommendation />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="*"
              element={
                <div className="page-container content-section empty-state">
                  <h1>Page not found</h1>
                  <Link className="text-link" to="/">
                    Back to home
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
