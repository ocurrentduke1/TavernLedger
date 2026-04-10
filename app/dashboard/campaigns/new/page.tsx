"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("campaigns").insert({
      name,
      description,
      is_public: isPublic,
      max_players: maxPlayers,
      dm_id: user.id,
      status: "active",
    });

    if (error) {
      setError("No se pudo crear la campaña. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/campaigns");
    router.refresh();
  };

  const inputStyle = {
    width: "100%", padding: "0.8rem 1rem",
    background: "rgba(26,20,16,0.8)",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "var(--parchment)",
    fontFamily: "var(--font-crimson), serif",
    fontSize: "1rem", outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.7rem", letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--gold)", marginBottom: "0.5rem",
  };

  return (
    <div style={{ padding: "3rem", maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <Link href="/dashboard/campaigns" style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.1em",
          color: "var(--text-muted)", textDecoration: "none",
          textTransform: "uppercase", display: "inline-block",
          marginBottom: "1.5rem",
        }}>
          ← Volver a Campañas
        </Link>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.5rem",
        }}>
          Nueva Historia
        </p>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          color: "var(--parchment)", lineHeight: 1.2,
        }}>
          Crear Campaña
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: "rgba(58,50,40,0.4)",
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "2.5rem",
      }}>

        {/* Nombre */}
        <div style={{ marginBottom: "1.8rem" }}>
          <label style={labelStyle}>Nombre de la Campaña</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="La Maldición de Strahd..."
            style={inputStyle}
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: "1.8rem" }}>
          <label style={labelStyle}>Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe el mundo, la trama o el tono de tu campaña..."
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />
        </div>

        {/* Max players */}
        <div style={{ marginBottom: "1.8rem" }}>
          <label style={labelStyle}>Máximo de Jugadores — {maxPlayers}</label>
          <input
            type="range"
            min={2} max={8}
            value={maxPlayers}
            onChange={e => setMaxPlayers(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gold)" }}
          />
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.65rem", color: "var(--text-muted)",
            marginTop: "0.3rem",
          }}>
            <span>2</span><span>8</span>
          </div>
        </div>

        {/* Visibilidad */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={labelStyle}>Visibilidad</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            {[
              { value: false, label: "Privada", desc: "Solo con código de invitación" },
              { value: true, label: "Pública", desc: "Aparece en el buscador" },
            ].map((opt) => (
              <div
                key={String(opt.value)}
                onClick={() => setIsPublic(opt.value)}
                style={{
                  flex: 1, padding: "1rem",
                  background: isPublic === opt.value ? "rgba(201,168,76,0.1)" : "rgba(26,20,16,0.5)",
                  border: `1px solid ${isPublic === opt.value ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.12)"}`,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.8rem", color: isPublic === opt.value ? "var(--gold)" : "var(--parchment-deeper)",
                  marginBottom: "0.3rem",
                }}>
                  {opt.label}
                </div>
                <div style={{
                  fontSize: "0.8rem", fontStyle: "italic",
                  color: "var(--text-muted)",
                }}>
                  {opt.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p style={{
            fontSize: "0.85rem", color: "var(--blood-light)",
            marginBottom: "1rem", fontStyle: "italic",
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "1rem",
            background: loading ? "var(--gold-dark)" : "var(--gold)",
            border: "none", color: "var(--ink)",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.85rem", letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Creando campaña..." : "Forjar Campaña"}
        </button>
      </form>
    </div>
  );
}