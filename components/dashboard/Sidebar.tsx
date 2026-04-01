"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Mis Personajes",
    href: "/dashboard/characters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    label: "Mis Campañas",
    href: "/dashboard/campaigns",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    label: "Buscar Campañas",
    href: "/dashboard/explore",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    label: "Dados",
    href: "/dashboard/dice",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    label: "Mapas",
    href: "/dashboard/maps",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
  },
  {
    label: "Bestiario",
    href: "/dashboard/bestiary",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 1 0 10 10"/>
        <path d="M12 8v4l3 3"/>
        <path d="M18 2l4 4-4 4"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside style={{
      width: 240, minHeight: "100vh",
      background: "rgba(26,20,16,0.95)",
      borderRight: "1px solid rgba(201,168,76,0.12)",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: "1.8rem 1.5rem",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
      }}>
        <Link href="/" style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1.1rem", color: "var(--gold)",
          textDecoration: "none", display: "block",
        }}>
          Tavern<span style={{ color: "var(--parchment)" }}>Ledger</span>
        </Link>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.6rem", letterSpacing: "0.2em",
          color: "var(--text-muted)", textTransform: "uppercase",
          marginTop: "0.3rem",
        }}>
          Panel del Aventurero
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1.5rem 0", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.8rem",
              padding: "0.75rem 1.5rem",
              color: isActive ? "var(--gold)" : "var(--parchment-deeper)",
              textDecoration: "none",
              background: isActive ? "rgba(201,168,76,0.08)" : "transparent",
              borderLeft: isActive ? "2px solid var(--gold)" : "2px solid transparent",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.75rem", letterSpacing: "0.08em",
              transition: "all 0.2s",
            }}>
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "1.5rem",
        borderTop: "1px solid rgba(201,168,76,0.1)",
      }}>
        <Link href="/dashboard/settings" style={{
          display: "flex", alignItems: "center", gap: "0.8rem",
          padding: "0.75rem",
          color: "var(--parchment-deeper)",
          textDecoration: "none",
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.75rem", letterSpacing: "0.08em",
          marginBottom: "0.5rem",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          Configuración
        </Link>

        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "0.8rem",
          padding: "0.75rem", width: "100%",
          color: "var(--blood-light)",
          background: "transparent", border: "none",
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.75rem", letterSpacing: "0.08em",
          cursor: "pointer", textAlign: "left",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}