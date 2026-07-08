import { useEffect, useRef } from "react";
import FlipCardPanel, { FlipCardRef } from "react-flip-cards";
import "react-flip-cards/styles.css";

export const CycleCounter = ({ count }: { count: number }) => {
  const ref = useRef<FlipCardRef>(null);

  useEffect(() => {
    const newValue = count
      .toString()
      .padStart(3, "0")
      .split("")
      .map((i, idx, arr) => {
        let nr = +i;
        if (nr >= 10) {
          if (arr.at(idx + 1)) {
            arr[idx + 1] += 1;
          }
          nr = 0;
        }
        return nr;
      });

    ref.current?.set(newValue);
  }, [count]);

  return (
    <FlipCardPanel
      ref={ref}
      nrCards={3}
      mode="spin"
      separatorStyle={{ color: "#db2777" }}
      blockStyle={{
        background: "linear-gradient(160deg,#db277755,#6d28d955)",
        color: "#fff",
        borderRadius: 10,
        height: "3rem",
        width: "2rem",
        fontSize: "1.5rem",
      }}
      dividerStyle={{ color: "#ffffff33" }}
    />
    // <OdometerCard value={count} />
    //   <p className="pointer-events-none font-mono text-[10px] tabular-nums tracking-[0.22em] text-white/30 whitespace-nowrap select-none translate-y-4 text-center">
    //     ↻ {String(count).padStart(4, "0")}
    //   </p>
  );
};

// export const CycleCounter = ({ count }: { count: number }) => {
//   const ref = useRef<FlipCardRef>(null);
//   useEffect(() => {
//     ref.current?.set([count]);
//   }, [count]);

//   return (
//     <FlipCardPanel ref={ref} nrCards={3} separators={[1, 3]} max />
//     //   <p className="pointer-events-none font-mono text-[10px] tabular-nums tracking-[0.22em] text-white/30 whitespace-nowrap select-none translate-y-4 text-center">
//     //     ↻ {String(count).padStart(4, "0")}
//     //   </p>
//   );
// };
