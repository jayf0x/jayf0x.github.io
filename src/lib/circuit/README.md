# Circuit Library

This directory contains a small canvas-based circuit visualization used in the site resume section. It is designed as a reusable drawing and animation engine for a signal-flow circuit with a comet carrying phase transitions through logic gates.

## What this library is for

- Render the static circuit wiring and gate geometry on a canvas.
- Animate moving comets along signal paths.
- Expose phase events for React state synchronization.
- Provide reusable path and gate geometry utilities.

This is not a generic electronics simulator. It is an artistic visualization of a fixed circuit topology and state flow.

## Key entry points

### `src/lib/circuit/index.ts`

- Re-exports the primary hook and type definitions for consumers.
- Use this file when importing the circuit animation API from outside the library.
- Example:
  - `import { useDigitalHeartbeat, type CircuitEvents } from '@/lib/circuit';`

### `src/pages/Resume/useCircuitPhase.ts`

- Connects the library's event callbacks into React state.
- Tracks the currently active phase (`question`, `orbit`, `memory`, `loop`) and cycle count.
- Useful reference for how to handle `CircuitEvents` in React.

## File overview

### `config.ts`

Contains shared numeric constants and theme colors.

- `DESIGN_W` / `DESIGN_H` — logical canvas design size.
- `BASE` — comet speed in design-space pixels per second.
- `CIRC_CX`, `CIRC_CY`, `CIRC_R` — orbit circle position and radius.
- `C` and `GCOL` — wire and glow palette values.

If you need to change scaling, colors, or the visual circle layout, this is the file to edit.

### `draw.ts`

Contains low-level canvas rendering helpers.

- `renderStatic(bgCtx)` — draws the circuit wires, gate bodies, and labels once.
- `drawComet(ctx, path, head, col, len, r)` — draws a comet with tail and glow, based on a path and head position.
- `drawFlash(ctx, cx, cy, intensity, col)` — draws a radial gate flash effect.

Use these functions from an animation loop or rendering component.

### `gates.ts`

Defines gate geometry.

- `notGate(ix, iy)` — returns a NOT gate shape at a given position.
- `xorGate(lx, cy)` — returns an XOR gate shape with its path, arc, and center.
- `srLatch(lx, cy, gap)` — returns the SR latch geometry and internal wiring.

Gate functions are pure geometry generators. If you want to reposition a gate or change its spacing, update this file.

### `grid.ts`

Defines the layout grid and named coordinate points used throughout the circuit.

- `gpt(col, row)` — returns a position from the shared grid.
- `registerPt(name, point)` — stores named points for cross-file access.

This is the place to tune the overall grid and location names used by the circuit topology.

### `path.ts`

Contains path build and interpolation utilities.

- `buildPath(points)` — converts a sequence of points into a `Path` with segment lengths.
- `pointAt(path, d)` — returns a point at distance `d` along a path.
- `arcPts` / `loopPts` — helper point arrays for the orbit circle.

The animation system uses these helpers to move comets smoothly along the circuit.

### `topology.ts`

Defines the circuit wiring and comet travel paths.

- Gate instances: `NOT`, `XOR`, `LATCH`.
- Key junctions: `CONV`, `SPLIT1`, `SPLIT2`, `Q_OUT`, `QBAR_OUT`.
- Static wire list: `WIRES`.
- Splitter dots: `SPLITTER_DOTS`.
- Comet paths: `loopQ`, `loopQBar`, `ghostQ`, `ghostQBar`, `crossPath1`, `crossPath2`, `notBranchPath`.
- Trigger distances used to map path progress to semantic phases.

This is the central file for the circuit layout and signal flow. Use it when you need to trace how the moving comet interacts with the static wires and phase triggers.

### `types.ts`

Defines shared types used across the circuit library.

- `Point`, `Seg`, `Path` — path and coordinate shapes.
- `CircuitPhase` — named animation phases: `question`, `orbit`, `memory`, `loop`.
- `CircuitEvents` — optional callback interface for phase notifications.

### `hook.ts`

Contains the main animation hook used by the React component.

- `useDigitalHeartbeat` — the library's primary hook.
- This is the most important file for consumers who want to mount the circuit in a component and drive animations.
- Look here for how the hook accepts events, initializes canvas state, and advances comet positions.

## How to use this library

From a React component:

1. Import the hook and event types:
   ```ts
   import { useDigitalHeartbeat, type CircuitEvents } from "@/lib/circuit";
   ```
2. Provide phase callbacks if you want to sync UI state:
   ```ts
   const events: CircuitEvents = {
     onPhase: (phase) => {
       // react to question/orbit/memory/loop events
     },
   };
   const { ref, phase } = useDigitalHeartbeat({ events });
   ```
3. Attach the returned `ref` to a `<canvas>` element and render it.

If you only need the visual effect, consume `useDigitalHeartbeat` without callbacks.

## When to customize

- Change timing or comet speed: edit `config.ts` (`BASE`) or timing code in `hook.ts`.
- Change gate placement and shape: edit `gates.ts` and `topology.ts`.
- Change wire routing or event trigger points: edit `topology.ts`.
- Change colors: edit `config.ts`.
- Add new visual effects: extend `draw.ts` or the hook-driven animation loop.

## Recommended starting points

For a new agent or maintainer:

- Start at `src/lib/circuit/index.ts` to see exports.
- Read `src/lib/circuit/hook.ts` for the runtime behavior and canvas integration.
- Read `src/lib/circuit/topology.ts` to understand how the circuit is constructed.
- Inspect `src/lib/circuit/draw.ts` for low-level rendering primitives.

## Notes

- The circuit library is intentionally designed for a single fixed topology.
- The path system is based on precomputed polyline segments, not physics simulation.
- The library is used to visually correlate circuit phases with resume UI copy and state.
