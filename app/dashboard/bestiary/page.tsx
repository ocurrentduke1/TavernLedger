"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Input } from "@/components/ui/input";

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
  const t = useTranslations("bestiary");
  const [monsters, setMonsters]       = useState<MonsterSummary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [hasNext, setHasNext]         = useState(false);
  const [hasPrev, setHasPrev]         = useState(false);

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

  return (
    <div className="p-12">

      {/* Header */}
      <div className="mb-10">
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-1">
          {t("subtitle")}
        </p>
        <h1 className="font-cinzel-dec text-[clamp(1.5rem,3vw,2.2rem)] text-prose leading-tight mb-1">
          {t("title")}
        </h1>
        <p className="font-crimson text-[1rem] text-prose-muted italic">
          {loading ? t("loading") : `${total.toLocaleString()} ${t("creatures")}`}
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-[1fr_220px] gap-4 mb-8 items-end">
        <div>
          <label className="block font-cinzel text-[0.62rem] tracking-[0.15em] uppercase text-gold mb-1">
            {t("search")}
          </label>
          <Input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="bg-canvas/80 border-gold/20 text-prose font-crimson text-[1rem] focus:border-gold/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <label className="block font-cinzel text-[0.62rem] tracking-[0.15em] uppercase text-gold mb-1">
            {t("type")}
          </label>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-canvas/80 border border-gold/20 text-prose font-crimson text-[1rem] outline-none focus:border-gold/50 transition-colors"
          >
            <option value="">{t("allTypes")}</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-blood-ui italic mb-6 text-[0.9rem]">
          {t("error")} {error}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface/25 border border-gold/[0.06] animate-pulse" />
          ))}
        </div>
      ) : monsters.length === 0 ? (
        <div className="text-center py-20 px-8">
          <p className="font-cinzel text-[0.85rem] text-prose-muted mb-2">{t("noResults")}</p>
          <p className="font-crimson text-[0.95rem] text-prose-muted italic">
            {t("noResultsHint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {monsters.map(m => (
            <Link key={m.slug} href={`/dashboard/bestiary/${m.slug}`} className="no-underline">
              <div className="px-5 py-4 bg-surface/40 border border-gold/10 cursor-pointer h-full transition-all duration-[180ms] hover:border-gold/[0.35] hover:bg-surface/65 box-border">
                {/* Name + CR */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-cinzel-dec text-[0.92rem] text-prose leading-snug m-0 flex-1">
                    {m.name}
                  </h3>
                  <span
                    className="font-cinzel text-[0.6rem] tracking-[0.05em] px-2 py-0.5 bg-black/25 shrink-0 whitespace-nowrap border"
                    style={{ color: crColor(m.cr), borderColor: crColor(m.cr) }}
                  >
                    {t("cr")} {m.challenge_rating || "0"}
                  </span>
                </div>

                {/* Type */}
                <p className="font-cinzel text-[0.6rem] tracking-[0.06em] capitalize text-prose-muted mb-3">
                  {[m.size, m.type, m.subtype ? `(${m.subtype})` : ""].filter(Boolean).join(" ")}
                </p>

                {/* Stats row */}
                <div className="flex gap-5">
                  {([[t("ac"), m.armor_class], [t("hp"), m.hit_points]] as [string, number][]).map(([label, val]) => (
                    <div key={label}>
                      <span className="font-cinzel text-[0.52rem] text-gold tracking-[0.1em] uppercase">{label} </span>
                      <span className="font-cinzel text-[0.78rem] text-prose-soft">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!hasPrev}
            className={[
              "font-cinzel text-[0.68rem] tracking-[0.1em] uppercase bg-transparent border border-gold/20 px-5 py-2 transition-opacity",
              hasPrev ? "text-gold cursor-pointer opacity-100" : "text-prose-muted cursor-not-allowed opacity-40",
            ].join(" ")}
          >
            {t("previous")}
          </button>
          <span className="font-cinzel text-[0.68rem] text-prose-muted tracking-[0.08em]">
            {t("page")} {page} {t("of")} {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNext}
            className={[
              "font-cinzel text-[0.68rem] tracking-[0.1em] uppercase bg-transparent border border-gold/20 px-5 py-2 transition-opacity",
              hasNext ? "text-gold cursor-pointer opacity-100" : "text-prose-muted cursor-not-allowed opacity-40",
            ].join(" ")}
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
