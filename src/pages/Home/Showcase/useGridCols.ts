import { useEffect, useState } from "react";

const BREAKPOINT = 640; // tailwind `sm`

/** Nominal column count fed to the treemap — 2 on mobile (stacked, full-width
 * cards), 6 on desktop. Not a hard pixel grid, just the squarify target. */
export const useGridCols = (): number => {
  const [cols, setCols] = useState(() =>
    typeof window === "undefined" || window.innerWidth < BREAKPOINT ? 2 : 6,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
    const onChange = () => setCols(mql.matches ? 6 : 2);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return cols;
};
