import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../firebase/roomService.js';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #474c73',
  background: '#16182a',
  color: '#eceefe',
};

export default function CreateRoom() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('플레이어 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await createRoom(trimmedName);
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
      setError(err?.message ?? '방 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleCreate}
      style={{ background: '#171a2d', border: '1px solid #343854', borderRadius: 10, padding: 16 }}
    >
      <h2 style={{ fontSize: 20, marginBottom: 10 }}>방 만들기</h2>
      <label style={{ display: 'block', marginBottom: 8, color: '#cdd1f3' }}>이름</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: WhitePlayer"
        maxLength={24}
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
          background: loading ? '#4c4f66' : '#5b63d9',
          color: '#fff',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '생성 중...' : '새 방 생성'}
      </button>
    </form>
  );
}
