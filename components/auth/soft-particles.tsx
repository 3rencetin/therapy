"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

const seeds = [
  { x: "12%", y: "22%", r: 2.2, d: 14 },
  { x: "78%", y: "18%", r: 1.6, d: 18 },
  { x: "68%", y: "62%", r: 2.8, d: 16 },
  { x: "22%", y: "70%", r: 1.4, d: 20 },
  { x: "44%", y: "36%", r: 1.1, d: 22 },
  { x: "54%", y: "78%", r: 1.9, d: 17 },
];

export function SoftParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {seeds.map((p, idx) => (
        <motion.span
          key={idx}
          className="absolute rounded-full bg-white/[0.12]"
          style={{ left: p.x, top: p.y, width: p.r, height: p.r }}
          animate={{ y: [0, -10, 0], opacity: [0.08, 0.22, 0.08] }}
          transition={{ duration: p.d, repeat: Infinity, ease: premiumEase, delay: idx * 0.35 }}
        />
      ))}
    </div>
  );
}
