import type { Transition, Variants } from "framer-motion";

import { premiumEase } from "./easing";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: premiumEase,
    },
  },
};

export const staggerChildren = (delay = 0.06): Transition => ({
  delayChildren: 0.04,
  staggerChildren: delay,
});

export const containerRise: Variants = {
  hidden: {},
  show: {
    transition: staggerChildren(0.085),
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: premiumEase },
  },
};
