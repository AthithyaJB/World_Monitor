"use client";

import { getSentimentLabel, getSentimentColor } from "@/lib/constants";

interface SentimentGaugeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export default function SentimentGauge({
  score,
  size = "md",
}: SentimentGaugeProps) {
  const label = getSentimentLabel(score);
  const color = getSentimentColor(score);
  const normalizedScore = score != null ? (score + 1) / 2 : 0.5; // -1..1 -> 0..1

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const radius = size === "sm" ? 28 : size === "md" ? 44 : 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedScore);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={size === "sm" ? 3 : 4}
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={size === "sm" ? 3 : 4}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm font-bold"
            style={{ color, fontSize: size === "sm" ? "10px" : "14px" }}
          >
            {score != null ? score.toFixed(2) : "N/A"}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
