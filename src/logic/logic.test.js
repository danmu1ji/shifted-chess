import { describe, it, expect } from 'vitest';
import { isUpperHalf, isLowerHalf, toAbsCol, isValidSquare, squareIndex } from './coordinates.js';
import { createInitialBoard, cloneBoard, applyMoveToBoard, computeNewEnPassantTarget, updateCastlingRights, initialCastlingRights } from './boardUtils.js';
import { getBoundaryCaptures } from './boundaryMoves.js';
import { getPawnDoublePush, getEnPassantMoves, getCastlingMoves } from './specialMoves.js';
import { getPseudoLegalMoves } from './moveGenerator.js';
import { isInCheck, getLegalMoves, isCheckmate, isStalemate, getAllLegalMoves } from './checkDetection.js';

// ── coordinates ──────────────────────────────────────────────────────────────

describe('coordinates', () => {
  it('isUpperHalf: rank>=4', () => {
    expect(isUpperHalf(4)).toBe(true);
    expect(isUpperHalf(7)).toBe(true);
    expect(isUpperHalf(3)).toBe(false);
  });

  it('isLowerHalf: rank<=3', () => {
    expect(isLowerHalf(3)).toBe(true);
    expect(isLowerHalf(0)).toBe(true);
    expect(isLowerHalf(4)).toBe(false);
  });

  it('toAbsCol: upper=file, lower=file+1', () => {
    expect(toAbsCol(0, 4)).toBe(0); // upper a
    expect(toAbsCol(7, 7)).toBe(7); // upper h
    expect(toAbsCol(0, 0)).toBe(1); // lower a → absCol 1
    expect(toAbsCol(7, 3)).toBe(8); // lower h → absCol 8
  });

  it('isValidSquare', () => {
    expect(isValidSquare(0, 0)).toBe(true);
    expect(isValidSquare(7, 7)).toBe(true);
    expect(isValidSquare(-1, 0)).toBe(false);
    expect(isValidSquare(8, 0)).toBe(false);
  });
});

// ── boardUtils ────────────────────────────────────────────────────────────────

describe('createInitialBoard', () => {
  it('has 64 cells', () => {
    expect(createInitialBoard().length).toBe(64);
  });

  it('white back rank is correct', () => {
    const b = createInitialBoard();
    const expected = ['R','N','B','Q','K','B','N','R'];
    for (let f = 0; f < 8; f++) {
      expect(b[squareIndex(f, 0)]).toEqual({ piece: expected[f], color: 'w' });
    }
  });

  it('black pawns at rank6', () => {
    const b = createInitialBoard();
    for (let f = 0; f < 8; f++) {
      expect(b[squareIndex(f, 6)]).toEqual({ piece: 'P', color: 'b' });
    }
  });

  it('center is empty', () => {
    const b = createInitialBoard();
    for (let r = 2; r <= 5; r++) {
      for (let f = 0; f < 8; f++) {
        expect(b[squareIndex(f, r)]).toBeNull();
      }
    }
  });
});

describe('applyMoveToBoard', () => {
  it('moves piece', () => {
    const b = createInitialBoard();
    const b2 = applyMoveToBoard(b, { from: { file: 4, rank: 1 }, to: { file: 4, rank: 3 } });
    expect(b2[squareIndex(4, 1)]).toBeNull();
    expect(b2[squareIndex(4, 3)]).toEqual({ piece: 'P', color: 'w' });
  });

  it('en passant removes captured pawn', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 4)] = { piece: 'P', color: 'w' }; // white pawn at e5
    b[squareIndex(5, 4)] = { piece: 'P', color: 'b' }; // black pawn at f5 (just moved)
    const b2 = applyMoveToBoard(b, {
      from: { file: 4, rank: 4 },
      to: { file: 5, rank: 5 },
      special: 'enPassant',
    });
    expect(b2[squareIndex(5, 4)]).toBeNull(); // captured
    expect(b2[squareIndex(5, 5)]).toEqual({ piece: 'P', color: 'w' });
  });

  it('kingside castle moves rook', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 0)] = { piece: 'K', color: 'w' };
    b[squareIndex(7, 0)] = { piece: 'R', color: 'w' };
    const b2 = applyMoveToBoard(b, {
      from: { file: 4, rank: 0 },
      to: { file: 6, rank: 0 },
      special: 'castleKingside',
    });
    expect(b2[squareIndex(6, 0)]).toEqual({ piece: 'K', color: 'w' });
    expect(b2[squareIndex(5, 0)]).toEqual({ piece: 'R', color: 'w' });
    expect(b2[squareIndex(7, 0)]).toBeNull();
  });

  it('promotion changes piece type', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 6)] = { piece: 'P', color: 'w' };
    const b2 = applyMoveToBoard(b, {
      from: { file: 4, rank: 6 },
      to: { file: 4, rank: 7 },
      special: 'promotion',
      promotion: 'Q',
    });
    expect(b2[squareIndex(4, 7)]).toEqual({ piece: 'Q', color: 'w' });
  });
});

