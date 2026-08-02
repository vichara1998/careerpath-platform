import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">CareerPath <span className="text-brand-light">SL</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Empowering Sri Lankan students and professionals to discover the right educational pathway — regardless of exam results.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-brand flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Courses', '/courses'], ['Universities', '/universities'], ['Career Guide', '/recommendation'], ['About Us', '/about']].map(([label, to]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Career Paths</h4>
            <ul className="space-y-2.5 text-sm">
              {['Software Engineering', 'Data Science', 'Business', 'Medicine', 'Engineering', 'Arts & Design', 'Cybersecurity', 'AI / ML'].map(p => (
                <li key={p}><Link to={`/courses?careerField=${encodeURIComponent(p)}`} className="hover:text-white transition-colors">{p}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5"><MapPin className="w-4 h-4 shrink-0 mt-0.5 text-brand-light" /><span>No. 12, Galle Road, Colombo 03, Sri Lanka</span></li>
              <li className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-brand-light" /><a href="tel:+94112345678" className="hover:text-white">+94 11 234 5678</a></li>
              <li className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-brand-light" /><a href="mailto:info@careerpathsl.lk" className="hover:text-white">info@careerpathsl.lk</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CareerPath Sri Lanka. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}