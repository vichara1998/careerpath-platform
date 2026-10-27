import { readPathwayState, writePathwayState, initialPathwayState, profileSignature } from "./utils/pathwayState.js";
import AdminDesk from "./components/admin/AdminDesk.jsx";
import { useEffect, useRef, useState } from "react";
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


import ProviderCourseSubmission from "./components/courses/ProviderCourseSubmission.jsx";
import { courseApi } from "./api/courseApi.js";
import { recommendApi } from "./api/recommendApi.js";
import { authApi } from "./api/authApi.js";

import PathwayPreview from "./components/profile/PathwayPreview.jsx";
import QualificationChoices from "./components/profile/QualificationChoices.jsx";
import Profile from "./components/profile/Profile.jsx";
import { getStudyStreams, getInterestChoices } from "./components/profile/profileOptions.js";
import ProfileChoices, { districts, studyStreams, interestChoices, skillChoices, goalChoices } from "./components/profile/ProfileChoices.jsx";

import { login, register } from "./store/slices/authSlice.js";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

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
  const navigate = useNavigate();
  const [homeForm, setHomeForm] = useState(() => readPathwayState("home").form || {});
  const qualification = homeForm.qualificationLevel || "";
  const stream = homeForm.stream || "";
  useEffect(() => { writePathwayState("home", { form: homeForm }); }, [homeForm]);
  const submitProfile = (event) => {
    event.preventDefault();
    const profile = Object.fromEntries(new FormData(event.currentTarget));
    navigate("/recommendation", { state: { profile } });
  };
  return (
    <div className="guided-dashboard">
      <div className="page-container dashboard-shell">
        <div className="hero-headline-wrap">
          <p className="eyebrow eyebrow-gold">
            <span className="eyebrow-mark" /> Education pathways in Sri Lanka
          </p>
          <h1>
            Make your next move
            <span>clearer.</span>
          </h1>
          <p className="hero-copy">
            Share your background and interests to get a pathway and relevant
            courses.
          </p>
        </div>

        <div className="dashboard-panel">
          <form className="profile-panel" onSubmit={submitProfile} onChange={(event) => {
            const { name, value } = event.target;
            if (name && name !== "qualificationLevel") setHomeForm(current => ({ ...current, [name]: value }));
          }}>
            <h2>Your profile</h2>

            <QualificationChoices name="qualificationLevel" value={qualification} required
              onChange={(value) => setHomeForm(current => ({ ...current, qualificationLevel: value, stream: "", interests: "" }))} />

            <div className="row-fields profile-entry-details">
              <label className="field-wrap"><span>Highest school grade completed (optional)</span><div className="input-shell"><input name="highestSchoolGrade" defaultValue={homeForm.highestSchoolGrade || ""} type="number" min="1" max="13" placeholder="e.g. 9 or 11" /></div></label>
              <label className="field-wrap"><span>Age (optional)</span><div className="input-shell"><input name="age" defaultValue={homeForm.age || ""} type="number" min="10" max="100" placeholder="For age-based entry rules" /></div></label>
            </div>
            <label className="field-wrap">
              <span>Study stream</span>
              <div className="select-shell">
                <select name="stream" value={stream} disabled={!qualification} onChange={(event) => setHomeForm(current => ({ ...current, stream: event.target.value, interests: "" }))}>
                  <option value="">Choose a stream</option>
                  {getStudyStreams(qualification, studyStreams).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </label>

            <ProfileChoices key={qualification + ":" + stream} name="interests" label="Interests"
              disabled={!stream} hint={stream ? "Suggested for your stream. Tick any that apply, or add your own field." : "Choose your qualification and study stream to see suggested interests."}
              options={getInterestChoices(qualification, stream, studyStreams, interestChoices)} initialValue={homeForm.interests || ""} onChange={(value) => setHomeForm(current => ({ ...current, interests: value }))} />
            <ProfileChoices name="skills" label="Skills" options={skillChoices} initialValue={homeForm.skills || ""} onChange={(value) => setHomeForm(current => ({ ...current, skills: value }))} />
            <ProfileChoices name="careerGoal" label="Career goals" options={goalChoices} initialValue={homeForm.careerGoal || ""} onChange={(value) => setHomeForm(current => ({ ...current, careerGoal: value }))} />

            <div className="row-fields">
              <label className="field-wrap field-half">
                <span>Study mode</span>
                <div className="select-shell">
                  <select name="preferredMode" defaultValue={homeForm.preferredMode || ""}>
                    <option value="">
                      Any mode
                    </option>
                    <option value="PHYSICAL">Physical</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </label>

              <label className="field-wrap field-half">
                <span>District</span>
                <div className="select-shell">
                  <select name="district" defaultValue={homeForm.district || ""}>
                    <option value="">
                      Any district
                    </option>
                    {districts.map((district) => <option key={district}>{district}</option>)}
                  </select>
                </div>
              </label>
            </div>

            <button type="submit" className="dashboard-primary">
              Get recommendations <ArrowRight size={17} />
            </button>
          </form>

          <div className="guide-panel">
            <div className="guide-icon-wrap">
              <div className="guide-icon">
                <Sparkles size={25} />
              </div>
            </div>

            <div className="guide-copy">
              <h3>Your pathway starts here.</h3>
              <p>
                Complete your profile to see suggested career fields, practical
                guidance, and matching courses.
              </p>
            </div>

            <div className="compass-scene" aria-hidden="true">
              <div className="compass-ring">
                <Check className="compass-check" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Courses() {
  const [searchFields, setSearchFields] = useState({ keyword: "", district: "", maxFee: "" });
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

  const searchPending = Object.entries(searchFields).some(
    ([key, value]) => value.trim() !== filters[key],
  );

  //debouncing
  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextFields = Object.fromEntries(
        Object.entries(searchFields).map(([key, value]) => [key, value.trim()]),
      );
      setFilters((current) =>
        Object.entries(nextFields).some(([key, value]) => current[key] !== value)
          ? { ...current, ...nextFields, page: 0 }
          : current,
      );
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchFields]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    courseApi
      .search({ ...filters, size: 12 }, { signal: controller.signal })
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
      controller.abort();
    };
  }, [filters, retryCount]);

  const update = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 0 }));
  const updateSearch = (key, value) =>
    setSearchFields((current) => ({ ...current, [key]: value }));

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
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search size={19} aria-hidden="true" />
        <input
          aria-label="Search courses"
          placeholder="Search by course, subject or provider"
          type="search"
          value={searchFields.keyword}
          onChange={(event) => updateSearch("keyword", event.target.value)}
        />
        {searchFields.keyword && (
          <button className="course-search-clear" type="button" aria-label="Clear course search" onClick={() => updateSearch("keyword", "")}>
            <X size={17} aria-hidden="true" />
          </button>
        )}
        <span role="status" aria-live="polite">
          {loading || searchPending ? "Searching…" : `${pageInfo.totalElements} results`}
        </span>
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
        <select
          aria-label="District"
          value={searchFields.district}
          onChange={(event) => updateSearch("district", event.target.value)}
        >
          <option value="">All districts</option>
          {districts.map((district) => <option key={district}>{district}</option>)}
        </select>
        <select aria-label="Career field" value={filters.careerField} onChange={(event) => update("careerField", event.target.value)}>
          <option value="">All career fields</option>
          {interestChoices.map((field) => <option key={field}>{field}</option>)}
        </select>
        <input
          aria-label="Maximum fee"
          type="number"
          min="0"
          placeholder="Max fee (LKR)"
          value={searchFields.maxFee}
          onChange={(event) => updateSearch("maxFee", event.target.value)}
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
            disabled={loading || searchPending || filters.page === 0}
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
            disabled={loading || searchPending || filters.page + 1 >= pageInfo.totalPages}
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

