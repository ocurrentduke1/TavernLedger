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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex items-center gap-3 px-6 py-5 bg-surface/50 border border-gold/10 no-underline hover:bg-surface hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="text-[1.2rem]">{action.icon}</span>
          <span className="font-cinzel text-[0.78rem] tracking-[0.05em] text-gold-subtle">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
