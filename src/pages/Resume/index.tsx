import { RESUME_DOWNLOAD_URL } from "@/config";
import { useDigitalHeartbeat } from "@/lib/circuit";
import { FileHeart } from "lucide-react";
import { useRef } from "react";
import "./styles.css";

export const Resume = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  useDigitalHeartbeat(
    containerRef,
    buttonRef as React.RefObject<HTMLElement>,
    labelRef as React.RefObject<HTMLElement>,
  );

  return (
    <div ref={containerRef} className="size-full relative overflow-hidden">
      {/* Download button — positioned by hook at circuit circle */}
      <div
        ref={buttonRef}
        className="absolute pointer-events-auto z-10"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <a
          href={RESUME_DOWNLOAD_URL}
          download
          className="no-underline"
          aria-label="Download resume"
        >
          <div
            id="red-button"
            title="Doubt everything. Find your own light. - Buddha"
          >
            <FileHeart size={32} className="opacity-60" />
          </div>
        </a>
      </div>

      {/* "download cv" label — positioned below the circle by hook */}
      <p
        ref={labelRef}
        className="absolute pointer-events-none z-10 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 whitespace-nowrap select-none"
        style={{ transform: "translateX(-50%)" }}
      >
        download cv
      </p>

      {/* Quote — above circuit */}
      <p className="absolute left-0 top-[10%] z-10 w-full text-center font-mono text-[13px] text-white/65 italic select-none pointer-events-none px-8">
        "The question becomes a beat — the beat becomes memory — and memory asks
        again."
      </p>
    </div>
  );
};
