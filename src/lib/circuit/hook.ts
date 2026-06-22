import type { RefObject } from "react";
import { useEffect } from "react";
import { DESIGN_W, DESIGN_H, BASE, CIRC_CX, CIRC_CY, CIRC_R, C, GCOL, tau } from "./config";
import { pointAt } from "./path";
import { NOT, AND, N1, N2, loopHi, loopLo, dNOR_A, dNOR_B } from "./topology";
import { renderStatic, drawComet, drawFlash } from "./draw";

const CCX = (90 + 660) / 2;
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
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    // ── animation state ───────────────────────────────────────────────────
    let headA = 0;
    let headB = loopLo.total / 2; // comB starts half a cycle behind
    let bitPop_1 = 0;
    let bitPop_2 = 0;
    let lastFired = 0; // 1=N1, 0=N2
    let last = 0;
    let rafId = 0;

    // ── responsive layout ─────────────────────────────────────────────────
    let scale = 1, ox = 0, oy = 0;
    let mobMode = false, mobTx = 0, mobTy = 0;

    function positionOverlays() {
      const btnX = mobMode ? CIRC_CY * scale + mobTx : CIRC_CX * scale + ox;
      const btnY = mobMode ? -CIRC_CX * scale + mobTy : CIRC_CY * scale + oy;
      if (buttonRef?.current) {
        buttonRef.current.style.left = `${btnX}px`;
        buttonRef.current.style.top = `${btnY}px`;
      }
      if (labelRef?.current) {
        labelRef.current.style.left = `${btnX}px`;
        labelRef.current.style.top = `${btnY + CIRC_R * scale + 14}px`;
      }
    }

    function resize(w: number, h: number) {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      mobMode = w < h;
      scale = mobMode
        ? Math.min(h / DESIGN_W, w / DESIGN_H) * 0.95
        : Math.min(w / DESIGN_W, h / DESIGN_H) * 0.95;
      ox = w / 2 - CCX * scale;
      oy = h / 2 - CCY * scale;
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
      const TA = loopHi.total, TB = loopLo.total;
      const prevA = headA, prevB = headB;
      headA += BASE * dt;
      headB += BASE * dt;

      const aA = ((prevA % TA) + TA) % TA, bA = ((headA % TA) + TA) % TA;
      if (crossed(aA, bA, dNOR_A)) { bitPop_1 = 1; lastFired = 1; }

      const aB = ((prevB % TB) + TB) % TB, bB = ((headB % TB) + TB) % TB;
      if (crossed(aB, bB, dNOR_B)) { bitPop_2 = 1; lastFired = 0; }

      if (headA >= TA) headA -= TA;
      if (headB >= TB) headB -= TB;
      if (bitPop_1 > 0) bitPop_1 = Math.max(0, bitPop_1 - dt * 3.2);
      if (bitPop_2 > 0) bitPop_2 = Math.max(0, bitPop_2 - dt * 3.2);
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

      // Subtle active-path glow
      for (const path of [loopHi, loopLo]) {
        ctx.save();
        ctx.strokeStyle = `rgba(${C.warm},0.12)`;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(path.segs[0].a[0], path.segs[0].a[1]);
        for (const s of path.segs) ctx.lineTo(s.b[0], s.b[1]);
        ctx.stroke();
        ctx.restore();
      }

      // Latch gate bubbles: pop on trigger, glow on stored bit
      // TODO (plan-circuit.md §Animation): update for SR latch Q/Q-bar outputs
      [
        { x: N1.bub[0], y: N1.bub[1], pop: bitPop_1, stored: lastFired === 1 },
        { x: N2.bub[0], y: N2.bub[1], pop: bitPop_2, stored: lastFired === 0 },
      ].forEach(({ x, y, pop, stored }) => {
        const alpha = pop > 0 ? 1 : stored ? 0.55 : 0.15;
        const radius = pop > 0 ? 5 + pop * 2 : stored ? 4 : 3;
        const blur = pop > 0 ? 14 : stored ? 8 : 2;
        ctx.save();
        ctx.shadowColor = `rgb(${C.teal})`;
        ctx.shadowBlur = blur;
        ctx.fillStyle = `rgba(${C.teal},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, tau);
        ctx.fill();
        ctx.restore();
      });

      const headPtA = pointAt(loopHi, headA);
      const headPtB = pointAt(loopLo, headB);

      const wNotB = near(headPtB, NOT.cx, NOT.cy, 38);
      const wGateA = near(headPtA, AND.cx, AND.cy, 42);
      const wGateB = near(headPtB, AND.cx, AND.cy, 42);
      const wN1A = near(headPtA, N1.cx, N1.cy, 42);
      const wN2B = near(headPtB, N2.cx, N2.cy, 42);

      drawFlash(ctx, NOT.cx, NOT.cy, wNotB, GCOL.not);
      drawFlash(ctx, AND.cx, AND.cy, Math.max(wGateA, wGateB), GCOL.gate);
      drawFlash(ctx, N1.cx, N1.cy, wN1A, GCOL.latch);
      drawFlash(ctx, N2.cx, N2.cy, wN2B, GCOL.latch);

      const colA = wN1A > 0.2 ? GCOL.latch : wGateA > 0.2 ? GCOL.gate : C.warm;
      const colB = wN2B > 0.2 ? GCOL.latch : wGateB > 0.2 ? GCOL.gate : wNotB > 0.2 ? GCOL.not : C.warm;

      drawComet(ctx, loopHi, headA, colA, 54, 4);
      drawComet(ctx, loopLo, headB, colB, 54, 4);

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
