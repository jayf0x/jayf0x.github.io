# Circuit Animation Redesign — Execution Plan

**Goal**: Replace the current AND-gate + NOR-pair circuit with a cleaner
XOR-gate + SR-NAND-latch design. Poetic loop stays the same:
Input → Split → Process (XOR) → Memory (CV button + SR Latch) → Feedback → split again.

---

## File map (all in `src/lib/circuit/`)

| File | Role | Touch for this task? |
|------|------|---------------------|
| `config.ts` | constants, colors | no |
| `types.ts` | Point / Seg / Path | no |
| `path.ts` | buildPath, pointAt, arcPts | no |
| `gates.ts` | gate geometry factories | **YES** — add xorGate, srLatch |
| `topology.ts` | wire arrays, loop paths | **YES** — full redesign |
| `draw.ts` | renderStatic, drawComet, drawFlash | **YES** — update gate rendering |
| `hook.ts` | React hook, animation loop | **YES** — update gate references + flash targets |

---

## §Gates — `gates.ts`

### Replace `andGate` → `xorGate`

XOR = OR body + extra back arc (input side). No bubble.

```ts
export type XorGateShape = { outerArc: string; body: string; cx: number; cy: number };

export function xorGate(lx: number, cy: number): XorGateShape {
  // back arc (drawn separately so it floats behind body)
  const outerArc = `M ${lx - 6},${cy - 20} Q ${lx + 6},${cy} ${lx - 6},${cy + 20}`;
  // OR-shaped body
  const body = `M ${lx},${cy - 20} Q ${lx + 12},${cy} ${lx},${cy + 20} Q ${lx + 30},${cy + 20} ${lx + 48},${cy} Q ${lx + 30},${cy - 20} ${lx},${cy - 20} Z`;
  return { outerArc, body, cx: lx + 28, cy };
  // output tip at (lx+48, cy)
}
```

Input wire join points:
- top input: `(lx, cy - 12)`
- bottom input: `(lx, cy + 12)`
- output: `(lx + 48, cy)`

### Replace `norGate × 2` → `srLatch`

SR NAND asynchronous flip-flop. Reference:
https://www.electricaltechnology.org/wp-content/uploads/2019/08/Active-Low-SR-NAND-asynchronous-Flip-flop-Symbol-SR-Latch.png

Two NAND gates (AND body + output bubble), cross-coupled:
- Top NAND: S input → Q output
- Bot NAND: R input → Q-bar output

```ts
export type SrLatchShape = {
  top: { path: string; bub: [number, number, number]; cx: number; cy: number };
  bot: { path: string; bub: [number, number, number]; cx: number; cy: number };
  cross: [Point, Point, Point, Point][]; // 2 cross-coupling wire paths
  qOut: Point;    // Q output (top NAND bubble tip)
  qBarOut: Point; // Q-bar output (bot NAND bubble tip)
};

export function srLatch(lx: number, cy: number, gap = 50): SrLatchShape {
  // gap = vertical distance between the two NAND gate centers
  const ty = cy - gap / 2; // top NAND center y
  const by = cy + gap / 2; // bot NAND center y

  // NAND body = AND shape: 40px wide, 40px tall (±20 from cy)
  const nandPath = (gy: number) =>
    `M ${lx},${gy - 20} L ${lx},${gy + 20} Q ${lx + 40},${gy + 20} ${lx + 40},${gy} Q ${lx + 40},${gy - 20} ${lx},${gy - 20} Z`;

  const bubR = 5;
  const topBub: [number, number, number] = [lx + 45, ty, bubR];
  const botBub: [number, number, number] = [lx + 45, by, bubR];

  // Cross coupling:
  //   top output (lx+50, ty) → bot lower input (lx, by+10)
  //   bot output (lx+50, by) → top lower input (lx, ty+10)
  const cross: [Point, Point, Point, Point][] = [
    [[lx + 50, ty], [lx + 56, ty], [lx + 56, by + 10], [lx, by + 10]],
    [[lx + 50, by], [lx + 60, by], [lx + 60, ty + 10], [lx, ty + 10]],
  ];

  return {
    top: { path: nandPath(ty), bub: topBub, cx: lx + 20, cy: ty },
    bot: { path: nandPath(by), bub: botBub, cx: lx + 20, cy: by },
    cross,
    qOut: [lx + 50, ty],
    qBarOut: [lx + 50, by],
  };
}
```

---

## §Topology — `topology.ts`

### Gate instances

```ts
export const NOT  = notGate(240, 290);   // keep
export const XOR  = xorGate(360, 260);   // was AND
export const LATCH = srLatch(590, 260, 50); // was N1+N2 at x=560
```

### Key points

```ts
export const CONV:   Point = [90, 260];             // input arrival
export const SPLIT1: Point = [130, 260];            // fan-out before XOR
export const SPLIT2: Point = [CIRC_CX + CIRC_R, CIRC_CY]; // = [550, 260]
```

### Static wires

```ts
export const WIRES: Point[][] = [
  // ── main signal ──────────────────────────────────────────────────
  [CONV, SPLIT1],                                          // 0: input trunk
  [SPLIT1, [130, 240], [360, 240]],                        // 1: direct → XOR top
  [SPLIT1, [130, 290], [240, 290]],                        // 2: → NOT in
  [[284, 290], [330, 290], [330, 280], [360, 280]],        // 3: NOT out → XOR bot
  [[408, 260], [CIRC_CX - CIRC_R, CIRC_CY]],              // 4: XOR out → circle left
  [SPLIT2, [550, 235], [590, 235]],                        // 5: circle → SR latch S (top)
  [SPLIT2, [550, 285], [590, 285]],                        // 6: circle → SR latch R (bot)
  // ── feedback arcs (dim) ──────────────────────────────────────────
  [SPLIT2, [660, 260], [660, 110], [90, 110], CONV],       // 7: top feedback
  [SPLIT2, [660, 260], [660, 410], [90, 410], CONV],       // 8: bot feedback
];
```

