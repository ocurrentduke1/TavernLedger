"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { canGenerateBackstory, generateBackstoryWithGroq, getCurrentUsage } from "@/lib/groq";

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

const DND_BACKGROUNDS = [
  "Acólito", "Artesano", "Charlatán", "Criminal", "Erudito",
  "Ermitaño", "Forastero", "Guardia", "Marinero", "Mercader",
  "Noble", "Proscrito", "Sabio", "Soldado", "Viajante",
];

const SIZES = ["Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco"];

const HIT_DICE_BY_CLASS: Record<string, string> = {
  "Bárbaro": "d12", "Bardo": "d8", "Clérigo": "d8", "Druida": "d8",
  "Guerrero": "d10", "Monje": "d8", "Paladín": "d10", "Explorador": "d10",
  "Pícaro": "d8", "Hechicero": "d6", "Brujo": "d8", "Mago": "d6",
};

type AbilityKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
type SkillKey =
  "skill_acrobatics" | "skill_animal_handling" | "skill_arcana" | "skill_athletics" |
  "skill_deception" | "skill_history" | "skill_insight" | "skill_intimidation" |
  "skill_investigation" | "skill_medicine" | "skill_nature" | "skill_perception" |
  "skill_performance" | "skill_persuasion" | "skill_religion" | "skill_sleight_of_hand" |
  "skill_stealth" | "skill_survival";
type SaveKey = "save_prof_strength" | "save_prof_dexterity" | "save_prof_constitution" |
  "save_prof_intelligence" | "save_prof_wisdom" | "save_prof_charisma";

const ABILITIES: { key: AbilityKey; label: string; abbr: string }[] = [
  { key: "strength", label: "Fuerza", abbr: "FUE" },
  { key: "dexterity", label: "Destreza", abbr: "DES" },
  { key: "constitution", label: "Constitución", abbr: "CON" },
  { key: "intelligence", label: "Inteligencia", abbr: "INT" },
  { key: "wisdom", label: "Sabiduría", abbr: "SAB" },
  { key: "charisma", label: "Carisma", abbr: "CAR" },
];

const SKILLS: { key: SkillKey; label: string; ability: AbilityKey }[] = [
  { key: "skill_athletics", label: "Atletismo", ability: "strength" },
  { key: "skill_acrobatics", label: "Acrobacias", ability: "dexterity" },
  { key: "skill_sleight_of_hand", label: "Juego de Manos", ability: "dexterity" },
  { key: "skill_stealth", label: "Sigilo", ability: "dexterity" },
  { key: "skill_arcana", label: "Arcanos", ability: "intelligence" },
  { key: "skill_history", label: "Historia", ability: "intelligence" },
  { key: "skill_investigation", label: "Investigación", ability: "intelligence" },
  { key: "skill_nature", label: "Naturaleza", ability: "intelligence" },
  { key: "skill_religion", label: "Religión", ability: "intelligence" },
  { key: "skill_animal_handling", label: "Trato con Animales", ability: "wisdom" },
  { key: "skill_insight", label: "Perspicacia", ability: "wisdom" },
  { key: "skill_medicine", label: "Medicina", ability: "wisdom" },
  { key: "skill_perception", label: "Percepción", ability: "wisdom" },
  { key: "skill_survival", label: "Supervivencia", ability: "wisdom" },
  { key: "skill_deception", label: "Engaño", ability: "charisma" },
  { key: "skill_intimidation", label: "Intimidación", ability: "charisma" },
  { key: "skill_performance", label: "Actuación", ability: "charisma" },
  { key: "skill_persuasion", label: "Persuasión", ability: "charisma" },
];

type Campaign = { id: string; name: string };

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function profBonus(level: number) {
  return Math.floor((level - 1) / 4) + 2;
}

