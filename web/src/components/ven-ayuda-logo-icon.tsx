"use client";

import { useId } from "react";

type VenAyudaLogoIconProps = {
  size?: number;
};

const FLAG_YELLOW = "#FFCC00";
const FLAG_BLUE = "#00247D";
const FLAG_RED = "#CF142B";

export function VenAyudaLogoIcon({ size = 24 }: VenAyudaLogoIconProps) {
  const gradientId = `ven-ayuda-flag-${useId().replace(/:/g, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={FLAG_YELLOW} />
          <stop offset="33.33%" stopColor={FLAG_YELLOW} />
          <stop offset="33.33%" stopColor={FLAG_BLUE} />
          <stop offset="66.66%" stopColor={FLAG_BLUE} />
          <stop offset="66.66%" stopColor={FLAG_RED} />
          <stop offset="100%" stopColor={FLAG_RED} />
        </linearGradient>
      </defs>
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      <path d="M12 6l-3.293 3.293a1 1 0 0 0 0 1.414l.543 .543c.69 .69 1.81 .69 2.5 0l1 -1a3.182 3.182 0 0 1 4.5 0l2.25 2.25" />
      <path d="M12.5 15.5l2 2" />
      <path d="M15 13l2 2" />
    </svg>
  );
}
