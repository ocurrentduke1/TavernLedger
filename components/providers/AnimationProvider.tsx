"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit:    {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" }
  },
};

const reducedVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.08 } },
};

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={prefersReduced ? reducedVariants : pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ display: "contents" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
