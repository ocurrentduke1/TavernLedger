"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Campaign = {
  id: string;
  name: string;
  description: string;
  dm_id: string;
  is_public: boolean;
  invite_code: string;
  max_players: number;
  current_players: number;
  status: string;
  created_at: string;
};

type Character = {
  id: string;
  user_id: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  hp_current: number;
  hp_max: number;
};

type CampaignPlayer = {
  user_id: string;
  character_name: string;
  character_class: string | null;
  character_race: string | null;
  character_level: number;
};

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [players, setPlayers] = useState<CampaignPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: campData, error: campError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", id)
          .single();

        if (campError || !campData) {
          router.push("/dashboard/campaigns");
          return;
        }

        setCampaign(campData);
        setDraft(campData);
        setIsOwner(campData.dm_id === user.id);

        // Fetch all characters in campaign
        const { data: charData, error: charError } = await supabase
          .from("characters")
          .select("id, user_id, name, race, class, level, hp_current, hp_max")
          .eq("campaign_id", id)
          .order("name");

        if (charError) {
          console.error("Error fetching characters:", charError);
        }

        // Group by user and build player list
        const playerMap = new Map<string, CampaignPlayer>();
        if (charData) {
          for (const char of charData) {
            playerMap.set(char.user_id, {
              user_id: char.user_id,
              character_name: char.name,
              character_class: char.class,
              character_race: char.race,
              character_level: char.level,
            });
          }
        }

        setPlayers(Array.from(playerMap.values()));
      } catch (err) {
        console.error("Error loading campaign:", err);
        setError("No se pudo cargar la campaña.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, supabase, router]);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("campaigns")
        .update({
          name: draft.name,
          description: draft.description,
          is_public: draft.is_public,
          status: draft.status,
          max_players: draft.max_players,
        })
        .eq("id", id)
        .eq("dm_id", (await supabase.auth.getUser()).data.user?.id);

      if (err) {
        setError("No se pudieron guardar los cambios.");
        console.error("Update error:", err);
        setSaving(false);
        return;
      }

      setCampaign(draft);
      setEditing(false);
      setSaving(false);
    } catch (err) {
      setError("Ocurrió un error al guardar.");
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    if (!confirm(`¿Eliminar la campaña "${campaign.name}" permanentemente?`)) return;

    setDeleting(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error: err } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("dm_id", user.id);

      if (err) {
        setError("No se pudo eliminar la campaña.");
        console.error("Delete error:", err);
        setDeleting(false);
        return;
      }

      router.push("/dashboard/campaigns");
    } catch (err) {
      setError("Ocurrió un error al eliminar.");
      console.error(err);
      setDeleting(false);
    }
  };

  const copyInviteCode = () => {
    if (campaign?.invite_code) {
      navigator.clipboard.writeText(campaign.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const setDraftField = (field: keyof Campaign, value: unknown) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{
        fontStyle: "italic", color: "var(--text-muted)",
        fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem",
      }}>
        Cargando campaña...
      </p>
    </div>
  );

  if (!campaign) return null;

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

  const sectionTitle = {
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.62rem", letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    borderBottom: "1px solid rgba(201,168,76,0.1)",
    paddingBottom: "0.5rem",
    marginBottom: "1.2rem",
    marginTop: "2rem",
  };

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

  return (
    <div style={{ padding: "3rem", maxWidth: 820 }}>

      {/* Back */}
      <Link href="/dashboard/campaigns" style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.7rem", letterSpacing: "0.1em",
        color: "var(--text-muted)", textDecoration: "none",
        textTransform: "uppercase", display: "inline-block",
        marginBottom: "2rem",
      }}>
        ← Volver a Campañas
      </Link>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: "2.5rem",
        gap: "1rem", flexWrap: "wrap",
      }}>
        <div>
          <p style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "var(--gold)",
            marginBottom: "0.4rem",
          }}>
            Campaña de {players.length} jugador{players.length !== 1 ? "es" : ""}
          </p>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "var(--parchment)", lineHeight: 1.2,
            marginBottom: "0.5rem",
          }}>
            {campaign.name}
          </h1>
          <div style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem", color: statusColor[campaign.status],
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            ● {statusLabel[campaign.status]}
          </div>
        </div>

        {isOwner && (
          <div style={{ display: "flex", gap: "0.8rem", flexShrink: 0 }}>
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); setDraft(campaign); setError(""); }} style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.72rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--parchment-deeper)",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.2)",
                  padding: "0.7rem 1.4rem", cursor: "pointer",
                }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.72rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--ink)",
                  background: saving ? "var(--gold-dark)" : "var(--gold)",
                  border: "none", padding: "0.7rem 1.4rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </>
            ) : (
              <>
                <button onClick={handleDelete} disabled={deleting} style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.72rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--blood-light)",
                  background: "transparent",
                  border: "1px solid rgba(180,40,40,0.3)",
                  padding: "0.7rem 1.4rem", cursor: "pointer",
                }}>
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
                <button onClick={() => setEditing(true)} style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.72rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--ink)",
                  background: "var(--gold)", border: "none",
                  padding: "0.7rem 1.4rem", cursor: "pointer",
                }}>
                  Editar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p style={{
          fontSize: "0.85rem", color: "var(--blood-light)",
          marginBottom: "1.5rem", fontStyle: "italic",
        }}>
          {error}
        </p>
      )}

      {/* Campaign sheet */}
      <div style={{
        background: "rgba(58,50,40,0.4)",
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "2.5rem",
      }}>

        {/* Info section */}
        <p style={sectionTitle}>Información de la Campaña</p>

        {editing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input type="text" value={draft?.name} onChange={e => setDraftField("name", e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <select value={draft?.status} onChange={e => setDraftField("status", e.target.value)} style={inputStyle}>
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Descripción</label>
              <textarea
                value={draft?.description ?? ""}
                onChange={e => setDraftField("description", e.target.value || null)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Máximo de Jugadores</label>
              <input type="number" min={2} max={8} value={draft?.max_players} onChange={e => setDraftField("max_players", Math.min(8, Math.max(2, Number(e.target.value))))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Visibilidad</label>
              <select value={draft?.is_public ? "true" : "false"} onChange={e => setDraftField("is_public", e.target.value === "true")} style={inputStyle}>
                <option value="false">Privada</option>
                <option value="true">Pública</option>
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.2rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Nombre", value: campaign.name },
              { label: "Descripción", value: campaign.description || "—" },
              { label: "Estado", value: statusLabel[campaign.status] },
              { label: "Jugadores", value: `${campaign.current_players}/${campaign.max_players}` },
              { label: "Visibilidad", value: campaign.is_public ? "Pública" : "Privada" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ ...labelStyle, marginBottom: "0.3rem" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.95rem", color: "var(--parchment)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Invite code - only if not public */}
        {!campaign.is_public && (
          <div style={{ marginBottom: "2rem", padding: "1rem", background: "rgba(26,20,16,0.5)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <p style={{ ...labelStyle, marginBottom: "0.6rem" }}>Código de Invitación</p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{
                flex: 1, padding: "0.6rem 1rem",
                background: "rgba(26,20,16,0.8)",
                border: "1px solid rgba(201,168,76,0.2)",
                fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem",
                color: "var(--gold)", letterSpacing: "0.15em",
              }}>
                {campaign.invite_code}
              </div>
              <button
                onClick={copyInviteCode}
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.7rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--ink)",
                  background: copied ? "var(--gold)" : "var(--gold-dark)",
                  border: "none", padding: "0.6rem 1.2rem",
                  cursor: "pointer", transition: "background 0.2s",
                }}
              >
                {copied ? "✓" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* Players section */}
        <p style={sectionTitle}>Jugadores y Personajes</p>

        {players.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {players.map((player, idx) => (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1.2rem",
                background: "rgba(26,20,16,0.5)",
                border: "1px solid rgba(201,168,76,0.12)",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "var(--stone)",
                  border: "1px solid var(--gold-dark)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "1.1rem", color: "var(--gold)", flexShrink: 0,
                }}>
                  ⚔
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "1rem", color: "var(--gold-light)",
                    marginBottom: "0.3rem",
                  }}>
                    {player.character_name}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.75rem", color: "var(--parchment-deeper)",
                    letterSpacing: "0.05em",
                  }}>
                    {[player.character_race, player.character_class, `Nv. ${player.character_level}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            fontStyle: "italic", color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}>
            Aún no hay jugadores con personajes en esta campaña.
          </p>
        )}

        {/* Description section if editing */}
        {editing && (
          <div style={{ marginTop: "2rem" }}>
            <p style={sectionTitle}>Descripción Larga</p>
            <textarea
              value={draft?.description ?? ""}
              onChange={e => setDraftField("description", e.target.value || null)}
              rows={6}
              placeholder="Describe los detalles de tu campaña, el mundo, la trama..."
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
