// useDigitalHeartbeat — the main animation loop.
//
// State machine overview:
//
//   latchBit    — which NAND gate is "active" (0 = top/Q, 1 = bot/Q̄).
//                 Determines which loop path (loopQ vs loopQBar) the main comet follows.
//
//   headA       — main comet's cumulative distance along the active loop (never resets,
//                 wraps each frame so it can cross the loop total cleanly).
//
//   pendingBit  — the NEXT latchBit, staged when the comet exits the NAND gate
//                 (dLATCH_TRIGGER), applied at the next CONV crossing.
//                 This delay gives the cross-coupling comet time to visually "arrive"
//                 before the stored bit visually changes.
//
//   bitPop_1    — flash intensity (0–1) that decays after each latch trigger.
//                 Drives the latch bubble glow pulse.
//
//   ghostActive — a fading comet on the path we just LEFT (the old feedback arc).
//   ghostHead   — ghost comet's distance along ghostCurrentPath.
//   ghostAlpha  — ghost comet opacity, fades as it travels (1 → 0 over path length).
//
//   cross1/cross2 — cross-coupling comets: visually show Q→R-input and Q̄→S-input signals.
//                   When cross1 or cross2 arrives at its destination, pendingBit is staged.

import { useIsMobile } from "@/hooks/useDevice";
import type { RefObject } from "react";
import { useEffect } from "react";
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
import {
  crossPath1,
  crossPath2,
  dLATCH_TRIGGER,
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
): void {
  const isMobile = useIsMobile();

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
    let headA   = 0;      // cumulative distance along active loop
    let latchBit = 0;     // 0 = loopQ (top NAND active), 1 = loopQBar (bot NAND active)
    let pendingBit = 0;   // staged next latchBit; committed when headA crosses CONV (d=0)

    // Latch trigger pulse
    let bitPop_1 = 0;     // decays 0→1 after each latch trigger; drives bubble glow

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

      scale = isMobile
        ? Math.min(h / DESIGN_W, w / DESIGN_H) * 1.25
        : Math.min(w / DESIGN_W, h / DESIGN_H) * 0.95;

      // Read actual button position so the orbit aligns with the DOM element.
      let targetX = w / 2;
      let targetY = h / 2;
      if (buttonRef?.current) {
        const btnRect  = buttonRef.current.getBoundingClientRect();
        const contRect = container!.getBoundingClientRect();
        targetX = btnRect.left - contRect.left + btnRect.width  / 2;
        targetY = btnRect.top  - contRect.top  + btnRect.height / 2;
      }

      // Clamp scale so the full diagram fits around the button.
      // Diagram extends 400px left, 170px right, 150px above/below from CIRC_CX/CY.
      const fitH = Math.min(targetX / (CIRC_CX - 90), (w - targetX) / (660 - CIRC_CX));
      const fitV = Math.min(targetY / (CIRC_CY - 110), (h - targetY) / (410 - CIRC_CY));
      scale = Math.min(scale, fitH, fitV);

      ox    = targetX - CIRC_CX * scale;
      oy    = targetY - CIRC_CY * scale;
      // Mobile: diagram is rotated 90° CCW (swap width/height axes)
      mobTx = targetX - CIRC_CY * scale;
      mobTy = targetY + CIRC_CX * scale;
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
      const loop = latchBit === 0 ? loopQ : loopQBar;
      const T    = loop.total;
      const prev = headA;
      headA += BASE * dt;

      // Normalize positions into [0, T) for threshold comparisons
      const a = ((prev  % T) + T) % T;
      const b = ((headA % T) + T) % T;

      // ── Latch trigger: comet exits the active NAND gate ──────────────
      if (crossed(a, b, dLATCH_TRIGGER)) {
        bitPop_1 = 1;
        // Ghost fires on the path we're about to leave
        ghostCurrentPath = latchBit === 0 ? ghostQ : ghostQBar;
        ghostActive = true;
        ghostHead   = 0;
        ghostAlpha  = 1;
        // Cross-coupling comet fires from the active Q output
        if (latchBit === 0) {
          cross1Active = true; cross1Head = 0; cross1Alpha = 1; // Q → R-input
        } else {
          cross2Active = true; cross2Head = 0; cross2Alpha = 1; // Q̄ → S-input
        }
        // pendingBit is set when the cross comet ARRIVES (see below), not here
      }

      // ── Bit commit: apply pending latch state at CONV (loop start) ───
      // Both loops start at CONV (d=0) so switching here is seamless.
      if (pendingBit !== latchBit && crossed(a, b, 0)) {
        latchBit = pendingBit;
      }

      if (headA >= T) headA -= T;
      if (bitPop_1 > 0) bitPop_1 = Math.max(0, bitPop_1 - dt * 3.2);

      // Ghost comet advances until it reaches its path end
      if (ghostActive) {
        ghostHead  += BASE * dt;
        ghostAlpha  = Math.max(0, 1 - ghostHead / ghostCurrentPath.total);
        if (ghostHead >= ghostCurrentPath.total) { ghostActive = false; ghostHead = 0; }
      }

      // Cross-coupling comets — pendingBit is staged when each ARRIVES at destination
      if (cross1Active) {
        cross1Head += BASE * dt;
        cross1Alpha = Math.max(0, 1 - cross1Head / crossPath1.total);
        if (cross1Head >= crossPath1.total) {
          cross1Active = false; cross1Head = 0;
          pendingBit = 1 - latchBit; // cross comet arrived at R-input → schedule toggle
        }
      }
      if (cross2Active) {
        cross2Head += BASE * dt;
        cross2Alpha = Math.max(0, 1 - cross2Head / crossPath2.total);
        if (cross2Head >= crossPath2.total) {
          cross2Active = false; cross2Head = 0;
          pendingBit = 1 - latchBit; // cross comet arrived at S-input → schedule toggle
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
        // 90° CCW rotation: maps design (x,y) → screen (-y, x) before scale+offset
        ctx.setTransform(0, -scale * DPR, scale * DPR, 0, mobTx * DPR, mobTy * DPR);
      } else {
        ctx.setTransform(scale * DPR, 0, 0, scale * DPR, ox * DPR, oy * DPR);
      }

      // Blit static background (wires, gates)
      ctx.drawImage(bg, 0, 0, DESIGN_W, DESIGN_H);

      const activeLoop = latchBit === 0 ? loopQ : loopQBar;

      // Active-path aura: faint warm glow along current loop
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
      // tBranch ∈ (0,1) maps the window; sin curve ramps up and back down smoothly.
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
      const headPtA = pointAt(activeLoop, headA);
      const wGateA  = near(headPtA, XOR.cx, XOR.cy, 42);
      const wN1A    = near(
        headPtA,
        latchBit === 0 ? LATCH.top.cx : LATCH.bot.cx,
        latchBit === 0 ? LATCH.top.cy : LATCH.bot.cy,
        42,
      );

      drawFlash(ctx, XOR.cx, XOR.cy, wGateA, GCOL.gate);
      drawFlash(
        ctx,
        latchBit === 0 ? LATCH.top.cx : LATCH.bot.cx,
        latchBit === 0 ? LATCH.top.cy : LATCH.bot.cy,
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
