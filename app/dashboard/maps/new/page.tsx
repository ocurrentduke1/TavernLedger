"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import UploadMapImage from "@/components/dashboard/maps/UploadMapImage";
import { createMap } from "@/lib/maps";
import { createClient } from "@/lib/supabase";

interface Campaign {
  id: string;
  name: string;
}

function NewMapForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get("campaign_id");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>(
    initialCampaignId || ""
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gridSize, setGridSize] = useState(70);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Usuario no autenticado");

        const { data, error: err } = await supabase
          .from("campaigns")
          .select("id, name")
          .eq("dm_id", user.id)
          .order("created_at", { ascending: false });

        if (err) throw err;
        setCampaigns(data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Error al cargar campañas"
        );
      }
    };

    fetchCampaigns();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) {
      setError("Selecciona una campaña");
      return;
    }

    if (!name.trim()) {
      setError("Ingresa un nombre para el mapa");
      return;
    }

    if (!selectedFile) {
      setError("Selecciona una imagen del mapa");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Upload image to Supabase Storage
      const timestamp = Date.now();
      const filename = `${selectedCampaign}/${timestamp}_${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("map-images")
        .upload(filename, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("map-images")
        .getPublicUrl(filename);

      // Create map in database
      const map = await createMap(
        selectedCampaign,
        name.trim(),
        description.trim(),
        publicData.publicUrl,
        gridSize
      );

      router.push(`/dashboard/maps/${map.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el mapa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 pl-60 min-h-screen bg-canvas">
      {/* Header */}
      <div className="border-b border-gold/10 bg-canvas/50">
        <div className="max-w-2xl mx-auto px-8 py-8">
          <Link href="/dashboard/maps" className="text-gold hover:text-gold/80 mb-4 inline-block text-sm">
            ← Volver a Mapas
          </Link>
          <h1 className="font-cinzel-dec text-4xl text-gold">Nuevo Mapa</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-8 py-8">
        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="bg-blood-light/20 border border-blood-light text-blood-light p-4 rounded">
              {error}
            </div>
          )}

          {/* Campaign Selection */}
          <div>
            <label className="block text-prose-soft text-sm font-cinzel mb-2">
              Campaña
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-gold/20 rounded text-prose focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Selecciona una campaña</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-prose-soft text-sm font-cinzel mb-2">
              Nombre del Mapa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Taberna del Gato Negro"
              className="w-full px-3 py-2 bg-canvas border border-gold/20 rounded text-prose placeholder-prose-muted focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-prose-soft text-sm font-cinzel mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el mapa..."
              rows={3}
              className="w-full px-3 py-2 bg-canvas border border-gold/20 rounded text-prose placeholder-prose-muted focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          {/* Grid Size */}
          <div>
            <label className="block text-prose-soft text-sm font-cinzel mb-2">
              Tamaño de Cuadrícula (píxeles por 5ft)
            </label>
            <input
              type="number"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              min="20"
              max="150"
              className="w-full px-3 py-2 bg-canvas border border-gold/20 rounded text-prose focus:outline-none focus:border-gold transition-colors"
            />
            <p className="text-prose-muted text-xs mt-1">
              70px es el estándar para mapas de batalla D&D 5e
            </p>
          </div>

          {/* Image Upload */}
          <UploadMapImage
            onFileSelect={handleFileSelect}
            onError={setError}
            preview={preview}
          />

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="flex-1 px-6 py-3 bg-gold/20 text-gold rounded hover:bg-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-cinzel"
            >
              {loading ? "Creando..." : "Crear Mapa"}
            </button>
            <Link
              href="/dashboard/maps"
              className="flex-1 px-6 py-3 bg-canvas-elevated text-prose rounded border border-gold/10 hover:border-gold/30 transition-colors font-cinzel text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewMapPage() {
  return (
    <Suspense fallback={<div className="flex-1 pl-60 min-h-screen bg-canvas" />}>
      <NewMapForm />
    </Suspense>
  );
}