> Note: The two feedback arcs both exit SPLIT2 the same way before diverging at
> `(660, 260)`. Add a junction dot there too, or split them to top/bot first:
> `[SPLIT2, [660, 210], [660, 110], [90, 110], CONV]` and
> `[SPLIT2, [660, 310], [660, 410], [90, 410], CONV]`.

### Cross-coupling (inside LATCH, drawn in draw.ts)

Remove the old `CROSS` constant. The SR latch cross wires are part of `LATCH.cross`.

### Splitter dots

```ts
export const SPLITTER_DOTS: Point[] = [CONV, SPLIT1, SPLIT2];
```

### Comet loop paths

**loopHi** (comA) — top/direct route:

```ts
const PRE_HI: Point[] = [
  CONV, SPLIT1, [130, 240], [360, 240],  // direct to XOR top
  [408, 260],                             // XOR output
  [CIRC_CX - CIRC_R, CIRC_CY],           // circle left edge
];
const SUF_HI: Point[] = [
  // after top arc exit at SPLIT2
  [660, 210], [660, 110], [90, 110], CONV,
];
export const loopHi = buildPath([...PRE_HI, ...arcPts(true).slice(1), ...SUF_HI]);
```

**loopLo** (comB) — NOT-gate route:

```ts
const PRE_LO: Point[] = [
  CONV, SPLIT1, [130, 290], [240, 290],  // to NOT
  [284, 290], [330, 290], [330, 280], [360, 280], // NOT→XOR bottom
  [408, 260],
  [CIRC_CX - CIRC_R, CIRC_CY],
];
const SUF_LO: Point[] = [
  [660, 310], [660, 410], [90, 410], CONV,
];
export const loopLo = buildPath([...PRE_LO, ...arcPts(false).slice(1), ...SUF_LO]);
```

### Trigger distances (§TriggerDistances)

The "bit pop" triggers when a comet exits the SR latch Q / Q-bar outputs.
Replace `dNOR_A` / `dNOR_B` with:

```ts
// distance to LATCH.qOut = (LATCH.top.bub[0], LATCH.top.cy)
export const dLATCH_A = buildPath([
  ...PRE_HI, ...arcPts(true).slice(1), [550, 235], [590, 235], [LATCH.top.bub[0], LATCH.top.cy],
]).total;

// distance to LATCH.qBarOut
export const dLATCH_B = buildPath([
  ...PRE_LO, ...arcPts(false).slice(1), [550, 285], [590, 285], [LATCH.bot.bub[0], LATCH.bot.cy],
]).total;
```

---

## §Draw — `draw.ts`

### renderStatic changes

1. Replace `AND` draw block with XOR:
   ```ts
   // XOR gate: back arc first, then body
   bgx.strokeStyle = C.ink;
   bgx.lineWidth = 1.6;
   bgx.stroke(new Path2D(XOR.outerArc)); // dashed or solid — designer choice
   bgx.stroke(new Path2D(XOR.body));
   ```

2. Replace NOR pair + CROSS with SR latch:
   ```ts
   // SR NAND latch — two gate bodies + bubbles
   [LATCH.top, LATCH.bot].forEach((g) => {
     bgx.stroke(new Path2D(g.path));
     bgx.beginPath();
     bgx.arc(g.bub[0], g.bub[1], g.bub[2], 0, tau);
     bgx.stroke();
   });
   // cross-coupling wires
   bgx.strokeStyle = `rgba(${GCOL.latch},0.65)`;
   bgx.lineWidth = 1.4;
   LATCH.cross.forEach((w) => {
     bgx.beginPath();
     w.forEach((p, j) => (j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
     bgx.stroke();
   });
   ```

3. Add `SPLIT1` to splitter dots (already in `SPLITTER_DOTS`).

---

## §Animation — `hook.ts`

1. Import `XOR`, `LATCH`, `dLATCH_A`, `dLATCH_B` from topology; remove `AND`, `N1`, `N2`, `dNOR_A`, `dNOR_B`.
2. In `step()`: replace `dNOR_A/B` with `dLATCH_A/B`.
3. In `frame()`: replace N1/N2 bubble glow positions with `LATCH.top.bub` and `LATCH.bot.bub`.
4. Update `near` calls: replace `AND.cx/cy` with `XOR.cx/cy`; replace `N1/N2.cx/cy` with `LATCH.top/bot.cx/cy`.
5. Update comet color shifts: same logic, just use new gate refs.

---

## Visual tuning notes

- XOR gate `outerArc`: consider `setLineDash([4,3])` for the back curve to visually separate it from the body.
- SR latch label: optionally draw "S", "R", "Q", "Q̄" text labels near inputs/outputs using `bgx.fillText`.
- SPLIT1 dot size: 4px instead of 3px to make the fan-out more visible.
- The `teal` color (`C.teal = "255,124,84"`) is actually orange-ish. Consider changing to real teal `"52,225,196"` for the latch glow (`GCOL.latch` already is).

---

## Checklist

- [ ] Add `xorGate()` to `gates.ts`
- [ ] Add `srLatch()` to `gates.ts`
- [ ] Update `topology.ts`: gate instances, WIRES, SPLITTER_DOTS, loop paths, trigger distances
- [ ] Update `draw.ts`: renderStatic to draw XOR + SR latch
- [ ] Update `hook.ts`: import new gates, update step/frame references
- [ ] Smoke test: `pnpm dev` — confirm two comets still run, gates glow on pass
