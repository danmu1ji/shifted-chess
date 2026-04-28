import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShiftedBoard from '../Board/ShiftedBoard.jsx';
import WaitingRoom from './WaitingRoom.jsx';
import TimerVote from './TimerVote.jsx';
import ChessClock from './ChessClock.jsx';
import GameOver from './GameOver.jsx';
import { usePlayerSession } from '../../hooks/usePlayerSession.js';
import { useFirebaseGame } from '../../hooks/useFirebaseGame.js';
import { useChessClock } from '../../hooks/useChessClock.js';

function stateMessage(status) {
  if (status === 'waiting') return '상대 플레이어 연결을 기다리는 중입니다.';
  if (status === 'voting') return '타이머 모드 투표를 진행하세요.';
  if (status === 'playing') return '게임 진행 중';
  if (status === 'ended') return '게임이 종료되었습니다.';
  return '';
}

export default function GameRoom() {
  const navigate = useNavigate();
  const { roomId = '' } = useParams();
  const { session, clearSession } = usePlayerSession(roomId);
  const { room, loading, error, submitMove, voteTimer, resign } = useFirebaseGame(roomId, session);

  const gameState = room?.gameState ?? null;
  const timer = room?.timer ?? null;
  const status = gameState?.status ?? 'waiting';
  const myColor = session?.color ?? null;

  const { whiteTimeMs, blackTimeMs } = useChessClock(
    roomId,
    timer,
    gameState?.currentTurn,
    status,
  );

  const identityValid = useMemo(() => {
    if (!session || !room?.players) return true;
    const player = room.players[session.color];
    return !!(player && player.uid === session.uid);
  }, [room?.players, session]);

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ marginBottom: 12 }}>세션 정보가 없습니다. 로비에서 다시 입장해주세요.</p>
        <button type="button" onClick={() => navigate('/')}>로비로 이동</button>
      </main>
    );
  }

  if (!identityValid) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ marginBottom: 12 }}>현재 세션이 방 정보와 일치하지 않습니다.</p>
        <button
          type="button"
          onClick={() => {
            clearSession();
            navigate('/');
          }}
        >
          세션 초기화 후 로비로 이동
        </button>
      </main>
    );
  }

  if (loading) {
    return <main style={{ padding: 24 }}>방 정보를 불러오는 중...</main>;
  }

  if (error) {
    return <main style={{ padding: 24, color: '#ff9a9a' }}>오류: {error}</main>;
  }

  if (!room || !gameState) {
    return <main style={{ padding: 24 }}>방을 찾을 수 없습니다.</main>;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 18,
        display: 'grid',
        gap: 16,
        alignContent: 'start',
      }}
    >
      <header
        style={{
          background: '#22243a',
          border: '1px solid #3a3d5b',
          borderRadius: 12,
          padding: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 22 }}>Room {roomId}</h1>
          <p style={{ color: '#c7cae6' }}>{stateMessage(status)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => resign()}
            disabled={status !== 'playing'}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #723d4a',
              background: status === 'playing' ? '#a24b60' : '#4b3e45',
              color: '#fff',
              cursor: status === 'playing' ? 'pointer' : 'not-allowed',
            }}
          >
            기권
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #474c73',
              background: '#1b1e31',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            로비
          </button>
        </div>
      </header>

      {status === 'waiting' && (
        <WaitingRoom roomId={roomId} players={room.players} />
      )}

      {status === 'voting' && (
        <TimerVote
          votes={timer?.votes}
          myColor={myColor}
          onVote={voteTimer}
          disabled={!myColor}
        />
      )}

      {(status === 'playing' || status === 'ended') && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1fr) minmax(240px, 320px)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <ShiftedBoard
            board={gameState.board}
            castlingRights={gameState.castlingRights}
            enPassantTarget={gameState.enPassantTarget}
            currentTurn={gameState.currentTurn}
            myColor={myColor}
            checkState={gameState.checkState}
            status={status}
            onMove={submitMove}
          />

          <div style={{ display: 'grid', gap: 12 }}>
            <ChessClock
              whiteTimeMs={whiteTimeMs}
              blackTimeMs={blackTimeMs}
              currentTurn={gameState.currentTurn}
              players={room.players}
            />
            {status === 'ended' && (
              <GameOver
                winner={gameState.winner}
                onBackToLobby={() => navigate('/')}
              />
            )}
          </div>
        </section>
      )}
    </main>
  );
}
