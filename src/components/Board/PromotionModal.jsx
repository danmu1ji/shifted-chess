import ChessPiece from './ChessPiece.jsx';

const PROMOTION_PIECES = ['Q', 'R', 'B', 'N'];

export default function PromotionModal({ color, onSelect, onCancel }) {
  const colorCode = color === 'white' ? 'w' : 'b';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#2c2c3e',
          border: '2px solid #555',
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          gap: 8,
          boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ color: '#eee', fontSize: 13, margin: 0, alignSelf: 'center', marginRight: 8 }}>
          프로모션 기물 선택
        </p>
        {PROMOTION_PIECES.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            style={{
              width: 60,
              height: 60,
              background: '#1a1a2e',
              border: '2px solid #666',
              borderRadius: 6,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f0d9b5')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#666')}
            title={p}
          >
            <ChessPiece piece={p} color={colorCode} isBlackView={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
