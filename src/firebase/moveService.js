import { ref, update, runTransaction } from 'firebase/database';
import { db } from './config.js';
import { applyMoveToBoard, computeNewEnPassantTarget, updateCastlingRights } from '../logic/boardUtils.js';
import { isInCheck, isCheckmate, isStalemate } from '../logic/checkDetection.js';
import { normalizeBoard, normalizeMoveHistory } from './roomService.js';

const TIMER_INITIAL_MS = {
  bullet: 60_000,
  blitz: 300_000,
  classical: 600_000,
};

export async function submitMove(roomId, move) {
  const roomRef = ref(db, `rooms/${roomId}`);

  const { committed } = await runTransaction(roomRef, (room) => {
    if (!room) return; // abort — no data yet

    const { gameState, timer } = room;
    const movingColor = gameState.currentTurn; // 'white' | 'black'
    const movingColorCode = movingColor === 'white' ? 'w' : 'b';

    const board = normalizeBoard(gameState.board);
    const movingPiece = board[move.from.rank * 8 + move.from.file];
    if (!movingPiece || movingPiece.color !== movingColorCode) return; // illegal

    const castlingRights = gameState.castlingRights;
    const enPassantTarget = gameState.enPassantTarget ?? null;

    const newBoard = applyMoveToBoard(board, move);
    const newEnPassantTarget = computeNewEnPassantTarget(move, movingPiece);
    const newCastlingRights = updateCastlingRights(castlingRights, move, movingPiece);

    const nextTurn = movingColor === 'white' ? 'black' : 'white';
    const nextColorCode = nextTurn === 'white' ? 'w' : 'b';

    const inCheck = isInCheck(newBoard, nextColorCode);
    const mated = inCheck && isCheckmate(newBoard, nextColorCode, newCastlingRights, newEnPassantTarget);
    const stale = !inCheck && isStalemate(newBoard, nextColorCode, newCastlingRights, newEnPassantTarget);

    let status = gameState.status;
    let winner = gameState.winner ?? null;

    if (mated) {
      status = 'ended';
      winner = movingColor;
    } else if (stale) {
      status = 'ended';
      winner = 'draw';
    }

    // Timer: deduct elapsed time from the player who just moved
    const now = Date.now();
    let whiteTimeMs = timer.whiteTimeMs;
    let blackTimeMs = timer.blackTimeMs;

    if (timer.mode && timer.lastTickAt) {
      const elapsed = now - timer.lastTickAt;
      if (movingColor === 'white') {
        whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
      } else {
        blackTimeMs = Math.max(0, blackTimeMs - elapsed);
      }
    }

    // Timeout check (should rarely trigger here; useChessClock handles it earlier)
    if (timer.mode && whiteTimeMs <= 0 && status !== 'ended') {
      status = 'ended';
      winner = 'black';
    } else if (timer.mode && blackTimeMs <= 0 && status !== 'ended') {
      status = 'ended';
      winner = 'white';
    }

    const historyEntry = {
      from: move.from,
      to: move.to,
      piece: movingPiece.piece,
      special: move.special ?? null,
      promotion: move.promotion ?? null,
      san: null,
    };

    const moveHistory = normalizeMoveHistory(gameState.moveHistory);

    return {
      ...room,
      gameState: {
        ...gameState,
        board: newBoard,
        enPassantTarget: newEnPassantTarget,
        castlingRights: newCastlingRights,
        currentTurn: nextTurn,
        checkState: inCheck ? nextTurn : 'none',
        status,
        winner,
        moveHistory: [...moveHistory, historyEntry],
      },
      timer: {
        ...timer,
        whiteTimeMs,
        blackTimeMs,
        lastTickAt: status === 'ended' ? null : now,
      },
    };
  });

  return committed;
}

// Records a timer mode vote; resolves and starts the game when both players have voted.
export async function voteTimer(roomId, color, mode) {
  const roomRef = ref(db, `rooms/${roomId}`);

  await runTransaction(roomRef, (room) => {
    if (!room) return;

    const newVotes = {
      ...room.timer.votes,
      [color]: mode,
    };

    let resolvedMode = room.timer.mode;
    let newStatus = room.gameState.status;
    let whiteTimeMs = room.timer.whiteTimeMs;
    let blackTimeMs = room.timer.blackTimeMs;
    let lastTickAt = room.timer.lastTickAt;

    if (newVotes.white && newVotes.black) {
      if (newVotes.white === newVotes.black) {
        resolvedMode = newVotes.white;
      } else {
        // Tie-break: random selection between the two voted modes
        resolvedMode = Math.random() < 0.5 ? newVotes.white : newVotes.black;
      }
      const initialTime = TIMER_INITIAL_MS[resolvedMode];
      whiteTimeMs = initialTime;
      blackTimeMs = initialTime;
      lastTickAt = Date.now();
      newStatus = 'playing';
    }

    return {
      ...room,
      timer: {
        ...room.timer,
        votes: newVotes,
        mode: resolvedMode,
        whiteTimeMs,
        blackTimeMs,
        lastTickAt,
      },
      gameState: {
        ...room.gameState,
        status: newStatus,
      },
    };
  });
}

// Updates timer fields directly (used for reconnection sync or timeout recording).
export async function syncTimer(roomId, updates) {
  await update(ref(db, `rooms/${roomId}/timer`), updates);
}

// Records the winner when a player's clock runs out.
export async function recordTimeout(roomId, losingColor) {
  const winner = losingColor === 'white' ? 'black' : 'white';
  await update(ref(db, `rooms/${roomId}/gameState`), {
    status: 'ended',
    winner,
  });
  await syncTimer(roomId, { lastTickAt: null });
}

// Records a resignation.
export async function resign(roomId, resigningColor) {
  const winner = resigningColor === 'white' ? 'black' : 'white';
  await update(ref(db, `rooms/${roomId}/gameState`), {
    status: 'ended',
    winner,
  });
  await syncTimer(roomId, { lastTickAt: null });
}
