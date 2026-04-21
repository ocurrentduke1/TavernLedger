"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { canGenerateBackstory, generateBackstoryWithGroq, getCurrentUsage } from "@/lib/groq";

type AbilityKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
type SkillKey =
  "skill_acrobatics" | "skill_animal_handling" | "skill_arcana" | "skill_athletics" |
  "skill_deception" | "skill_history" | "skill_insight" | "skill_intimidation" |
  "skill_investigation" | "skill_medicine" | "skill_nature" | "skill_perception" |
  "skill_performance" | "skill_persuasion" | "skill_religion" | "skill_sleight_of_hand" |
  "skill_stealth" | "skill_survival";
type SaveKey = "save_prof_strength" | "save_prof_dexterity" | "save_prof_constitution" |
  "save_prof_intelligence" | "save_prof_wisdom" | "save_prof_charisma";

type ClassFeature = {
  name: string;
  description: string;
  action_type: "action" | "bonus_action" | "reaction" | "limited" | "passive";
  limited_uses?: number;
};

type Character = {
  id: string;
  name: string;
  race: string | null;
  class: string | null;
  subclass: string | null;
  dnd_background: string | null;
  level: number;
  xp: number;
  ac: number;
  speed: number;
  size: string | null;
  shield: boolean;
  hp_current: number;
  hp_max: number;
  hp_temp: number;
  hit_dice: string | null;
  hit_dice_spent: number;
  death_saves_success: number;
  death_saves_failure: number;
  spell_slots_current: number;
  spell_slots_max: number;
  heroic_inspiration: boolean;
  strength: number; dexterity: number; constitution: number;
  intelligence: number; wisdom: number; charisma: number;
  save_prof_strength: boolean; save_prof_dexterity: boolean;
  save_prof_constitution: boolean; save_prof_intelligence: boolean;
  save_prof_wisdom: boolean; save_prof_charisma: boolean;
  skill_acrobatics: boolean; skill_animal_handling: boolean; skill_arcana: boolean;
  skill_athletics: boolean; skill_deception: boolean; skill_history: boolean;
  skill_insight: boolean; skill_intimidation: boolean; skill_investigation: boolean;
  skill_medicine: boolean; skill_nature: boolean; skill_perception: boolean;
  skill_performance: boolean; skill_persuasion: boolean; skill_religion: boolean;
  skill_sleight_of_hand: boolean; skill_stealth: boolean; skill_survival: boolean;
  armor_training: string | null;
  weapon_proficiencies: string | null;
  tool_proficiencies: string | null;
  class_features: ClassFeature[] | null;
  species_traits: string | null;
  feats: string | null;
  background: string | null;
  notes: string | null;
  campaign_id: string | null;
};

type Campaign = { id: string; name: string };

type InventoryItem = {
  id: string;
  character_id: string;
  name: string;
  type: string | null;
  damage: string | null;
  attack_bonus: string | null;
  weight: number | null;
  description: string | null;
  equipped: boolean;
};

