"use client";

import { motion } from "framer-motion";

interface MacroRingProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  trackColor?: string;
}

export default function MacroRing({
  label,
  current,
  goal,
  unit,
  color,
  trackColor = "var(--ring-track)",
}: MacroRingProps) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const percentage = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1], // Expo out
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={current}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold tabular-nums"
          >
            {current}
          </motion.span>
          <span className="text-[10px] text-muted">
            / {goal} {unit}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-muted font-medium">{label}</span>
        <span className="text-xs text-muted/60">{percentage}%</span>
      </div>
    </div>
  );
}
