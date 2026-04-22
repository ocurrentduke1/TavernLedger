"use client";

interface MapControlsProps {
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onClearTokens?: () => void;
  readOnly?: boolean;
}

export default function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onClearTokens,
  readOnly = false,
}: MapControlsProps) {
  return (
    <div className="bg-canvas-elevated border border-gold/10 rounded-lg p-4">
      <div className="flex flex-wrap gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 border-r border-gold/10 pr-4">
          <button
            onClick={onZoomOut}
            className="px-3 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors text-sm font-cinzel"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-prose text-sm font-cinzel w-16 text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={onZoomIn}
            className="px-3 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors text-sm font-cinzel"
            title="Zoom in"
          >
            +
          </button>
        </div>

        {/* View Controls */}
        <button
          onClick={onResetView}
          className="px-3 py-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors text-sm font-cinzel"
          title="Resetear vista"
        >
          🎯 Centrar
        </button>

        {/* Token Controls */}
        {!readOnly && (
          <button
            onClick={onClearTokens}
            className="px-3 py-2 bg-blood-light/20 text-blood-light rounded hover:bg-blood-light/30 transition-colors text-sm font-cinzel"
            title="Limpiar todos los tokens"
          >
            🗑️ Limpiar
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-3 pt-3 border-t border-gold/10 text-prose-muted text-xs space-y-1">
        <p>
          <span className="text-gold font-cinzel">Atajos:</span> Rueda =
          Zoom | Espacio + Drag = Pan | Clic derecho = Menú
        </p>
      </div>
    </div>
  );
}
