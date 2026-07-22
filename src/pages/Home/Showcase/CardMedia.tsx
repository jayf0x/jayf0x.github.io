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
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-[3px] grayscale brightness-75 transition-[opacity,filter] duration-500 group-hover:opacity-55 group-hover:grayscale-[0.4]"
        />
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-85 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
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
