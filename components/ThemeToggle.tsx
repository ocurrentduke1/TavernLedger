"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-8 h-8 flex items-center justify-center text-gold hover:text-gold-subtle transition-colors duration-300"
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Luz del día" : "Noche de taberna"}
    >
      {isDark ? (
        /* Sol — cambiar a tema claro */
        <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <line x1="12" y1="2"   x2="12" y2="5"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="19"  x2="12" y2="22"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="2"  y1="12"  x2="5"  y2="12"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="19" y1="12"  x2="22" y2="12"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="4.93" y1="4.93"  x2="6.64" y2="6.64"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="17.36" y1="17.36" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="4.93" y1="19.07" x2="6.64" y2="17.36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="17.36" y1="6.64" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        /* Antorcha — cambiar a tema oscuro */
        <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C10.5 4.5 8.5 6.5 9.2 9.5C9.7 11.8 12 13 12 13C12 13 14.3 11.8 14.8 9.5C15.5 6.5 13.5 4.5 12 2Z"
            fill="currentColor"
          />
          <path
            d="M12 6.5C11 8.5 10.5 9.5 11 11C11.4 12 12 12.8 12 12.8C12 12.8 12.6 12 13 11C13.5 9.5 13 8.5 12 6.5Z"
            fill="currentColor"
            opacity="0.35"
          />
          <rect x="10.5" y="13" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.65" />
          <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
