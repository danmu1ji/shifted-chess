import { isValidSquare } from './coordinates.js';

// Pawn captures that cross the rank3↔rank4 (chess rank4↔rank5) boundary.
// Upper half: absCol = file. Lower half: absCol = file + 1.
//
// White pawn at lower half (rank=3, file=F):
//   absCol = F+1. Left target absCol F → upper file F. Right target absCol F+2 → upper file F+2.
//
// Black pawn at upper half (rank=4, file=F):
//   absCol = F. Left target absCol F-1 → lower file F-2. Right target absCol F+1 → lower file F.

export function getBoundaryCaptures(board, file, rank, color) {
  const moves = [];

  if (color === 'w' && rank === 3) {
    // left capture: same file in upper half
    addCapture(board, moves, file, rank, file, 4, 'b');
    // right capture: file+2 in upper half
    addCapture(board, moves, file, rank, file + 2, 4, 'b');
  }

  if (color === 'b' && rank === 4) {
    // left capture: file-2 in lower half
    addCapture(board, moves, file, rank, file - 2, 3, 'w');
    // right capture: same file in lower half
    addCapture(board, moves, file, rank, file, 3, 'w');
  }

  return moves;
}

function addCapture(board, moves, fromFile, fromRank, toFile, toRank, opponentColor) {
  if (!isValidSquare(toFile, toRank)) return;
  const target = board[toRank * 8 + toFile];
  if (target && target.color === opponentColor) {
    moves.push({ from: { file: fromFile, rank: fromRank }, to: { file: toFile, rank: toRank } });
  }
}
