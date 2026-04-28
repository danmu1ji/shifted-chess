export default function WaitingRoom({ roomId, players }) {
  return (
    <section
      style={{
        background: '#22243a',
        border: '1px solid #3a3d5b',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 10 }}>상대 플레이어를 기다리는 중</h2>
      <p style={{ color: '#c7cae6', marginBottom: 14 }}>
        초대 코드: <strong style={{ color: '#fff', letterSpacing: 1 }}>{roomId}</strong>
      </p>
      <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
        <li>백: {players?.white?.name ?? '-'} {players?.white?.connected ? '🟢' : '⚪'}</li>
        <li>흑: {players?.black?.name ?? '대기 중'} {players?.black?.connected ? '🟢' : '⚪'}</li>
      </ul>
    </section>
  );
}
