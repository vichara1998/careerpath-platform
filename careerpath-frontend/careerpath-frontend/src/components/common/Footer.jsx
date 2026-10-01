import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container site-footer-main">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <span className="site-footer-mark">
              <GraduationCap size={19} />
            </span>
            <span>
              CareerPath <b>SL</b>
            </span>
          </Link>
          <p>
            Useful education choices, collected in one place for the next
            decision.
          </p>
          <div className="site-footer-place">
            <MapPin size={15} /> Sri Lanka, online
          </div>
        </div>

        <nav className="site-footer-links" aria-label="Footer navigation">
          <p className="site-footer-label">Go somewhere</p>
          <Link to="/courses">Browse courses</Link>
          <Link to="/recommendation">Career guide</Link>
          <Link to="/register">Create an account</Link>
        </nav>

        <div className="site-footer-help">
          <p className="site-footer-label">A better starting point</p>
          <p>
            Compare study mode, location, duration, and fees before you commit.
          </p>
          <a href="mailto:hello@careerpathsl.lk">
            <Mail size={15} /> hello@careerpathsl.lk
          </a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <div className="page-container">
          <span>© {new Date().getFullYear()} CareerPath SL</span>
          <span>Make your next step a considered one.</span>
        </div>
      </div>
    </footer>
  );
}
