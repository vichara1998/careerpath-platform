export const formatCurrency = (amount, currency = "LKR") => {
  if (!amount) return "Free";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export const getRoleBadge = (role) => {
  const map = {
    ROLE_ADMIN: { label: "Admin", cls: "badge-red" },
    ROLE_PROVIDER: { label: "Provider", cls: "badge-purple" },
    ROLE_UNIVERSITY: { label: "University", cls: "badge-blue" },
    ROLE_STUDENT: { label: "Student", cls: "badge-green" },
  };
  return map[role] || { label: role, cls: "badge-gray" };
};

export const getCourseTypeBadge = (type) => {
  const map = {
    DEGREE: { label: "Degree", cls: "badge-blue" },
    DIPLOMA: { label: "Diploma", cls: "badge-purple" },
    NVQ: { label: "NVQ", cls: "badge-amber" },
    CERTIFICATE: { label: "Certificate", cls: "badge-green" },
    ONLINE_CERTIFICATION: { label: "Online Cert", cls: "badge-teal" },
    VOCATIONAL: { label: "Vocational", cls: "badge-orange" },
    SHORT_COURSE: { label: "Short Course", cls: "badge-gray" },
    POSTGRADUATE: { label: "Postgraduate", cls: "badge-red" },
  };
  return map[type] || { label: type, cls: "badge-gray" };
};

export const getStatusBadge = (status) => {
  const map = {
    PENDING: { label: "Pending", cls: "badge-amber" },
    UNDER_REVIEW: { label: "Under Review", cls: "badge-blue" },
    ACCEPTED: { label: "Accepted", cls: "badge-green" },
    REJECTED: { label: "Rejected", cls: "badge-red" },
    WITHDRAWN: { label: "Withdrawn", cls: "badge-gray" },
  };
  return map[status] || { label: status, cls: "badge-gray" };
};

export const getModeBadge = (mode) => {
  const map = {
    PHYSICAL: { label: "Physical", cls: "badge-blue" },
    ONLINE: { label: "Online", cls: "badge-green" },
    HYBRID: { label: "Hybrid", cls: "badge-amber" },
  };
  return map[mode] || { label: mode, cls: "badge-gray" };
};

export const truncate = (str, len = 100) =>
  str && str.length > len ? str.slice(0, len) + "..." : str;

export const isAdmin = (role) => role === "ROLE_ADMIN";
export const isProvider = (role) =>
  ["ROLE_PROVIDER", "ROLE_UNIVERSITY", "ROLE_ADMIN"].includes(role);
export const isStudent = (role) => role === "ROLE_STUDENT";
