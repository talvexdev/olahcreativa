"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/**
 * The source of truth is the `dark` class on <html>, set before paint by the
 * inline script in layout.tsx. React subscribes to it rather than owning it,
 * which is why this uses useSyncExternalStore instead of useState/useEffect.
 */
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keep other tabs in sync when the choice changes.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// During SSR there is no DOM; React re-checks getSnapshot right after hydration.
function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode / blocked storage — the toggle still works for this visit.
    }
    notify();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="shrink-0 rounded-full border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-muted transition-colors hover:border-accent hover:text-fg"
    >
      {theme === "dark" ? "MODO OSCURO" : "MODO CLARO"}
    </button>
  );
}
