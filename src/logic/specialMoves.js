// Double push, en passant, castling helpers.
// Promotion detection is inlined in moveGenerator.js.

export function getPawnDoublePush(board, file, rank, color) {
  if (color === 'w' && rank === 1) {
    if (!board[2 * 8 + file] && !board[3 * 8 + file]) {
      return [{ from: { file, rank }, to: { file, rank: 3 }, special: 'doublePush' }];
    }
  }
  if (color === 'b' && rank === 6) {
    if (!board[5 * 8 + file] && !board[4 * 8 + file]) {
      return [{ from: { file, rank }, to: { file, rank: 4 }, special: 'doublePush' }];
    }
  }
  return [];
}

export function getEnPassantMoves(board, file, rank, color, enPassantTarget) {
  if (!enPassantTarget) return [];
  const { file: epFile, rank: epRank } = enPassantTarget;
  if (Math.abs(file - epFile) !== 1) return [];

  if (color === 'w' && rank === epRank - 1) {
    return [{ from: { file, rank }, to: { file: epFile, rank: epRank }, special: 'enPassant' }];
  }
  if (color === 'b' && rank === epRank + 1) {
    return [{ from: { file, rank }, to: { file: epFile, rank: epRank }, special: 'enPassant' }];
  }
  return [];
}

export function getCastlingMoves(board, file, rank, color, castlingRights) {
  if (!castlingRights) return [];
  const moves = [];

  if (color === 'w' && rank === 0 && file === 4) {
    if (castlingRights.wK && !board[0 * 8 + 5] && !board[0 * 8 + 6]) {
      moves.push({ from: { file, rank }, to: { file: 6, rank: 0 }, special: 'castleKingside' });
    }
    if (castlingRights.wQ && !board[0 * 8 + 3] && !board[0 * 8 + 2] && !board[0 * 8 + 1]) {
      moves.push({ from: { file, rank }, to: { file: 2, rank: 0 }, special: 'castleQueenside' });
    }
  }

  if (color === 'b' && rank === 7 && file === 4) {
    if (castlingRights.bK && !board[7 * 8 + 5] && !board[7 * 8 + 6]) {
      moves.push({ from: { file, rank }, to: { file: 6, rank: 7 }, special: 'castleKingside' });
    }
    if (castlingRights.bQ && !board[7 * 8 + 3] && !board[7 * 8 + 2] && !board[7 * 8 + 1]) {
      moves.push({ from: { file, rank }, to: { file: 2, rank: 7 }, special: 'castleQueenside' });
    }
  }

  return moves;
}
