import { useEffect, useRef, useState, useCallback } from 'react';
import { listenRoom, setConnected } from '../firebase/roomService.js';
import {
  submitMove as fbSubmitMove,
  voteTimer as fbVoteTimer,
  resign as fbResign,
} from '../firebase/moveService.js';

// Subscribes to a Firebase room and exposes wrapped action helpers.
// roomId  — the 6-char room code
// session — { uid, name, color } from usePlayerSession; pass null when not yet available
export function useFirebaseGame(roomId, session) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);

    unsubRef.current = listenRoom(roomId, (data) => {
      setRoom(data);
      setLoading(false);
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [roomId]);

  // Mark connected/disconnected when the tab gains or loses visibility
  useEffect(() => {
    if (!roomId || !session?.color) return;

    const handleVisible = () => setConnected(roomId, session.color, !document.hidden);
    document.addEventListener('visibilitychange', handleVisible);
    return () => document.removeEventListener('visibilitychange', handleVisible);
  }, [roomId, session?.color]);

  const submitMove = useCallback(
    async (move) => {
      try {
        await fbSubmitMove(roomId, move);
      } catch (err) {
        setError(err.message);
      }
    },
    [roomId],
  );

  const voteTimer = useCallback(
    async (mode) => {
      if (!session?.color) return;
      try {
        await fbVoteTimer(roomId, session.color, mode);
      } catch (err) {
        setError(err.message);
      }
    },
    [roomId, session?.color],
  );

  const resign = useCallback(async () => {
    if (!session?.color) return;
    try {
      await fbResign(roomId, session.color);
    } catch (err) {
      setError(err.message);
    }
  }, [roomId, session?.color]);

  return { room, loading, error, submitMove, voteTimer, resign };
}
