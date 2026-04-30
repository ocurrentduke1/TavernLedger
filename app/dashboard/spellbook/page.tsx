"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const API_BASE = "https://api.open5e.com/v1";
const PAGE_SIZE = 18;

const LEVEL_OPTIONS: { label: string; value: string }[] = [
  { label: "Truco", value: "0" },
  { label: "Nivel 1", value: "1" },
  { label: "Nivel 2", value: "2" },
  { label: "Nivel 3", value: "3" },
  { label: "Nivel 4", value: "4" },
  { label: "Nivel 5", value: "5" },
  { label: "Nivel 6", value: "6" },
  { label: "Nivel 7", value: "7" },
  { label: "Nivel 8", value: "8" },
  { label: "Nivel 9", value: "9" },
];

const SCHOOL_OPTIONS: { label: string; value: string }[] = [
  { label: "Abjuración", value: "Abjuration" },
  { label: "Conjuración", value: "Conjuration" },
  { label: "Adivinación", value: "Divination" },
  { label: "Encantamiento", value: "Enchantment" },
  { label: "Evocación", value: "Evocation" },
  { label: "Ilusión", value: "Illusion" },
  { label: "Nigromancia", value: "Necromancy" },
  { label: "Transmutación", value: "Transmutation" },
];

const CLASS_OPTIONS: { label: string; value: string }[] = [
  { label: "Bardo", value: "Bard" },
  { label: "Brujo", value: "Warlock" },
  { label: "Clérigo", value: "Cleric" },
  { label: "Druida", value: "Druid" },
  { label: "Mago", value: "Wizard" },
  { label: "Paladín", value: "Paladin" },
  { label: "Ranger", value: "Ranger" },
  { label: "Hechicero", value: "Sorcerer" },
];

type Spell = {
  slug: string;
  name: string;
  level_int: number;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  material?: string;
  concentration: string;
  duration: string;
  spell_lists: string[];
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Spell[];
};

function levelBadgeColor(level: number): string {
  if (level === 0) return "#9ca3af";
  if (level <= 2) return "#5a9e72";
  if (level <= 5) return "var(--gold)";
  if (level <= 7) return "#e6820a";
  return "var(--blood-light)";
}

export default function SpellbookPage() {
  const t = useTranslations("spellbook");

  const [spells, setSpells]           = useState<Spell[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [hasNext, setHasNext]         = useState(false);
  const [hasPrev, setHasPrev]         = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchSpells = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page), ordering: "level,name" });
        if (search)      params.set("search", search);
        if (levelFilter)  params.set("level", levelFilter);
        if (schoolFilter) params.set("school", schoolFilter);
        if (classFilter)  params.set("class", classFilter);

        const res = await fetch(`${API_BASE}/spells/?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();

        setSpells(data.results);
        setTotal(data.count);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("error"));
      } finally {
        setLoading(false);
      }
    };
    fetchSpells();
  }, [search, levelFilter, schoolFilter, classFilter, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-12">
      {/* Header */}
      <div className="border-b border-gold/10 bg-canvas/50 -m-12 mb-0 px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-cinzel-dec text-4xl text-gold mb-2">{t("title")}</h1>
          <p className="text-prose-soft">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Filters */}
        <div className="bg-surface border border-gold/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-prose-soft text-sm font-cinzel mb-2">{t("search")}</label>
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-gold/20 text-prose placeholder-prose-muted focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-prose-soft text-sm font-cinzel mb-2">{t("level")}</label>
              <select
                value={levelFilter}
                onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-canvas border border-gold/20 text-prose focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">{t("allLevels")}</option>
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* School Filter */}
            <div>
              <label className="block text-prose-soft text-sm font-cinzel mb-2">{t("school")}</label>
              <select
                value={schoolFilter}
                onChange={(e) => { setSchoolFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-canvas border border-gold/20 text-prose focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">{t("allSchools")}</option>
                {SCHOOL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-prose-soft text-sm font-cinzel mb-2">{t("class")}</label>
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-canvas border border-gold/20 text-prose focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">{t("allClasses")}</option>
                {CLASS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-end">
              <div className="text-prose-soft text-sm">
                {total} {total !== 1 ? t("resultsPlural") : t("results")}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="bg-blood-ui/20 border border-blood-ui text-blood-ui p-4 mb-6">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-prose-soft">{t("loading")}</div>
          </div>
        )}

        {/* Spells Grid */}
        {!loading && spells.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {spells.map((spell) => (
              <Link
                key={spell.slug}
                href={`/dashboard/spellbook/${spell.slug}`}
                className="block bg-surface border border-gold/10 p-4 hover:border-gold/30 transition-all hover:shadow-lg hover:shadow-gold/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-cinzel text-prose text-lg flex-1">{spell.name}</h3>
                  <div
                    style={{ backgroundColor: levelBadgeColor(spell.level_int) }}
                    className="px-2 py-1 text-white text-xs font-bold ml-2"
                  >
                    {spell.level_int === 0 ? "0" : `${spell.level_int}`}
                  </div>
                </div>
                <p className="text-prose-soft text-xs mb-3 capitalize">
                  {spell.school || "Escuela desconocida"}
                </p>
                <p className="text-prose-muted text-xs mb-2">
                  <strong>{t("castingTime")}:</strong> {spell.casting_time}
                </p>
                <p className="text-prose-muted text-xs mb-2">
                  <strong>{t("range")}:</strong> {spell.range || "Toque"}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {spell.spell_lists?.map((cls) => (
                    <span key={cls} className="px-2 py-1 bg-gold/10 text-gold text-xs capitalize">
                      {cls}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && spells.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-prose-soft">{t("empty")}</div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={!hasPrev}
              className="px-4 py-2 bg-surface border border-gold/20 text-prose-soft hover:border-gold hover:text-prose disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("previous")}
            </button>
            <span className="text-prose-soft font-cinzel">
              {t("page")} <strong>{page}</strong> {t("of")} <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={!hasNext}
              className="px-4 py-2 bg-surface border border-gold/20 text-prose-soft hover:border-gold hover:text-prose disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
