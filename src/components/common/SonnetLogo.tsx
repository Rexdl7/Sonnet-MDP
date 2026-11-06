import React from 'react';

interface SonnetLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const SonnetLogo: React.FC<SonnetLogoProps> = ({
  className = '',
  size = 28,
  glow = false,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 ${className} ${glow ? 'drop-shadow-[0_0_12px_rgba(250,45,72,0.6)]' : ''}`}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF0033" />
          <stop offset="50%" stopColor="#FA2D48" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>
      </defs>

      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="24"
        fill="#0B0E14"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
      />

      <path
        d="M 28 36 C 28 25, 42 22, 53 22 C 67 22, 74 29, 74 38 C 74 48, 62 50, 48 54 C 36 57, 26 62, 26 71 C 26 81, 35 88, 50 88 C 65 88, 74 81, 74 72"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />
      <circle cx="34" cy="48" r="3" fill="#FA2D48" />
      <circle cx="66" cy="52" r="3" fill="#FF7A00" />
    </svg>
  );
};
