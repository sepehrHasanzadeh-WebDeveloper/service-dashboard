"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "dark" | "light";
const THEME_STORAGE_KEY = "dashboard-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: Theme = savedTheme === "light" ? "light" : "dark";

    applyTheme(nextTheme);

    const frameId = window.requestAnimationFrame(() => setTheme(nextTheme));

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  return (
    <button className={styles.button} type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "فعال کردن تم روشن" : "فعال کردن تم تاریک"} title={theme === "dark" ? "تم روشن" : "تم تاریک"}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
