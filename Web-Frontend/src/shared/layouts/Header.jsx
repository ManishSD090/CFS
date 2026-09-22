import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { clearTokens } from "../../modules/admin/services/authStorage";

export default function Header({ title = 'Dashboard', onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  // Hardcoded for now per "dev tokens" setup
  const user = isSuperAdmin 
    ? { name: "Super Admin User", role: "Super Admin", img: "https://i.pravatar.cc/40?img=12" }
    : { name: "Project Admin", role: "Admin", img: "https://i.pravatar.cc/40?img=5" };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearTokens();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-100 dark:border-slate-700 px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Bell */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <img
              src={user.img}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user.role}</p>
            </div>
            <svg className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Dropdown Modal */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in font-lexend">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 mb-1 lg:hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              
              <Link 
                to={isSuperAdmin ? "/superadmin/profile" : "/admin/profile"}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Profile
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 mt-1 border-t border-slate-100 dark:border-slate-700/50 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

