"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type Campaign = {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  invite_code: string;
  max_players: number;
  current_players: number;
  status: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("dm_id", user.id)
        .order("created_at", { ascending: false });

      setCampaigns(data ?? []);
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  const statusLabel: Record<string, string> = {
    active: "Activa",
    paused: "Pausada",
    finished: "Finalizada",
  };

  const statusColor: Record<string, string> = {
    active: "var(--gold)",
    paused: "var(--text-muted)",
    finished: "var(--blood-light)",
  };

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{
        fontStyle: "italic", color: "var(--text-muted)",
        fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem",
      }}>
        Cargando campañas...
      </p>
    </div>
  );

  return (
    <div style={{ padding: "3rem" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "3rem",
      }}>
        <div>
          <p style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "var(--gold)",
            marginBottom: "0.5rem",
          }}>
            Mis Historias
          </p>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "var(--parchment)", lineHeight: 1.2,
          }}>
            Campañas
          </h1>
        </div>
        <Link href="/dashboard/campaigns/new" style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.78rem", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--ink)",
          background: "var(--gold)", padding: "0.8rem 1.8rem",
          textDecoration: "none", display: "inline-block",
        }}>
          + Nueva Campaña
        </Link>
      </div>

      {/* Lista */}
      {campaigns.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}>
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`} style={{
              display: "block", padding: "2rem",
              background: "rgba(58,50,40,0.4)",
              border: "1px solid rgba(201,168,76,0.12)",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
              position: "relative",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(58,50,40,0.7)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(58,50,40,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.12)";
              }}
            >
              {/* Status badge */}
              <div style={{
                position: "absolute", top: "1.2rem", right: "1.2rem",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.6rem", letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: statusColor[campaign.status] ?? "var(--text-muted)",
              }}>
                ● {statusLabel[campaign.status] ?? campaign.status}
              </div>

              <h3 style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "1.1rem", color: "var(--gold-light)",
                marginBottom: "0.8rem", lineHeight: 1.3,
              }}>
                {campaign.name}
              </h3>

              {campaign.description && (
                <p style={{
                  fontSize: "0.9rem", fontStyle: "italic",
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
                  letterSpacing: "0.05em",
                }}>
                  {campaign.current_players}/{campaign.max_players} jugadores
                </span>
                <span style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.65rem", letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: campaign.is_public ? "var(--gold-dark)" : "var(--text-muted)",
                  background: campaign.is_public ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)",
                  padding: "0.3rem 0.7rem",
                  border: `1px solid ${campaign.is_public ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)"}`,
                }}>
                  {campaign.is_public ? "Pública" : "Privada"}
                </span>
              </div>

              {!campaign.is_public && campaign.invite_code && (
                <div style={{
                  marginTop: "0.8rem",
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.65rem", letterSpacing: "0.2em",
                  color: "var(--text-muted)",
                }}>
                  Código: <span style={{ color: "var(--gold-dark)" }}>{campaign.invite_code}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div style={{
          padding: "5rem 2rem", textAlign: "center",
          background: "rgba(58,50,40,0.2)",
          border: "1px dashed rgba(201,168,76,0.12)",
        }}>
          <p style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "1.2rem", color: "var(--gold-dark)",
            marginBottom: "1rem",
          }}>
            El libro está vacío
          </p>
          <p style={{
            fontSize: "1rem", fontStyle: "italic",
            color: "var(--text-muted)", marginBottom: "2rem",
          }}>
            Aún no has creado ninguna campaña. ¡Empieza tu primera historia!
          </p>
          <Link href="/dashboard/campaigns/new" style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.8rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--ink)",
            background: "var(--gold)", padding: "0.8rem 2rem",
            textDecoration: "none", display: "inline-block",
          }}>
            Crear Primera Campaña
          </Link>
        </div>
      )}
    </div>
  );
}