"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

const API_BASE = "https://api.open5e.com/v1";

type Speed = {
  walk?: number;
  fly?: number;
  swim?: number;
  burrow?: number;
  climb?: number;
  hover?: boolean;
};

type Action = {
  name: string;
  desc: string;
  attack_bonus?: number;
};

type SpecialAbility = {
  name: string;
  desc: string;
};

type Monster = {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype: string;
  group: string | null;
  alignment: string;
  armor_class: number;
  armor_desc: string;
  hit_points: number;
  hit_dice: string;
  speed: Speed;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number | null;
  dexterity_save: number | null;
  constitution_save: number | null;
  intelligence_save: number | null;
  wisdom_save: number | null;
  charisma_save: number | null;
  perception: number | null;
  skills: Record<string, number>;
  damage_vulnerabilities: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  challenge_rating: string;
  cr: number;
  actions: Action[];
  bonus_actions: Action[] | null;
  reactions: Action[] | null;
  legendary_desc: string;
  legendary_actions: Action[] | null;
  special_abilities: SpecialAbility[] | null;
  img_main: string | null;
  document__title: string;
};

const XP_BY_CR: Record<string, number> = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
  "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
  "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
  "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000,
  "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000,
};

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function formatSpeed(speed: Speed): string {
  const parts: string[] = [];
  if (speed.walk)   parts.push(`${speed.walk} pies`);
  if (speed.fly)    parts.push(`vuelo ${speed.fly} pies${speed.hover ? " (flotar)" : ""}`);
  if (speed.swim)   parts.push(`nado ${speed.swim} pies`);
  if (speed.burrow) parts.push(`excavar ${speed.burrow} pies`);
  if (speed.climb)  parts.push(`trepar ${speed.climb} pies`);
  return parts.join(", ") || "0 pies";
}

function formatSkills(skills: Record<string, number>): string {
  return Object.entries(skills)
    .map(([name, val]) => `${name} ${val >= 0 ? "+" : ""}${val}`)
    .join(", ");
}

function crColor(cr: number): string {
  if (cr <= 2)  return "#5a9e72";
  if (cr <= 7)  return "var(--gold)";
  if (cr <= 12) return "#e6820a";
  if (cr <= 20) return "var(--blood-light)";
  return "#a78bfa";
}

const ABILITIES: { key: keyof Monster; label: string; saveKey: keyof Monster }[] = [
  { key: "strength",     label: "FUE", saveKey: "strength_save" },
  { key: "dexterity",    label: "DES", saveKey: "dexterity_save" },
  { key: "constitution", label: "CON", saveKey: "constitution_save" },
  { key: "intelligence", label: "INT", saveKey: "intelligence_save" },
  { key: "wisdom",       label: "SAB", saveKey: "wisdom_save" },
  { key: "charisma",     label: "CAR", saveKey: "charisma_save" },
];

