import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function getInitialDarkMode() {
  const savedTheme = localStorage.getItem("jobtracker_theme");
  return savedTheme ? savedTheme === "dark" : typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function AuthThemeToggle() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("jobtracker_theme", darkMode ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("jobtracker-theme-change", { detail: { darkMode } }));
  }, [darkMode]);
  return <button type="button" aria-label={darkMode ? "Use light mode" : "Use dark mode"} onClick={() => setDarkMode((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40">{darkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}</button>;
}
