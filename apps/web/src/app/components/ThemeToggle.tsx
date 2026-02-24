"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fitness-life-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored || "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const handleToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <button className="theme-toggle" onClick={handleToggle} aria-label="Alternar tema">
      <span className="theme-toggle__label">{theme === "dark" ? "Claro" : "Escuro"}</span>
    </button>
  );
}
