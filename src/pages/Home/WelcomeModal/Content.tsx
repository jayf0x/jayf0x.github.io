import { InfoPopover } from "@/components/InfoPopover";
import { useAnalyticsBlocked } from "@/hooks/useAnalyticsBlocked";
import { useIsMobile } from "@/hooks/useDevice";
import { Info, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";

export const CardContent = () => {
  const isMobile = useIsMobile();
  const isBlocked = useAnalyticsBlocked();
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [jokeShown, setJokeShown] = useState(false);

  const handleAnalyticsToggle = () => {
    if (analyticsOn) setJokeShown(true);
    setAnalyticsOn((v) => !v);
  };

  return (
    <div className="space-y-6 pb-5">
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--border-a40)" }}
      >
        A portfolio meets playground — here's a quick look at what's on the
        page.
      </p>

      <Xwrapper>
        <div className="relative">
          <p
            className="text-[9px] font-mono tracking-[0.22em] uppercase mb-4"
            style={{ color: "var(--overlay-lg)" }}
          >
            Page guide
          </p>

          <div className="flex items-start gap-6">
            {/* Descriptions */}
            <div className="flex-1 space-y-6">
              <div id="gd-slider" className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                  }}
                >
                  <SlidersHorizontal size={13} strokeWidth={1.5} />
                </span>
                <div>
                  <p
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "var(--border-a70)" }}
                  >
                    Temperature slider
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--border-a35)" }}
                  >
                    Controls how much is shown — from a clean minimal view to
                    the full experience.
                  </p>
                </div>
              </div>

              <div id="gd-chat" className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-sm select-none"
                  style={{ background: "var(--purple-dim)" }}
                >
                  🤖
                </span>
                <div>
                  <p
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "var(--border-a70)" }}
                  >
                    GPT-1 Chat
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--border-a35)" }}
                  >
                    Say hello to the original 2018 OpenAI model — historically
                    quirky by design.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: "var(--overlay-sm)",
                    color: "var(--border-a35)",
                  }}
                >
                  <Info size={13} strokeWidth={1.5} />
                </span>
                <div>
                  <div
                    className="text-[13px] font-medium mb-1 flex items-center gap-1.5 flex-wrap"
                    style={{ color: "var(--border-a70)" }}
                  >
                    Info popovers
                    <InfoPopover
                      items={[
                        ["Like this one!"],
                        ["They link to extra context or sources"],
                      ]}
                    />
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--border-a35)" }}
                  >
                    The ℹ buttons scattered around reveal context or linked
                    sources.
                  </p>
                </div>
              </div>
            </div>

            {/* Mini page preview (desktop only) */}
            {!isMobile && (
              <div
                className="shrink-0 relative rounded-xl overflow-hidden"
                style={{
                  width: 116,
                  height: 156,
                  border: "1px solid var(--border)",
                  background: "var(--overlay-xs)",
                }}
              >
                {/* Skeleton content */}
                <div className="p-3 space-y-2">
                  <div
                    className="h-2.5 w-10 rounded-full mx-auto"
                    style={{ background: "var(--border)" }}
                  />
                  <div
                    className="h-1 w-16 rounded-full mx-auto"
                    style={{ background: "var(--overlay-xs)" }}
                  />
                  <div
                    className="h-1 w-14 rounded-full mx-auto"
                    style={{ background: "var(--overlay-xs)" }}
                  />
                  <div className="mt-3 space-y-1">
                    <div
                      className="h-1 w-full rounded-full"
                      style={{ background: "var(--overlay-xs)" }}
                    />
                    <div
                      className="h-1 w-5/6 rounded-full"
                      style={{ background: "var(--overlay-xs)" }}
                    />
                  </div>
                </div>

                {/* Widget stack — mirrors real bottom-right position */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1.5">
                  <div
                    id="gd-slider-w"
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--accent-glow)",
                      border: "1px solid var(--accent-a28)",
                      color: "var(--accent)",
                    }}
                  >
                    <SlidersHorizontal size={13} strokeWidth={1.5} />
                  </div>
                  <div
                    id="gd-chat-w"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm select-none"
                    style={{
                      background: "var(--purple-dim)",
                      border: "1px solid var(--purple-border)",
                    }}
                  >
                    🤖
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Xarrows — desktop only */}
          {!isMobile && (
            <>
              <Xarrow
                start="gd-slider"
                end="gd-slider-w"
                color="rgba(79,124,255,0.4)"
                strokeWidth={1.5}
                dashness={{ strokeLen: 5, nonStrokeLen: 4, animation: 0.8 }}
                path="smooth"
                startAnchor="right"
                endAnchor="left"
                headSize={5}
              />
              <Xarrow
                start="gd-chat"
                end="gd-chat-w"
                color="rgba(168,85,247,0.4)"
                strokeWidth={1.5}
                dashness={{ strokeLen: 5, nonStrokeLen: 4, animation: 0.8 }}
                path="smooth"
                startAnchor="right"
                endAnchor="left"
                headSize={5}
              />
            </>
          )}
        </div>
      </Xwrapper>

      {/* Analytics toggle */}
      <div
        className="rounded-xl px-4 py-3 flex flex-col gap-2"
        style={{ background: "var(--overlay-xs)", border: "1px solid var(--overlay-sm)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[13px] font-medium" style={{ color: "var(--border-a70)" }}>
                Analytics
              </p>
              <InfoPopover
                items={[
                  ["Page visit counts only — no device or location data"],
                  ["Download Brave Browser", "https://brave.com/download"],
                  ["brave://settings/extensions/v2"],
                ]}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--border-a35)" }}>
              {isBlocked
                ? "Blocked by your ad blocker — that's fine!"
                : "Page visit counts only — no tracking, no fingerprinting."}
            </p>
          </div>

          {isBlocked ? (
            <span
              className="shrink-0 text-[10px] font-mono px-2 py-1 rounded-md"
              style={{
                background: "var(--overlay-sm)",
                color: "var(--border-a35)",
                border: "1px solid var(--overlay-sm)",
              }}
            >
              AdBlocked
            </span>
          ) : (
            <button
              type="button"
              role="switch"
              aria-checked={analyticsOn}
              onClick={handleAnalyticsToggle}
              className="shrink-0 relative w-9 h-5 rounded-full transition-colors duration-200 focus-visible:outline-none"
              style={{
                background: analyticsOn
                  ? "color-mix(in srgb, var(--accent) 70%, transparent)"
                  : "color-mix(in srgb, var(--border-a35) 40%, transparent)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                style={{ transform: analyticsOn ? "translateX(16px)" : "translateX(0)" }}
              />
            </button>
          )}
        </div>

        {jokeShown && !isBlocked && (
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--border-a35)" }}>
            oops — analytics already left the device. 👋 This is how most analytics really work.{" "}
            <span style={{ color: "var(--accent)" }}>Keep learning!</span>
          </p>
        )}
      </div>
    </div>
  );
};
