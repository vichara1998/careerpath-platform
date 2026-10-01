import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth.js";
import { logout } from "../../store/slices/authSlice.js";
import { toggleDarkMode } from "../../store/slices/uiSlice.js";
import {
  ArrowRight,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.ui.darkMode);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setLogoutOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/courses", label: "Courses" },
    { to: "/recommendation", label: "Career guide" },
    ...(isAuthenticated && user?.role === "ROLE_ADMIN"
      ? [{ to: "/admin", label: "Admin desk", icon: ShieldCheck }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-md brand-symbol flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg hidden sm:block">
              CareerPath <span className="text-brand">SL</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith(l.to) ? "text-brand bg-brand/5" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              className="theme-toggle"
              onClick={() => dispatch(toggleDarkMode())}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gray-700">
                  {user?.fullName?.split(" ")[0]}
                </span>
                <button
                  onClick={() => setLogoutOpen(true)}
                  className="nav-signout"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="nav-join">
                  Join <ArrowRight size={15} />
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1 animate-slide-up">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {l.icon && <l.icon size={15} />}
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 flex gap-2 px-4">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary text-sm flex-1 text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-sm flex-1 text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      {logoutOpen && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={() => setLogoutOpen(false)}
        >
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="confirm-icon">
              <LogOut size={19} />
            </div>
            <h2 id="logout-title">Sign out of CareerPath?</h2>
            <p>Your saved session will be cleared from this browser.</p>
            <div className="confirm-actions">
              <button
                className="button-outline"
                onClick={() => setLogoutOpen(false)}
              >
                Stay signed in
              </button>
              <button className="button-primary" onClick={handleLogout}>
                Yes, sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </nav>
  );
}
