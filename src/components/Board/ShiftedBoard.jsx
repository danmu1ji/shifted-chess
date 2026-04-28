import { useState } from 'react';
import { useLegalMoves } from '../../hooks/useLegalMoves.js';
import { toAbsCol } from '../../logic/coordinates.js';
import BoardSquare from './BoardSquare.jsx';
import PromotionModal from './PromotionModal.jsx';

// Square color: light when (absCol + rank_0indexed) % 2 === 0
function squareIsLight(absCol, rank) {
  return (absCol + rank) % 2 === 0;
}

function findKingSquare(board, colorCode) {
  if (!board) return null;
  for (let i = 0; i < 64; i++) {
    if (board[i]?.piece === 'K' && board[i]?.color === colorCode) {
      return { file: i % 8, rank: Math.floor(i / 8) };
    }
  }
  return null;
}

// Props:
//   board           — 64-cell flat array | null
//   castlingRights  — { wK, wQ, bK, bQ }
//   enPassantTarget — { file, rank } | null
//   currentTurn     — 'white' | 'black'
//   myColor         — 'white' | 'black'
//   checkState      — 'none' | 'white' | 'black'
//   status          — 'playing' | 'ended' | ...
//   onMove          — fn(move) — called with complete move object
export default function ShiftedBoard({
  board,
  castlingRights,
  enPassantTarget,
  currentTurn,
  myColor,
  checkState,
  status,
  onMove,
}) {
  const { selected, setSelected, legalMoves } = useLegalMoves(
    board,
    castlingRights,
    enPassantTarget,
    currentTurn,
    myColor,
  );
  const [pendingPromotion, setPendingPromotion] = useState(null);

  // Build a set of legal destinations for O(1) lookup: "file,rank"
  const legalDests = new Map();
  for (const m of legalMoves) {
    legalDests.set(`${m.to.file},${m.to.rank}`, m);
  }

  const isBlackView = myColor === 'black';

  const checkedKing = checkState !== 'none'
    ? findKingSquare(board, checkState === 'white' ? 'w' : 'b')
    : null;

  function handleSquareClick(file, rank) {
    if (status !== 'playing') return;

    const key = `${file},${rank}`;
    const matchedMove = legalDests.get(key);

    if (selected && matchedMove) {
      // Pawn reaching promotion rank
      if (matchedMove.special === 'promotion') {
        setPendingPromotion(matchedMove);
      } else {
        onMove(matchedMove);
        setSelected(null);
      }
      return;
    }

    // Select or deselect
    setSelected({ file, rank });
  }

  function handlePromotionSelect(promotionPiece) {
    if (pendingPromotion) {
      onMove({ ...pendingPromotion, promotion: promotionPiece });
    }
    setPendingPromotion(null);
    setSelected(null);
  }

  // Build cell array — render ranks 7→0 (top to bottom on screen)
  const cells = [];
  for (let r = 7; r >= 0; r--) {
    const gridRow = 8 - r; // CSS grid row: rank7=row1, rank0=row8

    for (let f = 0; f < 8; f++) {
      const absCol = toAbsCol(f, r);
      const gridCol = absCol + 1; // CSS grid column (1-indexed)
      const cell = board ? board[r * 8 + f] : null;
      const isSelected = !!(selected && selected.file === f && selected.rank === r);
      const isLegalMove = legalDests.has(`${f},${r}`);
      const hasEnemyPiece = isLegalMove && cell !== null;
      const isInCheck = !!(checkedKing && checkedKing.file === f && checkedKing.rank === r);
      const light = squareIsLight(absCol, r);

      cells.push(
        <BoardSquare
          key={`${f}-${r}`}
          file={f}
          rank={r}
          cell={cell}
          isLight={light}
          isSelected={isSelected}
          isLegalMove={isLegalMove}
          hasEnemyPiece={hasEnemyPiece}
          isInCheck={isInCheck}
          isBlackView={isBlackView}
          style={{ gridColumn: gridCol, gridRow: gridRow }}
          onClick={() => handleSquareClick(f, r)}
        />,
      );
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        transform: isBlackView ? 'rotate(180deg)' : 'none',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: 'min(90vw, 90vh, 640px)',
          aspectRatio: '9 / 8',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          position: 'relative',
          background: '#1a1a2e',
        }}
      >
        {cells}
      </div>

      {/* Boundary line at 50% height — between rank4 (grid-row 5) and rank5 (grid-row 4) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 2,
          background: 'rgba(220, 80, 80, 0.75)',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      />

      {pendingPromotion && (
        <PromotionModal
          color={myColor}
          onSelect={handlePromotionSelect}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
}
