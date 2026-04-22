export interface MapState {
  zoom: number;
  panX: number;
  panY: number;
  selectedTokenId: string | null;
  hoveredTokenId: string | null;
  showGrid: boolean;
}

export interface DragState {
  isDragging: boolean;
  dragType: "token" | "pan" | null;
  dragStartX: number;
  dragStartY: number;
  dragTokenStartX: number;
  dragTokenStartY: number;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  tokenId: string | null;
}

export type MapAction =
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; panX: number; panY: number }
  | { type: "SET_SELECTED_TOKEN"; tokenId: string | null }
  | { type: "SET_HOVERED_TOKEN"; tokenId: string | null }
  | { type: "TOGGLE_GRID" }
  | { type: "RESET_VIEW" };

export type DragAction =
  | {
      type: "START_DRAG";
      dragType: "token" | "pan";
      x: number;
      y: number;
      tokenStartX?: number;
      tokenStartY?: number;
    }
  | { type: "UPDATE_DRAG"; x: number; y: number }
  | { type: "END_DRAG" };
