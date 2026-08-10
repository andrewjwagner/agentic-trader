import { motion } from "framer-motion";

const path =
  "M0 180 C40 170 55 120 90 130 C130 142 150 90 190 95 C230 100 250 60 290 55 C330 50 360 85 400 70 C440 55 470 30 520 40 C560 48 590 20 640 28";

export function HeroChart() {
  return (
    <svg
      className="hero-chart"
      viewBox="0 0 640 220"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d={path}
        stroke="#0a6e6a"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut", delay: 0.35 }}
      />
      <motion.path
        d={`${path} L640 220 L0 220 Z`}
        fill="url(#heroFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.2, delay: 0.9 }}
      />
      <defs>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a6e6a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0a6e6a" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
