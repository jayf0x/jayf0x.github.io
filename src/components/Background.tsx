import { useCheckpointValue } from "@/hooks/useCheckpoint";
import { useIsMobile } from "@/hooks/useDevice";
import { FluidText } from "@jayf0x/fluidity-js";
// import { useMotionValue, useMotionValueEvent } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

export const Background = () => {
  const fluidRef = useRef<FluidHandle>(null);

  const isMobile = useIsMobile();
  const isVoid = useCheckpointValue("Void");
  const showChickenEgg = useCheckpointValue("🐔🥚");

  // useSplat(fluidRef);

  const splatCanvas = useCallback(
    (x: number, y: number) => {
      if (isMobile) {
        fluidRef.current?.splat(x, y, x + 20, y + 20, 10);
      } else {
        fluidRef.current?.move(x, y);
      }
    },
    [isMobile],
  );

  // const mx = useMotionValue(0);
  // const my = useMotionValue(0);

  useEffect(() => {
    const onPointerMove = (event: MouseEvent) => {
      if (event.isTrusted) {
        // const x = -Math.round(event.clientX / window.innerWidth);
        // const y = -Math.round(event.clientY / window.innerHeight);
        // mx.set(x);
        // my.set(y);

        splatCanvas(event.clientX, event.clientY);
      }
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [splatCanvas]);

  // useMotionValueEvent(mx, "change", (v) => {
  //   document.documentElement.style.setProperty("--mx", v.toFixed(2));
  // });

  // useMotionValueEvent(my, "change", (v) => {
  //   document.documentElement.style.setProperty("--my", v.toFixed(2));
  // });

  const fontSize = showChickenEgg
    ? 120
    : isVoid
      ? Math.min(Math.max(window.innerWidth, 300), 2000)
      : 300;
  const fluidTextSpace = " ".repeat(Math.floor(window.innerWidth / 100));

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      <div
        className="absolute inset-0 opacity-100"
        title="bun add @jayf0x/fluidity-js"
      >
        <FluidText
          // workerEnabled={true}
          mouseEnabled={false}
          ref={fluidRef}
          text={
            showChickenEgg ? `🐔${fluidTextSpace}<3/>${fluidTextSpace}🥚` : "□"
          }
          // densityDissipation={0.995}
          // velocityDissipation={0.994}
          waterColor="#020a10"
          glowColor="#301045"
          // shine={isFluidHighQuality ? 0.1 : 0.5}
          splatRadius={isVoid ? 0.1 : 0.05}
          specularExp={6}
          pressureIterations={3}
          // pixelRatio={isFluidHighQuality ? 0.5 : 0.3}
          // simResolution={0.5}
          // curl={0.2}
          fontSize={fontSize}
          fontFamily="Ubuntu"
          color={isVoid ? "black" : "#777"}
          // algorithm="aurora"
          // style={{
          //   filter: "grayscale(0.5)",
          // }}
        />
      </div>

      <div className="blob absolute -left-40 -top-40 h-125 w-125 rounded-full bg-linear-to-br from-accent to-(--c-8b5cf6) opacity-[0.1] blur-3xl" />
      <div className="blob absolute -bottom-40 -right-40 h-105 w-105 rounded-full bg-linear-to-tr from-accent to-(--c-8b5cf6) opacity-[0.1] blur-3xl [animation-delay:3s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.055)_1px,transparent_2px)] bg-size-[28px_28px]" />
    </div>
  );
};

const defaul = { x: 0.1, y: 0, z: 0, vx: 0, vy: 0 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSplat = (ref: any) => {
  const engine = {
    step: (p: typeof defaul) => {
      const theta = p.z + 0.05;
      const r = 180 + Math.sin(theta * 2) * 40;
      const tx = Math.cos(theta) * r;
      const ty = Math.sin(theta) * r;
      return { x: tx, y: ty, z: theta, vx: tx - p.x, vy: ty - p.y };
    },
    project: (p: typeof defaul, w: number, h: number) => ({
      sx: w / 2 + p.x,
      sy: h / 2 + p.y,
      svx: p.vx * 0.8,
      svy: p.vy * 0.8,
    }),
  };

  const stateRef = useRef(defaul);

  useEffect(() => {
    let animationId = 0;
    const animate = () => {
      const { innerWidth: w, innerHeight: h } = window;
      stateRef.current = engine.step(stateRef.current);
      const { sx, sy, svx, svy } = engine.project(stateRef.current, w, h);

      ref.current?.splat(sx, sy, svx, svy, 1);

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [ref]);
};
