import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { adminApi } from "../../api/adminApi.js";
import { courseApi } from "../../api/courseApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import CourseEditModal from "../courses/CourseEditModal.jsx";
import { districts } from "../profile/ProfileChoices.jsx";
import "./AdminDesk.css";

const types = ["DEGREE", "DIPLOMA", "NVQ", "CERTIFICATE", "ONLINE_CERTIFICATION", "VOCATIONAL", "SHORT_COURSE", "POSTGRADUATE"];
const statusOf = (course) => course.rejected ? "rejected" : course.approved ? "published" : "pending";
const errorMessage = (error) => error.response?.data?.message || "Could not complete this request. Please try again.";
const formatLabel = (value = "") => value.replaceAll("_", " ").toLowerCase();
const fee = (value) => value == null ? "Not listed" : `LKR ${Number(value).toLocaleString("en-LK")}`;

function ConfirmDialog({ action, onClose, onConfirm, busy, error }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.querySelector("button")?.focus();
    return () => previous?.focus();
  }, []);
  return <div className="dialog-backdrop" onMouseDown={() => !busy && onClose()}>
    <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="management-confirm-title" ref={dialog}
      onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) onClose();
        if (event.key === "Tab") {
          const buttons = dialog.current.querySelectorAll("button:not(:disabled)");
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <p className="eyebrow">CONFIRM ACTION</p>
      <h2 id="management-confirm-title">{action.title}</h2>
      <p>{action.message}</p>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <div className="confirm-actions">
        <button className="button-outline" disabled={busy} onClick={onClose}>Cancel</button>
        <button className="danger-button" disabled={busy} onClick={onConfirm}>{busy ? "Working..." : action.label}</button>
      </div>
    </section>
  </div>;
}

