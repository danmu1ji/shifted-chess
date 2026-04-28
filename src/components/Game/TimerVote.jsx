import { useEffect, useMemo, useState } from 'react';

const MODES = [
  { key: 'bullet', label: 'Bullet 1분' },
  { key: 'blitz', label: 'Blitz 5분' },
  { key: 'classical', label: 'Classical 10분' },
];

export default function TimerVote({ votes, myColor, onVote, disabled }) {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const myVote = votes?.[myColor] ?? null;

  useEffect(() => {
    if (myVote || disabled) return;
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerId);
  }, [myVote, disabled]);

  useEffect(() => {
    if (myVote || disabled || secondsLeft > 0) return;
    const randomMode = MODES[Math.floor(Math.random() * MODES.length)]?.key;
    if (randomMode) {
      onVote(randomMode);
    }
  }, [secondsLeft, myVote, onVote, disabled]);

  const voteCountText = useMemo(() => {
    const white = votes?.white ? '완료' : '대기';
    const black = votes?.black ? '완료' : '대기';
    return `백 투표: ${white} / 흑 투표: ${black}`;
  }, [votes?.black, votes?.white]);

  return (
    <section
      style={{
        background: '#22243a',
        border: '1px solid #3a3d5b',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 10 }}>타이머 모드 투표</h2>
      <p style={{ color: '#c7cae6', marginBottom: 12 }}>{voteCountText}</p>
      {!myVote && !disabled && (
        <p style={{ color: '#ffe8a3', marginBottom: 12 }}>
          {secondsLeft}초 안에 선택하지 않으면 랜덤으로 투표됩니다.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {MODES.map((mode) => {
          const selected = myVote === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => onVote(mode.key)}
              disabled={disabled || !!myVote}
              style={{
                padding: '12px 10px',
                borderRadius: 10,
                border: selected ? '2px solid #d4d9ff' : '1px solid #4a4f77',
                background: selected ? '#5962de' : '#1b1e31',
                color: '#fff',
                fontWeight: 700,
                cursor: disabled || myVote ? 'not-allowed' : 'pointer',
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
