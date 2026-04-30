"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("dice");
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

      const [{ data: chars }, { data: rolls }] = await Promise.all([
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
    ? "var(--raw-gold)"
    : isFumb
      ? "var(--raw-blood-ui)"
      : "var(--raw-prose)";

  return (
    <div className="p-12 grid grid-cols-[1fr_340px] gap-10 items-start">

      {/* ——— Main panel ——— */}
      <div>
        <div className="mb-10">
          <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">
            {t("subtitle")}
          </p>
          <h1 className="font-cinzel-dec text-[clamp(1.5rem,3vw,2.2rem)] text-prose leading-[1.2]">
            {t("title")}
          </h1>
        </div>

        {/* Die selector */}
        <div className="flex gap-[0.6rem] mb-8 flex-wrap">
          {DICE.map(die => {
            const active = selectedDie === die.type;
            return (
              <button
                key={die.type}
                onClick={() => { setSelectedDie(die.type); setDisplayResult(null); setFinalResult(null); }}
                className={`font-cinzel text-[0.85rem] tracking-[0.1em] uppercase px-5 py-3 cursor-pointer transition-all duration-150 border ${active ? "font-bold" : "text-prose-soft bg-surface/40 border-gold/15"}`}
                style={active ? { background: die.accent, borderColor: die.accent, color: "var(--raw-canvas)" } : undefined}
              >
                {die.type}
              </button>
            );
          })}
        </div>

        {/* Result panel */}
        <div
          className="p-12 text-center mb-6 relative overflow-hidden transition-all duration-300"
          style={{
            background: "rgba(58,50,40,0.4)",
            border: `1px solid ${isCrit ? "rgba(201,168,76,0.5)" : isFumb ? "rgba(194,68,42,0.4)" : "rgba(201,168,76,0.12)"}`,
          }}
        >
          {/* Die label */}
          <div
            className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase mb-4"
            style={{ color: currentDie.accent }}
          >
            {selectedDie}
            {modifier !== 0 && (
              <span className="text-prose-muted ml-2">
                {modifier > 0 ? `+${modifier}` : modifier}
              </span>
            )}
          </div>

          {/* Main number */}
          <div
            className="font-cinzel-dec leading-none transition-colors duration-300"
            style={{
              fontSize: "clamp(4rem, 10vw, 7rem)",
              color: rolling ? "var(--raw-prose-muted)" : resultColor,
              minHeight: "1em",
            }}
          >
            {displayResult !== null ? displayResult : "—"}
          </div>

          {/* Total with modifier */}
          {!rolling && modifier !== 0 && total !== null && (
            <div className="font-cinzel text-[1.1rem] text-gold mt-3 tracking-[0.1em]">
              {t("total")}: {total}
            </div>
          )}

          {/* Crit / fumble label */}
          {!rolling && isCrit && (
            <div className="mt-4 font-cinzel text-[0.75rem] tracking-[0.3em] uppercase text-gold">
              {t("critical")}
            </div>
          )}
          {!rolling && isFumb && (
            <div className="mt-4 font-cinzel text-[0.75rem] tracking-[0.3em] uppercase text-blood-ui">
              {t("fumble")}
            </div>
          )}
        </div>

        {/* Controls: modifier + character */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("modifier")}
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setModifier(m => Math.max(-20, m - 1))}
                className="w-10 h-11 bg-canvas/80 border border-gold/20 border-r-0 text-prose text-xl cursor-pointer hover:bg-surface transition-colors"
              >
                −
              </button>
              <div className="flex-1 h-11 bg-canvas/80 border border-gold/20 flex items-center justify-center font-cinzel text-[1rem] text-prose">
                {modifier > 0 ? `+${modifier}` : modifier}
              </div>
              <button
                onClick={() => setModifier(m => Math.min(20, m + 1))}
                className="w-10 h-11 bg-canvas/80 border border-gold/20 border-l-0 text-prose text-xl cursor-pointer hover:bg-surface transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("character")}
            </label>
            <select
              value={selectedCharId}
              onChange={e => setSelectedCharId(e.target.value)}
              className="w-full h-11 px-3 bg-canvas/80 border border-gold/20 text-prose font-crimson text-[0.95rem] outline-none"
            >
              <option value="">{t("noCharacter")}</option>
              {characters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.class ? ` (${c.class})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roll button */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="w-full py-4 border-none font-cinzel text-[0.9rem] tracking-[0.2em] uppercase font-bold cursor-pointer transition-colors disabled:cursor-not-allowed"
          style={{ background: rolling ? "var(--raw-gold-dim)" : currentDie.accent, color: "var(--raw-canvas)" }}
        >
          {rolling ? t("rolling") : `${t("roll")} ${selectedDie}`}
        </button>
      </div>

      {/* ——— History panel ——— */}
      <div>
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-prose-muted mb-5 border-b border-gold/10 pb-3">
          {t("history")}
        </p>

        {loadingHistory ? (
          <p className="italic text-prose-muted font-cinzel text-[0.8rem]">
            {t("historyLoading")}
          </p>
        ) : history.length === 0 ? (
          <p className="italic text-prose-muted text-[0.9rem]">
            {t("historyEmpty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
            {history.map((roll) => {
              const die = DICE.find(d => d.type === roll.dice_type);
              const accent = die?.accent ?? "var(--raw-gold)";
              const sides = die?.sides ?? 20;
              const crit = isCritical(roll.result, sides);
              const fumb = isFumble(roll.result);

              return (
                <div
                  key={roll.id}
                  className="flex items-center gap-3 px-4 py-3 border"
                  style={{
                    background: "rgba(58,50,40,0.35)",
                    borderColor: crit ? "rgba(201,168,76,0.3)" : fumb ? "rgba(194,68,42,0.25)" : "rgba(201,168,76,0.08)",
                  }}
                >
                  {/* Die badge */}
                  <div
                    className="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase px-2 py-1 text-center flex-shrink-0 min-w-9"
                    style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}40` }}
                  >
                    {roll.dice_type}
                  </div>

                  {/* Result */}
                  <div
                    className="font-cinzel text-[1.1rem] font-bold flex-shrink-0"
                    style={{ color: crit ? "var(--raw-gold)" : fumb ? "var(--raw-blood-ui)" : "var(--raw-prose)" }}
                  >
                    {roll.result}
                    {roll.modifier !== 0 && (
                      <span
                        className="text-[0.75rem] font-normal ml-1"
                        style={{ color: "var(--raw-prose-muted)" }}
                      >
                        ({roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier} = {roll.result + roll.modifier})
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <div
                    className="ml-auto font-cinzel text-[0.6rem] tracking-[0.05em] flex-shrink-0"
                    style={{ color: "var(--raw-prose-muted)" }}
                  >
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
