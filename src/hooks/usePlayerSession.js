import { useState, useCallback } from 'react';

const KEY = (roomId) => `chess_session_${roomId}`;

function loadSession(roomId) {
  try {
    const raw = localStorage.getItem(KEY(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(roomId, data) {
  try {
    localStorage.setItem(KEY(roomId), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

// Returns the cached session for a room, or null if none exists yet.
// The session is created by LobbyPage after createRoom / joinRoom and
// stored here for the lifetime of the browser tab.
export function usePlayerSession(roomId) {
  const [session, setSession] = useState(() => (roomId ? loadSession(roomId) : null));

  const saveSession = useCallback(
    ({ uid, name, color }) => {
      const data = { uid, name, color };
      persistSession(roomId, data);
      setSession(data);
    },
    [roomId],
  );

  const clearSession = useCallback(() => {
    try { localStorage.removeItem(KEY(roomId)); } catch {}
    setSession(null);
  }, [roomId]);

  return { session, saveSession, clearSession };
}
