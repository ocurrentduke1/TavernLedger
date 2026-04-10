"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Campaign = {
  id: string;
  name: string;
  description: string;
  max_players: number;
  current_players: number;
  invite_code: string;
};

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [tab, setTab] = useState<"explore" | "code">("explore");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchCampaigns();
  }, [search]);

  const fetchCampaigns = async () => {
    setLoading(true);
    let query = supabase
      .from("campaigns")
      .select("*")
      .eq("is_public", true)
      .eq("status", "active");

    if (search.trim()) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data } = await query.limit(20);
    setCampaigns(data ?? []);
    setLoading(false);
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError("");

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("invite_code", joinCode.toUpperCase())
      .single();

    if (!campaign) {
      setJoinError("Código inválido. Verifica e intenta de nuevo.");
      setJoinLoading(false);
      return;
    }

    router.push(`/dashboard/campaigns/${campaign.id}`);
  };

  const tabStyle = (active: boolean) => ({
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.75rem", letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    padding: "0.7rem 1.5rem",
    background: "transparent", border: "none",
    borderBottom: active ? "2px solid var(--gold)" : "2px solid transparent",
    color: active ? "var(--gold)" : "var(--text-muted)",
    cursor: "pointer", transition: "all 0.2s",
  });

  return (
    <div style={{ padding: "3rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.5rem",
        }}>
          El Tablón de la Taberna
        </p>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          color: "var(--parchment)", lineHeight: 1.2,
        }}>
          Explorar Campañas
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        borderBottom: "1px solid rgba(201,168,76,0.12)",
        marginBottom: "2rem", display: "flex",
      }}>
        <button style={tabStyle(tab === "explore")} onClick={() => setTab("explore")}>
          Campañas Públicas
        </button>
        <button style={tabStyle(tab === "code")} onClick={() => setTab("code")}>
          Unirse con Código
        </button>
      </div>

      {tab === "explore" ? (
        <>
          {/* Buscador */}
          <div style={{ marginBottom: "2rem", position: "relative" }}>
            <svg style={{
              position: "absolute", left: "1rem", top: "50%",
              transform: "translateY(-50%)", opacity: 0.4,
            }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar campaña por nombre..."
              style={{
                width: "100%", padding: "0.9rem 1rem 0.9rem 2.8rem",
                background: "rgba(26,20,16,0.8)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "var(--parchment)",
                fontFamily: "var(--font-crimson), serif",
                fontSize: "1rem", outline: "none",
              }}
            />
          </div>

          {/* Resultados */}
          {loading ? (
            <p style={{
              textAlign: "center", fontStyle: "italic",
              color: "var(--text-muted)", padding: "3rem",
            }}>
              Consultando el tablón...
            </p>
          ) : campaigns.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.2rem",
            }}>
              {campaigns.map((campaign) => (
                <div key={campaign.id} style={{
                  padding: "1.8rem",
                  background: "rgba(58,50,40,0.4)",
                  border: "1px solid rgba(201,168,76,0.12)",
                }}>
                  <h3 style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "1rem", color: "var(--gold-light)",
                    marginBottom: "0.6rem", lineHeight: 1.3,
                  }}>
                    {campaign.name}
                  </h3>
                  {campaign.description && (
                    <p style={{
                      fontSize: "0.88rem", fontStyle: "italic",
                      color: "var(--parchment-deeper)", lineHeight: 1.6,
                      marginBottom: "1.2rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {campaign.description}
                    </p>
                  )}
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(201,168,76,0.08)",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-cinzel), serif",
                      fontSize: "0.7rem", color: "var(--text-muted)",
                    }}>
                      {campaign.current_players}/{campaign.max_players} jugadores
                    </span>
                    <button
                      onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                      style={{
                        fontFamily: "var(--font-cinzel), serif",
                        fontSize: "0.7rem", letterSpacing: "0.1em",
                        textTransform: "uppercase", color: "var(--ink)",
                        background: "var(--gold)", border: "none",
                        padding: "0.5rem 1rem", cursor: "pointer",
                      }}
                    >
                      Ver Campaña
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: "4rem 2rem", textAlign: "center",
              background: "rgba(58,50,40,0.2)",
              border: "1px dashed rgba(201,168,76,0.12)",
            }}>
              <p style={{
                fontStyle: "italic", color: "var(--text-muted)",
                fontSize: "1rem",
              }}>
                No se encontraron campañas públicas.
              </p>
            </div>
          )}
        </>
      ) : (
        /* Join by code */
        <div style={{ maxWidth: 400 }}>
          <p style={{
            fontSize: "1rem", fontStyle: "italic",
            color: "var(--parchment-deeper)", lineHeight: 1.7,
            marginBottom: "2rem",
          }}>
            Ingresa el código de invitación que te compartió tu Dungeon Master.
          </p>
          <form onSubmit={handleJoinByCode}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.7rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--gold)",
                marginBottom: "0.5rem",
              }}>
                Código de Invitación
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                required
                maxLength={8}
                placeholder="Ej: A1B2C3D4"
                style={{
                  width: "100%", padding: "0.8rem 1rem",
                  background: "rgba(26,20,16,0.8)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  color: "var(--gold)",
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "1.3rem", letterSpacing: "0.3em",
                  outline: "none", textAlign: "center",
                }}
              />
            </div>

            {joinError && (
              <p style={{
                fontSize: "0.85rem", color: "var(--blood-light)",
                marginBottom: "1rem", fontStyle: "italic",
              }}>
                {joinError}
              </p>
            )}

            <button
              type="submit"
              disabled={joinLoading}
              style={{
                width: "100%", padding: "1rem",
                background: joinLoading ? "var(--gold-dark)" : "var(--gold)",
                border: "none", color: "var(--ink)",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.85rem", letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: joinLoading ? "not-allowed" : "pointer",
              }}
            >
              {joinLoading ? "Buscando..." : "Unirse a la Campaña"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}