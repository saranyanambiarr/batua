import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

function getInitialDark() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDark(isDark) {
  if (isDark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const isDark = getInitialDark();
    applyDark(isDark);
    return isDark;
  });

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      applyDark(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
