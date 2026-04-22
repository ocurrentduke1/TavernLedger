"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MapCanvas from "@/components/dashboard/maps/MapCanvas";
import TokenPalette from "@/components/dashboard/maps/TokenPalette";
import MapControls from "@/components/dashboard/maps/MapControls";
import {
  getMapById,
  addToken,
  updateToken,
  deleteToken,
  deleteAllTokens,
  MapWithTokens,
  MapToken,
} from "@/lib/maps";
import { clampZoom } from "@/lib/canvas-utils";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  tokenId: string | null;
}

export default function MapEditorPage() {
  const params = useParams();
  const mapId = typeof params.id === "string" ? params.id : "";

  const [map, setMap] = useState<MapWithTokens | null>(null);
  const [tokens, setTokens] = useState<MapToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    tokenId: null,
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Load map and tokens
  useEffect(() => {
    const fetchMap = async () => {
      if (!mapId) return;

      setLoading(true);
      setError("");

      try {
        const mapData = await getMapById(mapId);
        setMap(mapData);
        setTokens(mapData.tokens);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar el mapa");
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [mapId]);

  // Handle token move (debounced)
  const pendingUpdatesRef = useRef<Record<string, { x: number; y: number }>>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    // Update local state immediately
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
    );

    // Queue database update
    pendingUpdatesRef.current[tokenId] = { x, y };

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      // Save all pending updates
      for (const [id, coords] of Object.entries(
        pendingUpdatesRef.current
      )) {
        try {
          await updateToken(id, {
            x: coords.x,
            y: coords.y,
          });
        } catch (err) {
          console.error(`Error updating token ${id}:`, err);
        }
      }
      pendingUpdatesRef.current = {};
    }, 1000);
  };

  const handleAddToken = async (color: string, label: string) => {
    if (!map) return;

    try {
      const newToken = await addToken(
        map.id,
        Math.random() * 500,
        Math.random() * 500,
        color,
        label || null
      );

      setTokens((prev) => [...prev, newToken]);
    } catch (err: unknown) {
      console.error("Error adding token:", err);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm("¿Eliminar este token?")) return;

    try {
      await deleteToken(tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      setSelectedTokenId(null);
      setContextMenu({ ...contextMenu, visible: false });
    } catch (err: unknown) {
      console.error("Error deleting token:", err);
    }
  };

  const handleDeleteAllTokens = async () => {
    if (
      !confirm(
        `¿Limpiar todos los ${tokens.length} tokens del mapa? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await deleteAllTokens(map!.id);
      setTokens([]);
      setSelectedTokenId(null);
    } catch (err: unknown) {
      console.error("Error clearing tokens:", err);
    }
  };

  const handleUpdateToken = async (
    tokenId: string,
    updates: Partial<MapToken>
  ) => {
    try {
      await updateToken(tokenId, updates);
      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, ...updates } : t))
      );
    } catch (err: unknown) {
      console.error("Error updating token:", err);
    }
  };

  const handleContextMenu = (x: number, y: number, tokenId: string | null) => {
    setContextMenu({
      visible: true,
      x,
      y,
      tokenId,
    });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  if (loading) {
    return (
      <div className="flex-1 pl-60 min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-prose-soft">Cargando mapa...</div>
      </div>
    );
  }

  if (error || !map) {
    return (
      <div className="flex-1 pl-60 min-h-screen bg-canvas">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Link href="/dashboard/maps" className="text-gold hover:text-gold/80 mb-8 inline-block">
            ← Volver a Mapas
          </Link>
          {error && (
            <div className="bg-blood-light/20 border border-blood-light text-blood-light p-4 rounded">
              {error}
            </div>
          )}
          {!error && (
            <div className="text-prose-soft">Mapa no encontrado</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pl-60 min-h-screen bg-canvas">
      {/* Header */}
      <div className="border-b border-gold/10 bg-canvas/50">
        <div className="max-w-full mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/maps" className="text-gold hover:text-gold/80 mb-2 inline-block text-sm">
                ← Volver a Mapas
              </Link>
              <h1 className="font-cinzel-dec text-3xl text-gold">{map.name}</h1>
              {map.description && (
                <p className="text-prose-soft text-sm mt-1">{map.description}</p>
              )}
            </div>
            <div className="text-right text-prose-muted text-sm">
              <p>{tokens.length} tokens</p>
              <p>Cuadrícula: {map.grid_size}px</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3 space-y-4">
            <MapCanvas
              imageUrl={map.image_url}
              tokens={tokens}
              gridSize={map.grid_size}
              selectedTokenId={selectedTokenId}
              onTokenMove={handleTokenMove}
              onTokenSelect={setSelectedTokenId}
              onContextMenu={handleContextMenu}
            />

            <MapControls
              zoom={zoom}
              onZoomIn={() => setZoom((z) => clampZoom(z + 0.1))}
              onZoomOut={() => setZoom((z) => clampZoom(z - 0.1))}
              onResetView={() => setZoom(1)}
              onClearTokens={handleDeleteAllTokens}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TokenPalette
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onTokenSelect={setSelectedTokenId}
              onTokenAdd={handleAddToken}
              onTokenDelete={handleDeleteToken}
              onTokenUpdate={handleUpdateToken}
            />
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-canvas-elevated border border-gold/20 rounded shadow-lg z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          {contextMenu.tokenId ? (
            <button
              onClick={() => handleDeleteToken(contextMenu.tokenId!)}
              className="block w-full px-4 py-2 text-left text-blood-light hover:bg-blood-light/10 transition-colors text-sm font-cinzel"
            >
              Eliminar Token
            </button>
          ) : (
            <div className="p-2 text-prose-muted text-xs">
              No hay token aquí
            </div>
          )}
        </div>
      )}
    </div>
  );
}
