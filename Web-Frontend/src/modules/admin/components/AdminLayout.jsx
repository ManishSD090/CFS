import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { X, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(
    () => setSidebarOpen((prev) => !prev),
    []
  );

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && closeSidebar();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeSidebar]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) closeSidebar();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [closeSidebar]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header>
          <MobileMenuButton onClick={toggleSidebar} />
        </Header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 text-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function MobileSidebar({ open, onClose }) {
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-black/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-30 w-56 flex flex-col bg-white shadow-xl
        transform transition-transform duration-200 ease-in-out lg:hidden
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>

        <Sidebar />
      </aside>
    </>
  );
}

function MobileMenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden mr-3 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
    >
      <Menu size={18} />
    </button>
  );
}