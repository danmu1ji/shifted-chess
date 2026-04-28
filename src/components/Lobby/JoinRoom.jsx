import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom } from '../../firebase/roomService.js';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #474c73',
  background: '#16182a',
  color: '#eceefe',
};

export default function JoinRoom() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const roomId = inviteCode.trim();
    if (!trimmedName || !roomId) {
      setError('이름과 초대 코드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await joinRoom(roomId, trimmedName);
      localStorage.setItem(
        `chess_session_${result.roomId}`,
        JSON.stringify({
          uid: result.uid,
          name: trimmedName,
          color: result.color,
        }),
      );
      navigate(`/room/${result.roomId}`);
    } catch (err) {
      setError(err?.message ?? '방 참가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleJoin}
      style={{ background: '#171a2d', border: '1px solid #343854', borderRadius: 10, padding: 16 }}
    >
      <h2 style={{ fontSize: 20, marginBottom: 10 }}>방 참가</h2>
      <label style={{ display: 'block', marginBottom: 8, color: '#cdd1f3' }}>이름</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: BlackPlayer"
        maxLength={24}
        style={inputStyle}
      />
      <label style={{ display: 'block', marginTop: 12, marginBottom: 8, color: '#cdd1f3' }}>초대 코드</label>
      <input
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="6자리 코드"
        maxLength={16}
        style={inputStyle}
      />
      {error && <p style={{ color: '#ff9a9a', marginTop: 10 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: 14,
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: 'none',
          background: loading ? '#4c4f66' : '#35a66b',
          color: '#fff',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '참가 중...' : '방 참가'}
      </button>
    </form>
  );
}
