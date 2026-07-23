// Blueprint negative space — a faint diagonal hatch with hairline side rules.
// Reads as an intentional draft/placeholder beat between cards, not an empty
// hole. Pattern lifted from Tailwind's own docs treatment.
export const VoidTile = () => (
  <div
    className="h-full w-full rounded-[10px] border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-[length:10px_10px]"
    style={
      {
        "--pattern-fg": "color-mix(in oklab, #ffffff 8%, transparent)",
      } as React.CSSProperties
    }
    aria-hidden
  />
);
