"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.2rem 4rem",
      background: scrolled
        ? "rgba(26,20,16,0.97)"
        : "linear-gradient(to bottom, rgba(26,20,16,0.95), transparent)",
      backdropFilter: "blur(2px)",
      transition: "background 0.3s",
    }}>
      <Link href="/" style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "1.3rem",
        color: "var(--gold)",
        letterSpacing: "0.05em",
        textDecoration: "none",
      }}>
        Tavern<span style={{ color: "var(--parchment)" }}>Ledger</span>
      </Link>

      <ul style={{ display: "flex", gap: "2.5rem", listStyle: "none" }}>
        {[
          { label: "Características", href: "#features" },
          { label: "Cómo funciona", href: "#how" },
          { label: "Aventureros", href: "#testimonials" },
        ].map((link) => (
          <li key={link.href}>
            <a href={link.href} style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              color: "var(--parchment-dark)",
              textDecoration: "none",
              textTransform: "uppercase",
            }}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <Link href="/dashboard" style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.75rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--ink)",
        background: "var(--gold)",
        padding: "0.55rem 1.4rem",
        textDecoration: "none",
        display: "inline-block",
      }}>
        Entrar a la Taberna
      </Link>
    </nav>
  );
}