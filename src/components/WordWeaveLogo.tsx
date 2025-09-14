interface WordWeaveLogoProps {
  className?: string;
  width?: number;
  height?: number;
  compact?: boolean;
}

export default function WordWeaveLogo({
  className = "",
  width = 200,
  height = 60,
  compact = false,
}: WordWeaveLogoProps) {
  // Generate unique IDs to avoid conflicts when multiple logos are on the same page
  const uniqueId = Math.random().toString(36).substr(2, 9);

  if (compact) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 140 45"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`compactGradient-${uniqueId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient
            id={`compactWeave-${uniqueId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Visible weaving pattern behind text */}
        <g opacity="0.8">
          <path
            d="M8,18 Q35,12 65,18 Q95,24 125,18"
            stroke={`url(#compactWeave-${uniqueId})`}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M8,28 Q35,34 65,28 Q95,22 125,28"
            stroke={`url(#compactWeave-${uniqueId})`}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M20,10 Q25,22 20,35"
            stroke={`url(#compactWeave-${uniqueId})`}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M50,10 Q45,22 50,35"
            stroke={`url(#compactWeave-${uniqueId})`}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M80,10 Q85,22 80,35"
            stroke={`url(#compactWeave-${uniqueId})`}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M110,10 Q105,22 110,35"
            stroke={`url(#compactWeave-${uniqueId})`}
            strokeWidth="2.5"
            fill="none"
          />
        </g>

        {/* Single unified text */}
        <text
          x="15"
          y="30"
          fill={`url(#compactGradient-${uniqueId})`}
          fontSize="18"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5px"
        >
          WordWeave
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 70"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for the text */}
        <linearGradient
          id={`textGradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Strong gradient for the weaving lines */}
        <linearGradient
          id={`weavingGradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Animated flowing effect */}
        <linearGradient
          id={`flowGradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#ea580c">
            <animate
              attributeName="stop-color"
              values="#ea580c;#f59e0b;#ea580c"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#f59e0b">
            <animate
              attributeName="stop-color"
              values="#f59e0b;#fbbf24;#f59e0b"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#d97706">
            <animate
              attributeName="stop-color"
              values="#d97706;#fb923c;#d97706"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>

      {/* Prominent weaving pattern - much more visible */}
      <g>
        {/* Horizontal weaving threads - thicker and more opaque */}
        <path
          d="M15,25 Q60,15 105,25 Q150,35 195,25"
          stroke={`url(#weavingGradient-${uniqueId})`}
          strokeWidth="4"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M15,40 Q60,50 105,40 Q150,30 195,40"
          stroke={`url(#weavingGradient-${uniqueId})`}
          strokeWidth="4"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M15,55 Q60,45 105,55 Q150,65 195,55"
          stroke={`url(#weavingGradient-${uniqueId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.7"
        />

        {/* Vertical weaving threads - much more visible */}
        <path
          d="M35,15 Q40,40 35,65"
          stroke={`url(#flowGradient-${uniqueId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M70,15 Q65,40 70,65"
          stroke={`url(#flowGradient-${uniqueId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M105,15 Q110,40 105,65"
          stroke={`url(#flowGradient-${uniqueId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M140,15 Q135,40 140,65"
          stroke={`url(#flowGradient-${uniqueId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M175,15 Q180,40 175,65"
          stroke={`url(#flowGradient-${uniqueId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />

        {/* Intersection points to enhance weaving effect */}
        <circle
          cx="60"
          cy="25"
          r="2.5"
          fill={`url(#textGradient-${uniqueId})`}
          opacity="0.9"
        />
        <circle
          cx="105"
          cy="40"
          r="2.5"
          fill={`url(#textGradient-${uniqueId})`}
          opacity="0.9"
        />
        <circle
          cx="150"
          cy="25"
          r="2.5"
          fill={`url(#textGradient-${uniqueId})`}
          opacity="0.9"
        />
        <circle
          cx="60"
          cy="55"
          r="2.5"
          fill={`url(#textGradient-${uniqueId})`}
          opacity="0.9"
        />
        <circle
          cx="150"
          cy="55"
          r="2.5"
          fill={`url(#textGradient-${uniqueId})`}
          opacity="0.9"
        />
      </g>

      {/* Single unified WordWeave text */}
      <text
        x="30"
        y="48"
        fill={`url(#textGradient-${uniqueId})`}
        fontSize="28"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1px"
      >
        WordWeave
      </text>

      {/* Text shadow effect for depth */}
      <text
        x="32"
        y="50"
        fill="rgba(234, 88, 12, 0.3)"
        fontSize="28"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1px"
      >
        WordWeave
      </text>

      {/* Subtle AI transformation indicator */}
      <g transform="translate(190, 20)" opacity="0.7">
        <circle cx="0" cy="0" r="2" fill="#f59e0b">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="8" cy="8" r="1.5" fill="#ea580c">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.5s"
            repeatCount="indefinite"
            begin="0.8s"
          />
        </circle>
        <circle cx="4" cy="16" r="1" fill="#d97706">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.5s"
            repeatCount="indefinite"
            begin="1.6s"
          />
        </circle>
      </g>
    </svg>
  );
}
