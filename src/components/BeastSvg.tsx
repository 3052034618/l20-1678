import type { BeastStatus } from '../types';

interface BeastSvgProps {
  color: string;
  status: BeastStatus;
  size?: number;
  animated?: boolean;
}

export function BeastSvg({ color, status, size = 120, animated = true }: BeastSvgProps) {
  const isSleeping = status === 'sleeping' || status === 'sleepy';
  const isEnergetic = status === 'energetic';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={animated ? 'beast-breathe' : ''}
    >
      <defs>
        <radialGradient id="bodyGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={lightenColor(color, 20)} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>

      <ellipse
        cx="60"
        cy="70"
        rx="40"
        ry="35"
        fill="url(#bodyGradient)"
      />

      <circle cx="60" cy="50" r="30" fill="url(#bodyGradient)" />

      <ellipse cx="35" cy="30" rx="10" ry="14" fill={color} />
      <ellipse cx="85" cy="30" rx="10" ry="14" fill={color} />
      <ellipse cx="35" cy="32" rx="5" ry="8" fill={lightenColor(color, 30)} />
      <ellipse cx="85" cy="32" rx="5" ry="8" fill={lightenColor(color, 30)} />

      {isSleeping ? (
        <>
          <path d="M 48 52 Q 50 55 52 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 68 52 Q 70 55 72 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="5" fill="#333" />
          <circle cx="70" cy="50" r="5" fill="#333" />
          <circle cx="52" cy="48" r="2" fill="#fff" />
          <circle cx="72" cy="48" r="2" fill="#fff" />
        </>
      )}

      <ellipse cx="42" cy="58" rx="5" ry="3" fill="#FFB5C5" opacity="0.6" />
      <ellipse cx="78" cy="58" rx="5" ry="3" fill="#FFB5C5" opacity="0.6" />

      {isEnergetic ? (
        <path d="M 55 62 Q 60 68 65 62" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isSleeping ? (
        <path d="M 56 62 Q 60 60 64 62" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 56 63 Q 60 66 64 63" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      <ellipse cx="45" cy="95" rx="10" ry="6" fill={color} />
      <ellipse cx="75" cy="95" rx="10" ry="6" fill={color} />

      {isSleeping && status === 'sleeping' && (
        <g className="float-animation">
          <text x="90" y="35" fontSize="16" fill="#87CEEB">z</text>
          <text x="100" y="28" fontSize="12" fill="#87CEEB" opacity="0.7">z</text>
          <text x="108" y="22" fontSize="10" fill="#87CEEB" opacity="0.5">z</text>
        </g>
      )}

      {isEnergetic && (
        <g className="sparkle-animation">
          <circle cx="30" cy="25" r="3" fill="#FFE66D" opacity="0.8" />
          <circle cx="95" cy="35" r="2" fill="#FFE66D" opacity="0.6" />
          <circle cx="25" cy="60" r="2.5" fill="#FFE66D" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