describe('computeNewEnPassantTarget', () => {
  it('double push sets target', () => {
    const ep = computeNewEnPassantTarget(
      { from: { file: 4, rank: 1 }, to: { file: 4, rank: 3 } },
      { piece: 'P', color: 'w' }
    );
    expect(ep).toEqual({ file: 4, rank: 2 });
  });

  it('single push returns null', () => {
    const ep = computeNewEnPassantTarget(
      { from: { file: 4, rank: 2 }, to: { file: 4, rank: 3 } },
      { piece: 'P', color: 'w' }
    );
    expect(ep).toBeNull();
  });
});

// ── boundaryMoves ─────────────────────────────────────────────────────────────

describe('getBoundaryCaptures', () => {
  it('white pawn at rank3: left capture = same file, right = file+2', () => {
    const b = Array(64).fill(null);
    b[squareIndex(3, 3)] = { piece: 'P', color: 'w' }; // white pawn file=3 (d4)
    b[squareIndex(3, 4)] = { piece: 'P', color: 'b' }; // black piece at file=3 (d5)
    b[squareIndex(5, 4)] = { piece: 'N', color: 'b' }; // black piece at file=5 (f5)

    const moves = getBoundaryCaptures(b, 3, 3, 'w');
    const targets = moves.map(m => m.to.file).sort();
    expect(targets).toEqual([3, 5]); // left=3 (same), right=5 (3+2)
  });

  it('white pawn at rank3 file=6: right capture out of bounds', () => {
    const b = Array(64).fill(null);
    b[squareIndex(6, 3)] = { piece: 'P', color: 'w' };
    b[squareIndex(6, 4)] = { piece: 'P', color: 'b' }; // left capture target
    // file 8 is invalid so no right capture

    const moves = getBoundaryCaptures(b, 6, 3, 'w');
    expect(moves.length).toBe(1);
    expect(moves[0].to.file).toBe(6);
  });

  it('black pawn at rank4: left = file-2, right = same file', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 4)] = { piece: 'P', color: 'b' }; // black pawn file=4 (e5)
    b[squareIndex(2, 3)] = { piece: 'P', color: 'w' }; // white piece at file=2 (c4)
    b[squareIndex(4, 3)] = { piece: 'N', color: 'w' }; // white piece at file=4 (e4)

    const moves = getBoundaryCaptures(b, 4, 4, 'b');
    const targets = moves.map(m => m.to.file).sort();
    expect(targets).toEqual([2, 4]); // left=2 (4-2), right=4 (same)
  });

  it('black pawn at rank4 file=1: left capture out of bounds', () => {
    const b = Array(64).fill(null);
    b[squareIndex(1, 4)] = { piece: 'P', color: 'b' };
    b[squareIndex(1, 3)] = { piece: 'P', color: 'w' }; // right capture only

    const moves = getBoundaryCaptures(b, 1, 4, 'b');
    expect(moves.length).toBe(1);
    expect(moves[0].to.file).toBe(1);
  });

  it('returns empty when no opponent at target', () => {
    const b = Array(64).fill(null);
    b[squareIndex(3, 3)] = { piece: 'P', color: 'w' };
    expect(getBoundaryCaptures(b, 3, 3, 'w')).toEqual([]);
  });
});