export default function NewCharacterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Identity
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [charClass, setCharClass] = useState("");
  const [subclass, setSubclass] = useState("");
  const [dndBackground, setDndBackground] = useState("");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [campaignId, setCampaignId] = useState("");

  // Combat
  const [ac, setAc] = useState(10);
  const [shield, setShield] = useState(false);
  const [hpMax, setHpMax] = useState(10);
  const [hpTemp, setHpTemp] = useState(0);
  const [hitDice, setHitDice] = useState("d8");
  const [speed, setSpeed] = useState(30);
  const [size, setSize] = useState("Mediano");
  const [spellSlotsMax, setSpellSlotsMax] = useState(0);

  // Ability scores
  const [abilities, setAbilities] = useState<Record<AbilityKey, number>>({
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10,
  });

  // Saving throw proficiencies
  const [saves, setSaves] = useState<Record<SaveKey, boolean>>({
    save_prof_strength: false, save_prof_dexterity: false,
    save_prof_constitution: false, save_prof_intelligence: false,
    save_prof_wisdom: false, save_prof_charisma: false,
  });

  // Skill proficiencies
  const [skills, setSkills] = useState<Record<SkillKey, boolean>>({
    skill_acrobatics: false, skill_animal_handling: false, skill_arcana: false,
    skill_athletics: false, skill_deception: false, skill_history: false,
    skill_insight: false, skill_intimidation: false, skill_investigation: false,
    skill_medicine: false, skill_nature: false, skill_perception: false,
    skill_performance: false, skill_persuasion: false, skill_religion: false,
    skill_sleight_of_hand: false, skill_stealth: false, skill_survival: false,
  });

  // Proficiencies
  const [armorTraining, setArmorTraining] = useState({ light: false, medium: false, heavy: false, shields: false });
  const [weaponProficiencies, setWeaponProficiencies] = useState("");
  const [toolProficiencies, setToolProficiencies] = useState("");

  // Story
  const [background, setBackground] = useState("");
  const [notes, setNotes] = useState("");

  // Groq AI
  const [generatingBackstory, setGeneratingBackstory] = useState(false);
  const [backstoryError, setBackstoryError] = useState("");
  const [canGenerate, setCanGenerate] = useState(false);
  const [groqRemaining, setGroqRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: campData }, canGen, usage] = await Promise.all([
        supabase.from("campaigns").select("id, name").eq("dm_id", user.id).eq("status", "active").order("name"),
        canGenerateBackstory(user.id),
        getCurrentUsage(user.id),
      ]);
      setCampaigns(campData ?? []);
      setCanGenerate(canGen.allowed);
      setGroqRemaining(usage?.requestsRemaining ?? null);
    };
    fetchInitial();
  }, [supabase]);

  const handleGenerateBackstory = async () => {
    if (!name.trim()) {
      setBackstoryError("Ingresa el nombre del personaje antes de generar.");
      return;
    }
    setGeneratingBackstory(true);
    setBackstoryError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setBackstoryError("Debes estar autenticado."); return; }
      const result = await generateBackstoryWithGroq(user.id, name, charClass || null, race || null, level);
      if (result.backstory) {
        setBackground(result.backstory);
        const usage = await getCurrentUsage(user.id);
        setGroqRemaining(usage?.requestsRemaining ?? null);
      }
    } catch (err: unknown) {
      setBackstoryError(err instanceof Error ? err.message : "Error al generar trasfondo.");
    } finally {
      setGeneratingBackstory(false);
    }
  };

  const handleClassChange = (cls: string) => {
    setCharClass(cls);
    if (HIT_DICE_BY_CLASS[cls]) setHitDice(HIT_DICE_BY_CLASS[cls]);
  };

  const handleAbility = (key: AbilityKey, val: string) => {
    setAbilities(prev => ({ ...prev, [key]: Math.min(20, Math.max(1, Number(val) || 10)) }));
  };

  const toggleSave = (key: SaveKey) => setSaves(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSkill = (key: SkillKey) => setSkills(prev => ({ ...prev, [key]: !prev[key] }));

  const armorTrainingText = [
    armorTraining.light && "Light",
    armorTraining.medium && "Medium",
    armorTraining.heavy && "Heavy",
    armorTraining.shields && "Shields",
  ].filter(Boolean).join(", ");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("El nombre del personaje es requerido.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: err } = await supabase.from("characters").insert({
      user_id: user.id,
      campaign_id: campaignId || null,
      name, race: race || null, class: charClass || null,
      subclass: subclass || null, dnd_background: dndBackground || null,
      level, xp, ac, shield, speed, size,
      hp_current: hpMax, hp_max: hpMax, hp_temp: hpTemp,
      hit_dice: hitDice, hit_dice_spent: 0,
      spell_slots_current: spellSlotsMax, spell_slots_max: spellSlotsMax,
      death_saves_success: 0, death_saves_failure: 0,
      heroic_inspiration: false,
      ...abilities, ...saves, ...skills,
      armor_training: armorTrainingText || null,
      weapon_proficiencies: weaponProficiencies || null,
      tool_proficiencies: toolProficiencies || null,
      background: background || null, notes: notes || null,
      class_features: [],
    });

    if (err) {
      setError("No se pudo crear el personaje. Verifica los datos e intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/characters");
  };

  const s = {
    input: {
      width: "100%", padding: "0.8rem 1rem",
      background: "rgba(26,20,16,0.8)",
      border: "1px solid rgba(201,168,76,0.2)",
      color: "var(--parchment)",
      fontFamily: "var(--font-crimson), serif",
      fontSize: "1rem", outline: "none",
      boxSizing: "border-box" as const,
    },
    label: {
      display: "block",
      fontFamily: "var(--font-cinzel), serif",
      fontSize: "0.7rem", letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
      color: "var(--gold)", marginBottom: "0.5rem",
    },
    section: {
      fontFamily: "var(--font-cinzel), serif",
      fontSize: "0.65rem", letterSpacing: "0.3em",
      textTransform: "uppercase" as const,
      color: "var(--text-muted)",
      borderBottom: "1px solid rgba(201,168,76,0.1)",
      paddingBottom: "0.6rem", marginBottom: "1.5rem", marginTop: "2.5rem",
    },
    checkbox: {
      display: "flex", alignItems: "center", gap: "0.6rem",
      padding: "0.5rem 0.7rem",
      background: "rgba(26,20,16,0.4)",
      border: "1px solid rgba(201,168,76,0.1)",
      cursor: "pointer",
    },
  };

  const pb = profBonus(level);

  return (
    <div style={{ padding: "3rem", maxWidth: 780 }}>
      <div style={{ marginBottom: "3rem" }}>
        <Link href="/dashboard/characters" style={{
          fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem",
          letterSpacing: "0.1em", color: "var(--text-muted)",
          textDecoration: "none", textTransform: "uppercase",
          display: "inline-block", marginBottom: "1.5rem",
        }}>
          ← Volver a Personajes
        </Link>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
          Nuevo Héroe
        </p>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "var(--parchment)", lineHeight: 1.2 }}>
          Crear Personaje
        </h1>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "2.5rem" }}>

        {/* ── Identidad ── */}
        <p style={s.section}>Identidad</p>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={s.label}>Nombre del Personaje *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Gandalf el Gris..." style={s.input} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={s.label}>Especie</label>
            <select value={race} onChange={e => setRace(e.target.value)} style={s.input}>
              <option value="">— Seleccionar —</option>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Clase</label>
            <select value={charClass} onChange={e => handleClassChange(e.target.value)} style={s.input}>
              <option value="">— Seleccionar —</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Subclase</label>
            <input type="text" value={subclass} onChange={e => setSubclass(e.target.value)} placeholder="Escuela de Evocación..." style={s.input} />
          </div>
          <div>
            <label style={s.label}>Trasfondo D&D</label>
            <select value={dndBackground} onChange={e => setDndBackground(e.target.value)} style={s.input}>
              <option value="">— Seleccionar —</option>
              {DND_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={s.label}>Nivel — {level}</label>
            <input type="range" min={1} max={20} value={level} onChange={e => setLevel(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--gold)", marginTop: "0.4rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              <span>1</span><span style={{ color: "var(--gold)" }}>Prof +{pb}</span><span>20</span>
            </div>
          </div>
          <div>
            <label style={s.label}>Experiencia (XP)</label>
            <input type="number" min={0} value={xp} onChange={e => setXp(Math.max(0, Number(e.target.value)))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Campaña (opcional)</label>
            <select value={campaignId} onChange={e => setCampaignId(e.target.value)} style={s.input}>
              <option value="">— Sin campaña —</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* ── Combate ── */}
        <p style={s.section}>Combate</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={s.label}>CA (Armor Class)</label>
            <input type="number" min={1} max={30} value={ac} onChange={e => setAc(Math.max(1, Number(e.target.value)))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>PV Máximos</label>
            <input type="number" min={1} max={999} value={hpMax} onChange={e => setHpMax(Math.max(1, Number(e.target.value)))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>PV Temporales</label>
            <input type="number" min={0} max={999} value={hpTemp} onChange={e => setHpTemp(Math.max(0, Number(e.target.value)))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Espacio Conjuro Máx.</label>
            <input type="number" min={0} max={99} value={spellSlotsMax} onChange={e => setSpellSlotsMax(Math.max(0, Number(e.target.value)))} style={s.input} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={s.label}>Dados de Golpe</label>
            <select value={hitDice} onChange={e => setHitDice(e.target.value)} style={s.input}>
              {["d6", "d8", "d10", "d12"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Velocidad (pies)</label>
            <input type="number" min={0} max={200} step={5} value={speed} onChange={e => setSpeed(Math.max(0, Number(e.target.value)))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Tamaño</label>
            <select value={size} onChange={e => setSize(e.target.value)} style={s.input}>
              {SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label style={{ ...s.label, marginBottom: "0.8rem" }}>Escudo</label>
            <label style={{ ...s.checkbox, border: shield ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.1)" }}>
              <input type="checkbox" checked={shield} onChange={e => setShield(e.target.checked)} style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", color: shield ? "var(--gold)" : "var(--text-muted)" }}>
                Con Escudo
              </span>
            </label>
          </div>
        </div>

        {/* ── Características ── */}
        <p style={s.section}>Puntuaciones de Característica</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.8rem", marginBottom: "1.5rem" }}>
          {ABILITIES.map(({ key, abbr, label }) => (
            <div key={key} style={{ background: "rgba(26,20,16,0.5)", border: "1px solid rgba(201,168,76,0.1)", padding: "0.8rem", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
                {abbr}
              </div>
              <input
                type="number" min={1} max={20} value={abilities[key]}
                onChange={e => handleAbility(key, e.target.value)}
                title={label}
                style={{ ...s.input, textAlign: "center", fontSize: "1.3rem", padding: "0.3rem", fontFamily: "var(--font-cinzel), serif", marginBottom: "0.3rem" }}
              />
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", color: "var(--parchment-deeper)" }}>
                {mod(abilities[key])}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tiradas de Salvación ── */}
        <p style={s.section}>Tiradas de Salvación</p>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "1rem", letterSpacing: "0.05em" }}>
          Bono de Proficiencia: +{pb} · Marca las que tu clase/trasfondo te otorga
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {ABILITIES.map(({ key, label }) => {
            const saveKey = `save_prof_${key}` as SaveKey;
            const prof = saves[saveKey];
            const total = Math.floor((abilities[key] - 10) / 2) + (prof ? pb : 0);
            const totalStr = total >= 0 ? `+${total}` : `${total}`;
            return (
              <label key={key} style={{ ...s.checkbox, border: prof ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(201,168,76,0.1)" }}>
                <input type="checkbox" checked={prof} onChange={() => toggleSave(saveKey)} style={{ accentColor: "var(--gold)", width: 14, height: 14 }} />
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: prof ? "var(--parchment)" : "var(--text-muted)", flex: 1 }}>
                  {label}
                </span>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", color: "var(--gold)" }}>
                  {totalStr}
                </span>
              </label>
            );
          })}
        </div>

        {/* ── Habilidades ── */}
        <p style={s.section}>Habilidades</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem", marginBottom: "1.5rem" }}>
          {SKILLS.map(({ key, label, ability }) => {
            const prof = skills[key];
            const score = abilities[ability];
            const total = Math.floor((score - 10) / 2) + (prof ? pb : 0);
            const totalStr = total >= 0 ? `+${total}` : `${total}`;
            const abilityAbbr = ABILITIES.find(a => a.key === ability)?.abbr ?? "";
            return (
              <label key={key} style={{ ...s.checkbox, border: prof ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(201,168,76,0.08)" }}>
                <input type="checkbox" checked={prof} onChange={() => toggleSkill(key)} style={{ accentColor: "var(--gold)", width: 13, height: 13 }} />
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.62rem", color: prof ? "var(--parchment)" : "var(--text-muted)", flex: 1 }}>
                  {label}
                </span>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", color: "var(--text-muted)", marginRight: "0.3rem" }}>
                  ({abilityAbbr})
                </span>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", color: "var(--gold)" }}>
                  {totalStr}
                </span>
              </label>
            );
          })}
        </div>

        {/* ── Entrenamiento y Proficiencias ── */}
        <p style={s.section}>Entrenamiento y Proficiencias</p>

        <div style={{ marginBottom: "1.2rem" }}>
          <label style={s.label}>Entrenamiento con Armaduras</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" as const }}>
            {(["light", "medium", "heavy", "shields"] as const).map(type => {
              const labels = { light: "Ligera", medium: "Media", heavy: "Pesada", shields: "Escudos" };
              return (
                <label key={type} style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.4rem 0.8rem",
                  background: armorTraining[type] ? "rgba(201,168,76,0.15)" : "rgba(26,20,16,0.4)",
                  border: armorTraining[type] ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.1)",
                  cursor: "pointer",
                }}>
                  <input type="checkbox" checked={armorTraining[type]} onChange={() => setArmorTraining(prev => ({ ...prev, [type]: !prev[type] }))} style={{ accentColor: "var(--gold)" }} />
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: armorTraining[type] ? "var(--gold)" : "var(--text-muted)" }}>
                    {labels[type]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={s.label}>Armas</label>
            <input type="text" value={weaponProficiencies} onChange={e => setWeaponProficiencies(e.target.value)} placeholder="Armas simples, marciales..." style={s.input} />
          </div>
          <div>
            <label style={s.label}>Herramientas</label>
            <input type="text" value={toolProficiencies} onChange={e => setToolProficiencies(e.target.value)} placeholder="Instrumentos musicales..." style={s.input} />
          </div>
        </div>

        {/* ── Historia ── */}
        <p style={s.section}>Historia</p>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label style={{ ...s.label, marginBottom: 0 }}>Trasfondo (Historia del personaje)</label>
            {canGenerate && (
              <button
                type="button"
                onClick={handleGenerateBackstory}
                disabled={generatingBackstory}
                style={{
                  fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--ink)", background: generatingBackstory ? "var(--gold-dark)" : "var(--gold)",
                  border: "none", padding: "0.4rem 0.9rem",
                  cursor: generatingBackstory ? "not-allowed" : "pointer",
                }}
              >
                {generatingBackstory ? "Generando..." : "✨ Generar con IA"}
              </button>
            )}
          </div>
          {groqRemaining !== null && canGenerate && (
            <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              {groqRemaining} trasfondos disponibles este mes
            </p>
          )}
          {!canGenerate && (
            <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontStyle: "italic" }}>
              Límite mensual de trasfondos alcanzado.
            </p>
          )}
          {backstoryError && (
            <p style={{ fontSize: "0.8rem", color: "var(--blood-light)", marginBottom: "0.5rem", fontStyle: "italic" }}>{backstoryError}</p>
          )}
          <textarea value={background} onChange={e => setBackground(e.target.value)} rows={4} placeholder="¿De dónde viene tu personaje? ¿Qué lo motiva?..." style={{ ...s.input, resize: "vertical" as const, lineHeight: 1.7 }} />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={s.label}>Notas</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Aliados, secretos, rasgos de personalidad..." style={{ ...s.input, resize: "vertical" as const, lineHeight: 1.7 }} />
        </div>

        {error && <p style={{ fontSize: "0.85rem", color: "var(--blood-light)", marginBottom: "1rem", fontStyle: "italic" }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "1rem",
          background: loading ? "var(--gold-dark)" : "var(--gold)",
          border: "none", color: "var(--ink)",
          fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem",
          letterSpacing: "0.15em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s",
        }}>
          {loading ? "Forjando personaje..." : "Forjar Personaje"}
        </button>
      </form>
    </div>
  );
}
