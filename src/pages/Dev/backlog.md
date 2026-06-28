# Dev Page Backlog

## Goal

Create a new animated pulse flow for the Dev page that transforms this static ASCII concept into a polished canvas-driven circuit-like animation:

```md
<div align="center">
<pre>
┌──▶ Friction ──▶ Focus ──▶ Understanding ──┐
│                                           │
└────────────────◀ learning ────────────────┘
</pre>
</div>
```

This should feel like a logical pulse traveling through a small graph, with text highlights and a custom node or gate style.

## Current status

The Dev page currently exists as:

- `src/pages/Dev/index.tsx`
- `src/pages/Dev/CircuitInfo.tsx`
- `src/pages/Dev/Quote.tsx`
- `src/pages/Dev/useCircuitPhase.ts`

A copy of the circuit library is now present inside the Dev page folder, so this page can be rewritten for its own use case without needing to preserve compatibility with the shared resume circuit.

The existing `src/pages/Resume` implementation remains the best example for how the original hook and event pattern are wired together.

## Pragmatic direction

The best approach is:

1. Keep the existing resume circuit library intact as a reference.
2. Use `src/pages/Resume` as the example for how the hook and event pattern are integrated.
3. Reuse generic core utilities only when they make sense, but prefer the Dev page's copied implementation for this specific flow.
4. Build a new flow-specific implementation for the Dev page.

Because the Dev page now has its own copied circuit library, the agent can rewrite the Dev implementation to fit this use case directly rather than preserving compatibility with the original library.

## Fresh session implementation plan

### 1. Define the visual concept

- Build a new custom topology for the four nodes:
  - `Friction`
  - `Focus`
  - `Understanding`
  - `learning`
- Use a pulse or comet that travels clockwise around the loop.
- Make each label light up as the pulse passes its zone.
- Optionally create one new custom gate/node shape if it helps the graphic feel more circuit-like.

### 2. Create a new flow module

Add a new module under `src/lib` or inside `src/lib/circuit` such as:

- `src/lib/flow/` or `src/lib/circuit/flow.ts`
- `src/lib/flow/hook.ts`

This module should contain:

- layout and waypoint definitions
- static rendering for labels/nodes
- path creation for the pulse travel
- a hook that accepts `CircuitEvents`-style callbacks, or a new `FlowEvents` interface

### 3. Reuse shared utilities

Use the existing circuit utilities if possible:

- `buildPath()` from `src/lib/circuit/path.ts`
- `pointAt()` from `src/lib/circuit/path.ts`
- `drawComet()` and/or a small pulse variant in `src/lib/circuit/draw.ts`
- `CircuitPhase` / event callback pattern from `src/lib/circuit/types.ts`

If those utilities are too specific, copy only the needed code into the new module.

### 4. Update Dev page components

The Dev page should be refactored to use the new flow implementation.

Potential component structure:

- `src/pages/Dev/index.tsx` - page container and layout
- `src/pages/Dev/useFlowPhase.ts` - phase tracking hook for `Friction / Focus / Understanding / learning`
- `src/pages/Dev/Quote.tsx` - maybe replaced with a flow-specific label/highlight component
- `src/pages/Dev/CircuitInfo.tsx` - optional info popover if still useful

### 5. Build the animation hook

The hook should:

- mount a canvas into the Dev page container
- draw the static topology once on an offscreen or base canvas
- animate a pulse along the path using `requestAnimationFrame`
- fire hook callbacks when the pulse reaches each named node
- expose a `ref` or render target for the canvas container

### 6. Add highlight text behavior

- Use a React state hook to store the active node/phase.
- When the pulse reaches a waypoint, highlight the corresponding text chip.
- `Quote.tsx` can show the current active phase as lit.

## File-by-file TODO

### `src/pages/Dev/index.tsx`

- Replace `useDigitalHeartbeat` with the new Dev flow hook.
- Keep `DefaultLayout` and page styling.
- Keep `CircuitInfo` if desired or rename it to a flow info helper.

### `src/pages/Dev/useCircuitPhase.ts`

- Rename or duplicate into `useFlowPhase.ts`.
- Track the active flow stage and optionally cycle count.
- Adjust event names if using a new stage enum.

### `src/pages/Dev/Quote.tsx`

- Replace hardcoded circuit phase fragments with the new flow labels.
- Show text highlights for `Friction`, `Focus`, `Understanding`, `learning`.

### `src/lib/circuit/*` or new `src/lib/flow/*`

- Add new topology file with node layout and path definitions.
- Add new draw/render helpers for the custom pulse.
- Add a new hook or extend `useDigitalHeartbeat` only if it is easy.
- Prefer local Dev copies over shared circuit compatibility when the page needs a very specific visual.

### `src/lib/circuit/README.md`

- This file can remain as documentation for the existing circuit library.
- If the new flow uses shared utilities, mention that in the README later.

## Notes for the next session

- The immediate goal is not to preserve the old resume circuit behavior in the Dev page.
- The page should become an isolated experiment that can be swapped in without breaking the shared library.
- Prefer incremental implementation:
  1. static labels and canvas container
  2. simple pulse path and animation
  3. phase event callbacks and text highlights
  4. polish with custom node/gate styling

## Optional polish ideas

- Add a custom node shape that looks like a new logic gate.
- Use color-coded highlight rings or pulses for each stage.
- Keep the UI responsive and mobile-friendly like the rest of the page.
- If the current circuit hook is reusable, keep it as a shared base and layer the new flow on top.
