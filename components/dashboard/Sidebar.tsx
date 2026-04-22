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
        <path d="M12 3a7 7 0 0 0-7 7c0 2.8 1.6 5.2 4 6.5V19h6v-2.5c2.4-1.3 4-3.7 4-6.5a7 7 0 0 0-7-7z"/>
        <line x1="9" y1="19" x2="15" y2="19"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
        <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none"/>
        <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "Grimorio",
    href: "/dashboard/spellbook",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="10" y1="8" x2="16" y2="8"/>
        <line x1="10" y1="12" x2="16" y2="12"/>
        <line x1="10" y1="16" x2="14" y2="16"/>
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
    <aside className="w-60 min-h-screen bg-canvas/95 border-r border-gold/10 flex flex-col fixed top-0 left-0 bottom-0 z-50">
      {/* Logo */}
      <div className="px-6 py-[1.8rem] border-b border-gold/10">
        <Link href="/" className="font-cinzel-dec text-[1.1rem] text-gold no-underline block">
          Tavern<span className="text-prose">Ledger</span>
        </Link>
        <p className="font-cinzel text-[0.6rem] tracking-[0.2em] text-prose-muted uppercase mt-1">
          Panel del Aventurero
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 no-underline border-l-2 transition-all duration-200 font-cinzel text-[0.75rem] tracking-[0.08em] ${
                isActive
                  ? "text-gold bg-gold/8 border-gold"
                  : "text-prose-soft border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-gold/10">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-3 text-prose-soft no-underline font-cinzel text-[0.75rem] tracking-[0.08em] mb-2 hover:text-gold transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          Configuración
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 w-full text-blood-ui bg-transparent border-none font-cinzel text-[0.75rem] tracking-[0.08em] cursor-pointer text-left hover:text-blood-ui/80 transition-colors"
        >
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