// ── specialMoves ──────────────────────────────────────────────────────────────

describe('getPawnDoublePush', () => {
  it('white from rank1 with clear path', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 1)] = { piece: 'P', color: 'w' };
    const moves = getPawnDoublePush(b, 4, 1, 'w');
    expect(moves.length).toBe(1);
    expect(moves[0].to).toEqual({ file: 4, rank: 3 });
  });

  it('white double push blocked by piece on rank2', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 1)] = { piece: 'P', color: 'w' };
    b[squareIndex(4, 2)] = { piece: 'N', color: 'b' };
    expect(getPawnDoublePush(b, 4, 1, 'w')).toEqual([]);
  });

  it('black from rank6', () => {
    const b = Array(64).fill(null);
    b[squareIndex(3, 6)] = { piece: 'P', color: 'b' };
    const moves = getPawnDoublePush(b, 3, 6, 'b');
    expect(moves[0].to).toEqual({ file: 3, rank: 4 });
  });
});

describe('getEnPassantMoves', () => {
  it('white captures en passant', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 4)] = { piece: 'P', color: 'w' };
    const ep = { file: 5, rank: 5 };
    const moves = getEnPassantMoves(b, 4, 4, 'w', ep);
    expect(moves.length).toBe(1);
    expect(moves[0].special).toBe('enPassant');
    expect(moves[0].to).toEqual({ file: 5, rank: 5 });
  });

  it('returns empty if not adjacent', () => {
    const b = Array(64).fill(null);
    const ep = { file: 6, rank: 5 };
    expect(getEnPassantMoves(b, 4, 4, 'w', ep)).toEqual([]);
  });
});

describe('getCastlingMoves', () => {
  it('white kingside castling', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 0)] = { piece: 'K', color: 'w' };
    b[squareIndex(7, 0)] = { piece: 'R', color: 'w' };
    const rights = initialCastlingRights();
    const moves = getCastlingMoves(b, 4, 0, 'w', rights);
    expect(moves.some(m => m.special === 'castleKingside')).toBe(true);
  });

  it('no castling if path blocked', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 0)] = { piece: 'K', color: 'w' };
    b[squareIndex(7, 0)] = { piece: 'R', color: 'w' };
    b[squareIndex(6, 0)] = { piece: 'N', color: 'w' }; // blocks
    const rights = initialCastlingRights();
    const moves = getCastlingMoves(b, 4, 0, 'w', rights);
    expect(moves.some(m => m.special === 'castleKingside')).toBe(false);
  });
});

// ── moveGenerator ─────────────────────────────────────────────────────────────

describe('getPseudoLegalMoves', () => {
  it('white pawn from rank1 has single and double push', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 1)] = { piece: 'P', color: 'w' };
    const moves = getPseudoLegalMoves(b, 4, 1, null, null);
    const toRanks = moves.map(m => m.to.rank).sort();
    expect(toRanks).toContain(2);
    expect(toRanks).toContain(3);
  });

  it('white pawn at rank3 cannot push forward (boundary)', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 3)] = { piece: 'P', color: 'w' };
    const moves = getPseudoLegalMoves(b, 4, 3, null, null);
    expect(moves.filter(m => m.to.rank === 4 && m.to.file === 4).length).toBe(0);
  });

  it('white pawn at rank6 move marked as promotion', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 6)] = { piece: 'P', color: 'w' };
    const moves = getPseudoLegalMoves(b, 4, 6, null, null);
    expect(moves[0].special).toBe('promotion');
  });

  it('knight moves in L-shape', () => {
    const b = Array(64).fill(null);
    b[squareIndex(3, 3)] = { piece: 'N', color: 'w' };
    const moves = getPseudoLegalMoves(b, 3, 3, null, null);
    expect(moves.length).toBe(8);
  });

  it('rook blocked by own piece', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 4)] = { piece: 'R', color: 'w' };
    b[squareIndex(4, 6)] = { piece: 'P', color: 'w' }; // blocks upward
    const moves = getPseudoLegalMoves(b, 4, 4, null, null);
    const upMoves = moves.filter(m => m.to.file === 4 && m.to.rank > 4);
    expect(upMoves.every(m => m.to.rank < 6)).toBe(true);
  });
});

