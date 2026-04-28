import { ref, get, set, update, onValue, off, onDisconnect } from 'firebase/database';
import { db } from './config.js';
import { createInitialBoard, initialCastlingRights } from '../logic/boardUtils.js';

function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateUid() {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// Firebase stores arrays as objects when they contain nulls.
// These normalizers convert them back to the expected shape.
export function normalizeBoard(raw) {
  if (!raw) return Array(64).fill(null);
  const board = Array(64).fill(null);
  if (Array.isArray(raw)) {
    raw.forEach((v, i) => { board[i] = v ?? null; });
  } else {
    Object.entries(raw).forEach(([k, v]) => { board[parseInt(k)] = v ?? null; });
  }
  return board;
}

export function normalizeMoveHistory(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return Object.keys(raw)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(k => raw[k]);
}

export function normalizeGameState(raw) {
  if (!raw) return null;
  return {
    ...raw,
    board: normalizeBoard(raw.board),
    moveHistory: normalizeMoveHistory(raw.moveHistory),
    castlingRights: raw.castlingRights ?? initialCastlingRights(),
    enPassantTarget: raw.enPassantTarget ?? null,
    winner: raw.winner ?? null,
    checkState: raw.checkState ?? 'none',
  };
}

export async function createRoom(playerName) {
  const roomId = generateRoomId();
  const uid = generateUid();

  const roomData = {
    meta: {
      roomId,
      createdAt: Date.now(),
    },
    players: {
      white: { uid, name: playerName, connected: true },
      black: null,
    },
    timer: {
      mode: null,
      votes: { white: null, black: null },
      whiteTimeMs: 0,
      blackTimeMs: 0,
      lastTickAt: null,
    },
    gameState: {
      status: 'waiting',
      currentTurn: 'white',
      winner: null,
      checkState: 'none',
      board: createInitialBoard(),
      enPassantTarget: null,
      castlingRights: initialCastlingRights(),
      moveHistory: [],
    },
  };

  await set(ref(db, `rooms/${roomId}`), roomData);

  // Mark disconnected automatically if tab closes
  onDisconnect(ref(db, `rooms/${roomId}/players/white/connected`)).set(false);

  return { roomId, uid, color: 'white' };
}

export async function joinRoom(roomId, playerName) {
  const snapshot = await get(ref(db, `rooms/${roomId}`));

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다');
  }

  const room = snapshot.val();

  if (room.players?.black) {
    throw new Error('방이 가득 찼습니다');
  }

  const uid = generateUid();

  await update(ref(db, `rooms/${roomId}`), {
    'players/black': { uid, name: playerName, connected: true },
    'gameState/status': 'voting',
  });

  onDisconnect(ref(db, `rooms/${roomId}/players/black/connected`)).set(false);

  return { roomId, uid, color: 'black' };
}

export function listenRoom(roomId, callback) {
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snapshot) => {
    const raw = snapshot.val();
    if (!raw) { callback(null); return; }
    callback({
      ...raw,
      gameState: normalizeGameState(raw.gameState),
    });
  });
  return () => off(roomRef);
}

export async function setConnected(roomId, color, connected) {
  await update(ref(db, `rooms/${roomId}/players/${color}`), { connected });
}
