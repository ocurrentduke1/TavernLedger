"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RACES = [
  "Humano", "Elfo", "Semielfo", "Enano", "Mediano", "Gnomo",
  "Semiorco", "Tiefling", "Dracónido", "Aasimar", "Tabaxi",
  "Goliath", "Kenku", "Otro",
];

const CLASSES = [
  "Bárbaro", "Bardo", "Clérigo", "Druida", "Guerrero",
  "Monje", "Paladín", "Explorador", "Pícaro", "Hechicero",
  "Brujo", "Mago", "Otro",
];

type Campaign = { id: string; name: string };

type AbilityKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

const ABILITIES: { key: AbilityKey; label: string; abbr: string }[] = [
  { key: "strength",     label: "Fuerza",        abbr: "FUE" },
  { key: "dexterity",    label: "Destreza",       abbr: "DES" },
  { key: "constitution", label: "Constitución",   abbr: "CON" },
  { key: "intelligence", label: "Inteligencia",   abbr: "INT" },
  { key: "wisdom",       label: "Sabiduría",      abbr: "SAB" },
  { key: "charisma",     label: "Carisma",        abbr: "CAR" },
];

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export default function NewCharacterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Basic info
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [charClass, setCharClass] = useState("");
  const [level, setLevel] = useState(1);
  const [campaignId, setCampaignId] = useState("");

  // HP & spell slots
  const [hpMax, setHpMax] = useState(10);
  const [spellSlotsMax, setSpellSlotsMax] = useState(0);

  // Ability scores
  const [abilities, setAbilities] = useState<Record<AbilityKey, number>>({
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10,
  });

  // Story
  const [background, setBackground] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("dm_id", user.id)
        .eq("status", "active")
        .order("name");
      setCampaigns(data ?? []);
    };
    fetchCampaigns();
  }, []);

  const handleAbility = (key: AbilityKey, val: string) => {
    const n = Math.min(20, Math.max(1, Number(val) || 10));
    setAbilities(prev => ({ ...prev, [key]: n }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: err } = await supabase.from("characters").insert({
      user_id: user.id,
      campaign_id: campaignId || null,
      name,
      race: race || null,
      class: charClass || null,
      level,
      hp_current: hpMax,
      hp_max: hpMax,
      spell_slots_current: spellSlotsMax,
      spell_slots_max: spellSlotsMax,
      ...abilities,
      background: background || null,
      notes: notes || null,
    });

    if (err) {
      setError("No se pudo crear el personaje. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/characters");
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

  const sectionTitle = {
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.65rem", letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    borderBottom: "1px solid rgba(201,168,76,0.1)",
    paddingBottom: "0.6rem",
    marginBottom: "1.5rem",
    marginTop: "2rem",
  };

  return (
    <div style={{ padding: "3rem", maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <Link href="/dashboard/characters" style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.1em",
          color: "var(--text-muted)", textDecoration: "none",
          textTransform: "uppercase", display: "inline-block",
          marginBottom: "1.5rem",
        }}>
          ← Volver a Personajes
        </Link>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.5rem",
        }}>
          Nuevo Héroe
        </p>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          color: "var(--parchment)", lineHeight: 1.2,
        }}>
          Crear Personaje
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: "rgba(58,50,40,0.4)",
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "2.5rem",
      }}>

        {/* — Identidad — */}
        <p style={sectionTitle}>Identidad</p>

        <div style={{ marginBottom: "1.8rem" }}>
          <label style={labelStyle}>Nombre del Personaje *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Gandalf el Gris..."
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.8rem" }}>
          <div>
            <label style={labelStyle}>Raza</label>
            <select value={race} onChange={e => setRace(e.target.value)} style={inputStyle}>
              <option value="">— Seleccionar —</option>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Clase</label>
            <select value={charClass} onChange={e => setCharClass(e.target.value)} style={inputStyle}>
              <option value="">— Seleccionar —</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.8rem" }}>
          <div>
            <label style={labelStyle}>Nivel — {level}</label>
            <input
              type="range" min={1} max={20}
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--gold)", marginTop: "0.4rem" }}
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.2rem",
            }}>
              <span>1</span><span>20</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Campaña (opcional)</label>
            <select value={campaignId} onChange={e => setCampaignId(e.target.value)} style={inputStyle}>
              <option value="">— Sin campaña —</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* — Estadísticas — */}
        <p style={sectionTitle}>Estadísticas</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.8rem" }}>
          <div>
            <label style={labelStyle}>Puntos de Vida Máx.</label>
            <input
              type="number" min={1} max={999}
              value={hpMax}
              onChange={e => setHpMax(Math.max(1, Number(e.target.value) || 1))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Espacios de Conjuro Máx.</label>
            <input
              type="number" min={0} max={99}
              value={spellSlotsMax}
              onChange={e => setSpellSlotsMax(Math.max(0, Number(e.target.value) || 0))}
              style={inputStyle}
            />
          </div>
        </div>

        {/* — Puntuaciones de característica — */}
        <p style={sectionTitle}>Puntuaciones de Característica</p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "1.8rem",
        }}>
          {ABILITIES.map(({ key, abbr, label }) => (
            <div key={key} style={{
              background: "rgba(26,20,16,0.5)",
              border: "1px solid rgba(201,168,76,0.1)",
              padding: "1rem",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.65rem", letterSpacing: "0.2em",
                textTransform: "uppercase", color: "var(--gold)",
                marginBottom: "0.6rem",
              }}>
                {abbr}
              </div>
              <input
                type="number" min={1} max={20}
                value={abilities[key]}
                onChange={e => handleAbility(key, e.target.value)}
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  fontSize: "1.4rem",
                  padding: "0.4rem",
                  fontFamily: "var(--font-cinzel), serif",
                  marginBottom: "0.4rem",
                }}
                title={label}
              />
              <div style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.9rem",
                color: "var(--parchment-deeper)",
              }}>
                {modifier(abilities[key])}
              </div>
            </div>
          ))}
        </div>

        {/* — Historia — */}
        <p style={sectionTitle}>Historia</p>

        <div style={{ marginBottom: "1.8rem" }}>
          <label style={labelStyle}>Trasfondo</label>
          <textarea
            value={background}
            onChange={e => setBackground(e.target.value)}
            rows={4}
            placeholder="¿De dónde viene tu personaje? ¿Qué lo motiva?..."
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={labelStyle}>Notas</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Equipo, aliados, secretos, rasgos de personalidad..."
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />
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
          {loading ? "Forjando personaje..." : "Forjar Personaje"}
        </button>
      </form>
    </div>
  );
}
