import { createContext, useContext, useState, useEffect } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext();

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Initialise from localStorage (persists across refreshes)
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  // Sync the `dark` class on <html> and localStorage whenever the theme changes
  useEffect(() => {
    const isDark = theme === "dark";
    // Toggle class based on strict boolean condition
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Optionally provide a toggle function if needed by toggle buttons
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}