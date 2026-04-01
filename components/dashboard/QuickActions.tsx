"use client";

import Link from "next/link";

const actions = [
  { label: "Nuevo Personaje", href: "/dashboard/characters/new", icon: "⚔" },
  { label: "Nueva Campaña", href: "/dashboard/campaigns/new", icon: "📜" },
  { label: "Unirse con Código", href: "/dashboard/explore?join=true", icon: "🔑" },
  { label: "Explorar Campañas", href: "/dashboard/explore", icon: "🗺" },
];

export default function QuickActions() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1rem",
    }}>
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          style={{
            display: "flex", alignItems: "center", gap: "0.8rem",
            padding: "1.2rem 1.5rem",
            background: "rgba(58,50,40,0.4)",
            border: "1px solid rgba(201,168,76,0.12)",
            textDecoration: "none",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(58,50,40,0.8)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.3)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(58,50,40,0.4)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.12)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
          <span style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.78rem", letterSpacing: "0.05em",
            color: "var(--gold-light)",
          }}>
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
