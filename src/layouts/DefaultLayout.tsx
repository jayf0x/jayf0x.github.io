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
          : "w-[60%] m-auto h-[90vh] mt-[5vh] rounded-xl"
      }`}
      style={{ backdropFilter: "blur(10px) brightness(0.4)" }}
    >
      <Header />
      {children}
    </div>
  );
};
