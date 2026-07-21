import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/useDevice";
import type { ReactNode } from "react";

// The blurred glass card shared by every page: nav header on top, page body below.
// Each page wraps its content in this so the chrome stays consistent and the page
// transition (in App) can slide the whole card as one unit.
export const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`flex flex-col relative bg-(--bg-a20) pointer-events-auto isolate ${
        isMobile
          ? "w-full h-[120vh]"
          : "w-[76%] max-w-[1400px] m-auto h-[90vh] mt-[5vh] rounded-2xl border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
      }`}
      style={{ backdropFilter: "blur(14px) brightness(0.42) saturate(1.1)" }}
    >
      <Header />
      {children}
    </div>
  );
};
