import { useEffect, useState } from "react";

const BREAKPOINT = 640; // tailwind `sm`

/** Nominal column count fed to the treemap — 1 on mobile (full-width stacked
 * cards), 4 on desktop. Fewer columns = bigger, landscape-leaning tiles; the
 * treemap targets this aspect but never snaps to a hard pixel grid. */
export const useGridCols = (): number => {
  const [cols, setCols] = useState(() =>
    typeof window === "undefined" || window.innerWidth < BREAKPOINT ? 1 : 4,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
    const onChange = () => setCols(mql.matches ? 4 : 1);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return cols;
};
