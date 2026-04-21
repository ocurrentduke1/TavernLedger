"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardHeader({ title, subtitle }: {
  title: string;
  subtitle?: string;
}) {
  const [email, setEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  return (
    <header className="px-12 py-6 border-b border-gold/10 bg-canvas/60 flex items-center justify-between">
      {/* Título de la página */}
      <div>
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-1">
          {subtitle ?? "TavernLedger"}
        </p>
        <h1 className="font-cinzel-dec text-[1.4rem] text-prose leading-[1.2]">
          {title}
        </h1>
      </div>

      {/* Centro: Toggle de Tema */}
      <ThemeToggle />

      {/* Derecha: Usuario */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-cinzel text-[0.65rem] tracking-[0.1em] uppercase text-prose-muted">
            Aventurero
          </p>
          <p className="text-[0.85rem] italic text-prose-soft">
            {email}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface border border-gold-dim flex items-center justify-center font-cinzel-dec text-base text-gold flex-shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}