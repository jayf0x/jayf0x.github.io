import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { Background } from "./components/Background";
import { allCheckpointItems } from "./config";
import {
  useCheckpointValue,
  useRegisterCheckpoints,
} from "./hooks/useCheckpoint";
import { useRegisterIsMobile } from "./hooks/useDevice";
import { useCurrentRoute } from "./router/hooks";
import { routePaths } from "./router/routes";
import type { RoutePath } from "./router/schemas";
import { WidgetsContainer } from "./widgets";

export const App = () => {
  const isVoid = useCheckpointValue("Void");
  const { path, Component } = useCurrentRoute();
  const { variants, direction, commitPath } = usePageAnimation(path);

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
        {/* Each route renders as its own keyed motion.div — a concrete snapshot,
            so the outgoing page keeps its own content while it slides away. */}
        <AnimatePresence
          mode="popLayout"
          custom={direction}
          onExitComplete={commitPath}
        >
          <motion.div
            key={`page-${path}`}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.842, ease: "anticipate" }}
          >
            <Component />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const screenW = () => (typeof window !== "undefined" ? window.innerWidth : 0);

const pageVariants = {
  initial: (dir: number) => ({ x: dir * screenW() }),
  animate: { x: 0 },
  exit: (dir: number) => ({ x: -dir * screenW() }),
};

const usePageAnimation = (path: RoutePath) => {
  const prevRef = useRef(path);

  const prevIndex = routePaths.indexOf(prevRef.current);
  const nextIndex = routePaths.indexOf(path);
  const direction = nextIndex > prevIndex ? 1 : nextIndex < prevIndex ? -1 : 0;

  // Commit the new path only once the old page has finished sliding out, so the
  // direction stays stable for the whole transition.
  const commitPath = useCallback(() => {
    prevRef.current = path;
  }, [path]);

  return { variants: pageVariants, direction, commitPath };
};
