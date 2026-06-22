import type { RefObject } from "react";
import { useEffect } from "react";
import {
  BASE,
  C,
  CIRC_CX,
  CIRC_CY,
  CIRC_R,
  DESIGN_H,
  DESIGN_W,
  GCOL,
  tau,
} from "./config";
import { drawComet, drawFlash, renderStatic } from "./draw";
import { pointAt } from "./path";
import type { Path } from "./types";
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

// Visual center of the full diagram (x: 90–660, y: 110–410)
const CCX = (90 + 660) / 2; // 375
const CCY = 260;

export function useDigitalHeartbeat(
  containerRef: RefObject<HTMLDivElement | null>,
  buttonRef?: RefObject<HTMLElement | null>,
  labelRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── offscreen bg canvas (static, drawn once) ──────────────────────────
    const bg = document.createElement("canvas");
    const bgx = bg.getContext("2d")!;

    function paintStatic() {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      bg.width = DESIGN_W * DPR;
      bg.height = DESIGN_H * DPR;
      bgx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bgx.clearRect(0, 0, DESIGN_W, DESIGN_H);
      renderStatic(bgx);
    }

    // ── main canvas ───────────────────────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    // ── animation state ───────────────────────────────────────────────────
    let headA = 0;
    let bitPop_1 = 0;
    let latchBit = 0;       // 0: active loop is loopQ, 1: loopQBar
    let pendingBit = 0;     // flips at latch trigger, applied at next CONV wrap
    let ghostActive = false;
    let ghostHead = 0;
    let ghostAlpha = 0;
    let ghostCurrentPath: Path = ghostQBar;
    let cross1Active = false, cross1Head = 0, cross1Alpha = 0;
    let cross2Active = false, cross2Head = 0, cross2Alpha = 0;
    let last = 0;
    let rafId = 0;

    // ── responsive layout ─────────────────────────────────────────────────
    let scale = 1, ox = 0, oy = 0;
    let mobMode = false, mobTx = 0, mobTy = 0;

    // Position overlays so the button sits at the circuit circle (CIRC_CX, CIRC_CY)
    // while the diagram is centered on CCX, CCY in the container.
    function positionOverlays() {
      const btnX = mobMode ? CIRC_CY * scale + mobTx : CIRC_CX * scale + ox;
      const btnY = mobMode ? -CIRC_CX * scale + mobTy : CIRC_CY * scale + oy;
      if (buttonRef?.current) {
        buttonRef.current.style.left = `${btnX}px`;
        buttonRef.current.style.top  = `${btnY}px`;
      }
      if (labelRef?.current) {
        labelRef.current.style.left = `${btnX}px`;
        labelRef.current.style.top  = `${btnY + CIRC_R * scale + 14}px`;
      }
    }

    function resize(w: number, h: number) {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      mobMode = w < h;
      scale = mobMode
        ? Math.min(h / DESIGN_W, w / DESIGN_H) * 0.95
        : Math.min(w / DESIGN_W, h / DESIGN_H) * 0.95;
      ox    = w / 2 - CCX * scale;
      oy    = h / 2 - CCY * scale;
      mobTx = w / 2 - CCY * scale;
      mobTy = h / 2 + CCX * scale;
      positionOverlays();
    }

    // ── animation helpers ─────────────────────────────────────────────────

    function crossed(a: number, b: number, x: number) {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    function near(pt: [number, number], cx: number, cy: number, th: number) {
      return Math.max(0, 1 - Math.hypot(pt[0] - cx, pt[1] - cy) / th);
    }

    function step(dt: number) {
      const loop = latchBit === 0 ? loopQ : loopQBar;
      const T = loop.total;
      const prev = headA;
      headA += BASE * dt;

      const a = ((prev % T) + T) % T;
      const b = ((headA % T) + T) % T;

      if (crossed(a, b, dLATCH_TRIGGER)) {
        bitPop_1 = 1;
        pendingBit = 1 - latchBit;
        // Ghost fires on the path we're about to leave
        ghostCurrentPath = latchBit === 0 ? ghostQ : ghostQBar;
        ghostActive = true; ghostHead = 0; ghostAlpha = 1;
        // Cross-coupling comets fire
        cross1Active = true; cross1Head = 0; cross1Alpha = 1;
        cross2Active = true; cross2Head = 0; cross2Alpha = 1;
      }

      // Switch active loop at CONV (position 0) — both loops start there, seamless
      if (pendingBit !== latchBit && crossed(a, b, 0)) {
        latchBit = pendingBit;
      }

      if (headA >= T) headA -= T;
      if (bitPop_1 > 0) bitPop_1 = Math.max(0, bitPop_1 - dt * 3.2);

      if (ghostActive) {
        ghostHead += BASE * dt;
        ghostAlpha = Math.max(0, 1 - ghostHead / ghostCurrentPath.total);
        if (ghostHead >= ghostCurrentPath.total) { ghostActive = false; ghostHead = 0; }
      }

      if (cross1Active) {
        cross1Head += BASE * dt;
        cross1Alpha = Math.max(0, 1 - cross1Head / crossPath1.total);
        if (cross1Head >= crossPath1.total) { cross1Active = false; cross1Head = 0; }
      }
      if (cross2Active) {
        cross2Head += BASE * dt;
        cross2Alpha = Math.max(0, 1 - cross2Head / crossPath2.total);
        if (cross2Head >= crossPath2.total) { cross2Active = false; cross2Head = 0; }
      }
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      step(dt);

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mobMode) {
        ctx.setTransform(0, -scale * DPR, scale * DPR, 0, mobTx * DPR, mobTy * DPR);
      } else {
        ctx.setTransform(scale * DPR, 0, 0, scale * DPR, ox * DPR, oy * DPR);
      }
      ctx.drawImage(bg, 0, 0, DESIGN_W, DESIGN_H);

      const activeLoop = latchBit === 0 ? loopQ : loopQBar;

      // Active-path glow along current loop
      ctx.save();
      ctx.strokeStyle = `rgba(${C.warm},0.12)`;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(activeLoop.segs[0].a[0], activeLoop.segs[0].a[1]);
      for (const s of activeLoop.segs) ctx.lineTo(s.b[0], s.b[1]);
      ctx.stroke();
      ctx.restore();

      // NOT branch aura: glows while comet is between SPLIT1 and XOR input
      const ha = ((headA % activeLoop.total) + activeLoop.total) % activeLoop.total;
      const tBranch = (ha - dSPLIT1_dist) / (dXOR_dist - dSPLIT1_dist);
      const notAura = tBranch > 0 && tBranch < 1 ? Math.sin(tBranch * Math.PI) * 0.45 : 0;

      if (notAura > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(${C.warm},${notAura})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        [WIRES[2], WIRES[3]].forEach(w => {
          ctx.beginPath();
          w.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.stroke();
        });
        ctx.restore();
      }

      drawFlash(ctx, NOT.cx, NOT.cy, notAura * 0.8, GCOL.not);

      // NOT branch comet: travels SPLIT1 → NOT gate → XOR bot input
      const notDist = ha - dSPLIT1_dist;
      if (notDist > 0 && notDist < notBranchPath.total) {
        drawComet(ctx, notBranchPath, notDist, C.warm, 18, 2);
      }

      // Cross-coupling comets (fire on latch trigger)
      if (cross1Active && cross1Alpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = cross1Alpha;
        drawComet(ctx, crossPath1, cross1Head, GCOL.latch, 18, 2);
        ctx.restore();
      }
      if (cross2Active && cross2Alpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = cross2Alpha;
        drawComet(ctx, crossPath2, cross2Head, GCOL.latch, 18, 2);
        ctx.restore();
      }

      // Latch bubbles: active Q glows on beat, inactive Q̄ stays dim
      const activeIsPrimary = latchBit === 0;
      [
        { x: LATCH.top.bub[0], y: LATCH.top.bub[1], pop: activeIsPrimary ? bitPop_1 : 0,  primary: activeIsPrimary  },
        { x: LATCH.bot.bub[0], y: LATCH.bot.bub[1], pop: activeIsPrimary ? 0 : bitPop_1,  primary: !activeIsPrimary },
      ].forEach(({ x, y, pop, primary }) => {
        const alpha  = pop > 0 ? 1    : primary ? 0.55 : 0.18;
        const radius = pop > 0 ? 5 + pop * 2 : primary ? 4 : 2.5;
        const blur   = pop > 0 ? 14   : primary ? 8    : 2;
        ctx.save();
        ctx.shadowColor = `rgb(${GCOL.latch})`;
        ctx.shadowBlur = blur;
        ctx.fillStyle = `rgba(${GCOL.latch},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, tau);
        ctx.fill();
        ctx.restore();
      });

      // Ghost comet: fades along the path we just left
      if (ghostActive && ghostAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = ghostAlpha;
        drawComet(ctx, ghostCurrentPath, ghostHead, GCOL.latch, 40, 3);
        ctx.restore();
      }

      // Main comet — color shifts teal at latch, warm at XOR, warm elsewhere
      const headPtA = pointAt(activeLoop, headA);
      const wGateA  = near(headPtA, XOR.cx, XOR.cy, 42);
      const wN1A    = near(headPtA, latchBit === 0 ? LATCH.top.cx : LATCH.bot.cx,
                                    latchBit === 0 ? LATCH.top.cy : LATCH.bot.cy, 42);

      drawFlash(ctx, XOR.cx, XOR.cy, wGateA, GCOL.gate);
      drawFlash(ctx, latchBit === 0 ? LATCH.top.cx : LATCH.bot.cx,
                     latchBit === 0 ? LATCH.top.cy : LATCH.bot.cy, wN1A, GCOL.latch);

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
  }, []);
}
