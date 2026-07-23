import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "neobrutal-ui-theme";
const LEGACY_STORAGE_KEY = "vitepress-theme-appearance";

function getTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored =
    window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("neobrutal-ui:theme", { detail: theme }));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  const useDarkTheme = theme === "light";

  return (
    <button
      className="icon-button"
      type="button"
      aria-label={useDarkTheme ? "Use dark theme" : "Use light theme"}
      title={useDarkTheme ? "Dark theme" : "Light theme"}
      onClick={toggleTheme}
    >
      {useDarkTheme ? (
        <Moon aria-hidden="true" size={18} strokeWidth={2.3} />
      ) : (
        <Sun aria-hidden="true" size={18} strokeWidth={2.3} />
      )}
    </button>
  );
}
