import type { Variants } from "framer-motion";

import { premiumEase } from "./easing";

export const onboardingStepIn: Variants = {
  initial: { opacity: 0, y: 22, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.52, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(6px)",
    transition: { duration: 0.38, ease: premiumEase },
  },
};

export const onboardingListContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.055, delayChildren: 0.08 },
  },
};

export const onboardingListItem: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: premiumEase },
  },
};