// ── checkDetection ────────────────────────────────────────────────────────────

describe('isInCheck', () => {
  it('king attacked by rook', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 0)] = { piece: 'K', color: 'w' };
    b[squareIndex(4, 7)] = { piece: 'R', color: 'b' };
    expect(isInCheck(b, 'w')).toBe(true);
  });

  it('king not in check', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 0)] = { piece: 'K', color: 'w' };
    expect(isInCheck(b, 'w')).toBe(false);
  });

  it('blocking piece removes check', () => {
    const b = Array(64).fill(null);
    b[squareIndex(4, 0)] = { piece: 'K', color: 'w' };
    b[squareIndex(4, 3)] = { piece: 'P', color: 'w' }; // blocks rook
    b[squareIndex(4, 7)] = { piece: 'R', color: 'b' };
    expect(isInCheck(b, 'w')).toBe(false);
  });

  it('king attacked via boundary-crossing pawn', () => {
    // Black pawn at (rank4=chess5, file=4) attacks white king at (rank3=chess4, file=4) via right boundary capture
    const b = Array(64).fill(null);
    b[squareIndex(4, 3)] = { piece: 'K', color: 'w' }; // white king at e4 (rank3)
    b[squareIndex(4, 4)] = { piece: 'P', color: 'b' }; // black pawn at e5 (rank4)
    expect(isInCheck(b, 'w')).toBe(true);
  });
});

describe('isCheckmate', () => {
  it('fool\'s mate is checkmate', () => {
    // Set up a fool's mate position
    const b = Array(64).fill(null);
    // Standard back ranks
    ['R','N','B','Q','K','B','N','R'].forEach((p,f) => {
      b[squareIndex(f, 7)] = { piece: p, color: 'b' };
      b[squareIndex(f, 0)] = { piece: p, color: 'w' };
    });
    // White pawns with f and g moved
    for (let f = 0; f < 8; f++) b[squareIndex(f, 1)] = { piece: 'P', color: 'w' };
    b[squareIndex(5, 1)] = null; // f2 pawn moved
    b[squareIndex(6, 1)] = null; // g2 pawn moved
    b[squareIndex(5, 2)] = { piece: 'P', color: 'w' }; // f3
    b[squareIndex(6, 3)] = { piece: 'P', color: 'w' }; // g4
    // Black pawns with e moved
    for (let f = 0; f < 8; f++) b[squareIndex(f, 6)] = { piece: 'P', color: 'b' };
    b[squareIndex(4, 6)] = null;
    b[squareIndex(4, 4)] = { piece: 'P', color: 'b' }; // e5
    // Black queen moves from d8 to h4
    b[squareIndex(3, 7)] = null; // queen left d8
    b[squareIndex(7, 3)] = { piece: 'Q', color: 'b' }; // h4 (Qh4#) — rank index 3 = chess rank 4

    const rights = { wK: true, wQ: true, bK: true, bQ: true };
    expect(isInCheck(b, 'w')).toBe(true);
    expect(isCheckmate(b, 'w', rights, null)).toBe(true);
  });
});

describe('isStalemate', () => {
  it('classic stalemate', () => {
    const b = Array(64).fill(null);
    b[squareIndex(0, 7)] = { piece: 'K', color: 'w' }; // white king trapped at a8
    b[squareIndex(1, 5)] = { piece: 'Q', color: 'b' }; // b6
    b[squareIndex(2, 6)] = { piece: 'K', color: 'b' }; // c7
    const rights = { wK: false, wQ: false, bK: false, bQ: false };
    expect(isInCheck(b, 'w')).toBe(false);
    expect(isStalemate(b, 'w', rights, null)).toBe(true);
  });
});
