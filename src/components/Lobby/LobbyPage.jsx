import CreateRoom from './CreateRoom.jsx';
import JoinRoom from './JoinRoom.jsx';

export default function LobbyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <section
        style={{
          width: 'min(720px, 100%)',
          background: '#22243a',
          border: '1px solid #3a3d5b',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>어긋난 경계 체스</h1>
        <p style={{ color: '#c7cae6', marginBottom: 20 }}>
          방을 만들거나 초대 코드를 입력해 멀티플레이 게임을 시작하세요.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          <CreateRoom />
          <JoinRoom />
        </div>
      </section>
    </main>
  );
}
