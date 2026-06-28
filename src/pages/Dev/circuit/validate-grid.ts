// QA script: validates all registered grid points are within design-space bounds.
// Run with:  npx tsx src/lib/circuit/validate-grid.ts

import "./topology"; // side-effect: registers all points
import { allPts } from "./grid";
import { DESIGN_W, DESIGN_H } from "./config";

const pts = allPts();
let ok = true;

console.log(`\nCircuit grid — ${pts.size} registered points (design space ${DESIGN_W}×${DESIGN_H})\n`);
console.log("  Name".padEnd(20) + "  X".padStart(7) + "  Y".padStart(7) + "  status");
console.log("  " + "─".repeat(50));

for (const [name, [x, y]] of pts) {
  const inBounds = x >= 0 && x <= DESIGN_W && y >= 0 && y <= DESIGN_H;
  const status = inBounds ? "✓" : "✗ OUT OF BOUNDS";
  if (!inBounds) ok = false;
  console.log(`  ${name.padEnd(18)}  ${String(Math.round(x)).padStart(5)}  ${String(Math.round(y)).padStart(5)}  ${status}`);
}

console.log();
if (!ok) throw new Error("Some points are out of bounds — fix topology.ts or COLS/ROWS in grid.ts.");
console.log("All points in bounds.\n");
