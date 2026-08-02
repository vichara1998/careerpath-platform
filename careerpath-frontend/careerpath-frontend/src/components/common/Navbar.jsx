import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth.js'
import { toggleDarkMode } from '../../store/slices/uiSlice.js'
import { logout } from '../../store/slices/authSlice.js'
import { useSelector } from 'react-redux'
import { Sun, Moon, Bell, Menu, X, GraduationCap, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isProvider } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const darkMode = useSelector(s => s.ui.darkMode)
  const unreadCount = useSelector(s => s.notifications.unreadCount)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const navLinks = [
    { to: '/courses', label: 'Courses' },
    { to: '/universities', label: 'Universities' },
    { to: '/recommendation', label: 'Career Guide' },
    { to: '/about', label: 'About' },
  ]

  const getDashboardPath = () => {
    if (isAdmin) return '/admin'
    if (isProvider) return '/provider'
    return '/dashboard'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg hidden sm:block">
              CareerPath <span className="text-brand">SL</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`nav-link px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith(l.to) ? 'text-brand bg-brand/5' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center text-white text-xs font-bold">
                      {user?.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block max-w-[100px] truncate">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-52 card shadow-xl py-1 animate-slide-up" onMouseLeave={() => setDropdownOpen(false)}>
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <hr className="my-1 border-gray-100 dark:border-gray-800" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}

            <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1 animate-slide-up">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 flex gap-2 px-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 text-center">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}