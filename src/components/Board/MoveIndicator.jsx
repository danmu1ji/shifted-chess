// Renders a dot (empty square) or ring (capture square) to indicate a legal move.
export default function MoveIndicator({ hasCapture }) {
  if (hasCapture) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '30%',
        height: '30%',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.25)',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
