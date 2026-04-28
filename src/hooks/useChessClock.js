import { useEffect, useRef, useState } from 'react';
import { recordTimeout } from '../firebase/moveService.js';

const TICK_MS = 100;

// Manages the local countdown display and detects timeouts.
//
// Firebase holds the authoritative remaining time; this hook
// only adjusts the display between moves.  The actual deduction
// happens inside submitMove (server-side via runTransaction).
//
// roomId         — the 6-char room code
// timer          — room.timer from Firebase (whiteTimeMs, blackTimeMs, lastTickAt, mode)
// currentTurn    — 'white' | 'black'
// status         — gameState.status
export function useChessClock(roomId, timer, currentTurn, status) {
  const [whiteTimeMs, setWhiteTimeMs] = useState(0);
  const [blackTimeMs, setBlackTimeMs] = useState(0);

  const timerRef = useRef(timer);
  const currentTurnRef = useRef(currentTurn);
  const statusRef = useRef(status);
  const timeoutFiredRef = useRef(false);
  const intervalRef = useRef(null);

  // Sync the authoritative Firebase values whenever they change
  useEffect(() => {
    if (!timer) return;
    timerRef.current = timer;
    currentTurnRef.current = currentTurn;
    statusRef.current = status;

    setWhiteTimeMs(timer.whiteTimeMs ?? 0);
    setBlackTimeMs(timer.blackTimeMs ?? 0);
    timeoutFiredRef.current = false;
  }, [timer, currentTurn, status]);

  // Local tick loop — only runs while the game is live and a timer mode is active
  useEffect(() => {
    if (status !== 'playing' || !timer?.mode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const t = timerRef.current;
      const turn = currentTurnRef.current;
      const s = statusRef.current;

      if (s !== 'playing' || !t?.mode || !t?.lastTickAt) return;

      const elapsed = Date.now() - t.lastTickAt;

      if (turn === 'white') {
        const remaining = Math.max(0, t.whiteTimeMs - elapsed);
        setWhiteTimeMs(remaining);
        if (remaining === 0 && !timeoutFiredRef.current) {
          timeoutFiredRef.current = true;
          recordTimeout(roomId, 'white').catch(console.error);
        }
      } else {
        const remaining = Math.max(0, t.blackTimeMs - elapsed);
        setBlackTimeMs(remaining);
        if (remaining === 0 && !timeoutFiredRef.current) {
          timeoutFiredRef.current = true;
          recordTimeout(roomId, 'black').catch(console.error);
        }
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, status, timer?.mode]);

  return { whiteTimeMs, blackTimeMs };
}
