import { getPseudoLegalMoves } from './moveGenerator.js';
import { applyMoveToBoard } from './boardUtils.js';

function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r * 8 + f];
      if (cell && cell.piece === 'K' && cell.color === color) {
        return { file: f, rank: r };
      }
    }
  }
  return null;
}

export function isInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;

  const opponent = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r * 8 + f];
      if (cell && cell.color === opponent) {
        const moves = getPseudoLegalMoves(board, f, r, null, null);
        for (const move of moves) {
          if (move.to.file === king.file && move.to.rank === king.rank) return true;
        }
      }
    }
  }
  return false;
}

export function getLegalMoves(board, file, rank, castlingRights, enPassantTarget) {
  const cell = board[rank * 8 + file];
  if (!cell) return [];
  const { color } = cell;

  const pseudoMoves = getPseudoLegalMoves(board, file, rank, castlingRights, enPassantTarget);

  return pseudoMoves.filter(move => {
    // Castling: king must not be in check now, must not pass through attacked square
    if (move.special === 'castleKingside' || move.special === 'castleQueenside') {
      if (isInCheck(board, color)) return false;
      const passThroughFile = move.special === 'castleKingside' ? 5 : 3;
      const midBoard = applyMoveToBoard(board, {
        from: move.from,
        to: { file: passThroughFile, rank: move.from.rank },
      });
      if (isInCheck(midBoard, color)) return false;
    }

    const newBoard = applyMoveToBoard(board, move);
    return !isInCheck(newBoard, color);
  });
}

export function getAllLegalMoves(board, color, castlingRights, enPassantTarget) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r * 8 + f];
      if (cell && cell.color === color) {
        moves.push(...getLegalMoves(board, f, r, castlingRights, enPassantTarget));
      }
    }
  }
  return moves;
}

export function isCheckmate(board, color, castlingRights, enPassantTarget) {
  return (
    isInCheck(board, color) &&
    getAllLegalMoves(board, color, castlingRights, enPassantTarget).length === 0
  );
}

export function isStalemate(board, color, castlingRights, enPassantTarget) {
  return (
    !isInCheck(board, color) &&
    getAllLegalMoves(board, color, castlingRights, enPassantTarget).length === 0
  );
}
