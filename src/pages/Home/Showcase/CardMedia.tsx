import { StackIcon } from "@/components/StackIcon";
import { memo } from "react";

// Image layer for a card: a blurred cover fill for atmosphere, a sharp cover
// copy on top with feathered edges so its rectangle melts into the blur, and
// an optional gif swap-in on hover. Falls back to a giant ghost stack icon
// when there's no preview. No hover scaling — only opacity/filter eases.
export const CardMedia = memo(
  ({
    previewUrl,
    gifUrl,
    language,
    eager,
  }: {
    previewUrl: string | null | undefined;
    gifUrl: string | null | undefined;
    language: string | null;
    eager?: boolean;
  }) => {
    if (!previewUrl) {
      return (
        language && (
          <StackIcon
            language={language}
            className="pointer-events-none absolute -bottom-6 -right-6 text-[13rem] text-white/[0.04]"
          />
        )
      );
    }

    return (
      <>
        {/* atmosphere fill: blurred cover copy, present in the feathered margins */}
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-55 blur-[2px] grayscale brightness-[0.8]"
        />
        {/* sharp cover copy — object-cover fills edge-to-edge so the feather
            mask actually softens the picture's edges on any aspect ratio */}
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-95 transition-opacity duration-500 ease-out group-hover:opacity-100"
        />
        {gifUrl && (
          <img
            src={gifUrl}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        )}
      </>
    );
  },
);
CardMedia.displayName = "CardMedia";
