import ChessPiece from './ChessPiece.jsx';
import MoveIndicator from './MoveIndicator.jsx';
import CheckIndicator from './CheckIndicator.jsx';

// Light / dark square colors — aligned to standard chess coloring via absCol + rank_0indexed parity.
const LIGHT = '#f0d9b5';
const DARK  = '#b58863';
const SELECTED_LIGHT = '#f6f669';
const SELECTED_DARK  = '#baca2b';

export default function BoardSquare({
  file,
  rank,
  cell,
  isLight,
  isSelected,
  isLegalMove,
  hasEnemyPiece,
  isInCheck,
  isBlackView,
  style,
  onClick,
}) {
  let bg = isLight ? LIGHT : DARK;
  if (isSelected) bg = isLight ? SELECTED_LIGHT : SELECTED_DARK;

  // Coordinate labels (shown at board edges)
  const showFile = rank === 0; // bottom row → file label
  const showRank = file === 0; // leftmost file → rank label
  const fileLabel = String.fromCharCode(97 + file); // a–h
  const rankLabel = rank + 1;                        // 1–8

  return (
    <div
      onClick={onClick}
      style={{
        ...style,
        position: 'relative',
        background: bg,
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        aspectRatio: '1',
      }}
    >
      {isInCheck && <CheckIndicator />}
      {isLegalMove && <MoveIndicator hasCapture={hasEnemyPiece} />}
      {cell && (
        <ChessPiece piece={cell.piece} color={cell.color} isBlackView={isBlackView} />
      )}
      {showFile && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 3,
            fontSize: '10px',
            fontWeight: 'bold',
            color: isLight ? DARK : LIGHT,
            transform: isBlackView ? 'rotate(180deg)' : 'none',
            lineHeight: 1,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {fileLabel}
        </span>
      )}
      {showRank && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 3,
            fontSize: '10px',
            fontWeight: 'bold',
            color: isLight ? DARK : LIGHT,
            transform: isBlackView ? 'rotate(180deg)' : 'none',
            lineHeight: 1,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {rankLabel}
        </span>
      )}
    </div>
  );
}
