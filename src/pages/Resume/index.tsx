import { useIsMobile } from "@/hooks/useDevice";
import { DefaultLayout } from "@/layouts/DefaultLayout";
import { useDigitalHeartbeat } from "@/lib/circuit";
import { useRef } from "react";
import { CircuitInfo } from "./CircuitInfo";
import { CycleCounter } from "./CycleCounter";
import { DownloadButton } from "./DownloadButton";
import { Quote } from "./Quote";
import { useCircuitPhase } from "./useCircuitPhase";

export const Resume = () => {
  const isMobile = useIsMobile();
  const { active, cycles, events } = useCircuitPhase();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useDigitalHeartbeat(
    containerRef,
    buttonRef as React.RefObject<HTMLElement>,
    events,
  );

  return (
    <DefaultLayout>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
      >
        <div
          className={`absolute pointer-events-auto z-10 left-1/2 ${isMobile ? "top-2/5" : "top-1/2"}`}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <DownloadButton ref={buttonRef} isMobile={isMobile} />

          <p className="pointer-events-none font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 whitespace-nowrap select-none translate-y-6 text-center">
            download cv
          </p>
        </div>

        <div
          className={`absolute pointer-events-auto z-10 left-1/2 ${isMobile ? "bottom-1/5" : "bottom-1/5"}`}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <CycleCounter count={cycles} />
        </div>

        <Quote active={active} />
        <CircuitInfo />
      </div>
    </DefaultLayout>
  );
};
