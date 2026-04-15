"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

type RollRecord = {
  id: string;
  dice_type: string;
  result: number;
  modifier: number;
  rolled_at: string;
  character_id: string | null;
};

type Character = { id: string; name: string; class: string | null };

const DICE: { type: DieType; sides: number; accent: string }[] = [
  { type: "d4",   sides: 4,   accent: "#9B7FD4" },
  { type: "d6",   sides: 6,   accent: "#C9A84C" },
  { type: "d8",   sides: 8,   accent: "#4CAF7D" },
  { type: "d10",  sides: 10,  accent: "#D4601A" },
  { type: "d12",  sides: 12,  accent: "#D44F6E" },
  { type: "d20",  sides: 20,  accent: "#C2442A" },
  { type: "d100", sides: 100, accent: "#6B8EA8" },
];

function isCritical(result: number, sides: number) {
  return result === sides;
}

function isFumble(result: number) {
  return result === 1;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default function DicePage() {
  const supabase = createClient();
  const router = useRouter();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedDie, setSelectedDie] = useState<DieType>("d20");
  const [modifier, setModifier] = useState(0);
  const [selectedCharId, setSelectedCharId] = useState("");

  const [rolling, setRolling] = useState(false);
  const [displayResult, setDisplayResult] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<number | null>(null);

  const [history, setHistory] = useState<RollRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: chars, error: charsError }, { data: rolls, error: rollsError }] = await Promise.all([
        supabase
          .from("characters")
          .select("id, name, class")
          .eq("user_id", user.id)
          .order("name"),
        supabase
          .from("dice_rolls")
          .select("id, dice_type, result, modifier, rolled_at, character_id")
          .eq("user_id", user.id)
          .order("rolled_at", { ascending: false })
          .limit(30),
      ]);

      if (charsError) console.error("Error fetching characters:", charsError);
      if (rollsError) console.error("Error fetching rolls:", rollsError);

      setCharacters(chars ?? []);
      setHistory(rolls ?? []);
      setLoadingHistory(false);
    };
    init();
  }, []);

  const currentDie = DICE.find(d => d.type === selectedDie)!;

  const handleRoll = async () => {
    if (rolling) return;
    setRolling(true);
    setFinalResult(null);

    const rolled = Math.floor(Math.random() * currentDie.sides) + 1;

    // Rolling animation — cycle random numbers for 700ms
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setDisplayResult(Math.floor(Math.random() * currentDie.sides) + 1);
      ticks++;
      if (ticks >= 14) {
        clearInterval(intervalRef.current!);
        setDisplayResult(rolled);
        setFinalResult(rolled);
        persistRoll(rolled).finally(() => {
          setRolling(false);
        });
      }
    }, 50);
  };

  const persistRoll = async (rolled: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newRoll, error } = await supabase
      .from("dice_rolls")
      .insert({
        user_id: user.id,
        dice_type: selectedDie,
        result: rolled,
        modifier,
        character_id: selectedCharId || null,
      })
      .select("id, dice_type, result, modifier, rolled_at, character_id")
      .single();

    if (error) {
      console.error("Error saving roll:", error);
      return;
    }

    if (newRoll) {
      setHistory(prev => [newRoll, ...prev].slice(0, 30));
    }
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const total = displayResult !== null ? displayResult + modifier : null;
  const isCrit = finalResult !== null && isCritical(finalResult, currentDie.sides);
  const isFumb = finalResult !== null && isFumble(finalResult);

  const resultColor = isCrit
    ? "var(--gold)"
    : isFumb
      ? "var(--blood-light)"
      : "var(--parchment)";

  return (
    <div style={{ padding: "3rem", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }}>

      {/* ——— Panel principal ——— */}
      <div>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "var(--gold)",
            marginBottom: "0.5rem",
          }}>
            La Mesa del Destino
          </p>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "var(--parchment)", lineHeight: 1.2,
          }}>
            Dados
          </h1>
        </div>

        {/* Selector de dado */}
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {DICE.map(die => {
            const active = selectedDie === die.type;
            return (
              <button
                key={die.type}
                onClick={() => { setSelectedDie(die.type); setDisplayResult(null); setFinalResult(null); }}
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.85rem", letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.7rem 1.2rem",
                  background: active ? die.accent : "rgba(58,50,40,0.4)",
                  border: `1px solid ${active ? die.accent : "rgba(201,168,76,0.15)"}`,
                  color: active ? "var(--ink)" : "var(--parchment-deeper)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {die.type}
              </button>
            );
          })}
        </div>

        {/* Resultado */}
        <div style={{
          background: "rgba(58,50,40,0.4)",
          border: `1px solid ${isCrit ? "rgba(201,168,76,0.5)" : isFumb ? "rgba(194,68,42,0.4)" : "rgba(201,168,76,0.12)"}`,
          padding: "3rem 2rem",
          textAlign: "center",
          marginBottom: "1.5rem",
          transition: "border-color 0.3s",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Die label */}
          <div style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.65rem", letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: currentDie.accent,
            marginBottom: "1rem",
          }}>
            {selectedDie}
            {modifier !== 0 && (
              <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                {modifier > 0 ? `+${modifier}` : modifier}
              </span>
            )}
          </div>

          {/* Main number */}
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(4rem, 10vw, 7rem)",
            color: rolling ? "var(--text-muted)" : resultColor,
            lineHeight: 1,
            transition: "color 0.3s",
            minHeight: "1em",
          }}>
            {displayResult !== null ? displayResult : "—"}
          </div>

          {/* Total con modificador */}
          {!rolling && modifier !== 0 && total !== null && (
            <div style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1.1rem", color: "var(--gold)",
              marginTop: "0.8rem", letterSpacing: "0.1em",
            }}>
              Total: {total}
            </div>
          )}

          {/* Crit / fumble label */}
          {!rolling && isCrit && (
            <div style={{
              marginTop: "1rem",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.75rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "var(--gold)",
            }}>
              ¡Crítico!
            </div>
          )}
          {!rolling && isFumb && (
            <div style={{
              marginTop: "1rem",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.75rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "var(--blood-light)",
            }}>
              Pifia
            </div>
          )}
        </div>

        {/* Controles: modificador + personaje */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{
              display: "block",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.65rem", letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--gold)",
              marginBottom: "0.5rem",
            }}>
              Modificador
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <button
                onClick={() => setModifier(m => Math.max(-20, m - 1))}
                style={{
                  width: 40, height: 42,
                  background: "rgba(26,20,16,0.8)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRight: "none",
                  color: "var(--parchment)", fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >−</button>
              <div style={{
                flex: 1, height: 42,
                background: "rgba(26,20,16,0.8)",
                border: "1px solid rgba(201,168,76,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "1rem", color: "var(--parchment)",
              }}>
                {modifier > 0 ? `+${modifier}` : modifier}
              </div>
              <button
                onClick={() => setModifier(m => Math.min(20, m + 1))}
                style={{
                  width: 40, height: 42,
                  background: "rgba(26,20,16,0.8)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderLeft: "none",
                  color: "var(--parchment)", fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >+</button>
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.65rem", letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--gold)",
              marginBottom: "0.5rem",
            }}>
              Personaje (opcional)
            </label>
            <select
              value={selectedCharId}
              onChange={e => setSelectedCharId(e.target.value)}
              style={{
                width: "100%", height: 42,
                padding: "0 0.8rem",
                background: "rgba(26,20,16,0.8)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "var(--parchment)",
                fontFamily: "var(--font-crimson), serif",
                fontSize: "0.95rem", outline: "none",
              }}
            >
              <option value="">— Sin personaje —</option>
              {characters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.class ? ` (${c.class})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón lanzar */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          style={{
            width: "100%", padding: "1.1rem",
            background: rolling ? "var(--gold-dark)" : currentDie.accent,
            border: "none", color: "var(--ink)",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.9rem", letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: rolling ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            fontWeight: 700,
          }}
        >
          {rolling ? "Lanzando..." : `Lanzar ${selectedDie}`}
        </button>
      </div>

      {/* ——— Historial ——— */}
      <div>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.65rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--text-muted)",
          marginBottom: "1.2rem",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
          paddingBottom: "0.6rem",
        }}>
          Historial de Tiradas
        </p>

        {loadingHistory ? (
          <p style={{
            fontStyle: "italic", color: "var(--text-muted)",
            fontFamily: "var(--font-cinzel), serif", fontSize: "0.8rem",
          }}>
            Cargando...
          </p>
        ) : history.length === 0 ? (
          <p style={{
            fontStyle: "italic", color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}>
            Aún no hay tiradas. ¡Lanza tu primer dado!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "70vh", overflowY: "auto" }}>
            {history.map((roll) => {
              const die = DICE.find(d => d.type === roll.dice_type);
              const accent = die?.accent ?? "var(--gold)";
              const sides = die?.sides ?? 20;
              const crit = isCritical(roll.result, sides);
              const fumb = isFumble(roll.result);

              return (
                <div key={roll.id} style={{
                  display: "flex", alignItems: "center", gap: "0.8rem",
                  padding: "0.7rem 1rem",
                  background: "rgba(58,50,40,0.35)",
                  border: `1px solid ${crit ? "rgba(201,168,76,0.3)" : fumb ? "rgba(194,68,42,0.25)" : "rgba(201,168,76,0.08)"}`,
                }}>
                  {/* Die badge */}
                  <div style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.6rem", letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: accent,
                    background: `${accent}18`,
                    border: `1px solid ${accent}40`,
                    padding: "0.2rem 0.5rem",
                    flexShrink: 0,
                    minWidth: 36, textAlign: "center",
                  }}>
                    {roll.dice_type}
                  </div>

                  {/* Result */}
                  <div style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "1.1rem",
                    color: crit ? "var(--gold)" : fumb ? "var(--blood-light)" : "var(--parchment)",
                    fontWeight: 700, flexShrink: 0,
                  }}>
                    {roll.result}
                    {roll.modifier !== 0 && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400, marginLeft: "0.3rem" }}>
                        ({roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier} = {roll.result + roll.modifier})
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <div style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.6rem", color: "var(--text-muted)",
                    letterSpacing: "0.05em", flexShrink: 0,
                  }}>
                    {formatTime(roll.rolled_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
