// Canvas coordinate conversion and drawing utilities

export interface CanvasRect {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Token {
  id: string;
  x: number;
  y: number;
  label: string | null;
  color: string;
  size: number;
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvasCoords(
  screenX: number,
  screenY: number,
  canvasRect: CanvasRect,
  zoom: number,
  panX: number,
  panY: number
): Point {
  return {
    x: (screenX - canvasRect.width / 2) / zoom - panX,
    y: (screenY - canvasRect.height / 2) / zoom - panY,
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreenCoords(
  canvasX: number,
  canvasY: number,
  canvasRect: CanvasRect,
  zoom: number,
  panX: number,
  panY: number
): Point {
  return {
    x: (canvasX + panX) * zoom + canvasRect.width / 2,
    y: (canvasY + panY) * zoom + canvasRect.height / 2,
  };
}

/**
 * Check if a point is inside a circle
 */
export function isPointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

/**
 * Draw the map image on canvas
 */
export function drawMap(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number
): void {
  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(panX, panY);

  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

/**
 * Draw grid overlay
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number,
  gridSize: number
): void {
  ctx.save();

  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(panX, panY);

  ctx.strokeStyle = "rgba(201, 168, 76, 0.2)";
  ctx.lineWidth = 1 / zoom;

  // Only draw grid if zoomed enough
  if (zoom > 0.3) {
    const startX = Math.floor(-panX / gridSize) * gridSize;
    const startY = Math.floor(-panY / gridSize) * gridSize;
    const endX = startX + (canvasWidth / zoom) * 2;
    const endY = startY + (canvasHeight / zoom) * 2;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw a single token
 */
export function drawToken(
  ctx: CanvasRenderingContext2D,
  token: Token,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number,
  selected: boolean = false,
  hovered: boolean = false
): void {
  ctx.save();

  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(panX, panY);

  // Draw token circle
  ctx.beginPath();
  ctx.arc(token.x, token.y, token.size / 2, 0, Math.PI * 2);
  ctx.fillStyle = token.color;
  ctx.fill();

  // Draw border
  ctx.strokeStyle = selected ? "#FFD700" : hovered ? "rgba(255, 215, 0, 0.7)" : "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = selected ? 3 / zoom : hovered ? 2 / zoom : 1 / zoom;
  ctx.stroke();

  // Draw label if exists
  if (token.label) {
    ctx.fillStyle = "#000";
    ctx.font = `${12 / zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textWidth = ctx.measureText(token.label).width;

    // Background for text
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(
      token.x - textWidth / 2 - 2 / zoom,
      token.y + token.size / 2 + 2 / zoom,
      textWidth + 4 / zoom,
      14 / zoom
    );

    ctx.fillStyle = "#000";
    ctx.fillText(token.label, token.x, token.y + token.size / 2 + 9 / zoom);
  }

  ctx.restore();
}

/**
 * Draw all tokens
 */
export function drawTokens(
  ctx: CanvasRenderingContext2D,
  tokens: Token[],
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number,
  selectedTokenId: string | null = null,
  hoveredTokenId: string | null = null
): void {
  for (const token of tokens) {
    drawToken(
      ctx,
      token,
      canvasWidth,
      canvasHeight,
      zoom,
      panX,
      panY,
      token.id === selectedTokenId,
      token.id === hoveredTokenId
    );
  }
}

/**
 * Get token at position, considering z-order (last rendered = top)
 */
export function getTokenAtPosition(
  tokens: Token[],
  x: number,
  y: number,
  hitRadius: number = 25
): Token | null {
  // Check in reverse order (most recently added = top)
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    const dx = token.x - x;
    const dy = token.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= token.size / 2 + hitRadius) {
      return token;
    }
  }
  return null;
}

/**
 * Calculate grid-snapped position
 */
export function snapToGrid(
  x: number,
  y: number,
  gridSize: number
): Point {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

/**
 * Clamp zoom value
 */
export function clampZoom(zoom: number, minZoom: number = 0.1, maxZoom: number = 4): number {
  return Math.max(minZoom, Math.min(maxZoom, zoom));
}
