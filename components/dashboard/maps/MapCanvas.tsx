"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  drawMap,
  drawGrid,
  drawTokens,
  screenToCanvasCoords,
  canvasToScreenCoords,
  getTokenAtPosition,
  clampZoom,
} from "@/lib/canvas-utils";

interface Token {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string | null;
  size: number;
}

interface MapCanvasProps {
  imageUrl: string;
  tokens: Token[];
  gridSize: number;
  onTokenMove?: (tokenId: string, x: number, y: number) => void;
  onTokenSelect?: (tokenId: string | null) => void;
  onContextMenu?: (x: number, y: number, tokenId: string | null) => void;
  selectedTokenId?: string | null;
  readOnly?: boolean;
}

export default function MapCanvas({
  imageUrl,
  tokens,
  gridSize,
  onTokenMove,
  onTokenSelect,
  onContextMenu,
  selectedTokenId,
  readOnly = false,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [isDraggingToken, setIsDraggingToken] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragTokenStart, setDragTokenStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const canvasWidth = canvasRef.current?.width || 800;
  const canvasHeight = canvasRef.current?.height || 600;

  // Load image
  useEffect(() => {
    if (!imageRef.current) {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        redraw();
      };
      img.onerror = () => console.error("Failed to load map image");
    }
  }, [imageUrl]);

  // Redraw function
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !imageRef.current) return;

    // Draw map
    drawMap(ctx, imageRef.current, canvasWidth, canvasHeight, zoom, panX, panY);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvasWidth, canvasHeight, zoom, panX, panY, gridSize);
    }

    // Draw tokens
    drawTokens(
      ctx,
      tokens,
      canvasWidth,
      canvasHeight,
      zoom,
      panX,
      panY,
      selectedTokenId || undefined,
      hoveredTokenId || undefined
    );
  }, [zoom, panX, panY, showGrid, tokens, gridSize, selectedTokenId, hoveredTokenId, canvasWidth, canvasHeight]);

  // Redraw on state changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (readOnly) return;
    e.preventDefault();

    const zoomSpeed = 0.1;
    const newZoom = clampZoom(
      zoom + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed)
    );
    setZoom(newZoom);
  }, [zoom, readOnly]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasCoords = screenToCanvasCoords(
      screenX,
      screenY,
      { width: canvasWidth, height: canvasHeight },
      zoom,
      panX,
      panY
    );

    // Handle token dragging
    if (isDraggingToken && selectedTokenId && onTokenMove) {
      const deltaX = canvasCoords.x - dragTokenStart.x;
      const deltaY = canvasCoords.y - dragTokenStart.y;

      const selectedToken = tokens.find((t) => t.id === selectedTokenId);
      if (selectedToken) {
        const newX = Math.round(selectedToken.x + deltaX);
        const newY = Math.round(selectedToken.y + deltaY);
        onTokenMove(selectedTokenId, newX, newY);
        setDragTokenStart(canvasCoords);
      }
    }

    // Handle panning
    if (isPanning) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      setPanX((prev) => prev + deltaX);
      setPanY((prev) => prev + deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    // Check for hovered token
    if (!readOnly) {
      const hoveredToken = getTokenAtPosition(
        tokens,
        canvasCoords.x,
        canvasCoords.y,
        30
      );
      setHoveredTokenId(hoveredToken?.id || null);

      if (hoveredToken) {
        canvasRef.current.style.cursor = "grab";
      } else {
        canvasRef.current.style.cursor = spacePressed ? "grab" : "default";
      }
    }
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasCoords = screenToCanvasCoords(
      screenX,
      screenY,
      { width: canvasWidth, height: canvasHeight },
      zoom,
      panX,
      panY
    );

    if (e.button === 0) {
      // Left click
      if (!readOnly) {
        const clickedToken = getTokenAtPosition(
          tokens,
          canvasCoords.x,
          canvasCoords.y,
          30
        );

        if (clickedToken) {
          // Start dragging token
          onTokenSelect?.(clickedToken.id);
          setIsDraggingToken(true);
          setDragTokenStart(canvasCoords);
          canvasRef.current.style.cursor = "grabbing";
        } else {
          // Deselect
          onTokenSelect?.(null);
        }
      }
    } else if (e.button === 2) {
      // Right click - context menu
      e.preventDefault();
      const clickedToken = getTokenAtPosition(
        tokens,
        canvasCoords.x,
        canvasCoords.y,
        30
      );
      onContextMenu?.(screenX, screenY, clickedToken?.id || null);
    } else if (e.button === 1 || spacePressed) {
      // Middle click or space + click - start panning
      if (!readOnly) {
        setIsPanning(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        canvasRef.current.style.cursor = "grabbing";
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDraggingToken(false);
    setIsPanning(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
  };

  // Handle key down
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !readOnly) {
      setSpacePressed(true);
    }
  };

  // Handle key up
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      setSpacePressed(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("mousemove", handleMouseMove as any);
    canvas.addEventListener("mousedown", handleMouseDown as any);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("mousemove", handleMouseMove as any);
      canvas.removeEventListener("mousedown", handleMouseDown as any);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [handleWheel, selectedTokenId, isDraggingToken, isPanning, spacePressed, tokens, readOnly]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="w-full border border-gold/20 rounded bg-canvas-elevated"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />

      {/* Controls Info */}
      <div className="bg-canvas-elevated border border-gold/10 rounded p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-prose-soft font-cinzel">
          <div>
            <span className="text-gold">🔍 Zoom:</span> {(zoom * 100).toFixed(0)}%
          </div>
          <div>
            <span className="text-gold">⬚ Grid:</span> {showGrid ? "Visible" : "Oculto"}
          </div>
          <div className="text-xs">Rueda: Zoom | Espacio + Drag: Pan</div>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="px-3 py-1 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors"
          >
            {showGrid ? "Ocultar" : "Mostrar"} Cuadrícula
          </button>
        </div>
      </div>
    </div>
  );
}
