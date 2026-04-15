"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { canGenerateBackstory, generateBackstoryWithGroq, getCurrentUsage } from "@/lib/groq";

type AbilityKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

const ABILITIES: { key: AbilityKey; label: string; abbr: string }[] = [
  { key: "strength",     label: "Fuerza",       abbr: "FUE" },
  { key: "dexterity",    label: "Destreza",      abbr: "DES" },
  { key: "constitution", label: "Constitución",  abbr: "CON" },
  { key: "intelligence", label: "Inteligencia",  abbr: "INT" },
  { key: "wisdom",       label: "Sabiduría",     abbr: "SAB" },
  { key: "charisma",     label: "Carisma",       abbr: "CAR" },
];

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

const ITEM_TYPES = [
  "Arma", "Armadura", "Escudo", "Mochila", "Poción", "Pergamino",
  "Joya", "Herramienta", "Munición", "Libro", "Cantrip", "Consumible", "Otro",
];

type Character = {
  id: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  hp_current: number;
  hp_max: number;
  spell_slots_current: number;
  spell_slots_max: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
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
  weight: number | null;
  description: string | null;
  equipped: boolean;
};

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

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

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState("");

  // Groq AI state
  const [generatingBackstory, setGeneratingBackstory] = useState(false);
  const [backstoryError, setBackstoryError] = useState("");
  const [groqUsage, setGroqUsage] = useState<any>(null);
  const [canGenerate, setCanGenerate] = useState(false);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: "",
    type: "",
    damage: "",
    weight: "",
    description: "",
    equipped: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const [{ data: charData, error: charError }, { data: campData, error: campError }] = await Promise.all([
          supabase.from("characters").select("*").eq("id", id).eq("user_id", user.id).single(),
          supabase.from("campaigns").select("id, name").eq("dm_id", user.id).eq("status", "active"),
        ]);

        if (charError) {
          if (charError.code === "PGRST116") {
            router.push("/dashboard/characters");
            return;
          }
          throw charError;
        }

        if (!charData) {
          router.push("/dashboard/characters");
          return;
        }

        setChar(charData);
        setDraft(charData);
        setCampaigns(campData ?? []);

        // Fetch inventory
        const { data: invData, error: invError } = await supabase
          .from("inventory")
          .select("*")
          .eq("character_id", id)
          .order("equipped", { ascending: false })
          .order("name");

        if (invError) {
          console.error("Error fetching inventory:", invError);
        }

        setInventory(invData ?? []);
      } catch (err) {
        console.error("Error loading character:", err);
        setError("No se pudo cargar el personaje.");
      } finally {
        setLoading(false);
      }

      // Check Groq availability
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const canGen = await canGenerateBackstory(user.id);
        setCanGenerate(canGen.allowed);
        const usage = await getCurrentUsage(user.id);
        setGroqUsage(usage);
      }
    };
    fetchData();
  }, [id, supabase, router]);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("characters")
        .update({
          name: draft.name,
          race: draft.race,
          class: draft.class,
          level: draft.level,
          hp_current: draft.hp_current,
          hp_max: draft.hp_max,
          spell_slots_current: draft.spell_slots_current,
          spell_slots_max: draft.spell_slots_max,
          strength: draft.strength,
          dexterity: draft.dexterity,
          constitution: draft.constitution,
          intelligence: draft.intelligence,
          wisdom: draft.wisdom,
          charisma: draft.charisma,
          background: draft.background,
          notes: draft.notes,
          campaign_id: draft.campaign_id || null,
        })
        .eq("id", id)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (err) {
        setError("No se pudieron guardar los cambios.");
        console.error("Update error:", err);
        setSaving(false);
        return;
      }

      setChar(draft);
      setEditing(false);
      setSaving(false);
    } catch (err) {
      setError("Ocurrió un error al guardar.");
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!char) return;
    if (!confirm(`¿Eliminar a "${char.name}" permanentemente?`)) return;

    setDeleting(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: charToDelete } = await supabase
        .from("characters")
        .select("user_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!charToDelete) {
        setError("No tienes permiso para eliminar este personaje.");
        setDeleting(false);
        return;
      }

      const { error: err } = await supabase
        .from("characters")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (err) {
        setError("No se pudo eliminar el personaje.");
        console.error("Delete error:", err);
        setDeleting(false);
        return;
      }

      router.push("/dashboard/characters");
    } catch (err) {
      setError("Ocurrió un error al eliminar.");
      console.error(err);
      setDeleting(false);
    }
  };

  // Inventory handlers
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !char) {
      setItemError("El nombre del item es requerido.");
      return;
    }

    setSavingItem(true);
    setItemError("");

    try {
      const { data: item, error: err } = await supabase
        .from("inventory")
        .insert({
          character_id: char.id,
          name: newItem.name,
          type: newItem.type || null,
          damage: newItem.damage || null,
          weight: newItem.weight ? Number(newItem.weight) : null,
          description: newItem.description || null,
          equipped: newItem.equipped,
        })
        .select()
        .single();

      if (err) {
        setItemError("No se pudo añadir el item.");
        console.error("Add item error:", err);
        setSavingItem(false);
        return;
      }

      setInventory(prev => [item, ...prev].sort((a, b) => {
        if (b.equipped !== a.equipped) return b.equipped ? 1 : -1;
        return a.name.localeCompare(b.name);
      }));

      setNewItem({ name: "", type: "", damage: "", weight: "", description: "", equipped: false });
      setShowAddItemForm(false);
      setSavingItem(false);
    } catch (err) {
      setItemError("Ocurrió un error.");
      console.error(err);
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("¿Eliminar este item?")) return;

    try {
      const { error: err } = await supabase
        .from("inventory")
        .delete()
        .eq("id", itemId)
        .eq("character_id", char?.id);

      if (err) {
        setItemError("No se pudo eliminar el item.");
        console.error(err);
        return;
      }

      setInventory(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      setItemError("Ocurrió un error al eliminar.");
      console.error(err);
    }
  };

  const handleToggleEquipped = async (itemId: string, currentEquipped: boolean) => {
    try {
      const { error: err } = await supabase
        .from("inventory")
        .update({ equipped: !currentEquipped })
        .eq("id", itemId);

      if (err) throw err;

      setInventory(prev => prev.map(i => i.id === itemId ? { ...i, equipped: !currentEquipped } : i).sort((a, b) => {
        if (b.equipped !== a.equipped) return b.equipped ? 1 : -1;
        return a.name.localeCompare(b.name);
      }));
    } catch (err) {
      console.error("Error toggling equipped:", err);
    }
  };

  const setDraftField = (field: keyof Character, value: unknown) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleGenerateBackstory = async () => {
    if (!char) return;

    setGeneratingBackstory(true);
    setBackstoryError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBackstoryError("Debes estar autenticado.");
        setGeneratingBackstory(false);
        return;
      }

      const result = await generateBackstoryWithGroq(
        user.id,
        char.name,
        char.class,
        char.race,
        char.level
      );

      if (result.backstory) {
        setDraftField("background", result.backstory);
        // Update local char as well for immediate display
        setChar(prev => prev ? { ...prev, background: result.backstory } : prev);
        // Refresh usage stats
        const usage = await getCurrentUsage(user.id);
        setGroqUsage(usage);

        // Auto-save the backstory
        const { error: err } = await supabase
          .from("characters")
          .update({ background: result.backstory })
          .eq("id", id)
          .eq("user_id", user.id);

        if (err) {
          console.error("Error saving backstory:", err);
          setBackstoryError("Trasfondo generado pero no se pudo guardar.");
        }
      }
    } catch (err: any) {
      console.error("Error generating backstory:", err);
      setBackstoryError(err.message || "Error al generar trasfondo. Intenta de nuevo.");
    } finally {
      setGeneratingBackstory(false);
    }
  };

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{
        fontStyle: "italic", color: "var(--text-muted)",
        fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem",
      }}>
        Cargando hoja de personaje...
      </p>
    </div>
  );

  if (!char || !draft) return null;

  const hpRatio = char.hp_max > 0 ? char.hp_current / char.hp_max : 0;
  const hpColor = hpRatio > 0.5 ? "var(--gold)" : hpRatio > 0.25 ? "#e6a020" : "var(--blood-light)";

  const inputStyle = {
    width: "100%", padding: "0.5rem 0.7rem",
    background: "rgba(26,20,16,0.8)",
    border: "1px solid rgba(201,168,76,0.25)",
    color: "var(--parchment)",
    fontFamily: "var(--font-crimson), serif",
    fontSize: "1rem", outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.62rem", letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--gold)", marginBottom: "0.4rem",
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

  return (
    <div style={{ padding: "3rem", maxWidth: 820 }}>

      {/* Back */}
      <Link href="/dashboard/characters" style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.7rem", letterSpacing: "0.1em",
        color: "var(--text-muted)", textDecoration: "none",
        textTransform: "uppercase", display: "inline-block",
        marginBottom: "2rem",
      }}>
        ← Volver a Personajes
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
            {[char.race, char.class].filter(Boolean).join(" · ") || "Aventurero"}
          </p>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "var(--parchment)", lineHeight: 1.2,
            marginBottom: "0.3rem",
          }}>
            {char.name}
          </h1>
          <p style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem", color: "var(--text-muted)",
            letterSpacing: "0.1em",
          }}>
            Nivel {char.level}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.8rem", flexShrink: 0 }}>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDraft(char); setError(""); }} style={{
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
      </div>

      {error && (
        <p style={{
          fontSize: "0.85rem", color: "var(--blood-light)",
          marginBottom: "1.5rem", fontStyle: "italic",
        }}>
          {error}
        </p>
      )}

      {/* Main sheet */}
      <div style={{
        background: "rgba(58,50,40,0.4)",
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "2.5rem",
      }}>

        {/* — Identidad — */}
        <p style={sectionTitle}>Identidad</p>

        {editing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input type="text" value={draft.name} onChange={e => setDraftField("name", e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nivel</label>
              <input type="number" min={1} max={20} value={draft.level} onChange={e => setDraftField("level", Math.min(20, Math.max(1, Number(e.target.value))))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Raza</label>
              <select value={draft.race ?? ""} onChange={e => setDraftField("race", e.target.value || null)} style={inputStyle}>
                <option value="">— Seleccionar —</option>
                {RACES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Clase</label>
              <select value={draft.class ?? ""} onChange={e => setDraftField("class", e.target.value || null)} style={inputStyle}>
                <option value="">— Seleccionar —</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Campaña</label>
              <select value={draft.campaign_id ?? ""} onChange={e => setDraftField("campaign_id", e.target.value || null)} style={inputStyle}>
                <option value="">— Sin campaña —</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.2rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Nombre", value: char.name },
              { label: "Raza", value: char.race ?? "—" },
              { label: "Clase", value: char.class ?? "—" },
              { label: "Nivel", value: String(char.level) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ ...labelStyle, marginBottom: "0.3rem" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "1.05rem", color: "var(--parchment)" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* — Puntos de Vida — */}
        <p style={sectionTitle}>Puntos de Vida</p>

        {editing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>PV Actuales</label>
              <input type="number" min={0} value={draft.hp_current} onChange={e => setDraftField("hp_current", Math.max(0, Number(e.target.value)))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PV Máximos</label>
              <input type="number" min={1} value={draft.hp_max} onChange={e => setDraftField("hp_max", Math.max(1, Number(e.target.value)))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Conjuros Act.</label>
              <input type="number" min={0} value={draft.spell_slots_current} onChange={e => setDraftField("spell_slots_current", Math.max(0, Number(e.target.value)))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Conjuros Máx.</label>
              <input type="number" min={0} value={draft.spell_slots_max} onChange={e => setDraftField("spell_slots_max", Math.max(0, Number(e.target.value)))} style={inputStyle} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                PV
              </span>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", color: hpColor }}>
                {char.hp_current} / {char.hp_max}
              </span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "1rem" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, hpRatio * 100)}%`,
                background: hpColor,
                transition: "width 0.3s",
              }} />
            </div>
            {char.spell_slots_max > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Espacios de Conjuro
                </span>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", color: "var(--parchment-deeper)" }}>
                  {char.spell_slots_current} / {char.spell_slots_max}
                </span>
              </div>
            )}
          </div>
        )}

        {/* — Características — */}
        <p style={sectionTitle}>Puntuaciones de Característica</p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.8rem", marginBottom: "1.5rem",
        }}>
          {ABILITIES.map(({ key, abbr, label }) => (
            <div key={key} style={{
              background: "rgba(26,20,16,0.5)",
              border: "1px solid rgba(201,168,76,0.1)",
              padding: "1rem", textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.6rem", letterSpacing: "0.2em",
                textTransform: "uppercase", color: "var(--gold)",
                marginBottom: "0.5rem",
              }}>
                {abbr}
              </div>

              {editing ? (
                <input
                  type="number" min={1} max={20}
                  value={draft[key]}
                  onChange={e => setDraftField(key, Math.min(20, Math.max(1, Number(e.target.value) || 10)))}
                  title={label}
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    fontSize: "1.4rem",
                    padding: "0.3rem",
                    fontFamily: "var(--font-cinzel), serif",
                    marginBottom: "0.3rem",
                  }}
                />
              ) : (
                <div style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "1.6rem", color: "var(--parchment)",
                  lineHeight: 1, marginBottom: "0.4rem",
                }}>
                  {char[key]}
                </div>
              )}

              <div style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.85rem",
                color: "var(--parchment-deeper)",
              }}>
                {modifier(editing ? (draft[key] ?? 10) : char[key])}
              </div>
            </div>
          ))}
        </div>

        {/* — Inventario — */}
        <p style={sectionTitle}>Equipo e Inventario</p>

        {itemError && (
          <p style={{
            fontSize: "0.85rem", color: "var(--blood-light)",
            marginBottom: "1rem", fontStyle: "italic",
          }}>
            {itemError}
          </p>
        )}

        {/* Items list */}
        {inventory.length > 0 ? (
          <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {inventory.map(item => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "0.8rem 1rem",
                background: "rgba(26,20,16,0.6)",
                border: `1px solid ${item.equipped ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.08)"}`,
              }}>
                {/* Equipped toggle */}
                <button
                  onClick={() => handleToggleEquipped(item.id, item.equipped)}
                  style={{
                    width: 32, height: 32,
                    background: item.equipped ? "var(--gold)" : "rgba(201,168,76,0.1)",
                    border: `1px solid ${item.equipped ? "var(--gold)" : "rgba(201,168,76,0.2)"}`,
                    color: item.equipped ? "var(--ink)" : "var(--parchment-deeper)",
                    cursor: "pointer",
                    fontWeight: item.equipped ? 700 : 400,
                    fontSize: "0.8rem",
                  }}
                >
                  {item.equipped ? "✓" : "—"}
                </button>

                {/* Item info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "0.95rem", color: "var(--parchment)",
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.65rem", color: "var(--text-muted)",
                    letterSpacing: "0.05em",
                  }}>
                    {[item.type, item.damage && `${item.damage} daño`, item.weight && `${item.weight} kg`]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {item.description && (
                    <div style={{
                      fontFamily: "var(--font-crimson), serif",
                      fontSize: "0.8rem", color: "var(--parchment-deeper)",
                      fontStyle: "italic", marginTop: "0.3rem",
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.65rem", letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--blood-light)",
                    background: "transparent", border: "none",
                    padding: "0.3rem 0.6rem", cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            fontStyle: "italic", color: "var(--text-muted)",
            fontSize: "0.9rem", marginBottom: "1.5rem",
          }}>
            Sin items. ¡Empieza a equiparte!
          </p>
        )}

        {/* Add item button/form */}
        {showAddItemForm ? (
          <div style={{
            background: "rgba(26,20,16,0.8)",
            border: "1px solid rgba(201,168,76,0.2)",
            padding: "1.2rem",
            marginBottom: "1rem",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "0.8rem" }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Espada larga..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} style={inputStyle}>
                  <option value="">— Seleccionar —</option>
                  {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Daño</label>
                <input type="text" value={newItem.damage} onChange={e => setNewItem({ ...newItem, damage: e.target.value })} placeholder="1d8+2..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input type="number" step="0.1" value={newItem.weight} onChange={e => setNewItem({ ...newItem, weight: e.target.value })} placeholder="2.5" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  rows={2}
                  placeholder="Notas especiales..."
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="equipped"
                  checked={newItem.equipped}
                  onChange={e => setNewItem({ ...newItem, equipped: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <label htmlFor="equipped" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", cursor: "pointer", color: "var(--parchment)" }}>
                  EQUIPADO
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                onClick={() => { setShowAddItemForm(false); setNewItem({ name: "", type: "", damage: "", weight: "", description: "", equipped: false }); setItemError(""); }}
                style={{
                  flex: 1, padding: "0.6rem",
                  background: "transparent", border: "1px solid rgba(201,168,76,0.2)",
                  color: "var(--parchment-deeper)",
                  fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem",
                  cursor: "pointer", textTransform: "uppercase",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={savingItem}
                style={{
                  flex: 1, padding: "0.6rem",
                  background: savingItem ? "var(--gold-dark)" : "var(--gold)",
                  border: "none", color: "var(--ink)",
                  fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem",
                  cursor: savingItem ? "not-allowed" : "pointer", textTransform: "uppercase",
                }}
              >
                {savingItem ? "Añadiendo..." : "Añadir Item"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddItemForm(true)}
            style={{
              width: "100%", padding: "0.7rem",
              background: "rgba(201,168,76,0.1)", border: "1px dashed rgba(201,168,76,0.3)",
              color: "var(--gold)", fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.75rem", letterSpacing: "0.1em",
              cursor: "pointer", textTransform: "uppercase",
            }}
          >
            + Añadir Item
          </button>
        )}

        {/* — Historia — */}
        <p style={sectionTitle}>Historia</p>

        {backstoryError && (
          <p style={{
            fontSize: "0.85rem", color: "var(--blood-light)",
            marginBottom: "1rem", fontStyle: "italic",
          }}>
            {backstoryError}
          </p>
        )}

        {!editing && !generatingBackstory && canGenerate && (
          <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleGenerateBackstory}
              disabled={generatingBackstory}
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.72rem", letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--ink)",
                background: "var(--gold)", border: "none",
                padding: "0.7rem 1.4rem", cursor: "pointer",
              }}
            >
              ✨ Generar Trasfondo
            </button>
            {groqUsage && (
              <p style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.65rem", color: "var(--text-muted)",
                letterSpacing: "0.05em",
              }}>
                {groqUsage.requestsRemaining ?? 30} trasfondos disponibles
              </p>
            )}
          </div>
        )}

        {generatingBackstory && (
          <p style={{
            fontSize: "0.85rem", color: "var(--gold)",
            marginBottom: "1rem", fontStyle: "italic",
          }}>
            Generando trasfondo mágico...
          </p>
        )}

        {!canGenerate && !editing && (
          <p style={{
            fontSize: "0.85rem", color: "var(--text-muted)",
            marginBottom: "1rem", fontStyle: "italic",
          }}>
            Has alcanzado el límite de trasfondos para este mes.
          </p>
        )}

        {editing ? (
          <div>
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={labelStyle}>Trasfondo</label>
              <textarea
                value={draft.background ?? ""}
                onChange={e => setDraftField("background", e.target.value || null)}
                rows={4}
                placeholder="¿De dónde viene tu personaje?..."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Notas</label>
              <textarea
                value={draft.notes ?? ""}
                onChange={e => setDraftField("notes", e.target.value || null)}
                rows={3}
                placeholder="Equipo, aliados, secretos..."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>
          </div>
        ) : (
          <div>
            {char.background ? (
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ ...labelStyle, marginBottom: "0.6rem" }}>Trasfondo</p>
                <p style={{
                  fontFamily: "var(--font-crimson), serif",
                  fontSize: "1.05rem", lineHeight: 1.8,
                  color: "var(--parchment-deeper)", fontStyle: "italic",
                }}>
                  {char.background}
                </p>
              </div>
            ) : null}
            {char.notes ? (
              <div>
                <p style={{ ...labelStyle, marginBottom: "0.6rem" }}>Notas</p>
                <p style={{
                  fontFamily: "var(--font-crimson), serif",
                  fontSize: "1rem", lineHeight: 1.7,
                  color: "var(--parchment-deeper)",
                }}>
                  {char.notes}
                </p>
              </div>
            ) : null}
            {!char.background && !char.notes && (
              <p style={{
                fontStyle: "italic", color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}>
                Sin historia registrada. Haz clic en Editar para añadir una.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
