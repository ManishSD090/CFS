import { useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown } from "lucide-react";

// TODO: Replace with auth context / useUser() hook
const MOCK_USER = {
  name: "Robert Allen",
  role: "Admin",
  avatar: null, // set to image URL when available
};

// ─── Route → Page title mapping ────────────────────────────────────────────────
function usePageTitle() {
  const { pathname } = useLocation();
  const segment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  // Capitalize first letter
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Header() {
  const pageTitle = usePageTitle();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        <SearchBar />
        <NotificationBell count={3} />
        <UserMenu user={MOCK_USER} />
      </div>
    </header>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-56">
      <Search size={14} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Search companies, users..."
        className="bg-transparent text-sm text-gray-500 placeholder-gray-400 outline-none w-full"
      />
    </div>
  );
}

function NotificationBell({ count }) {
  return (
    <button className="relative p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
      <Bell size={17} className="text-gray-500" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

function UserMenu({ user }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-7 h-7 rounded-full object-cover"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
      )}
      <div className="text-left hidden sm:block">
        <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
        <p className="text-xs text-gray-400 leading-tight mt-0.5">{user.role}</p>
      </div>
      <ChevronDown size={13} className="text-gray-400" />
    </button>
  );
}