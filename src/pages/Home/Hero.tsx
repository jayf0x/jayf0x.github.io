import { motion } from "framer-motion";

export const Hero = () => (
  <section className="px-6 pt-8 pb-3 max-w-3xl mx-auto">
    <motion.h1
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-2xl md:text-3xl font-black tracking-tight text-text"
    >
      I build fast, playful web tools.
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
      className="mt-3 text-sm leading-relaxed text-(--overlay-a100) max-w-xl"
    >
      Developer in Ghent. I ship side projects — npm libraries, browser
      extensions, and the odd experiment. A few I'm proud of:
    </motion.p>
  </section>
);
