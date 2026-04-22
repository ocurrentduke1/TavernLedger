"use client";

import { useState } from "react";
import { MapToken } from "@/lib/maps";

interface TokenPaletteProps {
  tokens: MapToken[];
  selectedTokenId?: string | null;
  onTokenSelect?: (tokenId: string | null) => void;
  onTokenAdd?: (color: string, label: string) => void;
  onTokenDelete?: (tokenId: string) => void;
  onTokenUpdate?: (tokenId: string, updates: Partial<MapToken>) => void;
  readOnly?: boolean;
}

export default function TokenPalette({
  tokens,
  selectedTokenId,
  onTokenSelect,
  onTokenAdd,
  onTokenDelete,
  onTokenUpdate,
  readOnly = false,
}: TokenPaletteProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTokenColor, setNewTokenColor] = useState("#c9a84c");
  const [newTokenLabel, setNewTokenLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAddToken = () => {
    if (newTokenLabel.trim()) {
      onTokenAdd?.(newTokenColor, newTokenLabel.trim());
      setNewTokenLabel("");
      setNewTokenColor("#c9a84c");
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (token: MapToken) => {
    setEditingId(token.id);
    setEditLabel(token.label || "");
    setEditColor(token.color);
  };

  const handleSaveEdit = (tokenId: string) => {
    onTokenUpdate?.(tokenId, {
      label: editLabel || null,
      color: editColor,
    });
    setEditingId(null);
  };

  return (
    <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-4 h-96 flex flex-col">
      <h3 className="font-cinzel text-prose mb-3 text-sm">Tokens ({tokens.length})</h3>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {tokens.length === 0 ? (
          <p className="text-prose-muted text-xs text-center py-8">
            No hay tokens en este mapa
          </p>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className={`p-2 rounded border transition-all cursor-pointer ${
                selectedTokenId === token.id
                  ? "border-gold bg-gold/10"
                  : "border-gold/10 bg-canvas hover:border-gold/30"
              }`}
              onClick={() => onTokenSelect?.(token.id)}
            >
              {editingId === token.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Etiqueta"
                    className="w-full px-2 py-1 bg-canvas border border-gold/20 rounded text-prose text-xs focus:outline-none focus:border-gold"
                  />
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit(token.id);
                      }}
                      className="flex-1 px-2 py-1 bg-gold/20 text-gold rounded text-xs hover:bg-gold/30"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-black/30"
                    style={{ backgroundColor: token.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-prose text-xs truncate font-cinzel">
                      {token.label || "Sin etiqueta"}
                    </p>
                    <p className="text-prose-muted text-xs">
                      ({Math.round(token.x)}, {Math.round(token.y)})
                    </p>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(token);
                        }}
                        className="p-1 text-prose-soft hover:text-gold text-xs"
                      >
                        ✎
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTokenDelete?.(token.id);
                        }}
                        className="p-1 text-prose-soft hover:text-blood-light text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Token Form */}
      {!readOnly && (
        <div className="border-t border-gold/10 pt-3">
          {showAddForm ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newTokenLabel}
                onChange={(e) => setNewTokenLabel(e.target.value)}
                placeholder="Etiqueta del token"
                className="w-full px-2 py-1 bg-canvas border border-gold/20 rounded text-prose text-xs focus:outline-none focus:border-gold"
                onKeyPress={(e) => e.key === "Enter" && handleAddToken()}
              />
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newTokenColor}
                  onChange={(e) => setNewTokenColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <button
                  onClick={handleAddToken}
                  className="flex-1 px-2 py-1 bg-gold/20 text-gold rounded text-xs hover:bg-gold/30 font-cinzel"
                >
                  Agregar
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-2 py-1 bg-canvas-elevated border border-gold/20 rounded text-prose text-xs hover:border-gold/30"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full px-3 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors text-xs font-cinzel"
            >
              + Nuevo Token
            </button>
          )}
        </div>
      )}
    </div>
  );
}
