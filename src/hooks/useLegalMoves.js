import { useState, useMemo } from 'react';
import { getLegalMoves } from '../logic/checkDetection.js';

// Returns legal moves for the currently selected square, plus selection state.
//
// board            — 64-cell flat array (null | {piece, color})
// castlingRights   — { wK, wQ, bK, bQ }
// enPassantTarget  — { file, rank } | null
// currentTurn      — 'white' | 'black'  (whose turn it is in Firebase)
// myColor          — 'white' | 'black'  (this player's color)
export function useLegalMoves(board, castlingRights, enPassantTarget, currentTurn, myColor) {
  const [selected, setSelectedState] = useState(null); // { file, rank } | null

  const legalMoves = useMemo(() => {
    if (!selected || !board) return [];
    if (currentTurn !== myColor) return [];

    const cell = board[selected.rank * 8 + selected.file];
    const myColorCode = myColor === 'white' ? 'w' : 'b';
    if (!cell || cell.color !== myColorCode) return [];

    return getLegalMoves(board, selected.file, selected.rank, castlingRights, enPassantTarget);
  }, [board, selected, castlingRights, enPassantTarget, currentTurn, myColor]);

  // Clicking the same square deselects; clicking a non-own piece also clears.
  function setSelected(square) {
    if (!square) {
      setSelectedState(null);
      return;
    }
    if (selected && selected.file === square.file && selected.rank === square.rank) {
      setSelectedState(null);
      return;
    }
    if (!board) { setSelectedState(null); return; }

    const cell = board[square.rank * 8 + square.file];
    const myColorCode = myColor === 'white' ? 'w' : 'b';

    if (cell && cell.color === myColorCode && currentTurn === myColor) {
      setSelectedState(square);
    } else {
      setSelectedState(null);
    }
  }

  return { selected, setSelected, legalMoves };
}
