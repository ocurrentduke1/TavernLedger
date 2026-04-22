"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMapsByCampaign, deleteMap } from "@/lib/maps";
import { createClient } from "@/lib/supabase";

interface Map {
  id: string;
  campaign_id: string;
  name: string;
  description: string | null;
  image_url: string;
  grid_size: number;
  created_at: string;
  updated_at: string;
}

interface Campaign {
  id: string;
  name: string;
}

export default function MapsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mapsByCampaign, setMapsByCampaign] = useState<Record<string, Map[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();

        // Fetch user campaigns
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado");

        const { data: campaignsData, error: campaignsError } = await supabase
          .from("campaigns")
          .select("id, name")
          .eq("dm_id", user.id)
          .order("created_at", { ascending: false });

        if (campaignsError) throw campaignsError;

        setCampaigns(campaignsData || []);

        // Fetch maps for each campaign
        const mapsData: Record<string, Map[]> = {};
        for (const campaign of campaignsData || []) {
          try {
            const maps = await getMapsByCampaign(campaign.id);
            mapsData[campaign.id] = maps;
          } catch (err) {
            console.error(`Error fetching maps for campaign ${campaign.id}:`, err);
          }
        }

        setMapsByCampaign(mapsData);

        // Auto-expand first campaign if it has maps
        if (campaignsData && campaignsData.length > 0) {
          const firstCampaignWithMaps = campaignsData.find(
            (c) => mapsData[c.id]?.length > 0
          );
          if (firstCampaignWithMaps) {
            setExpandedCampaign(firstCampaignWithMaps.id);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar los mapas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteMap = async (mapId: string, mapName: string) => {
    if (!confirm(`¿Eliminar mapa "${mapName}"?`)) return;

    try {
      await deleteMap(mapId);

      // Update local state
      setMapsByCampaign((prev) => {
        const updated = { ...prev };
        for (const campaignId in updated) {
          updated[campaignId] = updated[campaignId].filter(
            (m) => m.id !== mapId
          );
        }
        return updated;
      });
    } catch (err: unknown) {
      alert(
        `Error al eliminar: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
    }
  };

  return (
    <div className="flex-1 pl-60 min-h-screen bg-canvas">
      {/* Header */}
      <div className="border-b border-gold/10 bg-canvas/50">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="font-cinzel-dec text-4xl text-gold mb-2">Mapas</h1>
          <p className="text-prose-soft">Gestiona los mapas de tus campañas</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {error && (
          <div className="bg-blood-light/20 border border-blood-light text-blood-light p-4 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-prose-soft">Cargando mapas...</div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-prose-soft mb-4">
              No tienes campañas. Crea una para comenzar a agregar mapas.
            </p>
            <Link
              href="/dashboard/campaigns/new"
              className="inline-block px-6 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors font-cinzel"
            >
              Nueva Campaña
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const maps = mapsByCampaign[campaign.id] || [];
              const isExpanded = expandedCampaign === campaign.id;

              return (
                <div key={campaign.id} className="border border-gold/10 rounded-lg overflow-hidden">
                  {/* Campaign Header */}
                  <button
                    onClick={() =>
                      setExpandedCampaign(
                        isExpanded ? null : campaign.id
                      )
                    }
                    className="w-full px-6 py-4 bg-canvas-elevated hover:bg-gold/5 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h2 className="font-cinzel text-prose text-lg">
                        {campaign.name}
                      </h2>
                      <p className="text-prose-muted text-sm">
                        {maps.length} mapa{maps.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-gold transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Campaign Content */}
                  {isExpanded && (
                    <div className="border-t border-gold/10 px-6 py-6 bg-canvas/50">
                      {maps.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-prose-soft mb-4">
                            No hay mapas en esta campaña
                          </p>
                          <Link
                            href={`/dashboard/maps/new?campaign_id=${campaign.id}`}
                            className="inline-block px-4 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors font-cinzel text-sm"
                          >
                            + Nuevo Mapa
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {maps.map((map) => (
                              <Link
                                key={map.id}
                                href={`/dashboard/maps/${map.id}`}
                                className="group block bg-canvas-elevated border border-gold/10 rounded-lg overflow-hidden hover:border-gold/30 transition-all hover:shadow-lg hover:shadow-gold/5"
                              >
                                <div className="aspect-video bg-canvas overflow-hidden">
                                  <img
                                    src={map.image_url}
                                    alt={map.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="font-cinzel text-prose mb-1">
                                    {map.name}
                                  </h3>
                                  {map.description && (
                                    <p className="text-prose-muted text-xs line-clamp-2">
                                      {map.description}
                                    </p>
                                  )}
                                  <p className="text-prose-soft text-xs mt-2">
                                    Creado: {new Date(map.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <div className="flex gap-2 justify-between">
                            <Link
                              href={`/dashboard/maps/new?campaign_id=${campaign.id}`}
                              className="px-4 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors font-cinzel text-sm"
                            >
                              + Nuevo Mapa
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
