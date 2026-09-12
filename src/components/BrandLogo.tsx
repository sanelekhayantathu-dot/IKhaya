import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  variant?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Res Living',
  variant = 'dark',
}) => {
  // Clear, generous heights for prominent brand presence
  const heights = {
    sm: 'h-9 sm:h-10',
    md: 'h-13 sm:h-16',
    lg: 'h-18 sm:h-22',
    xl: 'h-24 sm:h-32',
  };

  const primaryDark = variant === 'light' ? '#FFFFFF' : '#0B0F19';
  const subtitleColor = variant === 'light' ? '#E2E8F0' : '#2D3748';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 500 245"
        className={`${heights[size]} w-auto shrink-0 transition-transform duration-200 group-hover:scale-102`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ textRendering: 'geometricPrecision', shapeRendering: 'geometricPrecision' }}
      >
        <defs>
          {/* Vibrant 3D Orange Roof Gradient */}
          <linearGradient id="roofOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="30%" stopColor="#FF6D00" />
            <stop offset="75%" stopColor="#FF3D00" />
            <stop offset="100%" stopColor="#DD2C00" />
          </linearGradient>

          {/* Orange 'i' Stem Gradient */}
          <linearGradient id="stemOrangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8F00" />
            <stop offset="50%" stopColor="#FF5722" />
            <stop offset="100%" stopColor="#E64A19" />
          </linearGradient>

          {/* Underline Flourish Gradient */}
          <linearGradient id="swooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5722" />
            <stop offset="60%" stopColor="#FF8F00" />
            <stop offset="100%" stopColor="#FF3D00" />
          </linearGradient>
        </defs>

        {/* 1. Left Chimney */}
        <path
          d="M 74 96 L 74 38 L 98 38 L 98 75"
          stroke={primaryDark}
          strokeWidth="10"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* 2. Left Wall Outline / Eave */}
        <path
          d="M 40 134 L 86 134 L 86 182 L 72 182"
          stroke={primaryDark}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. Orange Architectural Gable Roof */}
        {/* Outer and Inner Facets of the 3D Gable */}
        <path
          d="M 18 134 L 168 22 L 260 92 L 246 104 L 168 45 L 36 146 Z"
          fill="url(#roofOrangeGrad)"
        />

        {/* 4. Four-Pane Window Grid Dot above 'i' (2x2 square panes) */}
        <g fill={primaryDark}>
          <rect x="150" y="70" width="11" height="11" rx="1.5" />
          <rect x="165" y="70" width="11" height="11" rx="1.5" />
          <rect x="150" y="85" width="11" height="11" rx="1.5" />
          <rect x="165" y="85" width="11" height="11" rx="1.5" />
        </g>

        {/* 5. Orange 'i' Stem Pillar */}
        <rect
          x="108"
          y="100"
          width="19"
          height="82"
          rx="3.5"
          fill="url(#stemOrangeGrad)"
        />

        {/* 6. Bold 'Khaya' Wordmark Typography */}
        <text
          x="138"
          y="182"
          fill={primaryDark}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="92"
          letterSpacing="-0.04em"
        >
          Khaya
        </text>

        {/* 7. Tapered Orange Underline Swoosh under 'Khaya' */}
        <path
          d="M 175 194 Q 310 192 485 190 Q 320 197 175 194 Z"
          fill="url(#swooshGrad)"
        />

        {/* 8. Subtitle 'Res Living' */}
        {showSubtitle && (
          <text
            x="328"
            y="232"
            fill={subtitleColor}
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontStyle="italic"
            fontWeight="700"
            fontSize="32"
            letterSpacing="-0.02em"
          >
            {subtitleText}
          </text>
        )}
      </svg>
    </div>
  );
};
