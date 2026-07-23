// Intentional negative space in the mosaic. Not empty — a faint centered
// crosshair + grain reads as placed whitespace, a quiet beat between cards.
export const VoidTile = () => (
  <div className="group/void relative h-full w-full overflow-hidden rounded-(--r-card)">
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)",
        backgroundSize: "14px 14px",
      }}
    />
    <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/[0.06]" />
    <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/[0.06]" />
  </div>
);
