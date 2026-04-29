"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem } from "@/hooks/useStaggerAnimation";

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
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations("characters");

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error: err } = await supabase
          .from("characters")
          .select("id, name, race, class, level, hp_current, hp_max")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (err) {
          throw err;
        }

        setCharacters(data ?? []);
      } catch {
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [supabase, router, t]);

  if (loading) return (
    <div className="p-12">
      <p className="font-cinzel text-[0.85rem] italic text-prose-muted">{t("loading")}</p>
    </div>
  );

  if (error) return (
    <div className="p-12">
      <p className="font-cinzel text-[0.85rem] italic text-blood-ui">{error}</p>
    </div>
  );

  return (
    <div className="p-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">
            {t("subtitle")}
          </p>
          <h1 className="font-cinzel-dec text-[clamp(1.5rem,3vw,2.2rem)] text-prose leading-[1.2]">
            {t("title")}
          </h1>
        </div>
        <Link
          href="/dashboard/characters/new"
          className="font-cinzel text-[0.78rem] tracking-[0.12em] uppercase text-canvas bg-gold px-7 py-3 no-underline inline-block hover:bg-gold-subtle transition-colors"
        >
          + {t("create")}
        </Link>
      </div>

      {/* Grid or empty state */}
      {characters.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
        >
          {characters.map((char) => (
            <motion.div key={char.id} variants={staggerItem}>
              <Link href={`/dashboard/characters/${char.id}`} className="block no-underline group">
                <Card className="p-8 border border-gold/10 relative hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  {/* Level badge — top right */}
                  <Badge
                    variant="outline"
                    className="absolute top-4 right-4 font-cinzel text-[0.6rem] tracking-[0.15em] text-gold border-gold/30"
                  >
                    {t("level")} {char.level}
                  </Badge>

                  <h3 className="font-cinzel-dec text-[1.05rem] text-gold-subtle mb-1 pr-14 leading-snug">
                    {char.name}
                  </h3>

                  {(char.race || char.class) && (
                    <p className="font-cinzel text-[0.72rem] tracking-[0.08em] uppercase text-prose-muted mb-6">
                      {[char.race, char.class].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {/* HP bar */}
                  <div>
                    <div className="flex justify-between font-cinzel text-[0.62rem] tracking-[0.1em] uppercase text-prose-muted mb-1">
                      <span>{t("hp")}</span>
                      <span>{char.hp_current} / {char.hp_max}</span>
                    </div>
                    <div className="h-1 bg-white/5 overflow-hidden">
                      <div
                        className="h-full transition-[width] duration-300"
                        style={{
                          width: `${Math.min(100, char.hp_max > 0 ? (char.hp_current / char.hp_max) * 100 : 0)}%`,
                          background: (() => {
                            const r = char.hp_max > 0 ? char.hp_current / char.hp_max : 0;
                            return r > 0.5 ? "var(--raw-gold)" : r > 0.25 ? "#e6a020" : "var(--raw-blood-ui)";
                          })(),
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-20 px-8 text-center bg-surface/20 border border-dashed border-gold/12">
          <p className="font-cinzel-dec text-[1.2rem] text-gold-dim mb-3">{t("empty")}</p>
          <p className="font-crimson text-[1rem] italic text-prose-muted mb-8">{t("emptyHint")}</p>
          <Link
            href="/dashboard/characters/new"
            className="font-cinzel text-[0.8rem] tracking-[0.15em] uppercase text-canvas bg-gold px-8 py-3 no-underline inline-block hover:bg-gold-subtle transition-colors"
          >
            {t("create")}
          </Link>
        </div>
      )}
    </div>
  );
}
