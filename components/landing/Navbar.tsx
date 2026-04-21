"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-[100]",
          "flex items-center justify-between",
          "px-[clamp(1.2rem,5vw,4rem)] py-5",
          "transition-all duration-300",
          scrolled || menuOpen
            ? "bg-canvas/95 backdrop-blur-sm border-b border-gold/10 shadow-sm"
            : "bg-gradient-to-b from-canvas/80 to-transparent backdrop-blur-[2px]",
        ].join(" ")}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-cinzel-dec text-[1.3rem] text-gold tracking-[0.05em] no-underline shrink-0 hover:text-gold-subtle transition-colors duration-300"
        >
          Tavern<span className="text-prose-soft">Ledger</span>
        </Link>

        {/* Links desktop */}
        <ul className="hidden lg:flex gap-[clamp(1rem,2.5vw,2.5rem)] list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-cinzel text-[clamp(0.65rem,1vw,0.8rem)] tracking-[0.12em] text-prose-muted no-underline uppercase whitespace-nowrap hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Acciones desktop */}
        <div className="hidden lg:flex gap-2 items-center shrink-0">
          <ThemeToggle />
          <Link
            href="/register"
            className="font-cinzel text-[clamp(0.65rem,0.9vw,0.75rem)] tracking-[0.1em] uppercase text-gold bg-transparent border border-gold-dim px-[clamp(0.8rem,1.5vw,1.4rem)] py-2 no-underline whitespace-nowrap hover:border-gold transition-colors duration-300"
          >
            Registrarse
          </Link>
          <Link
            href="/login"
            className="font-cinzel text-[clamp(0.65rem,0.9vw,0.75rem)] tracking-[0.1em] uppercase text-canvas bg-gold px-[clamp(0.8rem,1.5vw,1.4rem)] py-2 no-underline whitespace-nowrap hover:bg-gold-subtle transition-colors duration-300"
          >
            Entrar a la Taberna
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-[5px] p-[0.4rem] bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span
            className={`block w-6 h-0.5 bg-gold transition-transform duration-300 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gold transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gold transition-transform duration-300 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="lg:hidden fixed top-[4.5rem] left-0 right-0 z-[99] bg-canvas/97 border-t border-gold/15 flex flex-col shadow-lg">
          <div className="flex flex-col gap-6 px-6 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-cinzel text-[0.85rem] tracking-[0.12em] text-prose-soft no-underline uppercase hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}

            <div className="h-px bg-gradient-to-r from-transparent via-gold-dim to-transparent opacity-60" />

            <div className="flex items-center justify-between">
              <span className="font-cinzel text-[0.65rem] tracking-[0.15em] text-prose-muted uppercase">
                Tema
              </span>
              <ThemeToggle />
            </div>

            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="font-cinzel text-[0.8rem] tracking-[0.12em] uppercase text-gold bg-transparent border border-gold-dim py-3 px-6 no-underline text-center hover:border-gold transition-colors duration-300"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="font-cinzel text-[0.8rem] tracking-[0.12em] uppercase text-canvas bg-gold py-3 px-6 no-underline text-center hover:bg-gold-subtle transition-colors duration-300"
            >
              Entrar a la Taberna
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