export default function AdminDesk() {
  const { user } = useAuth();
  const [tab, setTab] = useState("courses");
  const [draft, setDraft] = useState("");
  const [filters, setFilters] = useState({ keyword: "", status: "all", type: "", district: "" });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [courses, setCourses] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => current.keyword === draft.trim() ? current : { ...current, keyword: draft.trim() });
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const params = { ...filters, page, size };
    if (!params.type) delete params.type;
    if (!params.district) delete params.district;
    adminApi.getAllCourses(params).then(({ data }) => {
      if (!active) return;
      const result = data.data;
      if (page > 0 && page >= result.totalPages) { setPage(Math.max(0, result.totalPages - 1)); return; }
      setCourses(result);
    }).catch((failure) => { if (active) setError(errorMessage(failure)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, page, size, refresh]);

  useEffect(() => {
    let active = true;
    setSummaryError("");
    adminApi.getCourseSummary().then(({ data }) => { if (active) setSummary(data.data); })
      .catch((failure) => { if (active) setSummaryError(errorMessage(failure)); });
    setUsersLoading(true); setUsersError("");
    adminApi.getUsers().then(({ data }) => { if (active) setUsers(data.data || []); })
      .catch((failure) => { if (active) setUsersError(errorMessage(failure)); })
      .finally(() => { if (active) setUsersLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  const updateFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const reload = () => setRefresh((current) => current + 1);
  const clearFilters = () => { setDraft(""); setFilters({ keyword: "", status: "all", type: "", district: "" }); setPage(0); };
  const saveCourse = async (id, payload) => {
    const { data } = id ? await adminApi.updateCourse(id, payload) : await courseApi.create(payload);
    setNotice(id ? `Updated “${data.data.title}”.` : `Created “${data.data.title}” for review.`);
    reload();
    return data.data;
  };
  const approve = async (course) => {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await adminApi.approveCourse(course.id); setNotice(`Published “${course.title}”.`); reload(); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const ask = (action) => { setActionError(""); setConfirmation(action); };
  const runAction = async () => {
    if (busy) return;
    setBusy(true); setActionError("");
    try { await confirmation.run(); setNotice(confirmation.success); setConfirmation(null); reload(); }
    catch (failure) { setActionError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const matchingUsers = users.filter((item) => `${item.fullName} ${item.email} ${item.role}`.toLowerCase().includes(userSearch.trim().toLowerCase()));
  const userPages = Math.ceil(matchingUsers.length / 10);
  const currentUserPage = Math.min(userPage, Math.max(0, userPages - 1));
  const pendingSearch = draft.trim() !== filters.keyword;

  return <div className="page-container content-section management-desk">
    <header className="management-header">
      <div><p className="eyebrow">ADMIN WORKSPACE</p><h1>Catalogue management</h1><p>Find a course, review submissions, and keep information up to date.</p></div>
      <div className="management-header-actions">
        <button className="button-outline" onClick={reload} disabled={loading || busy} aria-label="Refresh admin data"><RefreshCw size={16} />Refresh</button>
        <button className="button-primary" onClick={() => setEditor({})} disabled={busy}><Plus size={17} />Add course</button>
      </div>
    </header>
    <div className="management-stats" aria-label="Course overview">
      {[["all", "All courses", "total"], ["pending", "Needs review", "pending"], ["published", "Published", "published"], ["rejected", "Rejected", "rejected"]].map(([status, label, key]) =>
        <button key={key} className={`management-stat ${tab === "courses" && filters.status === status ? "is-active" : ""}`}
          onClick={() => { setTab("courses"); updateFilter("status", status); }} aria-pressed={tab === "courses" && filters.status === status}>
          <span>{label}</span><strong>{summaryError ? "—" : summary?.[key] ?? "…"}</strong><span className={`management-stat-dot ${status}`} />
        </button>)}
    </div>
    {summaryError && <p className="notice notice-error" role="alert">Summary unavailable. {summaryError}</p>}
    {notice && <div className="notice notice-success management-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={16} /></button></div>}
    <nav className="management-tabs" aria-label="Management sections">
      <button className={tab === "courses" ? "is-active" : ""} aria-current={tab === "courses" ? "page" : undefined} onClick={() => setTab("courses")}>Courses</button>
      <button className={tab === "users" ? "is-active" : ""} aria-current={tab === "users" ? "page" : undefined} onClick={() => setTab("users")}>Users <span>{usersLoading ? "…" : users.length}</span></button>
    </nav>
    {tab === "courses" ? <section className="management-panel" aria-label="Course catalogue">
      <div className="management-toolbar">
        <label className="management-search"><Search size={17} aria-hidden="true" /><input aria-label="Search course title or university" placeholder="Search course title or university..." value={draft} onChange={(event) => setDraft(event.target.value)} /></label>
        <select aria-label="Filter course status" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="all">All statuses</option><option value="pending">Needs review</option><option value="published">Published</option><option value="rejected">Rejected</option></select>
        <select aria-label="Filter course type" value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}><option value="">All types</option>{types.map((type) => <option key={type} value={type}>{formatLabel(type)}</option>)}</select>
        <select aria-label="Filter course district" value={filters.district} onChange={(event) => updateFilter("district", event.target.value)}><option value="">All districts</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>
        <button className="text-link" onClick={clearFilters}>Clear filters</button>
      </div>
      {error && <div className="notice notice-error" role="alert">{error} <button className="text-link" onClick={reload}>Retry</button></div>}
      <div className="management-table-scroll" aria-busy={loading || pendingSearch}>
        <table className="management-table"><thead><tr><th scope="col">Course / institution</th><th scope="col">Location / mode</th><th scope="col">Total fee</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
          <tbody>{loading || pendingSearch ? <tr><td colSpan={5} className="management-empty" role="status">Loading courses...</td></tr> : error ? <tr><td colSpan={5} className="management-empty">Courses could not be loaded. Retry above.</td></tr> : !courses.content.length ? <tr><td colSpan={5} className="management-empty"><BookOpen size={24} /><strong>No matching courses</strong><span>Try another search or clear your filters.</span><button className="button-outline" onClick={clearFilters}>Clear filters</button></td></tr> : courses.content.map((course) =>
            <tr key={course.id}>
              <td><div className="management-course-cell">{course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" loading="lazy" /> : <span className="management-thumbnail"><BookOpen size={20} /></span>}<div><button className="management-course-title" onClick={() => setEditor(course)}>{course.title}</button><span>{course.universityName}</span><small>#{course.id} · {formatLabel(course.type)}</small></div></div></td>
              <td><span>{course.district || "Not listed"}</span><small>{formatLabel(course.mode)}</small></td>
              <td className="management-fee">{fee(course.totalFee)}</td>
              <td><span className={`management-status ${statusOf(course)}`}>{statusOf(course) === "pending" ? "Needs review" : statusOf(course)}</span></td>
              <td><div className="management-row-actions">
                <button className="management-edit" disabled={busy} onClick={() => setEditor(course)} aria-label={`Edit ${course.title}`}><Pencil size={14} />Edit</button>
                {!course.approved && <button disabled={busy} onClick={() => approve(course)} aria-label={`Publish ${course.title}`} title="Publish course"><Check size={16} /><span className="sr-only">Publish</span></button>}
                {!course.rejected && <button disabled={busy} onClick={() => ask({ title: "Reject this course?", message: `“${course.title}” will be hidden from the public catalogue. You can publish it again later.`, label: "Reject course", success: `Rejected “${course.title}”.`, run: () => adminApi.rejectCourse(course.id) })} aria-label={`Reject ${course.title}`} title="Reject course"><X size={16} /><span className="sr-only">Reject</span></button>}
                <button className="management-delete" disabled={busy} onClick={() => ask({ title: "Delete this course?", message: `“${course.title}” will be permanently removed. This cannot be undone.`, label: "Delete course", success: "Course deleted.", run: () => adminApi.deleteCourse(course.id) })} aria-label={`Delete ${course.title}`} title="Delete course"><Trash2 size={15} /><span className="sr-only">Delete</span></button>
              </div></td>
            </tr>)}
          </tbody></table>
      </div>
      <footer className="management-pagination">
        <span role="status">{loading || pendingSearch ? "Updating results..." : error ? "Results unavailable" : `${courses.totalElements ? page * size + 1 : 0}–${Math.min((page + 1) * size, courses.totalElements)} of ${courses.totalElements} courses`}</span>
        <label>Rows <select aria-label="Courses per page" value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(0); }}>{[10, 25, 50].map((count) => <option key={count}>{count}</option>)}</select></label>
        <div><button aria-label="Previous course page" disabled={loading || pendingSearch || !!error || page === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><span>Page {page + 1} of {Math.max(1, courses.totalPages)}</span><button aria-label="Next course page" disabled={loading || pendingSearch || !!error || page + 1 >= courses.totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div>
      </footer>
    </section> : <section className="management-panel" aria-label="User management">
      <div className="management-toolbar"><label className="management-search"><Search size={17} /><input aria-label="Search users" placeholder="Search name, email or role..." value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setUserPage(0); }} /></label></div>
      {usersError && <p className="notice notice-error" role="alert">{usersError} <button className="text-link" onClick={reload}>Retry</button></p>}
      <div className="management-table-scroll"><table className="management-table"><thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Account</th><th scope="col">Actions</th></tr></thead><tbody>
        {usersLoading ? <tr><td colSpan={4} className="management-empty">Loading users...</td></tr> : usersError ? <tr><td colSpan={4} className="management-empty">Users could not be loaded.</td></tr> : !matchingUsers.length ? <tr><td colSpan={4} className="management-empty">No matching users.</td></tr> : matchingUsers.slice(currentUserPage * 10, currentUserPage * 10 + 10).map((item) => <tr key={item.id}><td><strong>{item.fullName}</strong><small>{item.email}</small></td><td>{formatLabel(item.role?.replace("ROLE_", ""))}</td><td><span>{item.status}</span><small>{item.emailVerified ? "Email verified" : "Email unverified"}</small></td><td><button className="management-delete management-user-delete" disabled={busy || item.id === user?.id || item.email === user?.email} onClick={() => ask({ title: "Delete this user?", message: `“${item.fullName}” and their related data will be permanently removed. This cannot be undone.`, label: "Delete user", success: "User deleted.", run: () => adminApi.deleteUser(item.id) })}><Trash2 size={15} />Delete</button></td></tr>)}
      </tbody></table></div>
      <footer className="management-pagination"><span>{matchingUsers.length} matching users</span><div><button aria-label="Previous user page" disabled={currentUserPage === 0} onClick={() => setUserPage(currentUserPage - 1)}><ChevronLeft size={16} /></button><span>Page {currentUserPage + 1} of {Math.max(1, userPages)}</span><button aria-label="Next user page" disabled={currentUserPage + 1 >= userPages} onClick={() => setUserPage(currentUserPage + 1)}><ChevronRight size={16} /></button></div></footer>
    </section>}
    {editor && <CourseEditModal key={editor.id || "new"} course={editor} onClose={() => setEditor(null)} onSave={saveCourse} />}
    {confirmation && <ConfirmDialog action={confirmation} onClose={() => setConfirmation(null)} onConfirm={runAction} busy={busy} error={actionError} />}
  </div>;
}
