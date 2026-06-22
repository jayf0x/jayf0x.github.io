import { RESUME_DOWNLOAD_URL } from "@/config";
import { useIsMobile } from "@/hooks/useDevice";
import { useDigitalHeartbeat } from "@/lib/circuit";
import { FileHeart } from "lucide-react";
import { useRef } from "react";

export const Resume = () => {
  const isMobile = useIsMobile();

  const buttonRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useDigitalHeartbeat(containerRef, buttonRef as React.RefObject<HTMLElement>);

  return (
    <div ref={containerRef} className="size-full relative overflow-hidden">
      <div
        className={`absolute pointer-events-auto z-10 left-1/2 ${isMobile ? "top-2/5" : "top-1/2"}`}
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <a
          ref={buttonRef}
          href={RESUME_DOWNLOAD_URL}
          download
          className="no-underline"
          aria-label="Download resume"
        >
          <div
            title="Doubt everything. Find your own light. - Buddha"
            style={{
              background:
                "radial-gradient(circle at 36% 32%, var(--c-ff9090) 0%, var(--c-e00000) 48%, var(--c-7a0000) 100%)",
              boxShadow:
                "0 0 28px var(--c-ff3737-a65), 0 8px 24px var(--bg-a60), inset 0 3px 7px var(--c-ffbebe-a45), inset 0 -3px 5px var(--bg-a45)",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
            }}
            className="hover:scale-[1.1] active:scale-[0.91] size-20 rounded-full flex justify-center items-center"
          >
            <FileHeart size={32} className="opacity-60" />
          </div>
        </a>

        <p className="pointer-events-none font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 whitespace-nowrap select-none translate-y-4">
          download cv
        </p>
      </div>

      {/* Quote — above circuit */}
      <p className="absolute left-0 top-[10%] z-10 w-full text-center font-mono text-[13px] text-white/65 italic select-none pointer-events-none px-8">
        The question becomes a beat <br /> the beat becomes memory <br /> and
        memory asks again.
      </p>
    </div>
  );
};
