import { squareIndex } from './coordinates.js';

export function createInitialBoard() {
  const board = Array(64).fill(null);
  const backRank = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

  for (let f = 0; f < 8; f++) {
    board[squareIndex(f, 0)] = { piece: backRank[f], color: 'w' }; // rank1
    board[squareIndex(f, 1)] = { piece: 'P', color: 'w' };         // rank2
    board[squareIndex(f, 6)] = { piece: 'P', color: 'b' };         // rank7
    board[squareIndex(f, 7)] = { piece: backRank[f], color: 'b' }; // rank8
  }
  return board;
}

export function cloneBoard(board) {
  return board.map(cell => (cell ? { ...cell } : null));
}

export function getCell(board, file, rank) {
  return board[rank * 8 + file];
}

export function applyMoveToBoard(board, move) {
  const newBoard = cloneBoard(board);
  const { from, to } = move;
  const piece = newBoard[from.rank * 8 + from.file];

  newBoard[from.rank * 8 + from.file] = null;

  if (move.special === 'enPassant') {
    // captured pawn sits on the from-rank, same file as destination
    newBoard[from.rank * 8 + to.file] = null;
  }

  if (move.special === 'castleKingside') {
    newBoard[from.rank * 8 + 5] = newBoard[from.rank * 8 + 7];
    newBoard[from.rank * 8 + 7] = null;
  }

  if (move.special === 'castleQueenside') {
    newBoard[from.rank * 8 + 3] = newBoard[from.rank * 8 + 0];
    newBoard[from.rank * 8 + 0] = null;
  }

  newBoard[to.rank * 8 + to.file] = move.promotion
    ? { piece: move.promotion, color: piece.color }
    : piece;

  return newBoard;
}

export function computeNewEnPassantTarget(move, piece) {
  if (piece.piece !== 'P') return null;
  if (Math.abs(move.to.rank - move.from.rank) === 2) {
    return {
      file: move.from.file,
      rank: (move.from.rank + move.to.rank) / 2,
    };
  }
  return null;
}

export function updateCastlingRights(rights, move, piece) {
  const r = { ...rights };
  if (piece.piece === 'K') {
    if (piece.color === 'w') { r.wK = false; r.wQ = false; }
    else { r.bK = false; r.bQ = false; }
  }
  if (piece.piece === 'R') {
    if (move.from.rank === 0 && move.from.file === 7) r.wK = false;
    if (move.from.rank === 0 && move.from.file === 0) r.wQ = false;
    if (move.from.rank === 7 && move.from.file === 7) r.bK = false;
    if (move.from.rank === 7 && move.from.file === 0) r.bQ = false;
  }
  // rook captured on its starting square
  if (move.to.rank === 0 && move.to.file === 7) r.wK = false;
  if (move.to.rank === 0 && move.to.file === 0) r.wQ = false;
  if (move.to.rank === 7 && move.to.file === 7) r.bK = false;
  if (move.to.rank === 7 && move.to.file === 0) r.bQ = false;
  return r;
}

export function initialCastlingRights() {
  return { wK: true, wQ: true, bK: true, bQ: true };
}
