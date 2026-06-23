import { Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { Background } from "./components/Background";
import { Header } from "./components/Header";
import { allCheckpointItems } from "./config";
import {
  useCheckpointValue,
  useRegisterCheckpoints,
} from "./hooks/useCheckpoint";
import { useIsMobile, useRegisterIsMobile } from "./hooks/useDevice";
import { routePaths } from "./router/routes";
import type { RoutePath } from "./router/schemas";
import { WidgetsContainer } from "./widgets";

export const App = () => {
  const isMobile = useIsMobile();
  const isVoid = useCheckpointValue("Void");
  const { pathname } = useLocation();
  const { variants, direction, commitPath } = usePageAnimation(pathname);

  const watchIsMobile = useRegisterIsMobile();
  const registerCheckpoints = useRegisterCheckpoints();

  useEffect(() => {
    watchIsMobile();
    registerCheckpoints(allCheckpointItems);
  }, [watchIsMobile, registerCheckpoints]);

  return (
    <div className="h-screen w-screen text-text">
      <WidgetsContainer />
      <Background />
      <main
        className="relative z-20 pointer-events-none"
        style={{ display: isVoid ? "none" : "" }}
      >
        <AnimatePresence
          mode="popLayout"
          custom={direction}
          onExitComplete={commitPath}
        >
          <motion.div
            key={`motion-page-${pathname}`}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.842, ease: "anticipate" }}
          >
            <div
              className={`flex flex-col relative bg-(--bg-a20) pointer-events-auto isolate ${isMobile ? "w-full h-[120vh]" : "w-[60%] m-auto h-[90vh] mt-[5vh] rounded-xl"}`}
              style={{ backdropFilter: "blur(10px) brightness(0.4)" }}
            >
              <Header />
              {!isVoid && <Outlet />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const screenW = () =>
  typeof window !== "undefined" ? window.innerWidth : 0;

const pageVariants = {
  initial: (dir: number) => ({ x: dir * screenW() }),
  animate: { x: 0 },
  exit: (dir: number) => ({ x: -dir * screenW() }),
};

const usePageAnimation = (pathname: string) => {
  const prevRef = useRef(pathname);

  const prevIndex = routePaths.indexOf(prevRef.current as RoutePath);
  const nextIndex = routePaths.indexOf(pathname as RoutePath);
  const direction =
    nextIndex > prevIndex ? 1 : nextIndex < prevIndex ? -1 : 0;

  const commitPath = useCallback(() => {
    prevRef.current = pathname;
  }, [pathname]);

  return { variants: pageVariants, direction, commitPath };
};
