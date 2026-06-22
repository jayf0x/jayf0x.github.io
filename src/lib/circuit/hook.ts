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
import {
  dLATCH_TRIGGER,
  dSPLIT1_dist,
  dXOR_dist,
  ghostPath,
  LATCH,
  loopHi,
  NOT,
  WIRES,
  XOR,
} from "./topology";

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
    let ghostActive = false;
    let ghostHead = 0;
    let ghostAlpha = 0;
    let last = 0;
    let rafId = 0;

    // ── responsive layout ─────────────────────────────────────────────────
    let scale = 1,
      ox = 0,
      oy = 0;
    let mobMode = false,
      mobTx = 0,
      mobTy = 0;

    function resize(w: number, h: number) {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      mobMode = w < h;
      scale = mobMode
        ? Math.min(h / DESIGN_W, w / DESIGN_H) * 0.95
        : Math.min(w / DESIGN_W, h / DESIGN_H) * 0.95;
      // Align diagram so (CIRC_CX, CIRC_CY) lands at the button's DOM center
      // when available, otherwise fall back to container center.
      let targetX = w / 2;
      let targetY = h / 2;
      if (buttonRef?.current) {
        const btnRect = buttonRef.current.getBoundingClientRect();
        const contRect = container!.getBoundingClientRect();
        targetX = btnRect.left - contRect.left + btnRect.width / 2;
        targetY = btnRect.top - contRect.top + btnRect.height / 2;
      }

      ox = targetX - CIRC_CX * scale;
      oy = targetY - CIRC_CY * scale;
      mobTx = targetX - CIRC_CY * scale;
      mobTy = targetY + CIRC_CX * scale;

      if (labelRef?.current) {
        labelRef.current.style.left = `${targetX}px`;
        labelRef.current.style.top = `${targetY + CIRC_R * scale + 14}px`;
      }
    }

    // ── animation helpers ─────────────────────────────────────────────────

    function crossed(a: number, b: number, x: number) {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    function near(pt: [number, number], cx: number, cy: number, th: number) {
      return Math.max(0, 1 - Math.hypot(pt[0] - cx, pt[1] - cy) / th);
    }

    function step(dt: number) {
      const T = loopHi.total;
      const prev = headA;
      headA += BASE * dt;

      const a = ((prev % T) + T) % T;
      const b = ((headA % T) + T) % T;
      if (crossed(a, b, dLATCH_TRIGGER)) {
        bitPop_1 = 1;
        ghostActive = true;
        ghostHead = 0;
        ghostAlpha = 1;
      }

      if (headA >= T) headA -= T;
      if (bitPop_1 > 0) bitPop_1 = Math.max(0, bitPop_1 - dt * 3.2);

      if (ghostActive) {
        ghostHead += BASE * dt;
        ghostAlpha = Math.max(0, 1 - ghostHead / ghostPath.total);
        if (ghostHead >= ghostPath.total) {
          ghostActive = false;
          ghostHead = 0;
        }
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
        ctx.setTransform(
          0,
          -scale * DPR,
          scale * DPR,
          0,
          mobTx * DPR,
          mobTy * DPR,
        );
      } else {
        ctx.setTransform(scale * DPR, 0, 0, scale * DPR, ox * DPR, oy * DPR);
      }
      ctx.drawImage(bg, 0, 0, DESIGN_W, DESIGN_H);

      // Active-path glow
      ctx.save();
      ctx.strokeStyle = `rgba(${C.warm},0.12)`;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(loopHi.segs[0].a[0], loopHi.segs[0].a[1]);
      for (const s of loopHi.segs) ctx.lineTo(s.b[0], s.b[1]);
      ctx.stroke();
      ctx.restore();

      // NOT branch aura: glows while main comet is between SPLIT1 and XOR input
      const ha = ((headA % loopHi.total) + loopHi.total) % loopHi.total;
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
          w.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.stroke();
        });
        ctx.restore();
      }

      drawFlash(ctx, NOT.cx, NOT.cy, notAura * 0.8, GCOL.not);

      // Latch bubbles: Q glows stored, Q-bar stays dim
      [
        { x: LATCH.top.bub[0], y: LATCH.top.bub[1], pop: bitPop_1, primary: true  },
        { x: LATCH.bot.bub[0], y: LATCH.bot.bub[1], pop: 0,        primary: false },
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

      // Ghost comet: Q-bar → bottom arc, fades over its path
      if (ghostActive && ghostAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = ghostAlpha;
        drawComet(ctx, ghostPath, ghostHead, GCOL.latch, 40, 3);
        ctx.restore();
      }

      // Main comet
      const headPtA = pointAt(loopHi, headA);
      const wGateA  = near(headPtA, XOR.cx, XOR.cy, 42);
      const wN1A    = near(headPtA, LATCH.top.cx, LATCH.top.cy, 42);

      drawFlash(ctx, XOR.cx, XOR.cy, wGateA, GCOL.gate);
      drawFlash(ctx, LATCH.top.cx, LATCH.top.cy, wN1A, GCOL.latch);

      const colA = wN1A > 0.2 ? GCOL.latch : wGateA > 0.2 ? GCOL.gate : C.warm;
      drawComet(ctx, loopHi, headA, colA, 54, 4);

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
