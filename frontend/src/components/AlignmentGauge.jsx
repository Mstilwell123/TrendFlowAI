import React from "react";

/**
 * AlignmentGauge — concentric circular gauge for Alignment Score.
 * 0..29 red, 30..49 orange, 50..69 yellow, 70..84 lime, 85+ green
 */
export default function AlignmentGauge({ score = 0, band = "", size = 220 }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 85 ? "#22C55E" :
    clamped >= 70 ? "#84CC16" :
    clamped >= 50 ? "#EAB308" :
    clamped >= 30 ? "#F97316" : "#EF4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} data-testid="alignment-gauge">
      <svg width={size} height={size} viewBox="0 0 220 220" className="transform -rotate-90">
        <circle cx="110" cy="110" r={radius} fill="none" strokeWidth="14" className="gauge-track" />
        <circle
          cx="110" cy="110" r={radius} fill="none" strokeWidth="14"
          stroke={color} strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-bold" style={{ fontFamily: "Outfit", color }} data-testid="gauge-score">{clamped}</span>
        <span className="text-xs uppercase tracking-widest text-neutral-400 mt-1">{band || "Alignment"}</span>
      </div>
    </div>
  );
}
