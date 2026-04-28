// Inline SVG chess pieces — no external file dependency.
// viewBox: 0 0 45 45. White pieces: light fill + dark stroke. Black: dark + light.

const W_FILL = '#f0d9b5';
const W_STROKE = '#b58863';
const B_FILL = '#b58863';
const B_STROKE = '#f0d9b5';

function PieceSVG({ children, fill, stroke }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ width: '100%', height: '100%', display: 'block' }}
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Pawn({ fill, stroke }) {
  return (
    <PieceSVG fill={fill} stroke={stroke}>
      {/* head */}
      <circle cx="22.5" cy="9" r="5.5" />
      {/* body */}
      <path d="M 22.5,15.5 C 18,15.5 14,20 14,25.5 C 14,27 14.5,28.5 15.5,29.5 L 11,34 L 34,34 L 29.5,29.5 C 30.5,28.5 31,27 31,25.5 C 31,20 27,15.5 22.5,15.5 Z" />
      {/* base */}
      <rect x="10" y="34" width="25" height="4" rx="1.5" />
    </PieceSVG>
  );
}

function Rook({ fill, stroke }) {
  return (
    <PieceSVG fill={fill} stroke={stroke}>
      {/* battlements */}
      <path d="M 9,9 L 9,15 L 12,15 L 12,11 L 16,11 L 16,15 L 29,15 L 29,11 L 33,11 L 33,15 L 36,15 L 36,9 Z" />
      {/* body */}
      <path d="M 12,15 L 12,34 L 33,34 L 33,15 Z" />
      {/* base */}
      <rect x="9" y="34" width="27" height="4" rx="1.5" />
    </PieceSVG>
  );
}

function Bishop({ fill, stroke }) {
  return (
    <PieceSVG fill={fill} stroke={stroke}>
      {/* ball top */}
      <circle cx="22.5" cy="7" r="3" />
      {/* body */}
      <path d="M 22.5,10 C 17,14 14,20 15,28 L 20,34 L 25,34 L 30,28 C 31,20 28,14 22.5,10 Z" />
      {/* collar */}
      <rect x="14" y="32" width="17" height="3" rx="1" />
      {/* base */}
      <rect x="9" y="35" width="27" height="4" rx="1.5" />
    </PieceSVG>
  );
}

function Knight({ fill, stroke }) {
  return (
    <PieceSVG fill={fill} stroke={stroke}>
      {/* body + horse head */}
      <path d="M 22,10 C 18,10 14,13 14,18 L 14,21 C 12,22 10,24 10,27 L 10,34 L 35,34 L 35,27 C 35,24 33,22 31,21 L 31,18 C 31,12 27,8 22,8 C 20,8 19,9 18,10 Z" />
      {/* muzzle */}
      <path d="M 18,10 C 15,8 13,6 15,4 C 17,2 21,4 22,7" />
      {/* ear */}
      <path d="M 22,10 C 23,7 26,6 27,9 C 26,11 24,11 22,10 Z" />
      {/* eye */}
      <circle cx="18.5" cy="8.5" r="1.5" fill={stroke} stroke="none" />
      {/* base */}
      <rect x="9" y="34" width="27" height="4" rx="1.5" />
    </PieceSVG>
  );
}

function Queen({ fill, stroke }) {
  return (
    <PieceSVG fill={fill} stroke={stroke}>
      {/* crown circles */}
      <circle cx="8.5" cy="13" r="3" />
      <circle cx="15" cy="9" r="3" />
      <circle cx="22.5" cy="7" r="3" />
      <circle cx="30" cy="9" r="3" />
      <circle cx="36.5" cy="13" r="3" />
      {/* body */}
      <path d="M 9,26 C 14.5,21 23,18 22.5,11.5 C 29.5,14 31,25 36,26 L 33,34 L 12,34 Z" />
      {/* collar */}
      <rect x="11" y="32" width="23" height="3" rx="1" />
      {/* base */}
      <rect x="8" y="35" width="29" height="4" rx="1.5" />
    </PieceSVG>
  );
}

function King({ fill, stroke }) {
  return (
    <PieceSVG fill={fill} stroke={stroke}>
      {/* cross */}
      <rect x="20.5" y="4" width="4" height="13" rx="1" />
      <rect x="15" y="8" width="15" height="4" rx="1" />
      {/* body */}
      <path d="M 12,36 C 16,28 20,21 22.5,17 C 25,21 29,28 33,36 Z" />
      {/* collar */}
      <rect x="11" y="34" width="23" height="3" rx="1" />
      {/* base */}
      <rect x="8" y="37" width="29" height="4" rx="1.5" />
    </PieceSVG>
  );
}

const RENDERERS = { K: King, Q: Queen, R: Rook, B: Bishop, N: Knight, P: Pawn };

export default function ChessPiece({ piece, color, isBlackView }) {
  const Renderer = RENDERERS[piece];
  if (!Renderer) return null;

  const fill = color === 'w' ? W_FILL : B_FILL;
  const stroke = color === 'w' ? W_STROKE : B_STROKE;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isBlackView ? 'rotate(180deg)' : 'none',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <Renderer fill={fill} stroke={stroke} />
    </div>
  );
}
