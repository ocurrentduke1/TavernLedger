"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Campaign = {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  invite_code: string;
  max_players: number;
  current_players: number;
  status: string;
};

export default function CampaignsPage() {
  const t = useTranslations("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("dm_id", user.id)
        .order("created_at", { ascending: false });

      setCampaigns(data ?? []);
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  const statusLabel: Record<string, string> = {
    active: "Activa",
    paused: "Pausada",
    finished: "Finalizada",
  };

  const statusColor: Record<string, string> = {
    active: "var(--gold)",
    paused: "var(--text-muted)",
    finished: "var(--blood-light)",
  };

  if (loading) return (
    <div className="p-12">
      <p className="italic text-prose-muted font-cinzel text-[0.85rem]">
        {t("loading")}
      </p>
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
          <h1 className="font-cinzel-dec text-[clamp(1.5rem,3vw,2.2rem)] text-prose leading-tight">
            {t("title")}
          </h1>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="font-cinzel text-[0.78rem] tracking-[0.12em] uppercase text-canvas bg-gold px-7 py-3 no-underline inline-block"
        >
          + {t("create")}
        </Link>
      </div>

      {/* Lista */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-0 border-0 bg-transparent">
              <Link
                href={`/dashboard/campaigns/${campaign.id}`}
                className="block no-underline bg-surface/40 border border-gold/10 hover:bg-surface/70 hover:border-gold/30 transition-all duration-200 p-8 relative"
              >
                {/* Status badge */}
                <Badge
                  variant="outline"
                  className="absolute top-5 right-5 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase border-transparent bg-transparent px-0"
                  style={{ color: statusColor[campaign.status] ?? "var(--text-muted)" }}
                >
                  ● {statusLabel[campaign.status] ?? campaign.status}
                </Badge>

                <h3 className="font-cinzel-dec text-[1.1rem] text-gold-subtle mb-3 leading-snug">
                  {campaign.name}
                </h3>

                {campaign.description && (
                  <p className="text-[0.9rem] italic text-prose-soft leading-relaxed mb-5 line-clamp-2">
                    {campaign.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gold/[0.08]">
                  <span className="font-cinzel text-[0.7rem] text-prose-muted tracking-[0.05em]">
                    {campaign.current_players}/{campaign.max_players} {t("players")}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      campaign.is_public
                        ? "font-cinzel text-[0.65rem] tracking-[0.1em] uppercase text-gold-dim bg-gold/[0.08] border-gold/20"
                        : "font-cinzel text-[0.65rem] tracking-[0.1em] uppercase text-prose-muted bg-white/[0.04] border-white/[0.06]"
                    }
                  >
                    {campaign.is_public ? t("public") : t("private")}
                  </Badge>
                </div>

                {!campaign.is_public && campaign.invite_code && (
                  <div className="mt-3 font-cinzel text-[0.65rem] tracking-[0.2em] text-prose-muted">
                    Código: <span className="text-gold-dim">{campaign.invite_code}</span>
                  </div>
                )}
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 px-8 text-center bg-surface/20 border border-dashed border-gold/[0.12]">
          <p className="font-cinzel-dec text-[1.2rem] text-gold-dim mb-4">
            {t("empty")}
          </p>
          <p className="text-[1rem] italic text-prose-muted mb-8">
            {t("emptyHint")}
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="font-cinzel text-[0.8rem] tracking-[0.15em] uppercase text-canvas bg-gold px-8 py-3 no-underline inline-block"
          >
            + {t("create")}
          </Link>
        </div>
      )}
    </div>
  );
}
