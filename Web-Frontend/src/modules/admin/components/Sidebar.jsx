import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  User,
  BarChart2,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Profile", path: "/admin/profile", icon: User },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col py-5 px-3 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
          <BarChart2 size={15} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 text-base tracking-tight">
          SampleWeb
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Light Mode Label */}
      <div className="mt-auto px-2 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-400 px-2">Light mode</div>
      </div>
    </aside>
  );
}