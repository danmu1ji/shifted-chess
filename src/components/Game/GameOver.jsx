export default function GameOver({ winner, onBackToLobby }) {
  const text =
    winner === 'draw'
      ? '무승부'
      : winner === 'white'
        ? '백 승리'
        : winner === 'black'
          ? '흑 승리'
          : '게임 종료';

  return (
    <section
      style={{
        background: '#22243a',
        border: '1px solid #3a3d5b',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 10 }}>게임 종료</h2>
      <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 14 }}>{text}</p>
      <button
        type="button"
        onClick={onBackToLobby}
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          border: 'none',
          background: '#5962de',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        로비로 돌아가기
      </button>
    </section>
  );
}
