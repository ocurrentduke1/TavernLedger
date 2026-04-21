"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = "https://api.open5e.com/v1";
const PAGE_SIZE = 18;

const TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "Aberración",     value: "aberration" },
  { label: "Bestia",         value: "beast" },
  { label: "Celestial",      value: "celestial" },
  { label: "Constructo",     value: "construct" },
  { label: "Dragón",         value: "dragon" },
  { label: "Elemental",      value: "elemental" },
  { label: "Feérico",        value: "fey" },
  { label: "Infernal",       value: "fiend" },
  { label: "Gigante",        value: "giant" },
  { label: "Humanoide",      value: "humanoid" },
  { label: "Monstruosidad",  value: "monstrosity" },
  { label: "Limo",           value: "ooze" },
  { label: "Planta",         value: "plant" },
  { label: "No-muerto",      value: "undead" },
];

type MonsterSummary = {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype: string;
  alignment: string;
  armor_class: number;
  hit_points: number;
  challenge_rating: string;
  cr: number;
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MonsterSummary[];
};

function crColor(cr: number): string {
  if (cr <= 2)  return "#5a9e72";
  if (cr <= 7)  return "var(--gold)";
  if (cr <= 12) return "#e6820a";
  if (cr <= 20) return "var(--blood-light)";
  return "#a78bfa";
}

export default function BestiaryPage() {
  const [monsters, setMonsters]     = useState<MonsterSummary[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [hasNext, setHasNext]       = useState(false);
  const [hasPrev, setHasPrev]       = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const fetchMonsters = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page), ordering: "cr,name" });
        if (search)     params.set("search", search);
        if (typeFilter) params.set("type", typeFilter);

        const res = await fetch(`${API_BASE}/monsters/?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();

        setMonsters(data.results);
        setTotal(data.count);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar el bestiario.");
      } finally {
        setLoading(false);
      }
    };
    fetchMonsters();
  }, [search, typeFilter, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const iStyle = {
    padding: "0.75rem 1rem",
    background: "rgba(26,20,16,0.8)",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "var(--parchment)",
    fontFamily: "var(--font-crimson), serif",
    fontSize: "1rem", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ padding: "3rem" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>
          D&D 5e · Open5e SRD
        </p>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "var(--parchment)", lineHeight: 1.2, marginBottom: "0.4rem" }}>
          Bestiario
        </h1>
        <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "1rem", color: "var(--text-muted)", fontStyle: "italic" }}>
          {loading ? "Consultando el archivo de criaturas..." : `${total.toLocaleString()} criaturas en el registro`}
        </p>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "1rem", marginBottom: "2rem", alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-cinzel), serif", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>
            Buscar criatura
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Dragón, Vampiro, Liche..."
            style={iStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-cinzel), serif", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>
            Tipo
          </label>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            style={iStyle}
          >
            <option value="">Todos los tipos</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--blood-light)", fontStyle: "italic", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Error al conectar con Open5e: {error}
        </p>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ height: 108, background: "rgba(58,50,40,0.25)", border: "1px solid rgba(201,168,76,0.06)" }} />
          ))}
        </div>
      ) : monsters.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Sin resultados</p>
          <p style={{ fontFamily: "var(--font-crimson), serif", fontSize: "0.95rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Prueba con otro término de búsqueda o cambia el filtro de tipo.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          {monsters.map(m => (
            <Link key={m.slug} href={`/dashboard/bestiary/${m.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{ padding: "1.1rem 1.3rem", background: "rgba(58,50,40,0.4)", border: "1px solid rgba(201,168,76,0.1)", cursor: "pointer", height: "100%", transition: "border-color 0.18s, background 0.18s", boxSizing: "border-box" as const }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = "rgba(201,168,76,0.35)"; d.style.background = "rgba(58,50,40,0.65)"; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = "rgba(201,168,76,0.1)"; d.style.background = "rgba(58,50,40,0.4)"; }}
              >
                {/* Name + CR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.92rem", color: "var(--parchment)", lineHeight: 1.25, margin: 0, flex: 1 }}>
                    {m.name}
                  </h3>
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", letterSpacing: "0.05em", padding: "0.18rem 0.5rem", border: `1px solid ${crColor(m.cr)}`, color: crColor(m.cr), background: "rgba(0,0,0,0.25)", flexShrink: 0, whiteSpace: "nowrap" as const }}>
                    CR {m.challenge_rating || "0"}
                  </span>
                </div>

                {/* Type */}
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "capitalize", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  {[m.size, m.type, m.subtype ? `(${m.subtype})` : ""].filter(Boolean).join(" ")}
                </p>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "1.2rem" }}>
                  {[["CA", m.armor_class], ["PV", m.hit_points]].map(([label, val]) => (
                    <div key={label as string}>
                      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.52rem", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label} </span>
                      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.78rem", color: "var(--parchment-deeper)" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.2rem" }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!hasPrev}
            style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: hasPrev ? "var(--gold)" : "var(--text-muted)", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", padding: "0.6rem 1.2rem", cursor: hasPrev ? "pointer" : "not-allowed", opacity: hasPrev ? 1 : 0.4 }}
          >
            ← Anterior
          </button>
          <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNext}
            style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: hasNext ? "var(--gold)" : "var(--text-muted)", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", padding: "0.6rem 1.2rem", cursor: hasNext ? "pointer" : "not-allowed", opacity: hasNext ? 1 : 0.4 }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
