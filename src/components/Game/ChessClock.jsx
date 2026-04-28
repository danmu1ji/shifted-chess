function formatMs(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function clockCard(active, label, timeMs, connected) {
  return (
    <div
      style={{
        background: active ? '#2f365f' : '#1b1e31',
        border: active ? '2px solid #8f9cff' : '1px solid #474c73',
        borderRadius: 10,
        padding: 12,
      }}
    >
      <p style={{ color: '#bec4f8', marginBottom: 6 }}>{label} {connected ? '🟢' : '⚪'}</p>
      <p style={{ fontSize: 28, fontWeight: 700 }}>{formatMs(timeMs)}</p>
    </div>
  );
}

export default function ChessClock({
  whiteTimeMs,
  blackTimeMs,
  currentTurn,
  players,
}) {
  return (
    <section style={{ display: 'grid', gap: 10 }}>
      {clockCard(
        currentTurn === 'black',
        `흑 ${players?.black?.name ?? ''}`.trim(),
        blackTimeMs,
        !!players?.black?.connected,
      )}
      {clockCard(
        currentTurn === 'white',
        `백 ${players?.white?.name ?? ''}`.trim(),
        whiteTimeMs,
        !!players?.white?.connected,
      )}
    </section>
  );
}
