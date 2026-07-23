import { StackIcon } from "@/components/StackIcon";
import { memo } from "react";

// Image layer for a card: grayscale blurred cover fill for atmosphere, a
// sharp contained copy on top for legibility, and an optional gif swap-in on
// hover. Falls back to a giant ghost stack icon when there's no preview.
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
            className="pointer-events-none absolute -bottom-6 -right-6 text-[13rem] text-white/[0.04] transition-transform duration-500 group-hover:scale-110"
          />
        )
      );
    }

    return (
      <>
        {/* atmosphere fill: blurred cover copy, clearly present behind */}
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-[2px] grayscale brightness-[0.8] transition-[opacity,filter,transform] duration-700 group-hover:scale-[1.14] group-hover:opacity-70 group-hover:grayscale-[0.35]"
        />
        {/* sharp contained copy, edges feathered so it melts into the fill */}
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-95 transition-[opacity,transform] duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
        />
        {gifUrl && (
          <img
            src={gifUrl}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </>
    );
  },
);
CardMedia.displayName = "CardMedia";
