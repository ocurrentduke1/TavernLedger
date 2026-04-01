"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Características", href: "#features" },
    { label: "Cómo funciona", href: "#how" },
    { label: "Aventureros", href: "#testimonials" },
  ];

  return (
    <>
      <style>{`
        .navbar {
          padding: 1.2rem clamp(1.2rem, 5vw, 4rem);
        }

        /* Desktop completo: todo visible */
        .nav-links { display: flex; }
        .nav-buttons { display: flex; }
        .hamburger { display: none; }
        .mobile-menu { display: none; }

        /* Tablet (≤1024px): ocultar links de nav, mostrar hamburger */
        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .nav-buttons { display: none; }
          .hamburger { display: flex; }
          .mobile-menu { display: flex; }
        }

        /* Móvil pequeño (≤480px) */
        @media (max-width: 480px) {
          .navbar {
            padding: 1rem 1.2rem;
          }
          .nav-logo {
            font-size: 1.1rem !important;
          }
          .mobile-menu-panel {
            padding: 1.2rem 1.2rem 1.8rem !important;
          }
        }
      `}</style>

      <nav className="navbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled || menuOpen
          ? "rgba(26,20,16,0.97)"
          : "linear-gradient(to bottom, rgba(26,20,16,0.95), transparent)",
        backdropFilter: "blur(2px)",
        transition: "background 0.3s",
      }}>
        <Link href="/" className="nav-logo" style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1.3rem",
          color: "var(--gold)",
          letterSpacing: "0.05em",
          textDecoration: "none",
          flexShrink: 0,
        }}>
          Tavern<span style={{ color: "var(--parchment)" }}>Ledger</span>
        </Link>

        {/* Links desktop */}
        <ul className="nav-links" style={{
          gap: "clamp(1rem, 2.5vw, 2.5rem)",
          listStyle: "none", margin: 0, padding: 0,
        }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "clamp(0.65rem, 1vw, 0.8rem)",
                letterSpacing: "0.12em",
                color: "var(--parchment-dark)",
                textDecoration: "none",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Botones desktop */}
        <div className="nav-buttons" style={{ gap: "0.6rem", alignItems: "center", flexShrink: 0 }}>
          <Link href="/register" style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(0.65rem, 0.9vw, 0.75rem)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--gold)",
            background: "transparent",
            border: "1px solid var(--gold-dark)",
            padding: "0.5rem clamp(0.8rem, 1.5vw, 1.4rem)",
            textDecoration: "none",
            display: "inline-block",
            whiteSpace: "nowrap",
          }}>
            Registrarse
          </Link>
          <Link href="/login" style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(0.65rem, 0.9vw, 0.75rem)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink)",
            background: "var(--gold)",
            padding: "0.5rem clamp(0.8rem, 1.5vw, 1.4rem)",
            textDecoration: "none",
            display: "inline-block",
            whiteSpace: "nowrap",
          }}>
            Entrar a la Taberna
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none", border: "none",
            cursor: "pointer", padding: "0.4rem",
            flexDirection: "column", gap: "5px",
          }}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span style={{
            display: "block", width: 24, height: 2,
            background: "var(--gold)",
            transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            transition: "transform 0.25s",
          }} />
          <span style={{
            display: "block", width: 24, height: 2,
            background: "var(--gold)",
            opacity: menuOpen ? 0 : 1,
            transition: "opacity 0.25s",
          }} />
          <span style={{
            display: "block", width: 24, height: 2,
            background: "var(--gold)",
            transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            transition: "transform 0.25s",
          }} />
        </button>
      </nav>

      {/* Menú móvil / tablet */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          position: "fixed", top: "4rem", left: 0, right: 0, zIndex: 99,
          background: "rgba(26,20,16,0.97)",
          borderTop: "1px solid rgba(201,168,76,0.15)",
          flexDirection: "column",
        }}>
          <div className="mobile-menu-panel" style={{
            padding: "1.5rem 2rem 2rem",
            display: "flex", flexDirection: "column", gap: "1.5rem",
          }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.85rem", letterSpacing: "0.12em",
                  color: "var(--parchment-dark)",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                {link.label}
              </a>
            ))}

            <div style={{
              height: 1,
              background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)",
            }} />

            <Link href="/register" onClick={() => setMenuOpen(false)} style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.8rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--gold)",
              background: "transparent",
              border: "1px solid var(--gold-dark)",
              padding: "0.8rem 1.4rem",
              textDecoration: "none", textAlign: "center",
            }}>
              Registrarse
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.8rem", letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--ink)",
              background: "var(--gold)",
              padding: "0.8rem 1.4rem",
              textDecoration: "none", textAlign: "center",
            }}>
              Entrar a la Taberna
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
