"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type Character = {
  id: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  hp_current: number;
  hp_max: number;
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("characters")
        .select("id, name, race, class, level, hp_current, hp_max")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setCharacters(data ?? []);
      setLoading(false);
    };

    fetchCharacters();
  }, []);

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{
        fontStyle: "italic", color: "var(--text-muted)",
        fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem",
      }}>
        Cargando personajes...
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
            Mis Héroes
          </p>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "var(--parchment)", lineHeight: 1.2,
          }}>
            Personajes
          </h1>
        </div>
        <Link href="/dashboard/characters/new" style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.78rem", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--ink)",
          background: "var(--gold)", padding: "0.8rem 1.8rem",
          textDecoration: "none", display: "inline-block",
        }}>
          + Nuevo Personaje
        </Link>
      </div>

      {/* Grid */}
      {characters.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}>
          {characters.map((char) => {
            const hpRatio = char.hp_max > 0 ? char.hp_current / char.hp_max : 0;
            const hpColor = hpRatio > 0.5 ? "var(--gold)" : hpRatio > 0.25 ? "#e6a020" : "var(--blood-light)";

            return (
              <Link
                key={char.id}
                href={`/dashboard/characters/${char.id}`}
                style={{
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
                {/* Level badge */}
                <div style={{
                  position: "absolute", top: "1.2rem", right: "1.2rem",
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.6rem", letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "var(--gold)",
                }}>
                  Nv. {char.level}
                </div>

                <h3 style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "1.05rem", color: "var(--gold-light)",
                  marginBottom: "0.4rem", lineHeight: 1.3,
                  paddingRight: "3.5rem",
                }}>
                  {char.name}
                </h3>

                {(char.race || char.class) && (
                  <p style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.72rem", letterSpacing: "0.08em",
                    color: "var(--parchment-deeper)", marginBottom: "1.5rem",
                    textTransform: "uppercase",
                  }}>
                    {[char.race, char.class].filter(Boolean).join(" · ")}
                  </p>
                )}

                {/* HP bar */}
                <div style={{ marginTop: char.race || char.class ? 0 : "1.5rem" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.62rem", letterSpacing: "0.1em",
                    color: "var(--text-muted)", textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}>
                    <span>PV</span>
                    <span>{char.hp_current} / {char.hp_max}</span>
                  </div>
                  <div style={{
                    height: 4,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, hpRatio * 100)}%`,
                      background: hpColor,
                      transition: "width 0.3s",
                    }} />
                  </div>
                </div>
              </Link>
            );
          })}
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
            Sin aventureros
          </p>
          <p style={{
            fontSize: "1rem", fontStyle: "italic",
            color: "var(--text-muted)", marginBottom: "2rem",
          }}>
            Aún no has creado ningún personaje. ¡Forja tu primer héroe!
          </p>
          <Link href="/dashboard/characters/new" style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.8rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--ink)",
            background: "var(--gold)", padding: "0.8rem 2rem",
            textDecoration: "none", display: "inline-block",
          }}>
            Crear Primer Personaje
          </Link>
        </div>
      )}
    </div>
  );
}