const ABILITIES: { key: AbilityKey; label: string; abbr: string; saveKey: SaveKey }[] = [
  { key: "strength", label: "Fuerza", abbr: "FUE", saveKey: "save_prof_strength" },
  { key: "dexterity", label: "Destreza", abbr: "DES", saveKey: "save_prof_dexterity" },
  { key: "constitution", label: "Constitución", abbr: "CON", saveKey: "save_prof_constitution" },
  { key: "intelligence", label: "Inteligencia", abbr: "INT", saveKey: "save_prof_intelligence" },
  { key: "wisdom", label: "Sabiduría", abbr: "SAB", saveKey: "save_prof_wisdom" },
  { key: "charisma", label: "Carisma", abbr: "CAR", saveKey: "save_prof_charisma" },
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

const RACES = ["Humano","Elfo","Semielfo","Enano","Mediano","Gnomo","Semiorco","Tiefling","Dracónido","Aasimar","Tabaxi","Goliath","Kenku","Otro"];
const CLASSES = ["Bárbaro","Bardo","Clérigo","Druida","Guerrero","Monje","Paladín","Explorador","Pícaro","Hechicero","Brujo","Mago","Otro"];
const DND_BACKGROUNDS = ["Acólito","Artesano","Charlatán","Criminal","Erudito","Ermitaño","Forastero","Guardia","Marinero","Mercader","Noble","Proscrito","Sabio","Soldado","Viajante"];
const SIZES = ["Diminuto","Pequeño","Mediano","Grande","Enorme","Gargantuesco"];
const ITEM_TYPES = ["Arma","Armadura","Escudo","Mochila","Poción","Pergamino","Joya","Herramienta","Munición","Libro","Cantrip","Consumible","Otro"];
const ACTION_TYPES: { value: ClassFeature["action_type"]; label: string }[] = [
  { value: "action", label: "Acción" },
  { value: "bonus_action", label: "Acción Adicional" },
  { value: "reaction", label: "Reacción" },
  { value: "limited", label: "Usos Limitados" },
  { value: "passive", label: "Pasivo" },
];

function mod(score: number) { const m = Math.floor((score - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; }
function profBonus(level: number) { return Math.floor((level - 1) / 4) + 2; }
function skillTotal(score: number, prof: boolean, level: number) {
  const t = Math.floor((score - 10) / 2) + (prof ? profBonus(level) : 0);
  return t >= 0 ? `+${t}` : `${t}`;
}
function passivePerc(wisdom: number, prof: boolean, level: number) {
  return 10 + Math.floor((wisdom - 10) / 2) + (prof ? profBonus(level) : 0);
}

const defaultChar: Partial<Character> = {
  xp: 0, ac: 10, speed: 30, size: "Mediano", shield: false,
  hp_temp: 0, hit_dice: "d8", hit_dice_spent: 0,
  death_saves_success: 0, death_saves_failure: 0, heroic_inspiration: false,
  save_prof_strength: false, save_prof_dexterity: false, save_prof_constitution: false,
  save_prof_intelligence: false, save_prof_wisdom: false, save_prof_charisma: false,
  skill_acrobatics: false, skill_animal_handling: false, skill_arcana: false,
  skill_athletics: false, skill_deception: false, skill_history: false,
  skill_insight: false, skill_intimidation: false, skill_investigation: false,
  skill_medicine: false, skill_nature: false, skill_perception: false,
  skill_performance: false, skill_persuasion: false, skill_religion: false,
  skill_sleight_of_hand: false, skill_stealth: false, skill_survival: false,
  class_features: [],
};

export default function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [char, setChar] = useState<Character | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Character | null>(null);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState("");
  const [newItem, setNewItem] = useState({ name: "", type: "", damage: "", attack_bonus: "", weight: "", description: "", equipped: false });

  const [showAddFeatureForm, setShowAddFeatureForm] = useState(false);
  const [newFeature, setNewFeature] = useState<ClassFeature>({ name: "", description: "", action_type: "passive" });

  const [generatingBackstory, setGeneratingBackstory] = useState(false);
  const [backstoryError, setBackstoryError] = useState("");
  const [groqUsage, setGroqUsage] = useState<{ requestsRemaining?: number } | null>(null);
  const [canGenerate, setCanGenerate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const [{ data: charData, error: charError }, { data: campData }] = await Promise.all([
          supabase.from("characters").select("*").eq("id", id).eq("user_id", user.id).single(),
          supabase.from("campaigns").select("id, name").eq("dm_id", user.id).eq("status", "active"),
        ]);

        if (charError) {
          if (charError.code === "PGRST116") { router.push("/dashboard/characters"); return; }
          throw charError;
        }
        if (!charData) { router.push("/dashboard/characters"); return; }

        const merged = { ...defaultChar, ...charData } as Character;
        setChar(merged);
        setDraft(merged);
        setCampaigns(campData ?? []);

        const { data: invData } = await supabase.from("inventory").select("*")
          .eq("character_id", id).order("equipped", { ascending: false }).order("name");
        setInventory(invData ?? []);

        const canGen = await canGenerateBackstory(user.id);
        setCanGenerate(canGen.allowed);
        const usage = await getCurrentUsage(user.id);
        setGroqUsage(usage);
      } catch {
        setError("No se pudo cargar el personaje.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, supabase, router]);

  const setF = (field: keyof Character, value: unknown) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from("characters").update({
        name: draft.name, race: draft.race, class: draft.class,
        subclass: draft.subclass, dnd_background: draft.dnd_background,
        level: draft.level, xp: draft.xp,
        ac: draft.ac, speed: draft.speed, size: draft.size, shield: draft.shield,
        hp_current: draft.hp_current, hp_max: draft.hp_max, hp_temp: draft.hp_temp,
        hit_dice: draft.hit_dice, hit_dice_spent: draft.hit_dice_spent,
        death_saves_success: draft.death_saves_success, death_saves_failure: draft.death_saves_failure,
        spell_slots_current: draft.spell_slots_current, spell_slots_max: draft.spell_slots_max,
        heroic_inspiration: draft.heroic_inspiration,
        strength: draft.strength, dexterity: draft.dexterity, constitution: draft.constitution,
        intelligence: draft.intelligence, wisdom: draft.wisdom, charisma: draft.charisma,
        save_prof_strength: draft.save_prof_strength, save_prof_dexterity: draft.save_prof_dexterity,
        save_prof_constitution: draft.save_prof_constitution, save_prof_intelligence: draft.save_prof_intelligence,
        save_prof_wisdom: draft.save_prof_wisdom, save_prof_charisma: draft.save_prof_charisma,
        skill_acrobatics: draft.skill_acrobatics, skill_animal_handling: draft.skill_animal_handling,
        skill_arcana: draft.skill_arcana, skill_athletics: draft.skill_athletics,
        skill_deception: draft.skill_deception, skill_history: draft.skill_history,
        skill_insight: draft.skill_insight, skill_intimidation: draft.skill_intimidation,
        skill_investigation: draft.skill_investigation, skill_medicine: draft.skill_medicine,
        skill_nature: draft.skill_nature, skill_perception: draft.skill_perception,
        skill_performance: draft.skill_performance, skill_persuasion: draft.skill_persuasion,
        skill_religion: draft.skill_religion, skill_sleight_of_hand: draft.skill_sleight_of_hand,
        skill_stealth: draft.skill_stealth, skill_survival: draft.skill_survival,
        armor_training: draft.armor_training, weapon_proficiencies: draft.weapon_proficiencies,
        tool_proficiencies: draft.tool_proficiencies,
        class_features: draft.class_features ?? [],
        species_traits: draft.species_traits, feats: draft.feats,
        background: draft.background, notes: draft.notes,
        campaign_id: draft.campaign_id || null,
      }).eq("id", id).eq("user_id", user?.id);

      if (err) { setError("No se pudieron guardar los cambios."); return; }
      setChar(draft);
      setEditing(false);
    } catch { setError("Ocurrió un error al guardar."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!char || !confirm(`¿Eliminar a "${char.name}" permanentemente?`)) return;
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { error: err } = await supabase.from("characters").delete().eq("id", id).eq("user_id", user.id);
      if (err) { setError("No se pudo eliminar el personaje."); return; }
      router.push("/dashboard/characters");
    } catch { setError("Ocurrió un error al eliminar."); }
    finally { setDeleting(false); }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !char) { setItemError("El nombre del item es requerido."); return; }
    setSavingItem(true); setItemError("");
    try {
      const { data: item, error: err } = await supabase.from("inventory").insert({
        character_id: char.id, name: newItem.name,
        type: newItem.type || null, damage: newItem.damage || null,
        attack_bonus: newItem.attack_bonus || null,
        weight: newItem.weight ? Number(newItem.weight) : null,
        description: newItem.description || null, equipped: newItem.equipped,
      }).select().single();
      if (err) { setItemError("No se pudo añadir el item."); return; }
      setInventory(prev => [item, ...prev].sort((a, b) => {
        if (b.equipped !== a.equipped) return b.equipped ? 1 : -1;
        return a.name.localeCompare(b.name);
      }));
      setNewItem({ name: "", type: "", damage: "", attack_bonus: "", weight: "", description: "", equipped: false });
      setShowAddItemForm(false);
    } catch { setItemError("Ocurrió un error."); }
    finally { setSavingItem(false); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("¿Eliminar este item?")) return;
    const { error: err } = await supabase.from("inventory").delete().eq("id", itemId).eq("character_id", char?.id);
    if (!err) setInventory(prev => prev.filter(i => i.id !== itemId));
  };

  const handleToggleEquipped = async (itemId: string, current: boolean) => {
    const { error: err } = await supabase.from("inventory").update({ equipped: !current }).eq("id", itemId);
    if (!err) setInventory(prev => prev.map(i => i.id === itemId ? { ...i, equipped: !current } : i)
      .sort((a, b) => { if (b.equipped !== a.equipped) return b.equipped ? 1 : -1; return a.name.localeCompare(b.name); }));
  };

  const handleGenerateBackstory = async () => {
    if (!char) return;
    setGeneratingBackstory(true); setBackstoryError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setBackstoryError("Debes estar autenticado."); return; }
      const result = await generateBackstoryWithGroq(user.id, char.name, char.class, char.race, char.level);
      if (result.backstory) {
        setF("background", result.backstory);
        setChar(prev => prev ? { ...prev, background: result.backstory } : prev);
        await supabase.from("characters").update({ background: result.backstory }).eq("id", id).eq("user_id", user.id);
        const usage = await getCurrentUsage(user.id);
        setGroqUsage(usage);
      }
    } catch (err: unknown) {
      setBackstoryError(err instanceof Error ? err.message : "Error al generar trasfondo.");
    } finally { setGeneratingBackstory(false); }
  };

  const addFeature = () => {
    if (!newFeature.name.trim()) return;
    const features = [...(draft?.class_features ?? []), newFeature];
    setF("class_features", features);
    setNewFeature({ name: "", description: "", action_type: "passive" });
    setShowAddFeatureForm(false);
  };

  const removeFeature = (idx: number) => {
    const features = (draft?.class_features ?? []).filter((_, i) => i !== idx);
    setF("class_features", features);
  };

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem" }}>
        Cargando hoja de personaje...
      </p>
    </div>
  );
  if (!char || !draft) return null;

  const pb = profBonus(char.level);
  const hpRatio = char.hp_max > 0 ? char.hp_current / char.hp_max : 0;
  const hpColor = hpRatio > 0.5 ? "var(--gold)" : hpRatio > 0.25 ? "#e6a020" : "var(--blood-light)";
  const initiative = mod(char.dexterity);
  const passPerc = passivePerc(char.wisdom, char.skill_perception, char.level);

  const iStyle = {
    width: "100%", padding: "0.45rem 0.65rem",
    background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,168,76,0.25)",
    color: "var(--parchment)", fontFamily: "var(--font-crimson), serif",
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box" as const,
  };
  const lStyle = {
    display: "block", fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase" as const,
    color: "var(--gold)", marginBottom: "0.3rem",
  };
  const secStyle = {
    fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem",
    letterSpacing: "0.3em", textTransform: "uppercase" as const,
    color: "var(--text-muted)", borderBottom: "1px solid rgba(201,168,76,0.1)",
    paddingBottom: "0.5rem", marginBottom: "1rem", marginTop: "1.8rem",
  };
  const statBox = {
    background: "rgba(26,20,16,0.6)", border: "1px solid rgba(201,168,76,0.12)",
    padding: "0.8rem 0.6rem", textAlign: "center" as const,
  };

  return (
    <div style={{ padding: "2.5rem", maxWidth: 1100 }}>

      {/* Back */}
      <Link href="/dashboard/characters" style={{
        fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem",
        letterSpacing: "0.1em", color: "var(--text-muted)", textDecoration: "none",
        textTransform: "uppercase", display: "inline-block", marginBottom: "1.5rem",
      }}>
        ← Volver a Personajes
      </Link>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>
            {[char.race, char.class, char.subclass].filter(Boolean).join(" · ") || "Aventurero"}
          </p>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--parchment)", lineHeight: 1.2, marginBottom: "0.25rem" }}>
            {char.name}
          </h1>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            Nivel {char.level} · {char.dnd_background ?? "Sin trasfondo"} · XP {char.xp}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0 }}>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDraft(char); setError(""); }} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--parchment-deeper)", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", padding: "0.6rem 1.2rem", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)", background: saving ? "var(--gold-dark)" : "var(--gold)", border: "none", padding: "0.6rem 1.2rem", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} disabled={deleting} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blood-light)", background: "transparent", border: "1px solid rgba(180,40,40,0.3)", padding: "0.6rem 1.2rem", cursor: "pointer" }}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
              <button onClick={() => setEditing(true)} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)", background: "var(--gold)", border: "none", padding: "0.6rem 1.2rem", cursor: "pointer" }}>
                Editar
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p style={{ fontSize: "0.85rem", color: "var(--blood-light)", marginBottom: "1.2rem", fontStyle: "italic" }}>{error}</p>}

      {/* ── Combat Bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 160px 160px", gap: "0.6rem", marginBottom: "1.5rem", alignItems: "stretch" }}>

        {/* AC */}
        <div style={{ ...statBox, position: "relative" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>CA</div>
          {editing
            ? <input type="number" min={1} max={30} value={draft.ac} onChange={e => setF("ac", Math.max(1, Number(e.target.value)))} style={{ ...iStyle, textAlign: "center", fontSize: "1.4rem", fontFamily: "var(--font-cinzel), serif", padding: "0.2rem" }} />
            : <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", color: "var(--parchment)", lineHeight: 1 }}>{char.ac}</div>
          }
          {editing && (
            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem", cursor: "pointer", justifyContent: "center" }}>
              <input type="checkbox" checked={draft.shield} onChange={e => setF("shield", e.target.checked)} style={{ accentColor: "var(--gold)" }} />
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", color: "var(--text-muted)" }}>ESCUDO</span>
            </label>
          )}
          {!editing && char.shield && <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", color: "var(--gold)", marginTop: "0.3rem" }}>+ ESCUDO</div>}
        </div>

        {/* Heroic Inspiration */}
        <div style={{ ...statBox }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>Inspiración</div>
          <button
            onClick={() => editing ? setF("heroic_inspiration", !draft.heroic_inspiration) : undefined}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: (editing ? draft.heroic_inspiration : char.heroic_inspiration) ? "var(--gold)" : "rgba(201,168,76,0.1)",
              border: "2px solid rgba(201,168,76,0.4)", color: (editing ? draft.heroic_inspiration : char.heroic_inspiration) ? "var(--ink)" : "var(--text-muted)",
              fontSize: "1.2rem", cursor: editing ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
            }}
          >
            ✦
          </button>
        </div>

        {/* HP */}
        <div style={{ background: "rgba(26,20,16,0.6)", border: "1px solid rgba(201,168,76,0.12)", padding: "0.8rem 1rem" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>Puntos de Vida</div>
          {editing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem" }}>
              {([["hp_current","Actual",0], ["hp_max","Máximo",1], ["hp_temp","Temporal",0], ["spell_slots_current","Conjuros",0]] as const).map(([field, label, min]) => (
                <div key={field}>
                  <label style={{ ...lStyle, fontSize: "0.5rem" }}>{label}</label>
                  <input type="number" min={min} value={draft[field as keyof Character] as number} onChange={e => setF(field, Math.max(min, Number(e.target.value)))} style={{ ...iStyle, textAlign: "center", padding: "0.3rem" }} />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", color: hpColor, lineHeight: 1 }}>{char.hp_current}</span>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>/ {char.hp_max}</span>
                {char.hp_temp > 0 && <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", color: "#6ab7ff" }}>+{char.hp_temp} temp</span>}
                {char.spell_slots_max > 0 && <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>· {char.spell_slots_current}/{char.spell_slots_max} conjuros</span>}
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, hpRatio * 100)}%`, background: hpColor, transition: "width 0.3s" }} />
              </div>
            </div>
          )}
        </div>

        {/* Hit Dice */}
        <div style={{ ...statBox }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>Dados de Golpe</div>
          {editing ? (
            <div>
              <select value={draft.hit_dice ?? "d8"} onChange={e => setF("hit_dice", e.target.value)} style={{ ...iStyle, textAlign: "center", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                {["d6","d8","d10","d12"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                <label style={{ ...lStyle, fontSize: "0.5rem", marginBottom: 0 }}>Gastados</label>
                <input type="number" min={0} max={char.level} value={draft.hit_dice_spent} onChange={e => setF("hit_dice_spent", Math.max(0, Number(e.target.value)))} style={{ ...iStyle, width: 48, textAlign: "center", padding: "0.2rem" }} />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", color: "var(--parchment)", lineHeight: 1 }}>{char.level}{char.hit_dice}</div>
              {char.hit_dice_spent > 0 && <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{char.hit_dice_spent} gastados</div>}
            </div>
          )}
        </div>

        {/* Death Saves */}
        <div style={{ ...statBox }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>Tiradas de Muerte</div>
          {(["death_saves_success", "death_saves_failure"] as const).map((field, fi) => (
            <div key={field} style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.3rem" }}>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", color: fi === 0 ? "var(--gold)" : "var(--blood-light)", width: 28 }}>{fi === 0 ? "Éxito" : "Fallo"}</span>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[0,1,2].map(i => {
                  const val = editing ? (draft[field] as number) : (char[field] as number);
                  return (
                    <div key={i} onClick={() => editing && setF(field, val > i ? i : i + 1)} style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: i < val ? (fi === 0 ? "var(--gold)" : "var(--blood-light)") : "rgba(255,255,255,0.1)",
                      border: `1px solid ${fi === 0 ? "rgba(201,168,76,0.4)" : "rgba(180,40,40,0.4)"}`,
                      cursor: editing ? "pointer" : "default",
                    }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Sheet ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1rem", alignItems: "start" }}>

        {/* LEFT COLUMN: Ability Scores + Skills */}
        <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.2rem" }}>

          {/* Proficiency Bonus */}
          <div style={{ textAlign: "center", marginBottom: "1.2rem", padding: "0.8rem", background: "rgba(26,20,16,0.4)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>Bono de Proficiencia</div>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.8rem", color: "var(--parchment)" }}>+{pb}</div>
          </div>

          {/* Ability Scores */}
          <p style={{ ...secStyle, marginTop: "0" }}>Características</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            {ABILITIES.map(({ key, label, abbr, saveKey }) => {
              const score = editing ? draft[key] : char[key];
              const saveProf = editing ? draft[saveKey] : char[saveKey];
              const saveTotal = Math.floor((score - 10) / 2) + (saveProf ? pb : 0);
              const saveTotalStr = saveTotal >= 0 ? `+${saveTotal}` : `${saveTotal}`;
              return (
                <div key={key} style={{ background: "rgba(26,20,16,0.5)", border: "1px solid rgba(201,168,76,0.1)", padding: "0.6rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", width: 28 }}>{abbr}</div>
                    {editing ? (
                      <input type="number" min={1} max={20} value={draft[key]} onChange={e => setF(key, Math.min(20, Math.max(1, Number(e.target.value) || 10)))} title={label} style={{ ...iStyle, textAlign: "center", fontSize: "1.1rem", padding: "0.2rem", fontFamily: "var(--font-cinzel), serif", width: 52 }} />
                    ) : (
                      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", color: "var(--parchment)", lineHeight: 1 }}>{char[key]}</span>
                    )}
                    <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", color: "var(--parchment-deeper)" }}>{mod(score)}</span>
                    <div style={{ flex: 1 }} />
                    {/* Saving throw */}
                    <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: editing ? "pointer" : "default" }}>
                      {editing
                        ? <input type="checkbox" checked={draft[saveKey]} onChange={() => setF(saveKey, !draft[saveKey])} style={{ accentColor: "var(--gold)", width: 12, height: 12 }} />
                        : <div style={{ width: 10, height: 10, borderRadius: "50%", background: char[saveKey] ? "var(--gold)" : "transparent", border: "1px solid rgba(201,168,76,0.5)" }} />
                      }
                      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", color: "var(--text-muted)" }}>SAV {saveTotalStr}</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skills */}
          <p style={secStyle}>Habilidades</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
            {SKILLS.map(({ key, label, ability }) => {
              const score = editing ? draft[ability] : char[ability];
              const prof = editing ? draft[key] : char[key];
              const total = skillTotal(score, prof, editing ? draft.level : char.level);
              const abb = ABILITIES.find(a => a.key === ability)?.abbr ?? "";
              return (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.4rem", cursor: editing ? "pointer" : "default", background: prof ? "rgba(201,168,76,0.06)" : "transparent" }}>
                  {editing
                    ? <input type="checkbox" checked={draft[key]} onChange={() => setF(key, !draft[key])} style={{ accentColor: "var(--gold)", width: 12, height: 12 }} />
                    : <div style={{ width: 10, height: 10, borderRadius: "50%", background: char[key] ? "var(--gold)" : "transparent", border: "1px solid rgba(201,168,76,0.4)", flexShrink: 0 }} />
                  }
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", color: prof ? "var(--parchment)" : "var(--parchment-deeper)", flex: 1 }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", color: "var(--text-muted)" }}>({abb})</span>
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", color: "var(--gold)", minWidth: 24, textAlign: "right" }}>{total}</span>
                </label>
              );
            })}
          </div>

          {/* Equipment Training */}
          <p style={secStyle}>Entrenamiento</p>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div>
                <label style={lStyle}>Armaduras</label>
                <input type="text" value={draft.armor_training ?? ""} onChange={e => setF("armor_training", e.target.value || null)} placeholder="Ligera, Media..." style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Armas</label>
                <input type="text" value={draft.weapon_proficiencies ?? ""} onChange={e => setF("weapon_proficiencies", e.target.value || null)} placeholder="Simples, marciales..." style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Herramientas</label>
                <input type="text" value={draft.tool_proficiencies ?? ""} onChange={e => setF("tool_proficiencies", e.target.value || null)} placeholder="Instrumentos..." style={iStyle} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {[["Armaduras", char.armor_training], ["Armas", char.weapon_proficiencies], ["Herramientas", char.tool_proficiencies]].map(([label, val]) => (
                <div key={label as string}>
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>{label}: </span>
                  <span style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.85rem", color: val ? "var(--parchment-deeper)" : "var(--text-muted)" }}>{val ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Combat Stats Row */}
          <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem" }}>
              {/* Initiative */}
              <div style={statBox}>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>Iniciativa</div>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", color: "var(--parchment)", lineHeight: 1 }}>{initiative}</div>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>DES {mod(char.dexterity)}</div>
              </div>

              {/* Speed */}
              <div style={statBox}>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>Velocidad</div>
                {editing
                  ? <input type="number" min={0} max={200} step={5} value={draft.speed} onChange={e => setF("speed", Math.max(0, Number(e.target.value)))} style={{ ...iStyle, textAlign: "center", fontSize: "1.1rem", fontFamily: "var(--font-cinzel), serif", padding: "0.2rem" }} />
                  : <><div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", color: "var(--parchment)", lineHeight: 1 }}>{char.speed}</div><div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>pies</div></>
                }
              </div>

              {/* Size */}
              <div style={statBox}>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>Tamaño</div>
                {editing
                  ? <select value={draft.size ?? "Mediano"} onChange={e => setF("size", e.target.value)} style={{ ...iStyle, textAlign: "center", fontSize: "0.75rem" }}>
                      {SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                  : <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "var(--parchment)" }}>{char.size ?? "Mediano"}</div>
                }
              </div>

              {/* Passive Perception */}
              <div style={statBox}>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>Percepción Pasiva</div>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", color: "var(--parchment)", lineHeight: 1 }}>{passPerc}</div>
                <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.5rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>10 + SAB{char.skill_perception ? " + prof" : ""}</div>
              </div>
            </div>

            {/* Identity edit fields */}
            {editing && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.6rem", marginTop: "1rem" }}>
                <div><label style={lStyle}>Nombre</label><input type="text" value={draft.name} onChange={e => setF("name", e.target.value)} required style={iStyle} /></div>
                <div><label style={lStyle}>Especie</label><select value={draft.race ?? ""} onChange={e => setF("race", e.target.value || null)} style={iStyle}><option value="">—</option>{RACES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label style={lStyle}>Clase</label><select value={draft.class ?? ""} onChange={e => setF("class", e.target.value || null)} style={iStyle}><option value="">—</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={lStyle}>Subclase</label><input type="text" value={draft.subclass ?? ""} onChange={e => setF("subclass", e.target.value || null)} style={iStyle} /></div>
                <div><label style={lStyle}>Trasfondo D&D</label><select value={draft.dnd_background ?? ""} onChange={e => setF("dnd_background", e.target.value || null)} style={iStyle}><option value="">—</option>{DND_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                <div><label style={lStyle}>Nivel</label><input type="number" min={1} max={20} value={draft.level} onChange={e => setF("level", Math.min(20, Math.max(1, Number(e.target.value))))} style={iStyle} /></div>
                <div><label style={lStyle}>XP</label><input type="number" min={0} value={draft.xp} onChange={e => setF("xp", Math.max(0, Number(e.target.value)))} style={iStyle} /></div>
                <div><label style={lStyle}>Campaña</label><select value={draft.campaign_id ?? ""} onChange={e => setF("campaign_id", e.target.value || null)} style={iStyle}><option value="">— Sin campaña —</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
            )}
          </div>

          {/* Weapons & Damage Cantrips */}
          <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.2rem" }}>
            <p style={{ ...secStyle, marginTop: 0 }}>Armas y Cantrips de Daño</p>

            {inventory.filter(i => i.type === "Arma" || i.type === "Cantrip").length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0.8rem" }}>
                <thead>
                  <tr>
                    {["Nombre", "Bon. Ataque / CD", "Daño", "Notas"].map(h => (
                      <th key={h} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", textAlign: "left", padding: "0.3rem 0.5rem", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.filter(i => i.type === "Arma" || i.type === "Cantrip").map(item => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.9rem", color: "var(--parchment)", padding: "0.3rem 0.5rem" }}>{item.name}</td>
                      <td style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", color: "var(--parchment-deeper)", padding: "0.3rem 0.5rem" }}>{item.attack_bonus ?? "—"}</td>
                      <td style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", color: "var(--parchment-deeper)", padding: "0.3rem 0.5rem" }}>{item.damage ?? "—"}</td>
                      <td style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.3rem 0.5rem" }}>{item.description ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.8rem" }}>Sin armas registradas. Añade items de tipo "Arma" en el inventario.</p>
            )}
          </div>

          {/* Class Features */}
          <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.2rem" }}>
            <p style={{ ...secStyle, marginTop: 0 }}>Rasgos de Clase</p>

            {(editing ? draft.class_features : char.class_features)?.map((feat, idx) => (
              <div key={idx} style={{ padding: "0.6rem 0.8rem", background: "rgba(26,20,16,0.4)", border: "1px solid rgba(201,168,76,0.1)", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.85rem", color: "var(--parchment)", flex: 1 }}>{feat.name}</span>
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.52rem", color: "var(--gold)", padding: "0.15rem 0.4rem", border: "1px solid rgba(201,168,76,0.3)" }}>
                    {ACTION_TYPES.find(a => a.value === feat.action_type)?.label ?? feat.action_type}
                    {feat.action_type === "limited" && feat.limited_uses ? ` (${feat.limited_uses}x)` : ""}
                  </span>
                  {editing && <button onClick={() => removeFeature(idx)} style={{ background: "none", border: "none", color: "var(--blood-light)", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>}
                </div>
                {feat.description && <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.85rem", color: "var(--parchment-deeper)", lineHeight: 1.6, margin: 0 }}>{feat.description}</p>}
              </div>
            ))}

            {editing && (
              showAddFeatureForm ? (
                <div style={{ padding: "0.8rem", background: "rgba(26,20,16,0.5)", border: "1px solid rgba(201,168,76,0.15)", marginTop: "0.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div><label style={lStyle}>Nombre</label><input type="text" value={newFeature.name} onChange={e => setNewFeature(f => ({ ...f, name: e.target.value }))} style={iStyle} /></div>
                    <div>
                      <label style={lStyle}>Tipo de Acción</label>
                      <select value={newFeature.action_type} onChange={e => setNewFeature(f => ({ ...f, action_type: e.target.value as ClassFeature["action_type"] }))} style={iStyle}>
                        {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    {newFeature.action_type === "limited" && (
                      <div><label style={lStyle}>Usos</label><input type="number" min={1} value={newFeature.limited_uses ?? 1} onChange={e => setNewFeature(f => ({ ...f, limited_uses: Number(e.target.value) }))} style={iStyle} /></div>
                    )}
                    <div style={{ gridColumn: newFeature.action_type === "limited" ? "2" : "1 / -1" }}>
                      <label style={lStyle}>Descripción</label>
                      <textarea value={newFeature.description} onChange={e => setNewFeature(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...iStyle, resize: "vertical" as const }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setShowAddFeatureForm(false)} style={{ flex: 1, padding: "0.4rem", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", color: "var(--text-muted)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", cursor: "pointer" }}>Cancelar</button>
                    <button onClick={addFeature} style={{ flex: 1, padding: "0.4rem", background: "var(--gold)", border: "none", color: "var(--ink)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", cursor: "pointer" }}>Añadir</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddFeatureForm(true)} style={{ width: "100%", padding: "0.5rem", background: "rgba(201,168,76,0.08)", border: "1px dashed rgba(201,168,76,0.3)", color: "var(--gold)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", cursor: "pointer", textTransform: "uppercase" }}>
                  + Añadir Rasgo
                </button>
              )
            )}
          </div>

          {/* Species Traits & Feats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.2rem" }}>
              <p style={{ ...secStyle, marginTop: 0 }}>Rasgos de Especie</p>
              {editing
                ? <textarea value={draft.species_traits ?? ""} onChange={e => setF("species_traits", e.target.value || null)} rows={5} placeholder="Visión en la oscuridad, resistencias..." style={{ ...iStyle, resize: "vertical" as const, lineHeight: 1.6 }} />
                : <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.9rem", color: char.species_traits ? "var(--parchment-deeper)" : "var(--text-muted)", lineHeight: 1.7, fontStyle: char.species_traits ? "normal" : "italic" }}>{char.species_traits ?? "Sin rasgos registrados."}</p>
              }
            </div>
            <div style={{ background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.2rem" }}>
              <p style={{ ...secStyle, marginTop: 0 }}>Dotes</p>
              {editing
                ? <textarea value={draft.feats ?? ""} onChange={e => setF("feats", e.target.value || null)} rows={5} placeholder="Alert, Lucky, Sentinel..." style={{ ...iStyle, resize: "vertical" as const, lineHeight: 1.6 }} />
                : <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.9rem", color: char.feats ? "var(--parchment-deeper)" : "var(--text-muted)", lineHeight: 1.7, fontStyle: char.feats ? "normal" : "italic" }}>{char.feats ?? "Sin dotes registradas."}</p>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Inventory ── */}
      <div style={{ marginTop: "1rem", background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.5rem" }}>
        <p style={{ ...secStyle, marginTop: 0 }}>Equipo e Inventario</p>

        {itemError && <p style={{ fontSize: "0.85rem", color: "var(--blood-light)", marginBottom: "1rem", fontStyle: "italic" }}>{itemError}</p>}

        {inventory.length > 0 ? (
          <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {inventory.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.7rem 0.9rem", background: "rgba(26,20,16,0.6)", border: `1px solid ${item.equipped ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.08)"}` }}>
                <button onClick={() => handleToggleEquipped(item.id, item.equipped)} style={{ width: 28, height: 28, background: item.equipped ? "var(--gold)" : "rgba(201,168,76,0.1)", border: `1px solid ${item.equipped ? "var(--gold)" : "rgba(201,168,76,0.2)"}`, color: item.equipped ? "var(--ink)" : "var(--parchment-deeper)", cursor: "pointer", fontSize: "0.75rem" }}>
                  {item.equipped ? "✓" : "—"}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.9rem", color: "var(--parchment)" }}>{item.name}</div>
                  <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.58rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                    {[item.type, item.attack_bonus && `Atk ${item.attack_bonus}`, item.damage && `${item.damage} daño`, item.weight && `${item.weight} kg`].filter(Boolean).join(" · ")}
                  </div>
                  {item.description && <div style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.78rem", color: "var(--parchment-deeper)", fontStyle: "italic", marginTop: "0.2rem" }}>{item.description}</div>}
                </div>
                <button onClick={() => handleDeleteItem(item.id)} style={{ background: "transparent", border: "none", color: "var(--blood-light)", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>Sin items. ¡Empieza a equiparte!</p>
        )}

        {showAddItemForm ? (
          <div style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,168,76,0.2)", padding: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.7rem", marginBottom: "0.7rem" }}>
              <div><label style={lStyle}>Nombre *</label><input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Espada larga..." style={iStyle} /></div>
              <div><label style={lStyle}>Tipo</label><select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} style={iStyle}><option value="">—</option>{ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label style={lStyle}>Bon. de Ataque / CD</label><input type="text" value={newItem.attack_bonus} onChange={e => setNewItem({ ...newItem, attack_bonus: e.target.value })} placeholder="+5 o CD 14" style={iStyle} /></div>
              <div><label style={lStyle}>Daño</label><input type="text" value={newItem.damage} onChange={e => setNewItem({ ...newItem, damage: e.target.value })} placeholder="1d8+3" style={iStyle} /></div>
              <div><label style={lStyle}>Peso (kg)</label><input type="number" step="0.1" value={newItem.weight} onChange={e => setNewItem({ ...newItem, weight: e.target.value })} placeholder="2.5" style={iStyle} /></div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={newItem.equipped} onChange={e => setNewItem({ ...newItem, equipped: e.target.checked })} style={{ accentColor: "var(--gold)", width: 15, height: 15 }} />
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: "var(--parchment)" }}>Equipado</span>
                </label>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lStyle}>Descripción / Notas</label>
                <textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} rows={2} style={{ ...iStyle, resize: "vertical" as const }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => { setShowAddItemForm(false); setNewItem({ name: "", type: "", damage: "", attack_bonus: "", weight: "", description: "", equipped: false }); setItemError(""); }} style={{ flex: 1, padding: "0.55rem", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", color: "var(--parchment-deeper)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", cursor: "pointer", textTransform: "uppercase" }}>Cancelar</button>
              <button onClick={handleAddItem} disabled={savingItem} style={{ flex: 1, padding: "0.55rem", background: savingItem ? "var(--gold-dark)" : "var(--gold)", border: "none", color: "var(--ink)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", cursor: savingItem ? "not-allowed" : "pointer", textTransform: "uppercase" }}>{savingItem ? "Añadiendo..." : "Añadir Item"}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddItemForm(true)} style={{ width: "100%", padding: "0.6rem", background: "rgba(201,168,76,0.08)", border: "1px dashed rgba(201,168,76,0.3)", color: "var(--gold)", fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}>
            + Añadir Item
          </button>
        )}
      </div>

      {/* ── Historia ── */}
      <div style={{ marginTop: "1rem", background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.12)", padding: "1.5rem" }}>
        <p style={{ ...secStyle, marginTop: 0 }}>Historia</p>

        {editing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <label style={lStyle}>Historia del personaje</label>
                {canGenerate && (
                  <button
                    type="button"
                    onClick={handleGenerateBackstory}
                    disabled={generatingBackstory}
                    style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)", background: generatingBackstory ? "var(--gold-dark)" : "var(--gold)", border: "none", padding: "0.3rem 0.7rem", cursor: generatingBackstory ? "not-allowed" : "pointer" }}
                  >
                    {generatingBackstory ? "Generando..." : "✨ Generar con IA"}
                  </button>
                )}
              </div>
              {groqUsage && canGenerate && (
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.58rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  {groqUsage.requestsRemaining ?? 30} trasfondos disponibles
                </p>
              )}
              {!canGenerate && (
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.58rem", color: "var(--text-muted)", marginBottom: "0.3rem", fontStyle: "italic" }}>
                  Límite mensual alcanzado.
                </p>
              )}
              {backstoryError && <p style={{ fontSize: "0.8rem", color: "var(--blood-light)", marginBottom: "0.4rem", fontStyle: "italic" }}>{backstoryError}</p>}
              <textarea value={draft.background ?? ""} onChange={e => setF("background", e.target.value || null)} rows={6} placeholder="¿De dónde viene tu personaje?..." style={{ ...iStyle, resize: "vertical" as const, lineHeight: 1.7 }} />
            </div>
            <div><label style={lStyle}>Notas</label><textarea value={draft.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={6} placeholder="Aliados, secretos, objetivos..." style={{ ...iStyle, resize: "vertical" as const, lineHeight: 1.7 }} /></div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: char.background && char.notes ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
            {char.background && (
              <div>
                <p style={{ ...lStyle, marginBottom: "0.5rem" }}>Historia del personaje</p>
                <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "1rem", lineHeight: 1.8, color: "var(--parchment-deeper)", fontStyle: "italic" }}>{char.background}</p>
              </div>
            )}
            {char.notes && (
              <div>
                <p style={{ ...lStyle, marginBottom: "0.5rem" }}>Notas</p>
                <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "1rem", lineHeight: 1.7, color: "var(--parchment-deeper)" }}>{char.notes}</p>
              </div>
            )}
            {!char.background && !char.notes && (
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem" }}>Sin historia registrada. Haz clic en Editar para añadir una.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
