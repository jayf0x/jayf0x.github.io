// useDigitalHeartbeat — the main animation loop.
//
// State machine overview:
//
//   latchBit       — STORED bit displayed by the latch bubbles (0 = top/Q glows, 1 = bot/Q̄).
//                    Flips the instant the cross-coupling comet arrives at the opposite
//                    NAND's input — that's the physical moment the latch toggles.
//
//   loopBit        — which loop path (loopQ vs loopQBar) the main comet follows.
//                    Swapped at the CONV crossing so the path change is seamless
//                    (both loops share the CONV → SPLIT2 prefix). May briefly differ
//                    from latchBit while the comet finishes the old feedback arc.
//
//   headA          — main comet's cumulative distance along the active loop (never resets,
//                    wraps each frame so it can cross the loop total cleanly).
//
//   pendingLoopBit — the NEXT loopBit, staged when the cross-coupling comet ARRIVES,
//                    applied at the next CONV crossing.
//
//   bitPop_1       — flash intensity (0–1) that decays after each latch toggle.
//                    Drives the latch bubble glow pulse; fires on cross arrival.
//
//   ghostActive — a fading comet on the path we just LEFT (the old feedback arc).
//   ghostHead   — ghost comet's distance along ghostCurrentPath.
//   ghostAlpha  — ghost comet opacity, fades as it travels (1 → 0 over path length).
//
//   cross1/cross2 — cross-coupling comets: visually show Q→R-input and Q̄→S-input signals.
//                   When cross1 or cross2 arrives at its destination, pendingBit is staged.

import { useIsMobile } from "@/hooks/useDevice";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import {
  BASE,
  C,
  CIRC_CX,
  CIRC_CY,
  DESIGN_H,
  DESIGN_W,
  GCOL,
  tau,
} from "./config";
import { drawComet, drawFlash, renderStatic } from "./draw";
import { pointAt } from "./path";
import type { CircuitEvents } from "./types";
import {
  crossPath1,
  crossPath2,
  dLATCH_TRIGGER,
  dORBIT_dist,
  dSPLIT1_dist,
  dXOR_dist,
  ghostQ,
  ghostQBar,
  LATCH,
  loopQ,
  loopQBar,
  NOT,
  notBranchPath,
  WIRES,
  XOR,
} from "./topology";
import type { Path } from "./types";

