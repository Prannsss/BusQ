import React from "react";

interface CeresBusIconProps extends React.SVGProps<SVGSVGElement> {
  primaryColor?: string;
  secondaryColor?: string;
  isCeresYellow?: boolean;
}

export function CeresBusIcon({
  primaryColor = "#1d348a",
  secondaryColor = "#ff6802",
  isCeresYellow = true,
  className,
  ...props
}: CeresBusIconProps) {
  // If isCeresYellow is true, we override to the iconic yellow, else use system colors
  const mainColor = isCeresYellow ? "#facc15" : primaryColor;
  const accentColor = isCeresYellow ? "#1d348a" : secondaryColor;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 500 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Shadow */}
      <rect x="30" y="270" width="440" height="20" rx="10" fill="rgba(0,0,0,0.1)" />

      {/* Main Bus Body */}
      <rect x="20" y="50" width="460" height="200" rx="40" fill={mainColor} />

      {/* Front Window (Windshield) */}
      <path
        d="M 370 70 
           H 440 
           C 451.046 70 460 78.9543 460 90 
           V 160 
           C 460 165.523 455.523 170 450 170 
           H 370 
           C 364.477 170 360 165.523 360 160 
           V 80 
           C 360 74.4772 364.477 70 370 70 Z"
        fill="#1e293b" // dark glass
      />

      {/* Side Windows */}
      <rect x="60" y="70" width="80" height="100" rx="15" fill="#1e293b" />
      <rect x="160" y="70" width="80" height="100" rx="15" fill="#1e293b" />
      <rect x="260" y="70" width="80" height="100" rx="15" fill="#1e293b" />

      {/* Accent Line (Stripe) */}
      <path
        d="M 20 185 H 480"
        stroke={accentColor}
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M 20 205 H 450"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Wheels */}
      {/* Back Wheel */}
      <circle cx="100" cy="250" r="30" fill="#1e293b" />
      <circle cx="100" cy="250" r="15" fill="#94a3b8" />
      {/* Front Wheel */}
      <circle cx="400" cy="250" r="30" fill="#1e293b" />
      <circle cx="400" cy="250" r="15" fill="#94a3b8" />

      {/* Details (Lights) */}
      {/* Headlights */}
      <rect x="460" y="215" width="15" height="20" rx="7.5" fill="#ffffff" />
      <rect x="460" y="185" width="15" height="15" rx="7.5" fill="#fb923c" />
      
      {/* Taillights */}
      <rect x="15" y="185" width="10" height="30" rx="5" fill="#ef4444" />

      {/* Faint 'CERES' mock branding space on the side */}
      <text
        x="160"
        y="140"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="40"
        fill={mainColor}
        opacity="0.1"
      >
        CERES
      </text>
    </svg>
  );
}