import { isValidSquare } from './coordinates.js';
import { getBoundaryCaptures } from './boundaryMoves.js';
import { getPawnDoublePush, getEnPassantMoves, getCastlingMoves } from './specialMoves.js';

// Returns pseudo-legal moves (does not filter self-check).
export function getPseudoLegalMoves(board, file, rank, castlingRights, enPassantTarget) {
  const cell = board[rank * 8 + file];
  if (!cell) return [];
  const { piece, color } = cell;

  switch (piece) {
    case 'P': return getPawnMoves(board, file, rank, color, enPassantTarget);
    case 'N': return getKnightMoves(board, file, rank, color);
    case 'B': return getSlidingMoves(board, file, rank, color, [[-1,-1],[-1,1],[1,-1],[1,1]]);
    case 'R': return getSlidingMoves(board, file, rank, color, [[-1,0],[1,0],[0,-1],[0,1]]);
    case 'Q': return getSlidingMoves(board, file, rank, color, [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
    case 'K': return getKingMoves(board, file, rank, color, castlingRights);
    default:  return [];
  }
}

function getPawnMoves(board, file, rank, color, enPassantTarget) {
  const moves = [];
  const dir = color === 'w' ? 1 : -1;
  const nextRank = rank + dir;
  const promotionRank = color === 'w' ? 7 : 0;

  // Boundary: white rank3→rank4, black rank4→rank3
  const atBoundary = (color === 'w' && rank === 3) || (color === 'b' && rank === 4);

  if (!atBoundary && isValidSquare(file, nextRank)) {
    // Single push
    if (!board[nextRank * 8 + file]) {
      const move = { from: { file, rank }, to: { file, rank: nextRank } };
      if (nextRank === promotionRank) move.special = 'promotion';
      moves.push(move);
    }

    // Diagonal captures (same half only)
    for (const df of [-1, 1]) {
      const cf = file + df;
      if (isValidSquare(cf, nextRank)) {
        const target = board[nextRank * 8 + cf];
        if (target && target.color !== color) {
          const move = { from: { file, rank }, to: { file: cf, rank: nextRank } };
          if (nextRank === promotionRank) move.special = 'promotion';
          moves.push(move);
        }
      }
    }
  }

  // Double push (within same half — never crosses boundary)
  moves.push(...getPawnDoublePush(board, file, rank, color));

  // Boundary crossing captures (replaces normal diagonal at boundary)
  moves.push(...getBoundaryCaptures(board, file, rank, color));

  // En passant (only within same half — see PLAN.md §3)
  moves.push(...getEnPassantMoves(board, file, rank, color, enPassantTarget));

  return moves;
}

function getKnightMoves(board, file, rank, color) {
  const moves = [];
  for (const [df, dr] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const nf = file + df;
    const nr = rank + dr;
    if (isValidSquare(nf, nr)) {
      const target = board[nr * 8 + nf];
      if (!target || target.color !== color) {
        moves.push({ from: { file, rank }, to: { file: nf, rank: nr } });
      }
    }
  }
  return moves;
}

function getSlidingMoves(board, file, rank, color, directions) {
  const moves = [];
  for (const [df, dr] of directions) {
    let nf = file + df;
    let nr = rank + dr;
    while (isValidSquare(nf, nr)) {
      const target = board[nr * 8 + nf];
      if (!target) {
        moves.push({ from: { file, rank }, to: { file: nf, rank: nr } });
      } else {
        if (target.color !== color) {
          moves.push({ from: { file, rank }, to: { file: nf, rank: nr } });
        }
        break;
      }
      nf += df;
      nr += dr;
    }
  }
  return moves;
}

function getKingMoves(board, file, rank, color, castlingRights) {
  const moves = [];
  for (const [df, dr] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    const nf = file + df;
    const nr = rank + dr;
    if (isValidSquare(nf, nr)) {
      const target = board[nr * 8 + nf];
      if (!target || target.color !== color) {
        moves.push({ from: { file, rank }, to: { file: nf, rank: nr } });
      }
    }
  }
  moves.push(...getCastlingMoves(board, file, rank, color, castlingRights));
  return moves;
}
