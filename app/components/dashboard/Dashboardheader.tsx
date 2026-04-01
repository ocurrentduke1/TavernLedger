"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

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
    <header style={{
      padding: "1.5rem 3rem",
      borderBottom: "1px solid rgba(201,168,76,0.1)",
      background: "rgba(26,20,16,0.6)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* Título de la página */}
      <div>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.65rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.3rem",
        }}>
          {subtitle ?? "TavernLedger"}
        </p>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1.4rem", color: "var(--parchment)",
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
      </div>

      {/* Usuario */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.8rem",
      }}>
        <div style={{ textAlign: "right" }}>
          <p style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.65rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--text-muted)",
          }}>
            Aventurero
          </p>
          <p style={{
            fontSize: "0.85rem", fontStyle: "italic",
            color: "var(--parchment-deeper)",
          }}>
            {email}
          </p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--stone)",
          border: "1px solid var(--gold-dark)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1rem", color: "var(--gold)",
          flexShrink: 0,
        }}>
          {email.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}