export function useDigitalHeartbeat(
  containerRef: RefObject<HTMLDivElement | null>,
  buttonRef?: RefObject<HTMLElement | null>,
  events?: CircuitEvents,
): void {
  const isMobile = useIsMobile();

  // Latest events kept in a ref so changing callbacks never restart the RAF loop.
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── offscreen bg canvas (drawn once, blit each frame) ─────────────────
    const bg  = document.createElement("canvas");
    const bgx = bg.getContext("2d") as CanvasRenderingContext2D;
    if (!bgx) return;

    function paintStatic() {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      bg.width  = DESIGN_W * DPR;
      bg.height = DESIGN_H * DPR;
      bgx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bgx.clearRect(0, 0, DESIGN_W, DESIGN_H);
      renderStatic(bgx);
    }

    // ── main canvas ───────────────────────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    // ── animation state ───────────────────────────────────────────────────

    // Main comet
    let headA   = 0;          // cumulative distance along active loop
    let latchBit = 0;         // STORED bit (bubble display); toggles when cross arrives
    let loopBit  = 0;         // ACTIVE loop path; toggles at CONV for seamless comet transition
    let pendingLoopBit = 0;   // staged loopBit; committed when headA crosses CONV (d=0)

    // Latch trigger pulse
    let bitPop_1 = 0;     // decays 0→1 after each latch toggle; drives bubble glow

    // Ghost comet (fades along the path just left after a latch toggle)
    let ghostActive = false;
    let ghostHead   = 0;
    let ghostAlpha  = 0;
    let ghostCurrentPath: Path = ghostQBar;

    // Cross-coupling comets (Q→R-input and Q̄→S-input internal feedback signals)
    let cross1Active = false, cross1Head = 0, cross1Alpha = 0;
    let cross2Active = false, cross2Head = 0, cross2Alpha = 0;

    // RAF bookkeeping
    let last  = 0;
    let rafId = 0;

    // ── responsive layout ─────────────────────────────────────────────────
    // The design space (750×520) is scaled and offset so CIRC_CX/CY maps to
    // the actual button center in the container.

    let scale = 1, ox = 0, oy = 0, mobTx = 0, mobTy = 0;

    function resize(w: number, h: number) {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);

      // Read actual button position so the orbit aligns with the DOM element.
      let targetX = w / 2;
      let targetY = h / 2;
      if (buttonRef?.current) {
        const btnRect  = buttonRef.current.getBoundingClientRect();
        const contRect = container!.getBoundingClientRect();
        targetX = Math.round(btnRect.left - contRect.left + btnRect.width  / 2);
        targetY = Math.round(btnRect.top  - contRect.top  + btnRect.height / 2);
      }

      if (isMobile) {
        // Rotated 90° CCW: design x-axis (feedLeft=90 → feedRight=890, 800 units)
        // maps to screen height; design y-axis (feedTop=110 → feedBot=410, 300 units)
        // maps to screen width. Scale to fit content extents, not full DESIGN bounds.
        const CONTENT_X = 800;
        const CONTENT_Y = 300;
        scale = Math.min(w / CONTENT_Y, h / CONTENT_X) * 0.95;
        // Clamp so the rotated content stays within the viewport. CIRC_CX is anchored
        // at targetY; design x extends ±400 around CIRC_CX → screen y range targetY ± 400*scale.
        const fitV = Math.min(targetY / (CIRC_CX - 90), (h - targetY) / (890 - CIRC_CX));
        scale = Math.min(scale, fitV);
        // CW rotation (see frame()): small design-x (CONV/question) lands at the
        // top so the [1][2][3] zones read top → bottom.
        mobTx = targetX + CIRC_CY * scale;
        mobTy = targetY - CIRC_CX * scale;
        return;
      }

      // Desktop: symmetric content (CIRC_CX ± 400, CIRC_CY ± 150). Scale to fit the
      // available half around the button (button is at left-1/2 so halves are equal).
      const fitH = Math.min(targetX / (CIRC_CX - 90), (w - targetX) / (890 - CIRC_CX));
      const fitV = Math.min(targetY / (CIRC_CY - 110), (h - targetY) / (410 - CIRC_CY));
      scale = Math.min(fitH, fitV) * 0.95;

      ox = targetX - CIRC_CX * scale;
      oy = targetY - CIRC_CY * scale;
    }

    // ── animation helpers ─────────────────────────────────────────────────

    // True if position x crossed threshold in [a,b] (wrapping-aware).
    function crossed(a: number, b: number, x: number) {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    // Returns 0–1 proximity of pt to gate center (cx,cy) within threshold th.
    function near(pt: [number, number], cx: number, cy: number, th: number) {
      return Math.max(0, 1 - Math.hypot(pt[0] - cx, pt[1] - cy) / th);
    }

    // ── per-frame logic ───────────────────────────────────────────────────

    function step(dt: number) {
      const loop = loopBit === 0 ? loopQ : loopQBar;
      const T    = loop.total;
      const prev = headA;
      headA += BASE * dt;

      // Normalize positions into [0, T) for threshold comparisons
      const a = ((prev  % T) + T) % T;
      const b = ((headA % T) + T) % T;

      // ── Phase events: fire as the comet passes each semantic zone ────
      const onPhase = eventsRef.current?.onPhase;
      if (onPhase) {
        if (crossed(a, b, dXOR_dist)) onPhase("question");
        if (crossed(a, b, dORBIT_dist)) onPhase("orbit");
        if (crossed(a, b, dLATCH_TRIGGER)) onPhase("memory");
        if (crossed(a, b, 0)) onPhase("loop");
      }

      // ── Latch trigger: comet exits the active NAND gate ──────────────
      if (crossed(a, b, dLATCH_TRIGGER)) {
        // Ghost fires on the path we're about to leave
        ghostCurrentPath = loopBit === 0 ? ghostQ : ghostQBar;
        ghostActive = true;
        ghostHead   = 0;
        ghostAlpha  = 1;
        // Cross-coupling comet fires from the active Q output
        if (loopBit === 0) {
          cross1Active = true; cross1Head = 0; cross1Alpha = 1; // Q → R-input
        } else {
          cross2Active = true; cross2Head = 0; cross2Alpha = 1; // Q̄ → S-input
        }
        // latchBit + bubble flash fire when the cross comet ARRIVES (below)
      }

      // ── Loop swap: apply pending loop path at CONV (loop start) ──────
      // Both loops share the CONV → SPLIT2 prefix so switching here is seamless.
      // Decoupled from latchBit (which already toggled earlier on cross arrival).
      if (pendingLoopBit !== loopBit && crossed(a, b, 0)) {
        loopBit = pendingLoopBit;
      }

      if (headA >= T) headA -= T;
      if (bitPop_1 > 0) bitPop_1 = Math.max(0, bitPop_1 - dt * 3.2);

      // Ghost comet advances until it reaches its path end
      if (ghostActive) {
        ghostHead  += BASE * dt;
        ghostAlpha  = Math.max(0, 1 - ghostHead / ghostCurrentPath.total);
        if (ghostHead >= ghostCurrentPath.total) { ghostActive = false; ghostHead = 0; }
      }

      // Cross-coupling comets — arrival flips stored latchBit + bubble flash,
      // and schedules the comet's loop swap for the next CONV crossing.
      if (cross1Active) {
        cross1Head += BASE * dt;
        cross1Alpha = Math.max(0, 1 - cross1Head / crossPath1.total);
        if (cross1Head >= crossPath1.total) {
          cross1Active = false; cross1Head = 0;
          latchBit       = 1 - latchBit;  // stored bit toggles NOW — cross hit R-input
          pendingLoopBit = 1 - loopBit;   // schedule comet path swap at next CONV
          bitPop_1       = 1;             // flash the newly-active bubble
        }
      }
      if (cross2Active) {
        cross2Head += BASE * dt;
        cross2Alpha = Math.max(0, 1 - cross2Head / crossPath2.total);
        if (cross2Head >= crossPath2.total) {
          cross2Active = false; cross2Head = 0;
          latchBit       = 1 - latchBit;  // stored bit toggles NOW — cross hit S-input
          pendingLoopBit = 1 - loopBit;
          bitPop_1       = 1;
        }
      }
    }

    // ── render ────────────────────────────────────────────────────────────

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      step(dt);

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isMobile) {
        // 90° CW rotation: maps design (x,y) → screen (y, -x) before scale+offset
        ctx.setTransform(0, scale * DPR, -scale * DPR, 0, mobTx * DPR, mobTy * DPR);
      } else {
        ctx.setTransform(scale * DPR, 0, 0, scale * DPR, ox * DPR, oy * DPR);
      }

      const activeLoop = loopBit === 0 ? loopQ : loopQBar;

      // Active-path aura: faint warm glow along current loop.
      // Drawn BEFORE the static bg blit so opaque gate fills cover the aura where it
      // crosses gate bodies — the aura then reads as a glow on the wires only.
      ctx.save();
      ctx.strokeStyle = `rgba(${C.warm},0.12)`;
      ctx.lineWidth   = 2;
      ctx.lineJoin    = "round";
      ctx.lineCap     = "round";
      ctx.beginPath();
      ctx.moveTo(activeLoop.segs[0].a[0], activeLoop.segs[0].a[1]);
      for (const s of activeLoop.segs) ctx.lineTo(s.b[0], s.b[1]);
      ctx.stroke();
      ctx.restore();

      // NOT branch aura: glows while main comet is between SPLIT1 and XOR top-input.
      // Also pre-bg so the NOT triangle and XOR body cover it within their fills.
      const ha       = ((headA % activeLoop.total) + activeLoop.total) % activeLoop.total;
      const tBranch  = (ha - dSPLIT1_dist) / (dXOR_dist - dSPLIT1_dist);
      const notAura  = tBranch > 0 && tBranch < 1 ? Math.sin(tBranch * Math.PI) * 0.45 : 0;

      if (notAura > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(${C.warm},${notAura})`;
        ctx.lineWidth   = 2.5;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        [WIRES[2], WIRES[3]].forEach((w) => {
          ctx.beginPath();
          w.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.stroke();
        });
        ctx.restore();
      }

      // Blit static background (wires + opaque gate fills) on top of auras.
      ctx.drawImage(bg, 0, 0, DESIGN_W, DESIGN_H);

      // Radial flash glows around gate centers — drawn ON TOP of bg for visible halo.
      drawFlash(ctx, NOT.cx, NOT.cy, notAura * 0.8, GCOL.not);

      // NOT branch comet: travels SPLIT1 → NOT gate → XOR bot input in parallel
      const notDist = ha - dSPLIT1_dist;
      if (notDist > 0 && notDist < notBranchPath.total) {
        drawComet(ctx, notBranchPath, notDist, C.warm, 18, 2);
      }

      // Cross-coupling comets
      if (cross1Active && cross1Alpha > 0.02) {
        ctx.save(); ctx.globalAlpha = cross1Alpha;
        drawComet(ctx, crossPath1, cross1Head, C.warm, 18, 2);
        ctx.restore();
      }
      if (cross2Active && cross2Alpha > 0.02) {
        ctx.save(); ctx.globalAlpha = cross2Alpha;
        drawComet(ctx, crossPath2, cross2Head, C.warm, 18, 2);
        ctx.restore();
      }

      // Latch bubbles: active Q glows on beat, inactive Q̄ stays dim
      const activeIsPrimary = latchBit === 0;
      const latches = [
        { x: LATCH.top.bub[0], y: LATCH.top.bub[1], pop: activeIsPrimary ? bitPop_1 : 0, primary: activeIsPrimary  },
        { x: LATCH.bot.bub[0], y: LATCH.bot.bub[1], pop: activeIsPrimary ? 0 : bitPop_1, primary: !activeIsPrimary },
      ];
      for (const { x, y, pop, primary } of latches) {
        const alpha  = pop > 0 ? 1       : primary ? 0.55 : 0.18;
        const radius = pop > 0 ? 5 + pop * 2 : primary ? 4 : 2.5;
        const blur   = pop > 0 ? 14      : primary ? 8   : 2;
        ctx.save();
        ctx.shadowColor = `rgb(${GCOL.latch})`;
        ctx.shadowBlur  = blur;
        ctx.fillStyle   = `rgba(${GCOL.latch},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, tau);
        ctx.fill();
        ctx.restore();
      }

      // Ghost comet: fades along the path just left after a latch toggle
      if (ghostActive && ghostAlpha > 0.02) {
        ctx.save(); ctx.globalAlpha = ghostAlpha;
        drawComet(ctx, ghostCurrentPath, ghostHead, GCOL.latch, 40, 3);
        ctx.restore();
      }

      // Main comet — color shifts: teal near latch, warm near XOR, warm otherwise
      // NAND proximity tracks loopBit (comet's path), not latchBit (display state),
      // so the flash follows the comet even after latchBit flips early on cross arrival.
      const headPtA = pointAt(activeLoop, headA);
      const wGateA  = near(headPtA, XOR.cx, XOR.cy, 42);
      const wN1A    = near(
        headPtA,
        loopBit === 0 ? LATCH.top.cx : LATCH.bot.cx,
        loopBit === 0 ? LATCH.top.cy : LATCH.bot.cy,
        42,
      );

      drawFlash(ctx, XOR.cx, XOR.cy, wGateA, GCOL.gate);
      drawFlash(
        ctx,
        loopBit === 0 ? LATCH.top.cx : LATCH.bot.cx,
        loopBit === 0 ? LATCH.top.cy : LATCH.bot.cy,
        wN1A,
        GCOL.latch,
      );

      const colA = wN1A > 0.2 ? GCOL.latch : wGateA > 0.2 ? GCOL.gate : C.warm;
      drawComet(ctx, activeLoop, headA, colA, 54, 4);

      rafId = requestAnimationFrame(frame);
    }

    // ── boot ──────────────────────────────────────────────────────────────
    paintStatic();
    const { width, height } = container.getBoundingClientRect();
    resize(width, height);

    const ro = new ResizeObserver(([entry]) => {
      const { inlineSize: w, blockSize: h } = entry.contentBoxSize[0];
      resize(w, h);
    });
    ro.observe(container);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);
}
