"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_BASE = "https://api.open5e.com/v1";

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
  desc: string;
  higher_level?: string;
  spell_lists: string[];
  ritual: string;
};

function levelLabel(level: number): string {
  if (level === 0) return "Truco";
  return `Nivel ${level}`;
}

function levelColor(level: number): string {
  if (level === 0) return "#9ca3af";
  if (level <= 2) return "#5a9e72";
  if (level <= 5) return "var(--gold)";
  if (level <= 7) return "#e6820a";
  return "var(--blood-light)";
}

export default function SpellDetailPage() {
  const params = useParams();
  const spellIndex = typeof params.index === 'string' ? params.index : '';
  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpell = async () => {
      if (!spellIndex) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/spells/${spellIndex}/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Spell = await res.json();
        setSpell(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar el hechizo.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpell();
  }, [spellIndex]);

  if (loading) {
    return (
      <div className="flex-1 pl-60 min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-prose-soft">Cargando hechizo...</div>
      </div>
    );
  }

  if (error || !spell) {
    return (
      <div className="flex-1 pl-60 min-h-screen bg-canvas">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Link href="/dashboard/spellbook" className="text-gold hover:text-gold/80 mb-8 inline-block">
            ← Volver al Grimorio
          </Link>
          {error && <div className="bg-blood-light/20 border border-blood-light text-blood-light p-4 rounded">{error}</div>}
          {!error && <div className="text-prose-soft">Hechizo no encontrado</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pl-60 min-h-screen bg-canvas">
      {/* Header */}
      <div className="border-b border-gold/10 bg-canvas/50">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Link href="/dashboard/spellbook" className="text-gold hover:text-gold/80 mb-4 inline-block text-sm">
            ← Volver al Grimorio
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-cinzel-dec text-4xl text-gold">{spell.name}</h1>
              <p className="text-prose-soft mt-2 capitalize">{spell.school?.toLowerCase() || "Escuela desconocida"}</p>
            </div>
            <div
              style={{ backgroundColor: levelColor(spell.level_int) }}
              className="px-4 py-2 rounded text-white font-bold"
            >
              {levelLabel(spell.level_int)}
              {spell.ritual === "yes" && <div className="text-xs mt-1">Ritual</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-4">
            <p className="text-prose-soft text-xs font-cinzel mb-1">Tiempo de Lanzamiento</p>
            <p className="text-prose font-bold">{spell.casting_time}</p>
          </div>
          <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-4">
            <p className="text-prose-soft text-xs font-cinzel mb-1">Alcance</p>
            <p className="text-prose font-bold">{spell.range || "Toque"}</p>
          </div>
          <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-4">
            <p className="text-prose-soft text-xs font-cinzel mb-1">Duración</p>
            <p className="text-prose font-bold">{spell.duration}</p>
          </div>
          <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-4">
            <p className="text-prose-soft text-xs font-cinzel mb-1">Concentración</p>
            <p className="text-prose font-bold">{spell.concentration === "yes" ? "Sí" : "No"}</p>
          </div>
        </div>

        {/* Components */}
        <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-6 mb-6">
          <h2 className="font-cinzel text-prose text-lg mb-4">Componentes</h2>
          <div className="space-y-2">
            <p className="text-prose">
              <strong>Tipos:</strong> {spell.components || "Ninguno"}
            </p>
            {spell.material && (
              <p className="text-prose">
                <strong>Componente Material:</strong> {spell.material}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-6 mb-6">
          <h2 className="font-cinzel text-prose text-lg mb-4">Descripción</h2>
          <div className="space-y-3 text-prose-soft leading-relaxed whitespace-pre-wrap">
            {spell.desc}
          </div>
        </div>

        {/* Higher Level */}
        {spell.higher_level && spell.higher_level.length > 0 && (
          <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-6 mb-6">
            <h2 className="font-cinzel text-prose text-lg mb-4">A Mayor Nivel</h2>
            <div className="text-prose-soft leading-relaxed whitespace-pre-wrap">
              {spell.higher_level}
            </div>
          </div>
        )}

        {/* Classes */}
        <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-6">
          <h2 className="font-cinzel text-prose text-lg mb-4">Disponible para</h2>
          <div className="flex flex-wrap gap-2">
            {spell.spell_lists?.map((cls) => (
              <span key={cls} className="px-3 py-1 bg-gold/10 text-gold rounded font-cinzel text-sm capitalize">
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
