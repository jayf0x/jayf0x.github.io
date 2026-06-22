// Logical design-space size. The canvas is scaled to fit the container;
// all coordinates in this codebase are in these units.
export const DESIGN_W = 980;
export const DESIGN_H = 520;

// Comet travel speed in design-space pixels per second.
export const BASE = 360;

// Orbit circle: center and radius.
// The comet travels the top arc of this circle between XOR output and SR latch input.
// In the page, the red download button sits visually at this center.
export const CIRC_CX = 490;
export const CIRC_CY = 260;
export const CIRC_R  = 60;

export const tau = Math.PI * 2;

// Wire / UI palette.
export const C = {
  ink:    "#8b98ab",  // main wire color
  inkDim: "#46505f",  // feedback arc wire color (dimmer, thinner)
  warm:   "255,184,84",
  teal:   "255,124,84",
  gateBg: "rgba(8, 12, 20, 0.94)", // gate body fill — covers wires that pass through
} as const;

// Gate glow colors (RGB strings for use in rgba()).
export const GCOL = {
  not:   "180,100,255", // NOT gate flash
  gate:  "255,184,84",  // XOR gate flash
  latch: "52,225,196",  // SR latch bubble glow
} as const;
