export const DESIGN_W = 750;
export const DESIGN_H = 520;
export const BASE = 360; // comet speed px/sec

export const CIRC_CX = 490;
export const CIRC_CY = 260;
export const CIRC_R = 60;

export const tau = Math.PI * 2;

export const C = {
  ink: "#8b98ab",
  inkDim: "#46505f",
  warm: "255,184,84",
  teal: "255,124,84",
  gateBg: "rgba(8, 12, 20, 0.94)",
} as const;

// Gate glow colors — update 'gate' key label when AND→XOR lands
export const GCOL = {
  not: "180,100,255",
  gate: "255,184,84",
  latch: "52,225,196",
} as const;