const recommendationPayload = (form) => ({
  ...form,
  qualifications: (form.qualificationLevel || "").split(",").map(value => value.trim()).filter(Boolean),
  qualificationLevel: ["PROFESSIONAL", "GRADUATE", "UNDERGRADUATE", "DIPLOMA", "AL_PASS", "AL_FAIL", "OL_PASS", "OL_FAIL"]
    .find(level => (form.qualificationLevel || "").split(",").map(value => value.trim()).includes(level)) || null,
  preferredMode: form.preferredMode || null,
  age: form.age === "" || form.age == null ? null : Number(form.age),
  highestSchoolGrade: form.highestSchoolGrade === "" || form.highestSchoolGrade == null ? null : Number(form.highestSchoolGrade),
  maxBudget: form.maxBudget === "" || form.maxBudget == null ? null : Number(form.maxBudget),
  maxDurationMonths: form.maxDurationMonths === "" || form.maxDurationMonths == null ? null : Number(form.maxDurationMonths),
  interests: (form.interests || "").split(",").map((value) => value.trim()).filter(Boolean),
  skills: (form.skills || "").split(",").map((value) => value.trim()).filter(Boolean),
});

function Recommendation() {
  const location = useLocation();
  const resultsPanel = useRef(null);
  const [savedPathway] = useState(() => initialPathwayState(location.state?.profile));
  const [form, setForm] = useState(() => ({
    qualificationLevel: "",
    stream: "",
    gpa: "",
    interests: "",
    skills: "",
    careerGoal: "",
    preferredMode: "",
    district: "",
    age: "",
    highestSchoolGrade: "",
    maxBudget: "",
    maxDurationMonths: "",
    ...savedPathway.form,
  }));
  const [result, setResult] = useState(savedPathway.result || null);
  const resultProfileKey = useRef(savedPathway.result ? profileSignature(form) : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    const matchesProfile = profileSignature(form) === resultProfileKey.current;
    writePathwayState("guide", { form, result: matchesProfile ? result : null, sourceKey: savedPathway.sourceKey });
    if (result && !matchesProfile) setResult(null);
  }, [form, result, savedPathway.sourceKey]);

  useEffect(() => {
    if (!result || loading) return;
    resultsPanel.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    resultsPanel.current?.focus({ preventScroll: true });
  }, [result, loading]);

  useEffect(() => {
    if (!location.state?.profile || !savedPathway.needsRequest) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResult(null);
    recommendApi.getRecommendations(recommendationPayload(location.state.profile), { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          resultProfileKey.current = profileSignature(form);
          setResult(data.data);
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(apiError(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [location.state]);

  const submitProfile = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    const payload = recommendationPayload(form);
    try {
      const { data } = await recommendApi.getRecommendations(payload);
      resultProfileKey.current = profileSignature(form);
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
          <QualificationChoices name="qualificationLevel" value={form.qualificationLevel} required disabled={loading}
            onChange={(value) => { setForm({ ...form, qualificationLevel: value, stream: "", interests: "" }); setResult(null); }} />
          <div className="form-two">
            <label className="field-label">Highest school grade completed (optional)<input type="number" min="1" max="13" value={form.highestSchoolGrade} onChange={(event) => { setForm({ ...form, highestSchoolGrade: event.target.value }); setResult(null); }} /></label>
            <label className="field-label">Age (optional)<input type="number" min="10" max="100" value={form.age} onChange={(event) => { setForm({ ...form, age: event.target.value }); setResult(null); }} /></label>
          </div>
          <label className="field-label">Study stream<select value={form.stream} disabled={loading || !form.qualificationLevel} onChange={(event) => { setForm({ ...form, stream: event.target.value, interests: "" }); setResult(null); }}><option value="">Choose a stream</option>{getStudyStreams(form.qualificationLevel, studyStreams).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <ProfileChoices key={form.qualificationLevel + ":" + form.stream} name="interests" label="Interests" disabled={loading || !form.stream} hint={form.stream ? "Suggested for your stream. Tick any that apply, or add your own field." : "Choose your qualification and study stream to see suggested interests."} options={getInterestChoices(form.qualificationLevel, form.stream, studyStreams, interestChoices)} initialValue={form.interests} onChange={(value) => { setForm((current) => ({ ...current, interests: value })); setResult(null); }} />
          <ProfileChoices name="skills" label="Skills" options={skillChoices} initialValue={form.skills} onChange={(value) => setForm((current) => ({ ...current, skills: value }))} />
          <ProfileChoices name="careerGoal" label="Career goals" options={goalChoices} initialValue={form.careerGoal} onChange={(value) => setForm((current) => ({ ...current, careerGoal: value }))} />
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
            <label className="field-label">District<select value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}><option value="">Any district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
          </div>
          <div className="form-two">
            <label className="field-label">Maximum total budget (LKR)
              <input type="number" min="0" step="1" value={form.maxBudget} placeholder="Any budget"
                onChange={(event) => setForm({ ...form, maxBudget: event.target.value })} />
            </label>
            <label className="field-label">Maximum duration (months)
              <input type="number" min="1" max="120" step="1" value={form.maxDurationMonths} placeholder="Any duration"
                onChange={(event) => setForm({ ...form, maxDurationMonths: event.target.value })} />
            </label>
          </div>
          {error && <p className="notice notice-error">{error}</p>}
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? "Finding options..." : "Build my pathway"}
            <ArrowRight size={17} />
          </button>
        </form>
        <section className={`result-panel${!loading && !result ? " result-panel--preview" : ""}`} aria-label="Your pathway guidance" aria-live="polite" aria-busy={loading}>
          {loading ? <div className="result-empty" role="status"><Sparkles size={24} /><h2>Building your pathway...</h2><p>Finding courses that match your profile and study preferences.</p></div> : result ? (
            <>
              <p className="eyebrow">YOUR PATHWAY</p>
              <h2>A direction to explore</h2>
              <div className="field-tags">
                {result.careerFields?.map((field) => (
                  <span key={field}>{field}</span>
                ))}
              </div>
              {result.pathwaySummary && <details className="pathway-guidance"><summary>Read your pathway guidance</summary><p className="pathway-summary">{result.pathwaySummary}</p></details>}
            </>
          ) : (
            <PathwayPreview form={form} />
          )}
        </section>
      </div>
      {(loading || result) && <section className="pathway-courses" ref={resultsPanel} tabIndex={-1} aria-label="Recommended course list" aria-live="polite" aria-busy={loading}>
        <div className="section-heading">
          <div><p className="eyebrow">EXPLORE YOUR OPTIONS</p><h2>Courses in your selected fields</h2></div>
          <Link className="text-link" to="/courses">View all courses <ArrowRight size={16} /></Link>
        </div>
        {loading ? <p className="notice" role="status">Finding courses for your pathway...</p> : <>
          <p className="detail-muted">Scores measure profile alignment, not admission eligibility or career success. Unverified entry requirements must be confirmed with the provider.</p>
          {result.courseMatchType === "catalogue" && <p className="detail-muted">These courses fit your selected fields and education route, but may have additional entry conditions or differ from your study preferences. Review each course?s conditions before choosing.</p>}
          {result.recommendedCourses?.length ? <div className="course-grid">{result.recommendedCourses.map((course) => <article key={course.id} className="recommendation-course">
              <CourseCard course={course} />
              {course.matchScore != null && <div className="recommendation-evidence">
                <strong>Profile match: {course.matchScore}/100</strong>
                <p>{course.eligibilityStatus === "MEETS_LISTED_REQUIREMENT" ? "Meets the listed qualification requirement; confirm admission with the provider." : course.eligibilityStatus === "OPEN_ENTRY" ? "The provider lists open entry; confirm any additional requirements before applying." : course.eligibilityStatus === "CONDITIONAL_MATCH" ? "Your education fits the entry route. Confirm the additional provider conditions before applying." : course.eligibilityStatus === "BRIDGING_REQUIRED" ? "Ask the provider about a bridging pathway." : "Entry requirements need provider verification."}</p>
                {!!course.matchReasons?.length && <ul aria-label="Why this course">{course.matchReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
                {!!course.matchWarnings?.length && <ul className="recommendation-warnings" aria-label="Preferences to review">{course.matchWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
                {course.eligibility && <p><strong>Listed entry requirements:</strong> {course.eligibility}</p>}
              </div>}
            </article>)}</div>
            : <p className="notice">{result.emptyMessage || "No courses with confirmed compatible entry requirements were found in your selected fields."}</p>}
        </>}
      </section>}
      {result && !loading && <section className="pathway-courses" aria-label="Eligible courses in other fields">
        <div className="section-heading"><div><p className="eyebrow">OTHER FIELDS</p><h2>Other courses for your qualifications</h2></div></div>
        <p className="detail-muted">These options are outside your selected fields. Their entry routes fit your education; review any additional conditions, fees and study preferences.</p>
        {result.alternativeCourses?.length ? <div className="course-grid">{result.alternativeCourses.map(course => <article key={course.id} className="recommendation-course">
          <CourseCard course={course} />
          <div className="recommendation-evidence">
            <strong>{course.eligibilityStatus === "CONDITIONAL_MATCH" ? "Education fits ? additional conditions to confirm" : "Listed qualification requirement matches"}</strong>
            <p><strong>Entry requirements:</strong> {course.eligibility}</p>
            {!!course.matchWarnings?.length && <ul aria-label="Alternative course conditions">{course.matchWarnings.map(warning => <li key={warning}>{warning}</li>)}</ul>}
          </div>
        </article>)}</div> : <p className="notice">No other courses with a compatible entry route are available now. Courses with unknown or higher entry requirements are excluded.</p>}
      </section>}
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await dispatch(login(form)).unwrap();
      const destination = location.state?.from;
      navigate(destination ? {
        pathname: destination.pathname,
        search: destination.search,
        hash: destination.hash,
      } : "/", { replace: true, state: destination?.state });
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
          <div className="password-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
            <button
              className="password-visibility-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {error && <p className="notice notice-error">{error}</p>}
        <button className="button-primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight size={17} />
        </button>
      </form>
      <p className="auth-switch">
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p className="auth-switch">
        New to CareerPath? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your account email to receive a password reset link.">
      {sent ? (
        <div className="notice notice-success" role="status">
          Check your inbox and spam folder for a reset link. The link expires in 30 minutes.
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label className="field-label">
            Email
            <input type="email" autoComplete="email" required value={email}
              onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <button className="button-primary" disabled={loading}>
            {loading ? "Sending link..." : "Send reset link"}<ArrowRight size={17} />
          </button>
        </form>
      )}
      {sent && <p className="auth-switch"><button className="text-link" type="button" onClick={() => setSent(false)}>Try another email</button></p>}
      <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
    </AuthLayout>
  );
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (loading || !token) return;
    setError("");
    if (!password.trim() || password !== confirmation) {
      setError(!password.trim() ? "Enter a password with 8 to 50 characters." : "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setPassword("");
      setConfirmation("");
      setComplete(true);
      // Remove the consumed reset token from browser history.
      window.history.replaceState(window.history.state, "", window.location.pathname);
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={complete ? "Password updated" : "Choose a new password"}
      subtitle={complete ? "Your new password is ready. Sign in to continue." : "Use 8 to 50 characters for your new password."}>
      {complete ? (
        <p className="notice notice-success" role="status">Your password has been reset successfully.</p>
      ) : !token ? (
        <p className="notice notice-error" role="alert">This reset link is missing its token. Request a new link below.</p>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label className="field-label">
            New password
            <div className="password-input-wrap">
              <input type={showPassword ? "text" : "password"} required minLength={8} maxLength={50}
                autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="password-visibility-toggle" type="button"
                aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label className="field-label">
            Confirm new password
            <input type={showPassword ? "text" : "password"} required minLength={8} maxLength={50}
              autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </label>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <button className="button-primary" disabled={loading}>
            {loading ? "Updating password..." : "Reset password"}<ArrowRight size={17} />
          </button>
        </form>
      )}
      {!complete && <p className="auth-switch"><Link to="/forgot-password">Request a new reset link</Link></p>}
      <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
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
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="password-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength="8"
              maxLength="50"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
            <button
              className="password-visibility-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <AdminDesk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/courses"
              element={
                <ProtectedRoute
                  roles={["ROLE_PROVIDER", "ROLE_UNIVERSITY", "ROLE_ADMIN"]}
                >
                  <ProviderCourseSubmission />
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={
              <div className="page-container content-section empty-state">
                <ShieldAlert size={36} aria-hidden="true" />
                <h1>Access denied</h1>
                <p>Your account does not have permission to view this page.</p>
                <Link className="text-link" to="/">Back to home</Link>
              </div>
            } />
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