export default function MonsterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchMonster = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/monsters/${slug}/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Monster = await res.json();
        setMonster(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar la criatura.");
      } finally {
        setLoading(false);
      }
    };
    fetchMonster();
  }, [slug]);

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
        Consultando el bestiario...
      </p>
    </div>
  );

  if (error || !monster) return (
    <div style={{ padding: "3rem" }}>
      <Link href="/dashboard/bestiary" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--text-muted)", textDecoration: "none", textTransform: "uppercase", display: "inline-block", marginBottom: "1.5rem" }}>
        ← Volver al Bestiario
      </Link>
      <p style={{ color: "var(--blood-light)", fontStyle: "italic" }}>{error || "Criatura no encontrada."}</p>
    </div>
  );

  const xp = XP_BY_CR[monster.challenge_rating]?.toLocaleString() ?? "—";
  const saves = ABILITIES.filter(a => monster[a.saveKey] !== null);
  const hasSkills = Object.keys(monster.skills).length > 0;
  const color = crColor(monster.cr);

  // Style helpers
  const divider = { borderTop: "1px solid rgba(201,168,76,0.2)", margin: "1rem 0" };
  const sectionLabel = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "var(--gold)", marginBottom: "0.8rem" };
  const propLabel = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--gold)" };
  const propValue = { fontFamily: "var(--font-crimson), serif", fontSize: "0.95rem", color: "var(--parchment-deeper)" };
  const actionName = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--parchment)", marginBottom: "0.3rem" };
  const actionDesc = { fontFamily: "var(--font-crimson), serif", fontSize: "0.95rem", color: "var(--parchment-deeper)", lineHeight: 1.7 };

  function ActionBlock({ actions, title }: { actions: Action[]; title: string }) {
    return (
      <>
        <div style={divider} />
        <p style={{ ...sectionLabel, color: "var(--parchment)" }}>{title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {actions.map((a, i) => (
            <div key={i}>
              <p style={actionName}>
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{a.name}.</em>
              </p>
              <p style={actionDesc}>{a.desc}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div style={{ padding: "3rem", maxWidth: 860 }}>

      {/* Back */}
      <Link href="/dashboard/bestiary" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", letterSpacing: "0.1em", color: "var(--text-muted)", textDecoration: "none", textTransform: "uppercase", display: "inline-block", marginBottom: "1.8rem" }}>
        ← Bestiario
      </Link>

      {/* ── Header ── */}
      <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--parchment)", lineHeight: 1.15, marginBottom: "0.4rem" }}>
            {monster.name}
          </h1>
          <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "1rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            {[monster.size, monster.type, monster.subtype && `(${monster.subtype})`].filter(Boolean).join(" ")}
            {monster.alignment ? `, ${monster.alignment}` : ""}
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "0.6rem 1.2rem", border: `1px solid ${color}`, background: "rgba(0,0,0,0.2)" }}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: color, marginBottom: "0.2rem" }}>Desafío</p>
          <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.5rem", color: color, lineHeight: 1 }}>{monster.challenge_rating || "0"}</p>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{xp} XP</p>
        </div>
      </div>

      {/* ── Stat Block ── */}
      <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "2rem", marginTop: "1.5rem" }}>

        {/* AC · HP · Speed */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "0.5rem" }}>
          {[
            ["Clase de Armadura", `${monster.armor_class}${monster.armor_desc ? ` (${monster.armor_desc})` : ""}`],
            ["Puntos de Vida", `${monster.hit_points} (${monster.hit_dice})`],
            ["Velocidad", formatSpeed(monster.speed)],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={propLabel}>{label}</p>
              <p style={{ ...propValue, marginTop: "0.2rem" }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={divider} />

        {/* Ability Scores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
          {ABILITIES.map(({ key, label }) => {
            const score = monster[key] as number;
            return (
              <div key={label} style={{ background: "rgba(26,20,16,0.4)", border: "1px solid rgba(201,168,76,0.1)", padding: "0.7rem 0.4rem", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--gold)", marginBottom: "0.4rem" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", color: "var(--parchment)", lineHeight: 1, marginBottom: "0.2rem" }}>{score}</p>
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", color: "var(--parchment-deeper)" }}>{mod(score)}</p>
              </div>
            );
          })}
        </div>

        <div style={divider} />

        {/* Properties */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "0.5rem" }}>
          {saves.length > 0 && (
            <p style={propValue}>
              <span style={propLabel}>Tiradas de Salvación </span>
              {saves.map(a => `${a.label} ${monster[a.saveKey] as number >= 0 ? "+" : ""}${monster[a.saveKey]}`).join(", ")}
            </p>
          )}
          {hasSkills && (
            <p style={propValue}>
              <span style={propLabel}>Habilidades </span>
              {formatSkills(monster.skills)}
            </p>
          )}
          {monster.damage_vulnerabilities && (
            <p style={propValue}><span style={propLabel}>Vulnerabilidades al Daño </span>{monster.damage_vulnerabilities}</p>
          )}
          {monster.damage_resistances && (
            <p style={propValue}><span style={propLabel}>Resistencias al Daño </span>{monster.damage_resistances}</p>
          )}
          {monster.damage_immunities && (
            <p style={propValue}><span style={propLabel}>Inmunidades al Daño </span>{monster.damage_immunities}</p>
          )}
          {monster.condition_immunities && (
            <p style={propValue}><span style={propLabel}>Inmunidades a Condiciones </span>{monster.condition_immunities}</p>
          )}
          {monster.senses && (
            <p style={propValue}><span style={propLabel}>Sentidos </span>{monster.senses}</p>
          )}
          {monster.languages && (
            <p style={propValue}><span style={propLabel}>Idiomas </span>{monster.languages || "—"}</p>
          )}
        </div>

        {/* Special Abilities */}
        {monster.special_abilities && monster.special_abilities.length > 0 && (
          <>
            <div style={divider} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {monster.special_abilities.map((ab, i) => (
                <div key={i}>
                  <p style={actionName}>
                    <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{ab.name}.</em>
                  </p>
                  <p style={actionDesc}>{ab.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        {monster.actions?.length > 0 && (
          <ActionBlock actions={monster.actions} title="Acciones" />
        )}

        {/* Bonus Actions */}
        {monster.bonus_actions && monster.bonus_actions.length > 0 && (
          <ActionBlock actions={monster.bonus_actions} title="Acciones Adicionales" />
        )}

        {/* Reactions */}
        {monster.reactions && monster.reactions.length > 0 && (
          <ActionBlock actions={monster.reactions} title="Reacciones" />
        )}

        {/* Legendary Actions */}
        {monster.legendary_actions && monster.legendary_actions.length > 0 && (
          <>
            <div style={divider} />
            <p style={{ ...sectionLabel, color: "var(--parchment)" }}>Acciones Legendarias</p>
            {monster.legendary_desc && (
              <p style={{ ...actionDesc, marginBottom: "1rem" }}>{monster.legendary_desc}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {monster.legendary_actions.map((a, i) => (
                <div key={i}>
                  <p style={actionName}>
                    <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{a.name}.</em>
                  </p>
                  <p style={actionDesc}>{a.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Source */}
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--text-muted)", marginTop: "1rem", opacity: 0.6 }}>
        Fuente: {monster.document__title}
      </p>
    </div>
  );
}
