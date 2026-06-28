# Dev Page — Learning Loop Animation

A canvas-driven circuit animation: a glowing comet travels a rectangular loop through four logic-gate nodes, each lighting up as the pulse passes.

```
[TL] ──[FRICTION △]──[FOCUS D⊃]──[UNDERSTANDING ⊃⊃]──[TR]
 │                                                        │
[BL] ──────────────[learning ◁●]─────────────────────[BR]
```

## File map

| File | Role |
|------|------|
| `useLoop.ts` | Everything canvas: config, gate shapes, path math, comet draw, animation hook. Self-contained — no shared circuit lib. |
| `useFlowPhase.ts` | Bridges imperative phase events → React state. Tracks `active` phase and `cycles` count. |
| `FlowChips.tsx` | Four chip labels that glow with per-phase color as the pulse passes each node. |
| `index.tsx` | Page shell — wires the three above together inside `DefaultLayout`. |
| `circuit/` | Copied circuit library (not used by this page — kept as reference). |

## Key constants (useLoop.ts)

| Constant | Value | Notes |
|----------|-------|-------|
| `FLOW_W / FLOW_H` | 640 × 340 | Design-space size. **Exported** — set the container to this for GIF capture. |
| `SPEED` | 280 px/s | Comet travel speed. One loop ≈ 4.3 s. |
| `D[phase]` | arc-distance | Cumulative distance along `LOOP` at which each node fires its phase event. |

## Phase events

`useLoop` fires `FlowEvents.onPhase(phase)` when the comet crosses each node:

| Phase | Distance (px) | Color |
|-------|--------------|-------|
| `friction` | 105 | amber `255,148,52` |
| `focus` | 240 | cyan `46,208,255` |
| `understanding` | 375 | violet `172,72,255` |
| `learning` | 840 | green `88,228,118` |

## Gate shapes

Each gate shape is drawn in `drawGate()`, centered at `NPOS[phase]`:

- **FRICTION** — triangle buffer `→` (pointing right, raw input)
- **FOCUS** — AND gate `→` (D-shape, convergence)
- **UNDERSTANDING** — XOR gate `→` (D-shape + dashed outer arc, synthesis)
- **LEARNING** — mirrored NOT gate `←` (triangle + inversion bubble, feeds back)

## Rendering layers (per frame)

1. Clear canvas
2. Faint path aura (wire glow) — before bg blit so gate fills cover it
3. Blit offscreen bg (wires + gate fills + dim labels — drawn once)
4. Node flash glows (radial gradients, on top of gates intentionally)
5. Bright label text with glow shadow (when node is active)
6. Comet (dot trail + glowing head, color shifts to nearest active node)

## GIF capture (next session)

`FLOW_W` and `FLOW_H` are exported. To capture:

1. Set the container element to exactly `640 × 340 px` (or a multiple for HiDPI).
2. Hook into `requestAnimationFrame` or use a headless browser to grab frames.
3. Use `useFlowPhase` — the `cycles` counter increments on each `"learning"` phase, giving a clean loop-sync point to start/stop recording.
4. One full loop = 1200 design-px ÷ 280 px/s ≈ **4.3 seconds** at 60 fps ≈ **258 frames**.

## Ideas for next sessions

- **GIF export script** — Node/Puppeteer script that navigates to `/dev`, waits for `cycles >= 1`, captures frames, converts with ffmpeg or gifski.
- **Speed control** — expose `SPEED` as a prop or URL param for capture at lower fps.
- **Color themes** — swap `C` palette for a light/monochrome version.
- **Gate glow on stroke** — redraw gate outlines with `shadowBlur` when active (currently only the radial flash + label glow show activity; adding a glowing gate stroke would strengthen the effect).
- **Ripple ring** — brief expanding circle around a node when the comet first arrives (requires `ringActive/ringAlpha` state per node in the hook).
- **Speed-up near nodes** — ease the comet slightly faster between nodes and slower at them (pulse "snapping" feel).
